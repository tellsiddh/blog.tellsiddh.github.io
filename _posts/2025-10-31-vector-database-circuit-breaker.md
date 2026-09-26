---
layout: post
title: "Oct 31st – Tripped Circuit Breaker for Vector Database"
date: 2025-10-31
categories: [database]
tags: [opensearch, aws, incident, knn]
toc: true
---

Our vector database of choice is the AWS OpenSearch Service. On October 31st, our cluster tripped the k-NN **circuit breaker** during a bulk ingestion job: one index had eaten almost all of the native memory on a single data node, and indexing stopped until we cleared it.

<!--more-->

## Background

We rely on OpenSearch's **k-NN plugin** (backed by FAISS) for vector search. Each index holds high-dimensional embeddings (~1536 dimensions), and we ingest in **bulk batches of 256 documents** at a time.

Our setup:

- **Engine:** OpenSearch 2.19
- **Instance type:** `or2.large.search`
- **Data nodes:** 6, later scaled to 9
- **Breaker limit:** 60% (default)
- **Memory usage pattern:** one index (`mab_b2f97...`) consistently dominated memory

## The Circuit Breaker Event

During a bulk ingestion job, we started seeing errors like this:

```json
"caused_by": {
  "type": "knn_circuit_breaker_exception",
  "reason": "Parsing the created knn vector fields prior to indexing has failed as the circuit breaker triggered. This indicates that the cluster is low on memory resources and cannot index more documents at the moment. Check _plugins/_knn/stats for the circuit breaker status."
}
```

Running the diagnostic the error points to:

```text
GET _plugins/_knn/stats?pretty
```

produced the key result:

```json
"circuit_breaker_triggered": true
```

Two nodes had excessive graph memory usage:

| Node ID                    | Graph memory usage | Cache full | Top index      | Usage % |
| -------------------------- | ------------------ | ---------- | -------------- | ------- |
| `rvr4O1HFRiiZpcO1BctWK61`  | 98.27%             | True       | `mab_b2f97...` | 85.95%  |
| `knev23f3029vhivh13fjevn`  | 91.21%             | False      | `mab_b2f97...` | 84.24%  |

This confirmed that the breaker was triggered by one overloaded index consuming almost all available native memory on a single data node.

## Troubleshooting Process

We put together a small Python diagnostic script to confirm the issue programmatically. All requests are signed with SigV4 via `requests-aws4auth`.

### Checking k-NN stats

```python
import json

import boto3
import requests
from requests_aws4auth import AWS4Auth

region = "us-west-2"
service = "es"
endpoint = "https://vpc-main-xxxx.us-west-2.es.amazonaws.com"

creds = boto3.Session().get_credentials()
awsauth = AWS4Auth(creds.access_key, creds.secret_key, region, service, session_token=creds.token)

resp = requests.get(f"{endpoint}/_plugins/_knn/stats?pretty", auth=awsauth)
print(resp.status_code)
print(json.dumps(resp.json(), indent=2))
```

This returned detailed per-node memory usage and let us pinpoint the culprit.

### Verifying the breaker limit

```python
url = f"{endpoint}/_cluster/settings?include_defaults=true&filter_path=**.indices.breaker.request.limit"
resp = requests.get(url, auth=awsauth)
print(json.dumps(resp.json(), indent=2))
```

Result:

```json
{
  "defaults": {
    "indices": {
      "breaker": {
        "request": {
          "limit": "60%"
        }
      }
    }
  }
}
```

So we were indeed running against the default 60% threshold.

### Checking cluster health

```python
resp = requests.get(f"{endpoint}/_cluster/health?pretty", auth=awsauth)
print(json.dumps(resp.json(), indent=2))
```

Output:

```json
"status": "green",
"relocating_shards": 2,
"active_shards_percent_as_number": 100.0
```

Everything was healthy, except for the memory issue.

## Diagnosing Shard Distribution

We then checked how the heavy index's shards were spread across nodes:

