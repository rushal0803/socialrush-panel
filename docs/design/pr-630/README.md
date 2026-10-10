# PR #630 — Historical visual evidence (archived)

> **IMPORTANT — These are NOT screenshots of the current proposed redesign.**
> They were captured **before** the SocialRUSH brand-palette correction on PR #630.
> Their cream/ivory mockup panels were rejected because they do not match the existing
> SocialRUSH website identity. Do not use them as final "after" images or
> visual approval evidence.

## Approved brand reference (source of truth)

The active `app/globals.css` design tokens define the original SocialRUSH brand:

| Token | Colour |
| --- | --- |
| Main background | `#07080D` |
| Section surface | `#0C0E14` |
| Elevated surface | `#101219` |
| Secondary surface | `#151821` |
| Signature orange | `#FF7600` |
| Orange highlight | `#FF9A2E` |
| Primary text | `#F8FAFC` |
| Secondary text | `#A8AFBD` |

The newest code uses **these dark surfaces and orange accents** on the hero
workspace, Services guide, authentication panel and final CTA. No cream,
ivory or pastel panels should appear in the proposed visual design.

## Retired screenshots — provenance only

The files below remain in Git history for honest before/after auditability.
They are **not** current-version previews. In particular, retired "after"
screenshots show the superseded cream panels.

- Original baseline: [home desktop](before-home-1440.png), [home mobile](before-home-390.png), [Services desktop](before-services-1440.png), [Services mobile](before-services-390.png)
- Retired interim redesign (not approved): [home desktop](after-home-1440.png), [home mobile](after-home-390.png), [workspace desktop](workspace-1440.png), [workspace mobile](workspace-390.png)
- Retired interim supporting layouts: [Services desktop](after-services-1440.png), [Services mobile](after-services-390.png), [service-card desktop](after-cards-1440.png), [service-card mobile](after-cards-390.png), [login desktop](after-login-1440.png), [login mobile](after-login-390.png), [register desktop](after-register-1440.png), [register mobile](after-register-390.png)

## Required brand-correct visual review before approval

Capture **new screenshots from the latest reviewed branch build**, not from the
older Vercel preview or archived files:

- Homepage 390px and 1440px, showing the actual dark workspace mockup.
- Services 390px and 1440px, showing the updated charcoal/orange guide and cards.
- Login and register 390px and 1440px, showing the dark account-feature panel.
- Packages and checkout-adjacent review screens at mobile/desktop widths.
- Verify actual computed styles, text contrast, tap targets, no overflow and full
  rendered SEO content; repeat comparable speed checks before approval.

Only after new renders have been inspected may this gallery again identify
screenshots as current "after" evidence.

**PR stays draft.** No merge or production deployment is authorized by this
gallery change.
