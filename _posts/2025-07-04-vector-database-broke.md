---
layout: single
title: "July 3rd – How We Lost Our Vector Database (and Recovered)"
date: 2025-07-04
author: siddharth
categories: [database]
read_time: true
comments: true
share: true
related: true
toc: true
toc_sticky: true
---

Our vector database of choice is the OpenSearch service. We initially used their serverless instance to power our Retrieval-Augmented Generation (RAG) applications. However, slow ingestion speeds led us to move to a managed cluster setup.

---

## How It Started

During the week of June 30th, we noticed extreme JVM pressure and high CPU utilization in our Test environment. Our setup had:

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

This setup, while memory-optimized, was not ready for our load tests (~100 documents in short bursts). JVM pressure spiked and we needed to scale — fast.

---

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

---

## The Setup in Production

Confident in the new setup, I decided to apply the same configuration to production on **July 3rd**. However, there was one **critical difference**:

- In **test**, we applied configuration and security changes **separately**.
- In **production**, we applied **both** at the same time.

---

## Why Security Changes?

We had observed random index creations in test and wanted to enable **AUDIT_LOGS** to track user activity. That required enabling **advanced security**, which in turn required a **master user**.

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

In the test environment, this change caused a temporary **“RED” cluster state** for ~10 minutes, which reverted to **“GREEN”** successfully. Per AWS docs:

> _“The change triggers a blue/green deployment during which the cluster health becomes red, but all cluster operations remain unaffected.”_  
> — [AWS Docs on FGAC](https://docs.aws.amazon.com/opensearch-service/latest/developerguide/fgac.html#fgac-enabling)

So, I felt confident rolling the same changes into prod.

---

## The Deployment – What Went Wrong?

Once approved, we deployed changes in prod — both the **infrastructure scale-up** and **advanced security enablement** — simultaneously. This was the beginning of the outage. Below is an image of our cluster migration status during the deployment.
![Cluster Migration Status](/assets/images/cluster_migration_1.png)

It showed that new nodes had been added and traffic routing was successful. It had now reached the point where it was supposed to copy the shards to the new nodes. This is when we started noticing issues. The cluster status turned to "RED". We were unable to access the cluster and the OpenSearch dashboard was not loading. Any index or search operation was failing with a "503 Service Unavailable" error.

A quick google search led me to this forum post on AWS. https://repost.aws/knowledge-center/opensearch-domain-stuck-processing
The post basically mentioned that the cluster was stuck in a state where it was trying to copy the shards to the new nodes, but it was unable to do so. It asked us to monitor the current migration of the shard with the following API call:

```bash
GET /DOMAIN_ENDPOINT/_cat/recovery?active_only=true
```

We hit this error:

```json
{
  "error": {
    "type": "security_exception",
    "reason": "OpenSearch Security not initialized for indices:monitor/recovery"
  },
  "status": 503
}
```

That’s when I realized: **the security plugin hadn’t initialized properly**.

I attempted master-user access via IAM — still failed.

---

## AWS Support Weighs In

They were able to confirm that the cluster was stuck in a state where it was trying to copy the shards to the new nodes, but it was unable to do so. They initially mentioned that this is a normal behavior and the cluster would eventually recover. However, after waiting for a few hours, the cluster was still in the same state and we were unable to access it.

AWS confirmed:

- The cluster was stuck during **shard copying** to the new nodes.
- Specifically, the `.opendistro_security` index — which stores security config — **could not be assigned or migrated**.

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

This was the index that was causing the issue. The support team tried to reassign the shard, but it was still failing with the same error. This was an internal AWS index that is used to store the security configuration for the cluster. It was not able to migrate to the new nodes and was causing the cluster to be stuck in a state where it was unable to access any indices.

---

## No Way Out

I had a few options at this point. I could either wait for the cluster to recover on its own, or abandon that cluster and create a new one. I decided to wait for a few more hours, but the cluster was still in the same state. I was unable to access any indices or perform any operations on the cluster. I confirmed that all data nodes were migrated and in active state.

![Cluster Nodes](/assets/images/data_nodes.png)

I explored every workaround:

- **Reassign shards manually?** Blocked.
- **Cancel update?** Not allowed mid-migration.
- **Delete the domain?** Domain was locked in `Processing`.
- **Restore from snapshot?** AWS's default 1-hour snapshots are not user-restorable.

At this point, I was stuck in limbo.

Then we found this [AWS forum post from 2 years ago](https://repost.aws/questions/QUe_bYRWWNTJ23Y9l6Rhhg6w/opensearch-service-how-to-restore-opendistro-security-index) describing **exactly the same scenario**. The same `.opendistro_security` index was unassignable. Unfortunately, AWS support didn’t accept it as conclusive evidence and continued investigating.

---

## Our Recovery Plan

With production deadlocked, we took matters into our own hands:

- **Spun up a new domain**, same configuration — **excluding** advanced security.
- **Reingested from S3**, our source of truth.
- Redirected traffic to the new cluster.

Within a few hours, ingestion was back at 100 docs/sec. The new cluster held up well.

Meanwhile, our old cluster was still at **71% migration** and remained unusable but now with status `yellow`. AWS confirmed that shard migration was partially retriggered — but that didn't help us regain access.

---

## Downtime Summary

- **Total outage**: ~5 hours  
- **User impact**: Minimal (due to long weekend)  
- **Fallback**: Temporary reroute to serverless instance for select users

---

## Lessons Learned

### 1. **Don’t Combine Major Changes**
Scaling and security updates should be rolled out in **separate phases** — especially in production. Always perform a dry run to test the configuration first.

### 2. **Be Cautious with Advanced Security**
Once enabled, **you can’t disable** advanced security. Enable it only when you're confident it won’t block critical operations.

### 3. **Snapshots Matter**
Relying on AWS’s default hourly snapshots isn’t enough. Set up **manual, restorable snapshots**. You cannot restore from AWS's default snapshots directly, so ensure you have a backup strategy that allows you to restore data when needed.

### 4. **Monitoring is Key**
Track migrations closely. If a cluster update takes more than **90 minutes**, escalate immediately.

### 5. **Have a Rollback Plan**
Always have a **tested fallback path** (like our S3 ingestion) to recover quickly in case of failure.

---

## Final Thoughts

We’re still awaiting AWS’s official root cause analysis. But we were lucky: Our fallback pipelines kept this from becoming a full-blown production disaster.

I hope this post helps others avoid the trap we fell into.

**– Siddharth**
