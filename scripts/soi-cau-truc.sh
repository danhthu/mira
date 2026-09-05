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
FEATURES="Challenger Emotion Goal HabitTracker Reminder TimeTracker Trading Welcome Work"

# Composition root: việc của nó LÀ ghép các feature lại, nên được phép import feature.
ROOTS="Main Home"

# Nhóm module bị cắt theo PLAN.md — vi phạm dính tới chúng sẽ tự biến mất khi cắt,
# nên đếm riêng để không lẫn với nợ thật sự phải sửa tay.
CUT="HabitTracker Work Challenger Trading"

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

echo "== 1. Common/ (lớp shared) không được import ngược lên feature =="
common_up=$(grep -rnoE "from '\.\./\.\./($FEATURE_RE)[a-zA-Z/.]*'" "$FE/Common" 2>/dev/null || true)
if [ -n "$common_up" ]; then
  echo "$common_up"
  count=$(echo "$common_up" | wc -l)
  violations=$((violations + count))
  vanish=$(echo "$common_up" | grep -cE "\.\./\.\./($CUT_RE)" || true)
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
    vanish=$(echo "$hits" | grep -cE "\.\./\.\./($CUT_RE)" || true)
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
echo "== 5. code/be: luật tầng (giữ nguyên, be không bị đụng trong đợt reset) =="
be_bad=$(grep -rnE "from ['\"](\.\./)*(entities|database)/" code/be/src/shared 2>/dev/null || true)
if [ -n "$be_bad" ]; then
  echo "$be_bad"
  count=$(echo "$be_bad" | wc -l)
  violations=$((violations + count))
  echo "  -> $count vi phạm"
else
  echo "  sạch"
fi

echo ""
echo "== Tổng: $violations vi phạm =="
if [ "$violations" -gt 0 ]; then
  echo "   Trong đó ~$will_vanish sẽ tự biến mất khi cắt module theo PLAN.md."
  echo "   Nợ thật sự phải sửa tay: ~$((violations - will_vanish))"
fi
exit $((violations > 0 ? 1 : 0))
