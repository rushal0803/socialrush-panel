# Clean-install compatibility baseline v1

This is an explicit fresh-install plan, not a late migration and not an automatic production upgrade. It supplements all 121 hash-verified historical migrations; it does not replace, reorder, edit or mark any original file applied. Existing Supabase CLI `db push` does not execute this directory. Do not apply this baseline to a linked/production project.

The initial services definition lacks `updated_at`. The next 46 files do not create it. `202609020001_update_follower_service_pricing.sql` writes it twice. No later migration defines it either; service-health application code uses a separate `health_updated_at`. This is a missing schema prerequisite, not a missing financial backfill. Repository history cannot establish whether production has an out-of-band column or a different deployed schema.

Options reviewed:

| Option | Decision |
|---|---|
| Edit the original initial/pricing migration | Reject: rewrites potentially applied history |
| Add an ordinary migration at the end | Insufficient for clean replay: failure occurs before it can run |
| Insert a backdated migration | Reject here: risks inserting unapplied history into existing environments without evidence |
| Versioned explicit clean-install prerequisite | Chosen: reviewable separate plan; original files/hashes retained; label evidence honestly |
| Production additive upgrade | Deferred: needs approved schema-only evidence and separate rollout review; no upgrade script executed |

Plan: replay original files in order. Immediately before the named pricing file, explicitly set `socialrush.clean_install='v1'` and execute `services-timestamp.sql`. Then continue every original file, stopping at any error. The prerequisite adds only a nullable `timestamptz`; it sets no default, does no backfill/DML and adds no trigger. Existing unknown timestamps stay NULL. A type mismatch fails closed. Synthetic snapshots verify service fields and orders are unchanged by this prerequisite. The historical pricing migration still executes its historical DML on synthetic catalog data only; this is not permission to rerun pricing against live services.

Report as **baseline v1 + unchanged history replay**, never “unmodified history PASS.” Raw history remains known to fail without its prerequisite. All later failures must be separately recorded and reviewed; no blanket skip or exception suppression is allowed. The isolated run also checks route/cron isolation before replay.

Production-upgrade evidence, if later authorized, should be schema-only: services column type/nullability/default, triggers and function definitions referencing it, deployed migration versions and relevant grants. Do not retrieve service/customer rows, rates, orders, passwords or Vault values. Unknown schema evidence means upgrade compatibility remains BLOCKED. Do not drop a populated timestamp column for rollback; stop writes if required and use reviewed forward fixes. A disposable synthetic stack may simply be discarded.
