#!/usr/bin/env bash
# Sinh bởi skill cau-truc-du-an, 2026-08-25.
# Soi bốn luật kiến trúc ghi trong code/CLAUDE.md và code/docs/structure.md.
# Thoát mã 0 khi sạch, khác 0 khi có vi phạm — dùng được trong CI.

set -uo pipefail
cd "$(dirname "$0")/.."

violations=0

echo "== 1. code/fe: features/X không được import features/Y =="
fe_cross=$(grep -rnE "from ['\"].*features/" code/fe/src/features 2>/dev/null || true)
if [ -n "$fe_cross" ]; then
  echo "$fe_cross"
  count=$(echo "$fe_cross" | wc -l)
  violations=$((violations + count))
  echo "  -> $count vi phạm"
else
  echo "  sạch"
fi

echo ""
echo "== 2. code/fe/src/core: không được import react, db/, store/ =="
core_bad=$(grep -rnE "from ['\"](react|.*\/db\/|.*\/store\/)" code/fe/src/core 2>/dev/null || true)
if [ -n "$core_bad" ]; then
  echo "$core_bad"
  count=$(echo "$core_bad" | wc -l)
  violations=$((violations + count))
  echo "  -> $count vi phạm"
else
  echo "  sạch"
fi

echo ""
echo "== 3. code/be/src/shared: không được import entities/, database/ =="
be_shared_bad=$(grep -rnE "from ['\"]\.\./\.\./(entities|database)" code/be/src/shared 2>/dev/null || true)
if [ -n "$be_shared_bad" ]; then
  echo "$be_shared_bad"
  count=$(echo "$be_shared_bad" | wc -l)
  violations=$((violations + count))
  echo "  -> $count vi phạm"
else
  echo "  sạch"
fi

echo ""
echo "== 4. code/be/src/entities: không được import database/, hoặc shared/ ngoại trừ shared/types/enums (ngoại lệ đã duyệt 2026-08-25) =="
be_entities_bad=$(grep -rnE "from ['\"]\.\./(database|shared)" code/be/src/entities 2>/dev/null | grep -v "shared/types/enums" || true)
if [ -n "$be_entities_bad" ]; then
  echo "$be_entities_bad"
  count=$(echo "$be_entities_bad" | wc -l)
  violations=$((violations + count))
  echo "  -> $count vi phạm"
else
  echo "  sạch (import './shared' trong entities/ là entities/shared.ts nội bộ; import '../shared/types/enums' là ngoại lệ hẹp đã duyệt, không phải vi phạm)"
fi

echo ""
echo "== 5. code/be/src/database: chỉ được import shared/, không import entities/ trực tiếp bỏ qua shared =="
db_bad=$(grep -rnE "from ['\"]\.\./entities" code/be/src/database 2>/dev/null || true)
if [ -n "$db_bad" ]; then
  echo "$db_bad"
  count=$(echo "$db_bad" | wc -l)
  violations=$((violations + count))
  echo "  -> $count vi phạm"
else
  echo "  sạch"
fi

echo ""
echo "== Tổng: $violations vi phạm =="
if [ "$violations" -gt 0 ]; then
  echo "Không tự sửa — xem code/docs/structure.md mục \"Vi phạm phát hiện\" để quyết hướng sửa."
  exit 1
fi
exit 0
