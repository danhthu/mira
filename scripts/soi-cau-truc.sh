#!/usr/bin/env bash
# Soi luật kiến trúc feature-based, viết lại 2026-09-05 cho khung Batify.
#
# Bản trước (2026-08-25) soi code/fe/src/features/ và code/fe/src/core/ — hai thư
# mục đó biến mất khi app bị thay bằng Batify ngày 27/08, nên script in "sạch"
# một cách rỗng: grep không tìm thấy gì trong thư mục không tồn tại. Bản này soi
# đúng cây thư mục đang có.
#
# Thoát mã 0 khi sạch, khác 0 khi có vi phạm — dùng được trong CI.

set -uo pipefail
cd "$(dirname "$0")/.."

FE="code/fe/src"

# Feature = một domain, tự chứa Entities/Screens/Components/Models của nó.
FEATURES="Challenger Emotion Goal HabitTracker Hourglass Money Person Reminder TimeTracker Trading Welcome Work"

# Thư mục trong src/ KHÔNG phải feature. Mọi thư mục khác mà không có trong
# $FEATURES hay $ROOTS sẽ bị mục 0 bắt — xem lý do ở đó.
NON_FEATURES="Assets Common Controls Core Me"

# Composition root: việc của nó LÀ ghép các feature lại, nên được phép import feature.
ROOTS="Main Home"

# Trống từ 2026-09-05: bốn module Habit · Work · Challenger · Trading từng nằm trong
# danh sách cắt, nhưng chủ dự án đã chốt chúng là tính năng chính và cần thiết kế lại
# chứ không gỡ. Không còn module nào chờ cắt, nên mọi vi phạm dưới đây là nợ thật —
# giữ biến để không phải sửa logic bên dưới, nhưng đừng điền lại tên vào đây trừ khi
# thật sự có module sắp bị gỡ.
CUT=""

FEATURE_RE=$(echo "$FEATURES $ROOTS" | tr ' ' '|')
CUT_RE=$(echo "$CUT" | tr ' ' '|')

violations=0
will_vanish=0

fail_if_missing() {
  if [ ! -d "$1" ]; then
    echo "  !! KHÔNG TỒN TẠI: $1 — script đang soi nhầm cây thư mục, sửa script trước khi tin kết quả"
    exit 2
  fi
}

fail_if_missing "$FE"
fail_if_missing "$FE/Common"

