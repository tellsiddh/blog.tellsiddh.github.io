---
layout: post
title: "Is the Future of Software Engineering Agentic? What the Data Says in 2026"
date: 2026-09-25
categories: [tech]
tags: [ai, agents, career]
toc: true
---

Every few weeks someone tells me the software engineer is finished, and every few weeks someone else tells me nothing has really changed. Both are wrong, and both are wrong in ways you can measure. I spent a while reading the predictions, the controlled studies, the labor data, and the history, and this post is my attempt to write down what is actually known as of September 2026, what is still open, and what I think happens next.

<!--more-->

A note on how I wrote this. I tried to separate three things that usually get blended together: what people with something to sell are saying, what controlled or large-scale measurements show, and what I personally believe. Where I am guessing, I say so. Where a number is self-reported or comes from a vendor, I say that too. Every number has a footnote so you can check it.

## Where we actually are, September 2026

Start with the things that are not in dispute.

Adoption is essentially total. The 2025 Stack Overflow survey (49,000+ respondents) had 84% of developers using or planning to use AI tools, with 51% of professionals using them daily.[^so2025] DORA's 2025 report put it at 90% of tech professionals.[^dora2025] Stack Overflow's May 2026 agents pulse survey found 59% using agents at work, up from 31% a year earlier.[^so-agents] Whatever you think of the tools, the "will people adopt this" question is closed.

The money is real. Cursor went from $100M annualized revenue in January 2025 to about $4B by June 2026.[^cursor] Anthropic reported Claude Code passing $2.5B run-rate in February 2026.[^claude-code-rev] OpenAI reported Codex at over 5M weekly users by mid-2026.[^codex] Run-rate is a flattering metric (last month times twelve), but these are not toy numbers.

The share of code written by machines at AI-forward companies is high. Google said in April 2026 that 75% of new code is "AI-generated and approved by engineers," up from 50% the previous fall.[^google75] Anthropic reported in June 2026 that over 80% of code merged to its production codebase in May was authored by Claude.[^anthropic80] Coinbase claimed 95 to 100% by July 2026.[^coinbase] Every one of these numbers is self-reported by a company that sells AI, and none of them publish a denominator (does autocomplete count? tests? generated boilerplate?). But the direction is consistent across all of them and I do not think it is fabricated.

