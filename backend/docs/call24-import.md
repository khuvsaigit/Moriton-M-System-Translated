# Call 24 CSV adapter and local event flow

The supplied file is an export/report, not yet a verified live API contract. Its rows contain parent tasks (`task_id`) and child calls (`subtask_id`); one parent may have several call attempts. `services.integrations.call24.adapter.parse_csv()` maps parent requests and call records separately, joins child calls by task ID, preserves Mongolian category labels/status values, deduplicates repeated task/call identifiers in the preview, and emits a source-file SHA-256 plus row validation issues.

Observed sample columns include `Дугаар`, `Харилцагч`, `Төлөв`, `Хариуцагч`, `Ext`, `Email`, `Баг`, `Inbox`, `Ангилал 1..3`, `Огноо`, `Resolve тэмдэглэл`, `subtask_id`, `Дуудлага төрөл`, `Дуудлага төлөв`, `Хариулсан хүн`, `Хүлээсэн (сек)`, `Яриа (сек)`, and `Дуудлага огноо`. We do not infer a horse identity, confirmed booking, visit, clinical priority, or screening result from a call. Contact mapping from `Холбогдогч талын нэр, утас` and `Ext` is provisional until the provider confirms semantics; raw imported data must retain the original payload for traceability.

The `python -m services.integrations.call24.cli FILE.csv` CLI is preview-only. The local development service also has an explicit `call24_import` management command that persists raw batch/row provenance, emits stable versioned outbox events, and can deliver them to the Clinical durable inbox over the private Compose network. It requires explicit organization and branch UUIDs; neither is read from the CSV. Use `--publish` to exercise the full path:

```sh
docker compose --env-file backend/.env -f backend/compose.yaml cp /path/to/reviewed.csv integrations:/tmp/call24.csv
docker compose --env-file backend/.env -f backend/compose.yaml exec integrations \
  python manage.py call24_import /tmp/call24.csv \
  --organization-id ORGANIZATION_UUID --branch-id BRANCH_UUID --publish
```

This command is disabled unless the integrations service runs with `DEBUG=1` and `CALL24_CSV_IMPORT_ENABLED=1`. The receiver is separately gated by Clinical `DEBUG=1`, `LOCAL_CALL24_BRIDGE_ENABLED=1`, and a local bridge token. Compose defaults are for local development only. The local HTTP transport is not the production SQS/service-assertion adapter and must not be exposed publicly or enabled in a production deployment.

The outbox only publishes a later aggregate revision after all earlier revisions are acknowledged. The Clinical receiver stores the inbox receipt and reception-task projection in one tenant-scoped transaction. A repeat delivery with the same message ID and body is idempotent; reusing an ID with changed content conflicts; a late older source revision is recorded and ignored rather than replacing newer reception data. If a delivery response is lost after Clinical commits, the outbox retries the same message identity after its lease expires and Clinical returns the existing task.

Production intake still needs approved authenticated provider access, stable source event/revision semantics, tenant/branch routing, replay/correction policy and contract tests. A CSV file itself has no trustworthy organization/branch identity; caller/config supplies that after authorization, never a CSV tenant field.

The CSV's date/time fields are preserved as timezone-naive local wall time because the export does not carry an offset and the client's source timezone has not been confirmed. Do not publish those values as UTC or use them as an authoritative event timestamp until the Call 24 timezone and daylight-saving behavior are confirmed. Mongolian yes/no complaint flags are parsed only for recognized tokens; unknown values remain `null` and are reported for review.
