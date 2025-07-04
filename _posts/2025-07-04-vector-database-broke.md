---
layout: single
title: "July 3rd - We lost our vector database."
date: 2025-05-26
author: siddarth
categories: [database]
read_time: true
comments: true
share: true
related: true
toc: true
toc_sticky: true
---

Our vector database of choice is OpenSearch service. We initially relied on their serverless instance to power our RAG Applications, but due to slow ingestion speeds, have moved to managed cluster.

---

## How it started?

During the week of 30th June, we noticed extremely high JVM pressure and CPU utilization in our PoC account. Our shards were default to 5 per index and we had 3 nodes with 1 master node. Below is our very first iteration of cluster config which we still have for our PoC dev domain.

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

As it is evident, we had average throughput, memory optimized instance type and 3 nodes with warm storage enabled. We were ingesting around 100 documents per second, which was causing the JVM pressure to spike and eventually leading to high CPU utilization. This was during our load testing phase, where we were trying to ingest around 1000 documents in a short span of time.

A change was needed, and we had to make it fast. We had to scale our cluster to handle the load and reduce the JVM pressure. Hence we decided to change our cluster configuration to the following:

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

We increased the instance count to 9, changed the instance type to the one with higher memory, and increased the volume size to 1024 GB. We also enabled cold storage options to offload some of the data from the warm storage. This change was made on 1st July, and this led to a significant improvement in the cluster performance. The JVM pressure and CPU utilization came down, and we were able to ingest documents at a much faster rate.

## So what went wrong?

Given that the dev domain was stable and had not caused us any issues, we decided to apply the same configuration to our production domain. We had a similar setup with 3 nodes, warm storage enabled, and we were ingesting around 100 documents per second. 

Based on our past experience with instance updates and node count increase, we were confident that the changes would be applied without any issues. That is when we noticed we needed AUDIT_LOGS enabled to track user activity. We had cases when random indexes were auto created in our test environment and wanted to see what was happening. To enable AUDIT_LOGS, advanced security needs to be enabled, which requires a master user. This is when our issue started.

    advanced_security_options = {
      enabled                        = true # this needs to be enabled if you want AUDIT_LOGS
      internal_user_database_enabled = false
      anonymous_auth_enabled         = false
      master_user_options = {
        master_user_arn = "arn:aws:iam::xxxxxxxxxx:role/user-role"
      }
    }

We set up our terraform configuration to enable advanced security options with a master user. We deployed this change to our test environment first. It took around 30-45 minutes to apply the change, during which time, the cluster status showed "RED". This was for a very short period of time and when we were pointed to the documentation, it was mentioned that the cluster status would be "RED" during the update.

"The change triggers a blue/green deployment during which the cluster health becomes red, but all cluster operations remain unaffected."
source - https://docs.aws.amazon.com/opensearch-service/latest/developerguide/fgac.html#fgac-enabling

The status changed to "GREEN" in roughly 5-10 minutes after which we were able to verify that the cluster was stable and the changes were applied successfully. This gave us the confidence to apply the same changes to our production domain.

We applied the same changes on 3rd July and waited for approval. As soon as the approval came in, we deployed our changes and waited for the cluster to get reconfigured. There was one key difference between both the deployments. In our test environment we increased the the instance config and enabled advanced security options at different steps. In production, we did both at the same time. We were not aware of the implications of doing this, and this is where we are assuming the issue started. (We are still waiting for AWS support to confirm this.)

## What happened next?

What occured next were a series of events unfolding that led to the loss of our vector database. Below is an image of our cluster migration status during the deployment.
![Cluster Migration Status](assets/images/cluster_migration_1.png)

It showed that new nodes had been added and traffic routing was successful. It had now reached the point where it was supposed to copy the shards to the new nodes. This is when we started noticing issues. The cluster status turned to "RED". We were unable to access the cluster and the OpenSearch dashboard was not loading. Any index or search operation was failing with a "503 Service Unavailable" error.

A quick google search led us to this forum post on AWS. https://repost.aws/knowledge-center/opensearch-domain-stuck-processing
The post basically mentioned that the cluster was stuck in a state where it was trying to copy the shards to the new nodes, but it was unable to do so. It asked us to monitor the current migration of the shard with the following API call:

```bash
GET /DOMAIN_ENDPOINT/_cat/recovery?active_only=true
```
We ran the above command and got the following response:

```json
{'error': {'root_cause': [{'type': 'security_exception', 'reason': 'OpenSearch Security not initialized for indices:monitor/recovery'}], 'type': 'security_exception', 'reason': 'OpenSearch Security not initialized for indices:monitor/recovery'}, 'status': 503}
```

That is when we realized that the advanced security options were not enabled properly and the cluster was unable to access the indices. We tried to access the cluster using the master user role, but it was still failing with the same error.

