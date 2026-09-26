---
layout: post
title: "July 3rd – How We Lost Our Vector Database (and Recovered)"
date: 2025-07-04
categories: [database]
tags: [opensearch, aws, incident, rag]
toc: true
---

Our vector database of choice is the AWS OpenSearch Service. We initially used the serverless offering to power our Retrieval-Augmented Generation (RAG) applications, but slow ingestion speeds led us to migrate to a managed cluster. On July 3rd, a scale-up of that cluster took it down for about five hours.

<!--more-->

## TL;DR

- **Incident date:** July 3, 2025
- **Duration:** ~5 hours
- **Impact:** Production OpenSearch cluster became inaccessible after we applied a scale-up and an advanced security change in the same deployment.
- **Root cause (confirmed by AWS on July 22):** Enabling fine-grained access control (FGAC) and remote store migration at the same time left the domain stuck in a modifying state, with the `.opendistro_security` system index unassignable.
- **Recovery:** Spun up a fresh domain without advanced security and reingested from S3.

Anything marked *SPECULATION* below was written before AWS delivered the root cause analysis and is left as-is to show what we knew at the time.

## Updates

### July 22, 2025

We received the root cause analysis from AWS support. They confirmed that the issue was caused by the simultaneous scaling and security changes. The domain was stuck in a modifying state because two configuration changes, enabling remote store and enabling FGAC, were applied together. That combination can leave one of the system indices in a red state. AWS resolved it by deleting the affected system index and retrying the process, and said they will be implementing fixes to prevent similar incidents in the future.

> Until then, we recommend following this sequence: Enable FGAC first and then proceed with remote store migration if needed.
>
> — AWS Support

This was a huge relief. It confirmed our suspicions and gave us a clear path forward. It's also a recommendation I should have followed with or without AWS confirming it: during any migration or major change, apply steps in a sequence that is known to work. I'm glad the AWS support team got us out of this quickly and with no data loss.

### July 5, 2025

AWS support confirmed that our cluster had fully recovered and was in a healthy state. The migration was complete and all indices were accessible. We confirmed the same by looking at the cluster status. Next we needed to test the cluster and decide whether to point our pipelines back at it.

We were waiting on AWS to tell us whether they could sync the two clusters, the old one and the new one. If so, we could move pipelines to the new cluster without losing any data. If not, we would have to reingest from S3 again. I also needed approval from my Director before pointing pipelines back at the old cluster.

So we wait...

### July 4, 2025

AWS support identified a stuck snapshot blocking shard relocation and requested approval to perform a rolling restart of data nodes in the blue environment. After getting our approval for potential outages (we had a backup domain that was now being used actively), they restarted the nodes and confirmed the cluster returned to a healthy green state with all indices accessible.

Looking at the cluster status myself, I saw that the cluster, although green, was still trying to apply some changes.

![Cluster status: green but still applying changes](/assets/images/cluster_latest_state_green.png)

## How It Started

During the week of June 30th, we noticed extreme JVM pressure and high CPU utilization in our test environment. Our setup had:

- **5 shards per index** (default)
- **3 nodes** with 1 dedicated master node
- **Warm storage enabled**
- **Document ingestion rate:** ~100 docs/sec

Our initial configuration looked like this:

```hcl
cluster_config = {
  instance_count           = 3
  dedicated_master_enabled = true
  dedicated_master_type    = "c7g.large.search"
  instance_type            = "r7g.large.search"
  warm_count               = 3
  warm_enabled             = true
  warm_type                = "ultrawarm1.large.search"
  cold_storage_options = {
    enabled = false
  }
  zone_awareness_config = {
    availability_zone_count = 3
  }
  zone_awareness_enabled = true
}
ebs_options = {
  ebs_enabled = true
  iops        = 3000
  throughput  = 250
  volume_type = "gp3"
  volume_size = 512
}
encrypt_at_rest = {
  enabled = true
}
```

This setup, while memory-optimized, was not ready for our load tests (~100 documents in short bursts). JVM pressure spiked and we needed to scale, fast.

## Scaling Up

I rolled out a new configuration on **July 1st**, increasing node count, instance size, and enabling cold storage:

```hcl
cluster_config = {
  instance_count           = 9
  dedicated_master_enabled = true
  dedicated_master_count   = 3
  dedicated_master_type    = "r7g.large.search"
  instance_type            = "or2.2xlarge.search"
  warm_count               = 3
  warm_enabled             = true
  warm_type                = "ultrawarm1.large.search"
  cold_storage_options = {
    enabled = true
  }
  zone_awareness_config = {
    availability_zone_count = 3
  }
  zone_awareness_enabled = true
}
ebs_options = {
  ebs_enabled = true
  iops        = 3000
  throughput  = 250
  volume_type = "gp3"
  volume_size = 1024
}
```

This resulted in a major performance improvement: JVM pressure dropped, CPU stabilized, and ingestion was smooth.

## The Setup in Production

Confident in the new setup, I decided to apply the same configuration to production on **July 3rd**. However, there was one **critical difference** (*SPECULATION:* there might be more than one):

- In **test**, we applied the configuration and security changes **separately**.
- In **production**, we applied **both** at the same time.

## Why Security Changes?

We had observed random index creations in test and wanted to enable **audit logs** to track user activity. That required enabling **advanced security**, which in turn required a **master user**. Advanced security also provides fine-grained access control (FGAC) and internal user database management.