```python
resp = requests.get(f"{endpoint}/_cat/shards?v&format=json", auth=awsauth)
shards = [s for s in resp.json() if "mab_b2f97" in s["index"]]

for s in shards:
    print(f"Index: {s['index']} | Shard: {s['shard']} | Node: {s['node']}")
```

Output:

```text
Found 10 shards for index pattern 'mab_b2f97':
  Shard 0 → 234rsvdsvde43t36r2b14b686b19523f, b464vwerbwvev393849t8vb97ff1f554
  Shard 1 → 234rsvdsvde43t36r2b14b686b19523f, 4289fhf83fb3vb3839c36b17afaf590e
  Shard 2 → 234rsvdsvde43t36r2b14b686b19523f, 9b90871abd6e7r3if32iv209vnooino9
  ...
```

**Observation:** one node was hosting four shards of the heavy index. That node was exactly the one showing 98% memory usage.

## Fix Attempts

### Attempt 1: Scale data nodes

We increased the number of data nodes from 6 to 9. The cluster started redistributing shards (`relocating_shards: 2`). After waiting ~30 minutes, the breaker was still tripped, because the overloaded node reloaded the same k-NN graphs into memory.

### Attempt 2: Reboot the node

We followed the AWS docs and rebooted the data node via the console. The node restarted successfully. The circuit breaker was still tripped.

Rebooting cleared the JVM heap, but as soon as the node rejoined, OpenSearch reloaded the same graphs and hit the memory limit again.

### Attempt 3: Close and reopen the index

This one worked. We used the following script:

```python
import time

index_name = "mab_b2f97..."

# Close the index to evict its k-NN graphs from native memory
print(f"Closing index: {index_name}")
resp = requests.post(f"{endpoint}/{index_name}/_close", auth=awsauth)
print("Status:", resp.status_code)

time.sleep(30)

# Reopen it so shards reload with a fresh cache
print(f"Reopening index: {index_name}")
resp = requests.post(f"{endpoint}/{index_name}/_open", auth=awsauth)
print("Status:", resp.status_code)

resp = requests.get(f"{endpoint}/_cluster/health/{index_name}?pretty", auth=awsauth)
print(json.dumps(resp.json(), indent=2))
```

Result:

```text
Index closed successfully.
Index reopened successfully.
Checking index health...
"status": "yellow" → "green"
```

Rerunning the stats call:

```text
GET _plugins/_knn/stats?pretty
```

now showed:

```json
"circuit_breaker_triggered": false
```

No nodes were above 80% graph memory usage. The breaker reset cleanly and indexing resumed.

## Root Cause

- One vector index (`mab_b2f97...`) consumed ~85% of native graph memory on a single node.
- The k-NN circuit breaker tripped at the 60% limit.
- Adding data nodes redistributed shards but didn't clear the memory state automatically.
- Rebooting the node reloaded the same graphs.
- Closing and reopening the index flushed the FAISS graphs and rebalanced the k-NN cache.

### Outcome

- Circuit breaker cleared
- No nodes above 80% memory usage
- Indexing and search restored
- Cluster status: green

## Lessons Learned

- **Monitor `_plugins/_knn/stats` regularly.** It gives visibility into node-level native memory pressure that the usual JVM metrics don't show.
- **Circuit breakers protect your cluster.** They prevent out-of-memory crashes, but they also pause indexing until you act.
- **Closing and reopening an index is a safe, AWS-native reset.** It flushes the FAISS graphs from native memory without touching the data.
- **Scaling helps, but placement matters.** Use `_cat/shards` to confirm that heavy indices are actually spread across nodes.
- **The default 60% breaker limit is conservative on purpose.** It's safer to scale horizontally than to raise that threshold.

## Next Steps

- Monitor k-NN stats and shard placement daily.
- Automate alerts if any node exceeds 80% graph memory usage.
- Tune the ingestion batch size to reduce vector memory bursts.
- Document this process in our internal runbook.

**– Siddharth**
