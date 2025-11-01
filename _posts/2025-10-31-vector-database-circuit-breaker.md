---
layout: single
title: "Oct 31st – Tripped Circuit Breaker for Vector Database"
date: 2025-10-31
author: siddharth
categories: [database]
read_time: true
comments: true
share: true
related: true
toc: true
toc_sticky: true
---

Our vector database of choice is the **AWS OpenSearch Service**. **October 31st**, we encountered an unexpected challenge, our OpenSearch cluster tripped a **circuit breaker** due to high memory usage.

<!--more-->

## Background

We rely on OpenSearch’s **k-NN plugin** (built on FAISS) for vector search.  
Each index contains high-dimensional embeddings (~1536 dimensions), and we ingest data in **bulk batches of 256 documents** at a time.  

Our setup:

- **Engine:** OpenSearch_2.19  
- **Instance type:** `or2.large.search`  
- **Data nodes:** 6 → later scaled to 9  
- **Breaker limit:** 60% (default)  
- **Memory usage pattern:** One index (`mab_b2f97...`) consistently dominated memory.

---

## The Circuit Breaker Event

During a bulk ingestion job, we started seeing errors like this:

```json
"caused_by": {
  "type": "knn_circuit_breaker_exception",
  "reason": "Parsing the created knn vector fields prior to indexing has failed as the circuit breaker triggered. This indicates that the cluster is low on memory resources and cannot index more documents at the moment. Check _plugins/_knn/stats for the circuit breaker status."
}
```

## Running the diagnostic command:

GET _plugins/_knn/stats?pretty


produced the following key result:

"circuit_breaker_triggered": true


Two nodes had excessive graph memory usage:

Node ID	Graph Memory Usage	Cache Full	Top Index	Usage %
rvr4O1HFRiiZpcO1BctWK61	98.27%	True	mab_b2f97...	85.95%
knev23f3029vhivh13fjevn	91.21%	False	mab_b2f97...	84.24%

This confirmed that the breaker was triggered by one overloaded index that consumed almost all available native memory on a single data node.

**Troubleshooting Process**

We built a small Python diagnostic script to confirm the issue programmatically.

- Checking k-NN Stats
import requests
import boto3, json

region = 'us-west-2'
service = 'es'

endpoint = "https://vpc-main-xxxx.us-west-2.es.amazonaws.com"
url = f"{endpoint}/_plugins/_knn/stats?pretty"

resp = requests.get(url)
print(resp.status_code)
print(json.dumps(resp.json(), indent=2))


This returned detailed per-node memory usage, helping us pinpoint the culprit.

**Verifying Breaker Limit**
url = f"{endpoint}/_cluster/settings?include_defaults=true&filter_path=**.indices.breaker.request.limit"
resp = requests.get(url)
print(json.dumps(resp.json(), indent=2))


Result:

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


So, we were indeed running close to the default 60% circuit breaker threshold.

- Checking Cluster Health
url = f"{endpoint}/_cluster/health?pretty"
resp = requests.get(url)
print(json.dumps(resp.json(), indent=2))


Output:

"status": "green",
"relocating_shards": 2,
"active_shards_percent_as_number": 100.0


Everything was healthy — except for the memory issue.

## Diagnosing Shard Distribution

We then checked how the heavy index shards were distributed across nodes:

url = f"{endpoint}/_cat/shards?v&format=json"
response = requests.get(url)
shards = [s for s in response.json() if "mab_b2f97" in s["index"]]

for s in shards:
    print(f"Index: {s['index']} | Shard: {s['shard']} | Node: {s['node']}")


Output:

Found 10 shards for index pattern 'mab_b2f97':
  Shard 0 → 234rsvdsvde43t36r2b14b686b19523f, b464vwerbwvev393849t8vb97ff1f554
  Shard 1 → 234rsvdsvde43t36r2b14b686b19523f, 4289fhf83fb3vb3839c36b17afaf590e
  Shard 2 → 234rsvdsvde43t36r2b14b686b19523f, 9b90871abd6e7r3if32iv209vnooino9
  ...


⚠️ Observation: One node was hosting four shards of the heavy index.
That node was exactly the one showing 98% memory usage.

### Fix Attempt 1 – Scaling Data Nodes

We increased the number of data nodes from 6 → 9.
The cluster started redistributing shards (relocating_shards: 2).
However, after waiting ~30 minutes, the breaker still remained tripped — because the overloaded node reloaded the same k-NN graphs into memory.

### Fix Attempt 2 – Reboot Node

We followed AWS docs and rebooted the data node via the console.
Result: Node restarted successfully, Circuit breaker still tripped.

Rebooting cleared the JVM heap, but as soon as the node rejoined, OpenSearch reloaded the same graphs, instantly hitting the memory limit again.

### Fix Attempt 3 – Close and Reopen Index

Finally, this worked perfectly.

We used the following Python script:

import requests, boto3, json, time

endpoint = "https://vpc-main-xxxx.us-west-2.es.amazonaws.com"
index_name = "mab_b2f97..."

# Close index
print(f"Closing index: {index_name}")
resp = requests.post(f"{endpoint}/{index_name}/_close")
print("Status:", resp.status_code)

time.sleep(30)

# Reopen index
print(f"Reopening index: {index_name}")
resp = requests.post(f"{endpoint}/{index_name}/_open", auth=awsauth)
print("Status:", resp.status_code)

# Check health
resp = requests.get(f"{endpoint}/_cluster/health/{index_name}?pretty", auth=awsauth)
print(json.dumps(resp.json(), indent=2))


Result:

Index closed successfully.
Index reopened successfully.
    Checking index health...
"status": "yellow" → "green"


Then rerunning:

GET _plugins/_knn/stats?pretty


showed:

"circuit_breaker_triggered": false
No nodes above 80% graph memory usage.

The breaker reset cleanly, and indexing resumed.

## Root Cause

One vector index (mab_b2f97...) consumed ~85% of native graph memory on a single node.

The k-NN circuit breaker tripped at 60% limit.

Adding data nodes helped distribute shards but didn’t clear the memory state automatically.

Rebooting nodes reloaded the same graphs.

Closing and reopening the index successfully flushed and rebalanced the k-NN cache.

- Outcome

Circuit breaker cleared

No nodes > 80% memory usage

Indexing & search restored

Cluster status: green

## Lessons Learned

Monitor _plugins/_knn/stats regularly.
It gives visibility into node-level memory pressure.

Circuit breakers protect your cluster.
They prevent out-of-memory crashes but can pause indexing.

Closing & reopening an index is a safe AWS-native reset.
It flushes the FAISS graphs from native memory.

Scaling helps, but placement matters.
Use _cat/shards to ensure balanced shard distribution.

Default circuit breaker limit (60%) is conservative.
It’s safer to scale horizontally than tweak that threshold.

## Next Steps

We’ll continue to:

Monitor k-NN stats and shard placement daily.

Automate alerts if any node exceeds 80% graph memory usage.

Optimize ingestion batch size to reduce vector memory bursts.

Document this process in our internal runbook.

**– Siddharth**