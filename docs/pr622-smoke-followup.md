# PR #622 pre-merge smoke follow-up

The original GitHub Actions run collected 270 smoke cases: 216 passed, three
failed, and 51 opt-in responsive audit cases were skipped. Its typecheck, unit,
SEO and production build steps passed.

The packages failure came from the dashboard header, rather than the package
cards. At 1024px the sidebar leaves a narrow workspace, and the full Add Funds
label consumed the remaining toolbar room. A wider fallback font reproduced a
1030px document and a profile control extending past the viewport. Add Funds
now retains its 44px icon presentation until 1280px, with an explicit accessible
name. The same fallback-font measurement now reports 1024px without clipping.
Package checks still require zero document overflow and contained controls;
they now include header links/buttons and the wider-font regression.

Inline WhatsApp support on public service pages is intentional. The old tests
required the order action to sit horizontally left of WhatsApp even when
WhatsApp was below the footer. However, scrolling support into view exposed a
real overlap at the document end. Mobile service pages now reserve bottom space
after inline support for the fixed order action, its currency note and the
device safe area. Desktop placement and order behavior are unchanged.

Both existing failing support tests now require non-intersection on either
axis, minimum 44px touch dimensions, full viewport visibility when reached,
pointer hit-testing at five points, and Playwright trial-click actionability.
They still check the dock hides at its order builder and the CTA can be
dismissed. The support destination is checked without opening WhatsApp.

| Evidence | Before | After |
| --- | --- | --- |
| Dashboard packages, 1024px, wider fallback font | [Before](qa/pr622-smoke/packages-1024-before.png) | [After](qa/pr622-smoke/packages-1024-after.png) |
| Inline support at document end, 320px | [Before](qa/pr622-smoke/support-320-before.png) | [After](qa/pr622-smoke/support-320-after.png) |

The full local run also exposed a Windows test-transport difference: the
growth-planner smoke check parsed a relative login Location header without a
base URL. It now resolves against the test origin, preserving the same-origin,
login-path and real security-header assertions. Application redirects and
authentication logic were not changed.

Only dashboard header presentation, scoped service CSS and regression tests
changed. Payment, wallet, order, database, authentication and SEO business
logic were preserved. No main merge or production deployment was performed.

Verification: the three originally failing cases passed together; TypeScript,
production build and 15 focused unit checks passed. The full smoke command is
`npm run test:smoke -- --workers=2` against the isolated local production server.
Local collection includes the complete 270-case CI suite plus 64 configured
service-page matrix cases from the saved audit snapshot. The full local run
completed with 273 passed, 51 opt-in cases skipped, nine redirect-parsing
failures and one guest-Facebook navigation timeout. The redirect parser was
corrected as described above; all ten cases passed in the isolated rerun
(1.2 minutes). All 283 active local cases therefore passed across the full run
and rechecks, with the 51 opt-in cases skipped. Lint and the final TypeScript
check also passed. The final response reports the fresh complete GitHub Actions
result for this follow-up commit.