![Shard Migration Doc](assets/images/shard_migration_doc.png)

This is when we reached out to AWS support for help. They were able to confirm that the cluster was stuck in a state where it was trying to copy the shards to the new nodes, but it was unable to do so. They initially mentioned that this is a normal behavior and the cluster would eventually recover. However, after waiting for a few hours, the cluster was still in the same state and we were unable to access it.

Since during a migration, we were unable to perform any operations on the cluster, we were unable to make any changes. We asked the support staff to try and find the root cause of the issue. They said that a particular security node was unable to migrate and get activated. 
```json
{
  "index": ".opendistro_security",
  "shard": 0,
  "primary": false,
  "current_state": "unassigned",
  "unassigned_info": {
    "reason": "INDEX_CREATED",
    "at": "2025-07-03T21:27:11.736Z",
  }
}
```
This was the index that was causing the issue. The support team tried to reassign the shard, but it was still failing with the same error. This was an internal AWS index that is used to store the security configuration for the cluster. It was not able to migrate to the new nodes and was causing the cluster to be stuck in a state where it was unable to access any indices.

## What were our options?

We had a few options at this point. We could either wait for the cluster to recover on its own, or abandon that cluster and create a new one. We decided to wait for a few more hours, but the cluster was still in the same state. We were unable to access any indices or perform any operations on the cluster. We confirmed that all data nodes were migrated and in active state.

![Cluster Nodes](assets/images/data_nodes.png)

Support confirmed that we would not be able to delete or cancel the migration since it was in a migrating state. We were also unable to delete the domain since it was in a "processing" state. The only option we had was to create a new domain and migrate the data from the old domain to the new one.

That is when I found this post on the AWS forum pointing to the exact same issue we were having, but 2 years ago. [Link to Forum Post](https://repost.aws/questions/QUe_bYRWWNTJ23Y9l6Rhhg6w/opensearch-service-how-to-restore-opendistro-security-index)

The user had the same issue. The cluster status was red, so they made a list of unallocated shards with this reference, The .kibana_1 and .opendistro_security shards were unassigned. They were able to delete the .kibana_1 index, but the .opendistro_security index was not able to be delete since it was an AWS managed index. We sent this post to the AWS support team but they were not convinced that this was the same issue we were having. They said that they would need to investigate further and get back to us.

## What did we do?

We had no choice but to create a new domain and migrate the data from the old domain to the new one. We created a new domain with the same configuration as the old one but with advanced security option disabled. We had our source data in S3, so we pointed all our ingestion pipelines to the new domain and started ingesting the data. We were able to ingest around 1000 documents in a short span of time, and the cluster was stable. The new cluster was able to handle the load and we were able to access the indices without any issues.

During this time, our broken domain had the health turn to Yellow. The support staff confirmed that they are retriggered some migration and we started seeing some shards being migrated, but it was still stuck at 71% and we were unable to access the cluster. It has been 6 hours since that particular migration was retriggered and we are still unable to access the old broken cluster.

We had a downtime of 5 hours but were able to bring up our new cluster and resume our operations. We were able to ingest the data and access the indices without any issues. The new cluster was stable and we were able to continue our operations without any further issues. Since it was just before the long weekend, our traffic has significantly reduced and we were able to perform this migration without any user impact. There were a few active users, but we quickly rerouted them to our old serverless instance which was still up and running.

## Conclusion

There are a few key takeaways from this incident:
1. **Cluster Configuration**: Always test your cluster configuration changes by performing a dry run, before applying them to production. This will help you identify any potential issues and avoid downtime.
2. **Advanced Security Options**: Enabling advanced security options can cause issues during cluster migration. It is recommended to enable them after the cluster has been migrated to the new nodes. You cannot disable advanced security options once they are enabled, so be careful while enabling them.
3. **AWS Support**: AWS support may not always be able to help you with your issues. It is recommended to have a backup plan in place in case you encounter any issues with your cluster.
4. **Utilize Snapshots**: Always take snapshots of your data before making any changes to your cluster. This will help you restore your data in case of any issues. We are not sure if we would have been able to restore our data from the snapshots, but it is always a good practice to take snapshots before making any changes to your cluster. What we have currently is AWS default 1 hour snapshots. AWS does not allow you to restore from those snapshots.
5. **Monitoring**: Monitor your cluster closely during migration and be prepared to take action if you notice any issues. We were able to identify the issue early on and take action before it escalated further. If a cluster update is taking more than 1.5 hours, it is recommended to start evaluating the situation.

We are still waiting for AWS support to confirm the root cause of the issue, but we are glad that we were able to recover from it without any major impact. We will be implementing the above recommendations to avoid such issues in the future.

**Siddarth**