```hcl
advanced_security_options = {
  enabled                        = true
  internal_user_database_enabled = false
  anonymous_auth_enabled         = false
  master_user_options = {
    master_user_arn = "arn:aws:iam::xxxxxxxxxx:role/user-role"
  }
}
```

In the test environment, this change caused a temporary **red cluster state** for ~10 minutes, which reverted to **green** successfully. Per the AWS docs:

> The change triggers a blue/green deployment during which the cluster health becomes red, but all cluster operations remain unaffected.
>
> — [AWS docs on enabling FGAC](https://docs.aws.amazon.com/opensearch-service/latest/developerguide/fgac.html#fgac-enabling)

So I felt confident rolling the same changes into prod.

## The Deployment: What Went Wrong?

Once approved, we deployed both the **infrastructure scale-up** and **advanced security enablement** to prod simultaneously. This was the beginning of the outage (*SPECULATION:* we do not know for sure that this was the trigger). Below is our cluster migration status during the deployment.

![Cluster migration status during the deployment](/assets/images/cluster_migration_1.png)

It showed that new nodes had been added and traffic routing was successful. It had reached the point where it was supposed to copy shards to the new nodes. This is when we started noticing issues. The cluster status turned red. We were unable to access the cluster and the OpenSearch dashboard was not loading. Any index or search operation failed with a `503 Service Unavailable` error.

A quick Google search led me to [this AWS re:Post article](https://repost.aws/knowledge-center/opensearch-domain-stuck-processing). It described a cluster stuck trying to copy shards to new nodes and suggested monitoring the shard migration with:

```text
GET /_cat/recovery?active_only=true
```

We hit this error instead:

```json
{
  "error": {
    "type": "security_exception",
    "reason": "OpenSearch Security not initialized for indices:monitor/recovery"
  },
  "status": 503
}
```

That's when I realized: **the security plugin hadn't initialized properly**.

I attempted master-user access via IAM. Still failed.

This was around 3:00 pm.

## AWS Support Weighs In

At 6:15 pm I contacted AWS support. They confirmed the cluster was stuck trying to copy shards to the new nodes. They initially said this was normal behavior and the cluster would eventually recover. After a few more hours, it was still in the same state and we still had no access.

AWS confirmed:

- The cluster was stuck during **shard copying** to the new nodes.
- Specifically, the `.opendistro_security` index, which stores the security config, **could not be assigned or migrated**.

```json
{
  "index": ".opendistro_security",
  "shard": 0,
  "primary": false,
  "current_state": "unassigned",
  "unassigned_info": {
    "reason": "INDEX_CREATED",
    "at": "2025-07-03T21:27:11.736Z"
  }
}
```

This was the index causing the issue (*SPECULATION:* semi-confirmed by AWS on the Chime call). The support team tried to reassign the shard, but it kept failing with the same error. `.opendistro_security` is an internal index that stores the cluster's security configuration. Because it couldn't migrate to the new nodes, the cluster couldn't serve any indices at all.

## No Way Out

I had a few options at this point: wait for the cluster to recover on its own, or abandon it and create a new one. I waited a few more hours. Same state. I couldn't access any indices or perform any operations, even though all data nodes had migrated and were active.

![Data nodes all migrated and active](/assets/images/data_nodes.png)

I explored every workaround:

- **Reassign shards manually?** Blocked.
- **Cancel the update?** Not allowed mid-migration.
- **Delete the domain?** Domain was locked in `Processing`.
- **Restore from snapshot?** AWS's automated hourly snapshots are not user-restorable.

At this point, I was stuck in limbo.

Then we found [an AWS re:Post question from two years ago](https://repost.aws/questions/QUe_bYRWWNTJ23Y9l6Rhhg6w/opensearch-service-how-to-restore-opendistro-security-index) describing **exactly the same scenario**: the same `.opendistro_security` index, unassignable. Unfortunately, AWS support didn't accept it as conclusive evidence and continued investigating.

## Our Recovery Plan

With production deadlocked, we took matters into our own hands:

- **Spun up a new domain** with the same configuration, **excluding** advanced security.
- **Reingested from S3**, our source of truth.
- **Redirected traffic** to the new cluster.

Within a few hours, ingestion was back at 100 docs/sec. The new cluster held up well.

Meanwhile, the old cluster was still at **71% migration**. Its status had moved to yellow but it remained unusable. AWS confirmed that shard migration had been partially retriggered, but that didn't help us regain access.

## Downtime Summary

- **Total outage:** ~5 hours
- **User impact:** Minimal (long weekend)
- **Fallback:** Temporary reroute to the serverless instance for select users

## Lessons Learned

### 1. Don't combine major changes

Scaling and security updates should be rolled out in **separate phases**, especially in production. Always perform a dry run to test the configuration first.

### 2. Be cautious with advanced security

Once enabled, **you can't disable** advanced security. Enable it only when you're confident it won't block critical operations.

### 3. Snapshots matter

Relying on AWS's automated hourly snapshots isn't enough, because you can't restore from them yourself. Set up **manual, restorable snapshots** and a backup strategy that lets you recover on your own timeline.

### 4. Monitoring is key

Track migrations closely. If a cluster update takes more than **90 minutes**, escalate immediately.

### 5. Have a rollback plan

Always have a **tested fallback path** (like our S3 ingestion) to recover quickly in case of failure.

## Final Thoughts

AWS's root cause analysis (see the July 22 update above) confirmed what we suspected: the two changes should never have shipped together. We were lucky that our fallback pipelines kept this from becoming a full-blown production disaster.

I hope this post helps others avoid the trap we fell into.

**– Siddharth**
