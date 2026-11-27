# DATA_MODEL

Nguồn chuẩn: `growth/os/db/schema.sql`. Mã: `T-` task, `C-` campaign, `K-` content, `X-` experiment.

| Bảng | Khoá | Trường chính | Ràng buộc trong CLI |
|---|---|---|---|
| `tasks` | id T-0001 | title, description, agent, priority (= impact×confidence×urgency/effort), status, created/updated, deadline, depends_on (JSON), expected, actual, evidence, sprint, needs_approval | agent ∈ danh sách; trùng title (chưa đóng) bị chặn; IN_PROGRESS cần deps DONE; DONE cần evidence |
| `task_history` | auto | task_id, at, from/to status, note, actor | ghi mỗi lần đổi status |
| `campaigns` | C-0001 | name, objective, audience, platform (taxonomy), assets (JSON content ids), tracking_link, budget_usd, daily_cap_usd, dates, status, approved_by/at, results, lessons | kênh paid → PENDING_APPROVAL + dòng approvals; APPROVED chỉ `--actor founder`; RUNNING paid cần APPROVED; trần 30 USD/campaign, 5 USD/ngày |
| `expenses` | auto | campaign_id, date, amount_usd, note | tổng ≤ 100; campaign phải duyệt; ≤ budget campaign |
| `content` | K-0001 | topic, channel, format, audience, hook, body_ref, cta, asset_ref, status (workflow), url, utm, published_at, metrics (JSON), source_slug | trùng (topic+channel hoặc source_slug+channel) bị chặn; REVIEW/APPROVED cần hook+cta+body_ref và không từ cấm; PUBLISHED cần url |
| `experiments` | X-0001 | hypothesis, objective, channel, audience, variables, budget_usd, metric, baseline, target, dates, results, decision, campaign_id | decision ∈ SCALE/ITERATE/STOP/INCONCLUSIVE; SCALE cấm metric phù phiếm; cần results |
| `metrics_daily` | (date, platform, channel, metric, source) | value, quality (measured/estimated/unattributed), note | upsert idempotent; estimated cần note; installs UNKNOWN từ nguồn tay → unattributed |
| `approvals` | auto | kind (budget/publish/access/code_change/other), ref_id, request, status, decided_by/at, note | — |
| `runs` | auto | job, started/finished, status (RUNNING/OK/FAILED/SKIPPED), attempt, output, error | 1 OK/ngày/job trừ `--force` |
| `locks` | name | owner, acquired_at, expires_at | TTL 30 phút |
| `audit_log` | auto | at, actor, action, ref_id, detail | mọi hành động hướng ngoài |

## Workflow trạng thái

- Task: BACKLOG → READY → IN_PROGRESS → (BLOCKED ↔) → REVIEW → DONE | CANCELLED
- Content: IDEA → RESEARCH → DRAFT → REVIEW → APPROVED → PUBLISHED → MEASURED → REUSED; ARCHIVED từ bất kỳ đâu; REVIEW/APPROVED có thể lùi về DRAFT
- Campaign: DRAFT/PENDING_APPROVAL → APPROVED → RUNNING ↔ PAUSED → STOPPED/DONE

## Xuất ra file (để commit, DB thì không)

`dashboard/snapshot.json`, `dashboard/README.md`, `reports/**`, `memory/CURRENT_STATE.md` (khối AUTO).