And the tools crossed a threshold in late 2025. The clearest signal is Andrej Karpathy, who is not a vendor. In October 2025 he [told Dwarkesh Patel](https://www.dwarkesh.com/p/andrej-karpathy) that coding agents "just don't work," called their output slop, and said they were not net useful on his own project. On February 26, 2026 he [posted](https://simonwillison.net/2026/Feb/26/andrej-karpathy) that "coding agents basically didn't work before December and basically work since." By March 2026 he said he had not typed code by hand since December.[^karpathy-march] When the person who coined "vibe coding" as a half-joke flips from skeptic to full delegation in four months, something changed in the models, not just the marketing.

So: everyone is using it, a lot of code is coming out of it, and the tools got materially better around the turn of the year. That is the baseline. Now the harder questions.

## What controlled studies actually show about productivity

This is where the gap between claims and measurements is widest.

The most-cited rigorous study is METR's randomized controlled trial published July 2025.[^metr2025] Sixteen experienced open-source maintainers (median ten years experience) worked 246 real tasks on their own repos, randomized to AI-allowed or not. The AI-allowed tasks took 19% longer. The part I keep coming back to: before starting, the developers predicted AI would make them 24% faster. After finishing, having been measurably slowed down, they still believed it had made them about 20% faster. Economists surveyed beforehand predicted 39% speedup. Everyone was wrong in the same direction.

The obvious objection is that this was early-2025 tooling (Cursor with Claude 3.5/3.7 Sonnet) on codebases the developers knew intimately, where an agent has the least to add. METR said as much. So they ran it again.

The February 2026 follow-up had 57 developers, 143 repos, and 800+ tasks with later tools.[^metr2026] For the ten developers who returned from the original study, the point estimate flipped to an 18% speedup, but the confidence interval ran from -38% to +9%, which is to say it crossed zero. For the 47 new developers: 4% speedup, interval -15% to +9%. METR's own language was that this is "very weak evidence" and probably a lower bound, because the study design broke: 30 to 50% of participants admitted withholding tasks they did not want to do without AI, and timing became unreliable once people started running multiple agents in parallel. They are abandoning the design entirely. That last part is the most honest thing in the whole literature. The tool changed the shape of work enough that the ruler stopped fitting.

Google's internal RCT (96 engineers, one enterprise task) found about 21% time reduction, with the authors noting a wide interval.[^google-rct] That is a real gain. It is also one task in a lab-like setting.

The largest field study I found is from July 2026: 802 developers, 196,212 pull requests, January 2024 to April 2026, at one mid-sized company that had an explicit "2x PR output" mandate.[^vasilescu] Merged PRs per person hit 2.09x the baseline. Per-reviewer load roughly doubled. Automated review overtook human review in volume. Merge and revert rates held flat. The title of the paper is "AI Writes Faster Than Humans Can Review," and that is the finding. Output doubled; the ability to check it did not.

DORA's 2025 report (about 5,000 respondents) is the best survey-scale data and it lands in the same place from a different angle.[^dora2025] In 2024, DORA found that every 25% increase in AI adoption correlated with a 1.5% drop in throughput and a 7.2% drop in delivery stability.[^dora2024] In 2025 the throughput correlation turned positive, but instability kept rising. DORA's framing is that AI is an amplifier: it makes good organizations better and dysfunctional ones worse. Gergely Orosz's 2026 survey of engineering leaders found the same split, with some orgs reporting twice as many customer-facing incidents and others half as many.[^orosz] There is no 2026 DORA report; they paused the annual survey this year.[^dora-pause]

Here is what I take from all of this. The honest range for measured individual productivity gain with current tools, on real work, is somewhere between "slightly negative" and "about 20% faster," with a self-perception gap of 20 to 40 points on top. The 2x, 5x, and 10x numbers you hear are either PR volume (which the Vasilescu study shows you can mandate into existence), or self-reported, or from people who have restructured their entire workflow around agents and are describing their own experience, which is real but does not transfer to a team by decree.

Anthropic itself, in the same June 2026 report that claimed 80% of merged code, said that code volume overstates true productivity and that human review is the new bottleneck.[^anthropic80] When the most bullish company in the space says that, believe them.

## The quality bill is arriving

If output goes up and verification does not, something has to give, and we have data on what.

GitClear's June 2026 report, covering 2023 through mid-2026, found duplicated code blocks per million changed lines went from 40.3 to 73.0, an 81% increase.[^gitclear] Moved or refactored code as a share of changes fell from 21% in 2022 to 13% in 2023 to 3.8% in 2026. Copy-paste rose from 9.4% to 15.7%. Error-masking constructs (empty catches, silent fallbacks) up 47%. GitClear sells a code quality product, so discount accordingly, but nobody has published contradicting data, and every one of those metrics moves in the direction you would predict if the writer of the code does not have to maintain it.

Veracode's GenAI code security reports found that 45% of coding tasks (2025) and 44% (2026) introduced an OWASP Top 10 vulnerability in raw model output.[^veracode] Syntax correctness went to nearly 100% between the two reports. Security pass rate went from 55% to 56%. The models got dramatically better at producing code that compiles and runs and barely moved on producing code that is safe. This is measured on raw output without agentic self-review or scanners, so the real-world number with a good pipeline is better. But it tells you where the models' own gradient points.

Then there is the benchmark problem. On SWE-bench Verified, frontier models now score above 90% according to every tracker, and the benchmark is widely considered saturated and contaminated. Scale AI's SWE-bench Pro V2 (September 22, 2026) is the cleanest primary source I found on this: the top model scores 99.4% on the public task set and about 81.6% on a private, held-out set.[^swebench-pro] Scale attributes most of that 17.8 point gap to training-time exposure. Still, 81.6% on genuinely unseen, network-locked, real-repo tasks is remarkable. A year earlier the top score on SWE-bench Pro was 23.3%.

METR's time-horizon metric is the other capability measure worth knowing.[^metr-horizon] It asks: how long a task (in human-expert hours) can a model complete with 50% reliability? Their January 2026 update put the post-2023 doubling time at about 4.3 months. The most capable model they measured (evaluated March 2026) had a 50% horizon of at least 16 hours, at which point METR posted a notice that their task suite can no longer measure reliably above that. Their FAQ is careful to note these are clean, self-contained, algorithmically scored tasks, and the horizon is what a low-context contractor could do, not a high-context employee. The 80% reliability horizon is much shorter. On messy tasks with holistic scoring, performance drops.

Simon Willison [put the quality question](https://simonwillison.net/2026/jun/4/ai-enthusiasts-ai-skeptics/) better than I can, in June 2026: when you ship code faster than engineers can read it, you are making withdrawals from a trust account. Enthusiasts are in a race against time, skeptics are in a race against entropy. Both races are real and I do not know who wins.

## The labor market: the damage is at the entry level

This is the part where I think most commentary is either dishonestly rosy or dishonestly apocalyptic, so I am going to give you the numbers and let them sit.

The Stanford Digital Economy Lab "Canaries in the Coal Mine" paper (Brynjolfsson, Chandar, Chen) uses ADP payroll data on millions of workers.[^canaries] In its August 2026 revision, employment of 22 to 25 year olds in the most AI-exposed occupations is 19% below where it would be had it tracked less-exposed peers. In the original August 2025 version, software developers aged 22 to 25 were down nearly 20% from their late-2022 peak while developers 35 and over grew. The adjustment happens through reduced hiring, not firings. It shows up in headcount, not in pay. The effect is concentrated where AI automates rather than augments. The authors are explicit that these are descriptive patterns, not causal estimates, and the divergence survives controls for interest rates, remote work, and excluding tech firms.

SignalFire's 2026 talent report (LinkedIn-style profile data, so it undercounts some hires) has Big Tech new-grad and entry-level hiring down about 65% versus 2019, and down about 76% at early-stage startups.[^signalfire] Top CS grads in 2025 were 45% less likely to land a Big Tech job than the 2022 class. Engineering managers now average 12 reports, up from 10. SignalFire's own headline was that the "AI Code Apocalypse" for engineers failed to materialize, because total engineering headcount held up far better than design, product, or marketing. What collapsed was the on-ramp.

The NY Fed's data by major has computer engineering at 7.5 to 7.8% unemployment for recent grads, second highest of 73 majors, and computer science at 6.1 to 7.0%, top five.[^nyfed] But CS underemployment is around 19% versus roughly 40% for all majors. Unemployed CS grads are not working retail; they are either in the field or not working. That is a harder market, not a dead one.

Meanwhile, at the senior end, the picture is different. Indeed Hiring Lab (July 2026) found US software development postings up about 15% since Claude Code launched in February 2025, while overall postings fell 7%.[^indeed-postings] Postings are still about 27.5% below February 2020. Of the year-over-year increase, 71% was senior roles and 37% had "AI" in the title. Senior positions were 69.3% of all software development postings in Q1 2026, the highest share of any occupation Indeed tracks.[^indeed-senior]

BLS still projects software developers growing 10% from 2025 to 2035 (1.9M jobs, about 106,000 openings a year, median pay $135,980).[^bls-dev] BLS projections are ten-year trend models and historically slow to absorb technology shocks, and BLS itself flags AI as a risk to this one. Treat it as a prior, not a forecast.

Layoffs: roughly 140,000 US tech cuts year-to-date in 2026 per the FT, with Amazon, Oracle, Meta, and Microsoft accounting for about 50,000.[^techcrunch-layoffs] Challenger, Gray & Christmas counted about 55,000 US layoffs explicitly citing AI in 2025, twelve times 2023's figure.[^challenger] Block cut nearly half its staff. Salesforce cut about 4,000 support roles with Benioff saying "I need less heads."[^benioff] Coinbase cut 14% with Armstrong saying engineers ship in days what used to take a team weeks.[^techcrunch-layoffs]

And then the reversals. Klarna's CEO said in May 2025 that they focused too much on cost and got lower quality, and resumed hiring humans.[^klarna] Robert Half surveyed about 2,000 managers in April 2026 and found 32% of those who eliminated a role for AI later rehired the same or similar role.[^reversals] Gartner predicts half of companies attributing cuts to AI will rehire similar roles by 2027. The FT found companies citing AI for cuts underperformed the Nasdaq by about 10% over the following 30 trading days.[^techcrunch-layoffs] Andrew Ng's term for this is ["AI washing,"](https://x.com/AndrewYNg/status/2043742105852621052) and I think he is partly right: pandemic over-hiring and interest rates explain a lot of 2022 to 2024. But the Stanford data controls for those and the entry-level effect persists.

Jos Visser, who spent years at Google and is now at OpenAI, [wrote something](https://josvisser.substack.com/p/a-possible-future-of-software-engineering) in June 2026 that I think is the most honest sentence in any of the pieces I read. On the question of where senior engineers come from if nobody hires juniors: "For now I assume that everyone assumes that is someone else's problem." He also notes that neither Anthropic nor OpenAI hire new grads. Charity Majors [said the same thing](https://charitydotwtf.substack.com/p/ai-demands-more-engineering-discipline) more bluntly back in 2024: by not training juniors we are cannibalizing our own future. Two years later, the data says that is exactly what is happening, and nobody has a plan.

## A scorecard on the loud predictions

Predictions with dates can be checked. Here is how the famous ones did.

| Who | When | Claim | Status, Sept 2026 |
|---|---|---|---|
| Dario Amodei[^amodei90] | Mar 2025 | AI writes 90% of code in 3 to 6 months, essentially all in 12 | True inside Anthropic (80%+ by May 2026) and at a handful of AI-forward companies. Not true industry-wide. He later softened to a Jevons-paradox framing.[^amodei-jevons] |
| HN commenter reading Amodei's essay[^hn-amodei] | Jan 2025 | "Software engineering fully automated by 2027, the 0.01% engineer" | [The essay](https://darioamodei.com/essay/machines-of-loving-grace) never says this. The thread itself caught it. Still repeated constantly. |
| Boris Cherny (Claude Code)[^cherny] | Feb 2026 | "The title software engineer is going to start to go away" by end of 2026 | Postings with the title are up 15% since Feb 2025 per Indeed. Wrong on the title, possibly right on the content of the job. |
| Andrej Karpathy | Oct 2025 | Agents "just don't work," not net useful | He reversed himself in Feb 2026. Honest about it, and the reversal is the datapoint. |
| Andrew Ng | Apr 2026 | Jobpocalypse won't happen; postings rising; reading generated code "is not that important" | Right on postings, right on AI washing. The claim that reading generated code doesn't matter contradicts every quality dataset above and I think it is the single most dangerous idea in this debate. |
| Martin Fowler[^fowler] | Feb 2026 | Most LLM claims were "little better than snake oil," but this time is different | By July 2026: "The whole debate about whether this changes software engineering is over." |
| JetBrains[^jetbrains] | Sept 2026 | "Code becomes cheaper to generate but more expensive to verify" | Consistent with Vasilescu, GitClear, Anthropic's own report. It is also exactly the problem their new product line sells a solution to. |

The pattern: the people closest to frontier labs were directionally right about capability and early by about a year on the timeline. The people saying "nothing changes" were wrong. The people saying "everyone is fired by 2027" misread their own source. And almost everyone underweighted the verification problem until the data forced it.

## What history actually says (with numbers)

Three analogies get thrown around. They are more useful than people think, but only if you read to the end of the story.

ATMs and tellers. US ATMs went from about 100,000 to 400,000 between 1995 and 2010. Tellers went from about 500,000 in 1980 to about 600,000 in 2010.[^bessen] Cheaper branches meant more branches, and tellers shifted to relationship work. This is the Jevons paradox example everyone cites. What they skip: BLS counts 339,200 tellers in 2025, projected down another 13% by 2035.[^bls-tellers] The complementarity held for about thirty years and then mobile banking broke it. The lesson is not "automation creates jobs." It is "automation creates jobs until the demand it unlocks is itself automated."

Spreadsheets and accounting. Bookkeepers and accounting clerks fell from about 2.0M in 1987 to 1.5M in 2000. Accountants and auditors rose from 1.3M to 1.5M. Management analysts and financial managers went from 0.6M to 1.5M.[^spreadsheets] The job that was mostly "execute the calculation" shrank by a quarter. The jobs that were "decide what to calculate and what it means" more than doubled. The total went up. The people who lost the clerk jobs were not, for the most part, the people who got the analyst jobs.

Offshoring. In 2000, BLS counted 530,730 "computer programmers" and about 640,000 "software engineers."[^bls2000] The offshoring panic of 2002 to 2005 predicted mass elimination of US developer jobs. By 2015, programmers had fallen to about 295,000 (down 45%) while software developer titles had risen to about 1.14M (nearly doubled).[^bls2015] Total up about 22%. The occupation whose definition was "translate a spec into code" shrank. The occupation whose definition included owning the design grew. Real people in the first group had real careers disrupted.

The consistent shape across all three: the execution layer of a job gets automated, the judgment layer grows, total headcount often rises, the transition is brutal for the specific people in the execution layer, and the complementarity is not permanent. I see no reason software would be exempt from any part of that pattern, including the last part.

## So is the future agentic coding?

Yes, for code production. I do not think this is in doubt anymore. The share of code typed by humans is heading toward a small minority at any organization that is paying attention, and the Karpathy reversal is the tell that the tools crossed from "impressive demo" to "default workflow" around December 2025. Addy Osmani's [framing](https://addyosmani.com/blog/future-agentic-coding/) of conductor (one agent, tight loop) versus orchestrator (fleets of agents producing PRs asynchronously) matches what I see, and the orchestrator mode is where the growth is. JetBrains' prediction that more work gets triggered by repository events and schedules rather than a developer opening an editor is, I think, correct on a three-year horizon.[^jetbrains]

No, for software engineering as a job, if you define the job correctly. And here is where I want to be concrete rather than comforting.

The job was never typing. I have written two incident posts on this blog about an OpenSearch cluster: one where a [blue/green deployment wedged](/database/vector-database-broke/) on an unassignable security index for five hours, one where a [k-NN circuit breaker tripped](/database/vector-database-circuit-breaker/) and rebooting the node did nothing because it reloaded the same graphs. Neither of those was a coding problem. They were problems of knowing which of three plausible fixes to try first, knowing when to call AWS support versus keep digging, knowing that closing and reopening the index would flush native memory when a reboot would not, and being the person whose name was on the decision to migrate. An agent can now write the diagnostic scripts faster than I can. It cannot yet be the one who is accountable for the cluster. JetBrains put it as "an agent will not get the call at 3:00 am when something breaks," and that is marketing copy, but it is also true.

What I think the role becomes, stated as claims you can check against me later:

1. Verification becomes the primary skill and the primary bottleneck, and it is a harder skill than writing. The Vasilescu study showed reviewer load doubling. Anthropic said review is the bottleneck. Thoughtworks' 2026 Europe retreat report said code generation is no longer the bottleneck, verification is.[^thoughtworks] Stack Overflow's 2025 top frustration was "almost right, but not quite" at 66%.[^so2025] Reading code you did not write, at volume, for subtle wrongness, is the job now. Ng saying reading generated code is not important is, I think, the position that will age worst.

2. The junior pipeline problem does not fix itself, and it will be visible as a senior shortage around 2029 to 2031. This is the one I am most confident about and the one with the fewest people working on it. If entry-level hiring stays down 65% for five years, the 2030 cohort of engineers with five years of experience is a third the size it should be. Companies that solve internal training will have a structural advantage. Most will not try.

3. Total software engineering headcount does not collapse in the next five years, but its composition shifts hard toward people with judgment about systems, and pay compression at the top is likely. Visser's point that the 2010 to 2020 shortage was the historical anomaly is probably right. BLS's 10% growth projection is probably too high and the "fully automated by 2027" claim is wrong. My guess, and this is a guess, is that US developer employment is roughly flat to slightly up through 2030 with a very different age and seniority distribution than 2022.

4. The complementarity is not permanent, and I do not know when it breaks. METR's horizon is doubling every four to five months on clean tasks. The tellers had thirty years. I would not bet on thirty. I also would not bet on three. The honest answer is that the capability curve is steeper than any prior automation wave and the messiness of real systems is a bigger buffer than benchmarks suggest, and I do not have a model that resolves those two facts.

5. Organizations that treat this as a tooling change rather than a process change will get worse, measurably. DORA's amplifier finding and Orosz's 2x incidents versus 50% fewer incidents split are the same result. The tool does not have a sign; the organization gives it one.

What I am not claiming: that agents will not eventually do the judgment work too. Amodei's ["country of geniuses in a datacenter"](https://darioamodei.com/essay/machines-of-loving-grace) might arrive. The physical-world bottlenecks he cites as the limiting factor are much weaker for software than for biology, which is exactly why coding went first. I do not think anyone has a defensible date for that and I am not going to invent one.

## What I am actually doing about it

Not advice, just what I have concluded for myself.

I am treating agent output as untrusted by default, the same way I treat any PR from someone I have not worked with. Not because the models are bad. Because the cost of my review going to zero is the entire failure mode in the data.

I am spending more time on the layer above the code: the data model, the failure modes, the runbook, the thing that pages at 3am. That is where the leverage is and it is where the agents are weakest right now.

I am keeping agent session transcripts. Willison's [point](https://news.ycombinator.com/item?id=46354185) that the work increasingly is the session, and that the failures in it are where the value is, matches my experience. A commit tells you what changed. The transcript tells you what was tried and rejected.

I am running my own models and writing my own small agents, not because I need to, but because Visser is right that not understanding the tool you are managing is a disservice to yourself.

And I am watching the junior hiring numbers more than the benchmark numbers. The benchmarks tell you what the models can do. The hiring numbers tell you what the industry has decided to do about it, and right now the industry has decided to stop growing the next generation and hope someone else deals with it. That decision will show up in the data long before any benchmark does.

**– Siddharth**

[^so2025]: Stack Overflow, [2025 Developer Survey: AI](https://survey.stackoverflow.co/2025/ai/), July 2025. 49,000+ respondents, self-selected online sample.
[^dora2025]: Google Cloud, [2025 DORA State of AI-assisted Software Development](https://cloud.google.com/blog/products/ai-machine-learning/announcing-the-2025-dora-report), September 2025. About 5,000 survey respondents; correlational.
[^so-agents]: Stack Overflow, [Agents on a leash: agentic AI remains mostly monitored at work](https://stackoverflow.blog/2026/05/27/agents-on-a-leash-agentic-ai-remains-mostly-monitored-at-work/), May 2026. 1,100 respondents.
[^cursor]: Forbes, [Cursor hits $4 billion in annualized revenue](https://www.forbes.com/sites/richardnieva/2026/06/08/cursor-4-billion-annualized-revenue/), June 2026. Run-rate, not GAAP revenue.
[^claude-code-rev]: Anthropic, [Series G funding announcement](https://www.anthropic.com/news/anthropic-raises-30-billion-series-g-funding-380-billion-post-money-valuation), February 2026.
[^codex]: OpenAI, [Codex for knowledge work](https://openai.com/index/codex-for-knowledge-work/), 2026. Vendor-reported weekly users.
[^google75]: The Verge, [Google says 75 percent of all its new code is AI-generated](https://www.theverge.com/tech/917163/google-says-75-percent-of-all-its-new-code-is-ai-generated), April 2026, quoting Sundar Pichai's Cloud Next post. No public definition of the denominator.
[^anthropic80]: Tom's Hardware, [Anthropic says Claude now writes more than 80 percent of its merged code](https://www.tomshardware.com/tech-industry/artificial-intelligence/anthropic-says-claude-now-writes-more-than-80-percent-of-its-merged-code), June 2026, reporting an Anthropic Institute analysis. The same report notes that code volume overstates productivity and that human review is the bottleneck.
[^coinbase]: Cointelegraph, [Over 95% of Coinbase's code is now written with AI](https://cointelegraph.com/news/over-95-of-coinbases-code-is-now-written-with-ai), July 2026. CEO statement.
[^karpathy-march]: Forbes, [AI agents wrote 80% of Karpathy's code](https://www.forbes.com/sites/josipamajic/2026/03/22/ai-agents-wrote-80-of-karpathys-code-junior-developers-are-paying-the-price/), March 2026.
[^metr2025]: METR, [Measuring the Impact of Early-2025 AI on Experienced Open-Source Developer Productivity](https://metr.org/blog/2025-07-10-early-2025-ai-experienced-os-dev-study/), July 2025. Paper at [arXiv:2507.09089](https://arxiv.org/abs/2507.09089). 16 developers, 246 tasks, 95% CI on the slowdown +2% to +39%.
[^metr2026]: METR, [Uplift update](https://metr.org/blog/2026-02-24-uplift-update/), February 2026. 57 developers, 143 repos, 800+ tasks. METR calls the result "very weak evidence" and is retiring the design.
[^google-rct]: Paradis et al., [How much does AI impact development speed? An enterprise-based randomized controlled trial](https://arxiv.org/abs/2410.12944), ICSE-SEIP 2025. 96 Google engineers, one task.
[^vasilescu]: Vasilescu et al., [AI Writes Faster Than Humans Can Review](https://arxiv.org/abs/2607.01904), July 2026. Observational, single company, adoption not randomized.
[^dora2024]: TechTarget, [Google DORA: software delivery caught up to AI coding tools](https://www.techtarget.com/it-infrastructure/news/366631712/Google-DORA-Software-delivery-caught-up-to-AI-coding-tools), covering the 2024 DORA findings.
[^orosz]: Gergely Orosz, [The impact of AI on software engineers in 2026](https://newsletter.pragmaticengineer.com/p/the-impact-of-ai-on-software-engineers-2026), Pragmatic Engineer, 2026. Self-selected newsletter audience. See also his [Six Predictions](https://newsletter.pragmaticengineer.com/p/the-future-of-software-engineering-with-ai) piece, February 2026.
[^dora-pause]: Waydev, [DORA pauses the annual survey](https://waydev.co/dora-pauses-the-annual-survey/), September 2026. I could not find the primary dora.dev announcement. DORA did publish a smaller [ROI of AI-assisted Software Development](https://services.google.com/fh/files/misc/dora-roi-of-ai-assisted-software-development-2026.pdf) report in May 2026.
[^gitclear]: GitClear, [The Maintainability Gap](https://gitkraken.gitclear.com/the_ai_code_quality_maintainability_gap), June 2026. Vendor research; sample is GitClear customers plus public repos.
[^veracode]: Veracode, [2026 GenAI Code Security Report](https://www.veracode.com/blog/2026-genai-code-security-report-ai-risk/), 2026, and the [2025 report](https://veracode.com/blog/genai-code-security-report), July 2025. Vendor research on raw model output, 80 tasks, 100+ models.
[^swebench-pro]: Scale AI, [SWE-bench Pro V2](https://labs.scale.com/blog/swe-bench-pro-v2), September 22, 2026. 642 public tasks, 272 private, network-locked.
[^metr-horizon]: METR, [Time Horizons](https://metr.org/time-horizons/) and [Time Horizon 1.1](https://metr.org/blog/2026-1-29-time-horizon-1-1/), January 2026. METR notes measurements above 16 hours are unreliable with the current task suite.
[^canaries]: Brynjolfsson, Chandar, Chen, [Canaries in the Coal Mine, August 2026 update](https://digitaleconomy.stanford.edu/news/canariesaug26/), Stanford Digital Economy Lab. Original [August 2025 paper](https://digitaleconomy.stanford.edu/publications/canaries-in-the-coal-mine/). ADP payroll data; descriptive, not causal.
[^signalfire]: SignalFire, [State of Tech Talent 2026](https://www.signalfire.com/blog/signalfire-state-of-talent-report-2026), June 2026. Profile-based data; undercounts some hires.
[^nyfed]: Federal Reserve Bank of New York, [The Labor Market for Recent College Graduates](https://www.newyorkfed.org/research/college-labor-market). Major-level figures lag one to two years.
[^indeed-postings]: Indeed Hiring Lab, [AI and Job Postings: From Destruction to Creation?](https://hiringlab.indeed.com/2026/07/08/ai-and-job-postings-from-destruction-to-creation/), July 2026. Postings, not hires; Indeed flags the Claude Code timing as correlation.
[^indeed-senior]: Indeed Hiring Lab, [The Labor Market Is Tilting Toward Seniority](https://hiringlab.indeed.com/2026/07/23/the-labor-market-is-tilting-toward-seniority/), July 2026.
[^bls-dev]: BLS, [Occupational Outlook Handbook: Software Developers, QA Analysts, and Testers](https://www.bls.gov/ooh/computer-and-information-technology/software-developers.htm), 2025 to 2035 projection.
[^techcrunch-layoffs]: TechCrunch, [The running list: major tech layoffs in 2026 where employers cited AI](https://techcrunch.com/2026/07/06/the-running-list-major-tech-layoffs-in-2026-where-employers-cited-ai/), July 2026, citing FT counts.
[^challenger]: CNBC, [Amazon, Microsoft and more cite AI for 2025 layoffs](https://www.cnbc.com/2025/12/21/ai-job-cuts-amazon-microsoft-and-more-cite-ai-for-2025-layoffs.html), December 2025, citing Challenger, Gray & Christmas.
[^benioff]: Fortune, [Benioff on AI agents and support layoffs](https://fortune.com/2025/09/02/salesforce-ceo-billionaire-marc-benioff-ai-agents-jobs-layoffs-customer-service-sales/), September 2025.
[^klarna]: Bloomberg, [Klarna turns from AI to real person customer service](https://www.bloomberg.com/news/articles/2025-05-08/klarna-turns-from-ai-to-real-person-customer-service), May 2025.
[^reversals]: CNBC, [Employers who laid off workers for AI are reversing their decisions](https://www.cnbc.com/2026/07/01/employers-who-laid-off-workers-for-ai-are-reversing-their-decisions.html), July 2026, covering the Robert Half survey and Gartner forecast. Surveys of HR leaders, small samples.
[^amodei90]: Business Insider, [Anthropic CEO: AI will write 90% of code in 3 to 6 months](https://www.businessinsider.com/anthropic-ceo-ai-90-percent-code-3-to-6-months-2025-3), March 2025.
[^amodei-jevons]: Fortune, [Dario Amodei on the Jevons paradox and white-collar jobs](https://fortune.com/2026/05/05/dario-amodei-jevons-paradox-will-ai-wipe-out-white-collar-jobs/), May 2026.
[^hn-amodei]: Hacker News, [comment 42857721](https://news.ycombinator.com/item?id=42857721), January 2025, in the DeepSeek R1 thread.
[^cherny]: Fortune, [Claude Code creator says the software engineer title will go away](https://fortune.com/2026/02/24/will-claude-destroy-software-engineer-coding-jobs-creator-says-printing-press/), February 2026.
[^fowler]: Martin Fowler, [Future of Software Development retreat notes](https://martinfowler.com/fragments/2026-02-18.html), February 2026, and [fragment of July 6, 2026](https://martinfowler.com/fragments/2026-07-06.html) for the "debate is over" quote.
[^jetbrains]: JetBrains, [Introducing JetBrains Air](https://blog.jetbrains.com/blog/2026/09/22/introducing-jetbrains-air/), September 22, 2026. Product announcement; read with that in mind.
[^bessen]: James Bessen, [Toil and Technology](https://www.imf.org/external/pubs/ft/fandd/2015/03/pdf/bessen.pdf), IMF Finance & Development, March 2015.
[^bls-tellers]: BLS, [Occupational Outlook Handbook: Tellers](https://www.bls.gov/ooh/office-and-administrative-support/tellers.htm), 2025 to 2035 projection.
[^spreadsheets]: Business Insider, [What Excel and ATMs tell us about AI and jobs](https://www.businessinsider.com/ai-artificial-intelligence-job-replacement-worries-losses-microsoft-excel-atms-2023-10), October 2023, citing Morgan Stanley analysis of BLS data.
[^bls2000]: BLS, [Occupational Employment Statistics, May 2000 national release](https://www.bls.gov/news.release/history/ocwage_11142001.txt). Programmers 530,730; applications engineers 374,640; systems software engineers 264,610.
[^bls2015]: BLS Occupational Employment Statistics, May 2015 national estimates, via the [OES archive](https://www.bls.gov/oes/oes_arch.htm). Occupation definitions changed in 2010 and 2018, so the 2000 to 2015 comparison is approximate.
[^thoughtworks]: Thoughtworks, [The Future of Software Engineering, Europe 2026](https://www.thoughtworks.com/content/dam/thoughtworks/documents/report/tw_future_of_software_engineering_europe_2026.pdf), June 2026.
