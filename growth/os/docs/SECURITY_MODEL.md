# SECURITY_MODEL

| Nguyên tắc | Thực thi |
|---|---|
| Không secret trong Git | `.gitignore` đã có `.env`; GEMINI_API_KEY, token Telegram, GA4 credentials chỉ qua env/secret của app desktop. CLI không đọc secret nào. |
| Không chi tiền khi chưa duyệt | `campaigns.mjs`: kênh paid → PENDING_APPROVAL; APPROVED chỉ `--actor founder`; `expense add` chặn chưa duyệt / vượt budget campaign / vượt 100 USD tổng. Test: `tests/os.test.mjs`. |
| Không publish khi chưa duyệt | `content.mjs`: PUBLISHED chỉ từ APPROVED; outreach cần `approval publish`. |
| Không đụng app/code vì marketing | AGENT_BRIEF §4: approval `code_change`. Ràng buộc #5 local-first giữ nguyên. |
| Không spam / fake | Skill community/outreach: không mass message, không nhiều tài khoản, không fake review/install. |
| Audit | `audit_log` ghi campaign status, expense, publish, experiment decision, approval, memory log. `os audit` để xem. |
| Dữ liệu cá nhân | Hệ thống không lưu dữ liệu người dùng app; outreach CSV chỉ chứa thông tin công khai (tên kênh, email công khai). Không gom hồ sơ cá nhân. |
| Quyền ghi | DB và logs gitignore; snapshot/report commit — review được qua PR. Không commit lên `main` (CLAUDE.md gốc). |
| Chính sách nền tảng | ASO skill kiểm giới hạn ký tự + nội dung cấm; paid skill cấm creative gây hiểu lầm; hook "bố mẹ" không chạy paid trước khi test organic. |
| Human gate cho hành động không hoàn tác | Publish, chi tiền, gửi thư, đổi listing, sửa code: Founder xác nhận trong chat → agent ghi `--actor founder`. |
