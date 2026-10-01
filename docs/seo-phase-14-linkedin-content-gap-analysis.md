# Phase 14 — LinkedIn content gap analysis

Audit date: 1 October 2026.

## Rule

Create one new indexed article only when it answers a distinct user question, is supported by current platform documentation, has low cannibalization risk, and strengthens an existing canonical page.

## Evidence

- Repository inventory of the current LinkedIn money page, growth hub and blog cluster.
- Live October 2026 SERP review showing active results for "LinkedIn followers vs connections".
- Current LinkedIn Help documentation distinguishing Follow from Connect, 1st-degree connections, follower settings and the 30,000 1st-degree connection limit.
- Search Console data remains unavailable because the connected GSC Wizard subscription is inactive.
- Semrush data remains unavailable because the connected account has no remaining API units.

## Candidate decisions

| Topic | Decision | Why |
| --- | --- | --- |
| LinkedIn followers price in India | Covered | Existing price guide already owns the intent. |
| LinkedIn followers vs engagement | Covered | Existing comparison guide already owns the intent. |
| LinkedIn personal-brand growth | Covered | Existing growth guide already owns the intent. |
| LinkedIn followers vs connections | Implement | Distinct platform-mechanics question, current search activity, official documentation and low transactional cannibalization risk. |
| Profile followers vs company-page followers | Defer | Current service already supports both destination types; stronger query evidence is needed for a separate article. |
| Follow button vs Connect button | Consolidate | Close variant of followers vs connections; strengthen the implemented article instead of creating a second URL. |

## Implemented target

`/blog/linkedin-followers-vs-connections`

The article links to:

- `/linkedin-followers`
- `/linkedin-growth-india`
- `/blog/linkedin-followers-vs-engagement-india`
- `/blog/linkedin-growth-tips-personal-brands`
- `/blog/linkedin-followers-for-business-growth`

## Claim discipline

The guide follows LinkedIn's documented relationship model:

- Connect is a mutual 1st-degree relationship.
- Follow can surface public posts without creating a 1st-degree relationship.
- 1st-degree connections automatically follow posts/articles unless they later unfollow.
- Members can choose whether Follow or Connect is the primary profile action.
- LinkedIn documents a 30,000 1st-degree connection limit.

The article does not claim that followers or connections guarantee reach, engagement, leads, sales, hiring outcomes or algorithmic preference.

## Cannibalization protection

No new transactional LinkedIn route is created. `/linkedin-followers` remains the follower-purchase canonical and `/linkedin-growth-india` remains the broad growth hub. The new article owns only the informational platform-mechanics question.