echo "== 0. Mọi thư mục trong src/ đều phải được khai báo =="
# Bài học 27/08 và 05/09: script chỉ soi những tên có trong $FEATURES. Feature mới
# sinh ra mà quên khai thì KHÔNG bị soi dòng nào, và tổng "0 vi phạm" là lời nói dối.
# Mục này bắt chính lỗi đó, và cố ý thoát mã 2 chứ không cộng vào tổng vi phạm —
# script sai thì mọi con số bên dưới đều không đáng tin.
undeclared=""
for d in "$FE"/*/; do
  name=$(basename "$d")
  case " $FEATURES $ROOTS $NON_FEATURES " in
    *" $name "*) ;;
    *) undeclared="$undeclared $name" ;;
  esac
done
if [ -n "$undeclared" ]; then
  echo "  !! CHƯA KHAI BÁO:$undeclared"
  echo "     Thêm vào \$FEATURES (nếu là feature) hoặc \$NON_FEATURES, rồi chạy lại."
  exit 2
fi
echo "  sạch — $(echo $FEATURES | wc -w) feature, $(echo $ROOTS | wc -w) composition root"

echo ""
echo "== 1. Common/ (lớp shared) không được import ngược lên feature =="
common_up=$(grep -rnoE "from '\.\./\.\./($FEATURE_RE)[a-zA-Z/.]*'" "$FE/Common" 2>/dev/null || true)
if [ -n "$common_up" ]; then
  echo "$common_up"
  count=$(echo "$common_up" | wc -l)
  violations=$((violations + count))
  vanish=0
  [ -n "$CUT" ] && vanish=$(echo "$common_up" | grep -cE "\.\./\.\./($CUT_RE)" || true)
  will_vanish=$((will_vanish + vanish))
  echo "  -> $count vi phạm (trong đó $vanish sẽ tự mất khi cắt module)"
else
  echo "  sạch"
fi

echo ""
echo "== 2. Feature không được import feature khác =="
echo "   (Common/ và composition root $ROOTS không tính — xem luật 3)"
cross_total=0
for m in $FEATURES; do
  [ -d "$FE/$m" ] || continue
  hits=$(grep -rnoE "from '\.\./\.\./($FEATURE_RE)[a-zA-Z/.]*'" "$FE/$m" 2>/dev/null || true)
  if [ -n "$hits" ]; then
    count=$(echo "$hits" | wc -l)
    vanish=0
    [ -n "$CUT" ] && vanish=$(echo "$hits" | grep -cE "\.\./\.\./($CUT_RE)" || true)
    # Vi phạm cũng tự mất nếu chính module nguồn nằm trong danh sách cắt.
    if echo "$CUT" | grep -qw "$m"; then vanish=$count; fi
    cross_total=$((cross_total + count))
    will_vanish=$((will_vanish + vanish))
    echo "  $m -> $count lần (tự mất khi cắt: $vanish)"
  fi
done
if [ "$cross_total" -gt 0 ]; then
  violations=$((violations + cross_total))
else
  echo "  sạch"
fi

echo ""
echo "== 3. Composition root ($ROOTS) được import feature — không phải vi phạm =="
for r in $ROOTS; do
  [ -d "$FE/$r" ] || continue
  n=$(grep -rhoE "from '\.\./\.\./($FEATURE_RE)[a-zA-Z/.]*'" "$FE/$r" 2>/dev/null | wc -l)
  echo "  $r: $n import feature (hợp lệ)"
done

echo ""
echo "== 4. Vòng lặp giữa hai feature =="
cycles=0
for a in $FEATURES; do
  for b in $FEATURES; do
    [ "$a" = "$b" ] && continue
    [ -d "$FE/$a" ] && [ -d "$FE/$b" ] || continue
    ab=$(grep -rlE "from '\.\./\.\./$b[a-zA-Z/.]*'" "$FE/$a" 2>/dev/null | head -1)
    ba=$(grep -rlE "from '\.\./\.\./$a[a-zA-Z/.]*'" "$FE/$b" 2>/dev/null | head -1)
    if [ -n "$ab" ] && [ -n "$ba" ] && [[ "$a" < "$b" ]]; then
      echo "  $a <-> $b"
      echo "     $ab"
      echo "     $ba"
      cycles=$((cycles + 1))
    fi
  done
done
[ "$cycles" -eq 0 ] && echo "  sạch"

echo ""
echo "== 5. code/be: luật tầng (thêm tầng http/ ngày 2026-09-05) =="
# Thứ tự tầng: shared <- entities <- database <- http. Mũi tên chỉ được đi xuống.
# http/ là tầng ngoài cùng: nó gọi shared/ và database/, không ai được gọi ngược lên nó.
# Hai ngoại lệ import type (entities -> shared/types/enums, database -> entities)
# đã ghi trong code/CLAUDE.md nên không nằm trong các mẫu soi bên dưới.
be_total=0
soi_be_layer() {
  local layer="$1"
  local forbidden="$2"
  local dir="code/be/src/$layer"
  [ -d "$dir" ] || return 0
  local hits
  hits=$(grep -rnE "from ['\"](\.\./)*($forbidden)/" "$dir" 2>/dev/null || true)
  if [ -n "$hits" ]; then
    echo "$hits"
    local count
    count=$(echo "$hits" | wc -l)
    be_total=$((be_total + count))
    echo "  $layer -> $count vi phạm (cấm import: $forbidden)"
  fi
}

soi_be_layer "shared" "entities|database|http"
soi_be_layer "entities" "database|http"
soi_be_layer "database" "http"

if [ "$be_total" -gt 0 ]; then
  violations=$((violations + be_total))
else
  echo "  sạch"
fi

echo ""
echo "== 6. code/fe/src/Core: hàm thuần, tầng đáy =="
# Core nằm DƯỚI Common: chỉ nhận số vào, trả số ra. Không React (không render được),
# không Repositories (không chạm lưu trữ), không feature (không biết ai gọi mình).
# Nhờ vậy công thức của docs/08-three-pillars.md test được mà không cần dựng app.
CORE="$FE/Core"
fail_if_missing "$CORE"

core_total=0
soi_core() {
  local label="$1"
  local pattern="$2"
  local hits
  hits=$(grep -rnE "$pattern" "$CORE" 2>/dev/null || true)
  if [ -n "$hits" ]; then
    echo "$hits"
    local count
    count=$(echo "$hits" | wc -l)
    core_total=$((core_total + count))
    echo "  Core -> $count vi phạm ($label)"
  fi
}

soi_core "cấm import React / react-native" "from ['\"]react(-native|-dom)?(/[a-zA-Z/.-]*)?['\"]"
soi_core "cấm import Repositories / Sync" "from ['\"](\.\./)*(Repositories|Sync|Common)[a-zA-Z/.]*['\"]"
soi_core "cấm import feature" "from ['\"](\.\./)+($FEATURE_RE)[a-zA-Z/.]*['\"]"

if [ "$core_total" -gt 0 ]; then
  violations=$((violations + core_total))
else
  echo "  sạch"
fi

echo ""
echo "== Tổng: $violations vi phạm =="
if [ "$violations" -gt 0 ] && [ "$will_vanish" -gt 0 ]; then
  echo "   Trong đó ~$will_vanish dính tới module trong \$CUT, sẽ mất khi gỡ module đó."
  echo "   Nợ phải sửa tay: ~$((violations - will_vanish))"
fi
exit $((violations > 0 ? 1 : 0))
