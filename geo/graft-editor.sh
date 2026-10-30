#!/usr/bin/env bash
# 把 yujun 編輯器嫁接進 GEO 前台。定案後才執行，說明見 TODOS.md。
#
# 用法（在 yujun 專案根目錄）：
#   bash geo/graft-editor.sh <GEO-Saas 路徑>                 # 第一次嫁接：不含即時預覽
#   bash geo/graft-editor.sh <GEO-Saas 路徑> --with-preview  # 之後加上即時預覽模組（編輯器端）
#
# 只改 GEO 的工作目錄，不 commit。classic 品牌的行為不變（getSiteTemplate 回傳 undefined）。
set -euo pipefail

GEO="${1:?請指定 GEO-Saas 路徑}"
MODE="${2:-}"
HERE="$(cd "$(dirname "$0")/.." && pwd)"
DEST="$GEO/frontend/src/components/templates"

if [ "$MODE" = "--with-preview" ]; then
  [ -f "$DEST/index.ts" ] || { echo "請先執行第一次嫁接"; exit 1; }
  mkdir -p "$DEST/yujun/preview"
  cp "$HERE/src/components/templates/yujun/preview/PreviewLayout.tsx" "$HERE/src/components/templates/yujun/preview/protocol.ts" "$DEST/yujun/preview/"
  cp "$HERE/src/components/templates/index.ts" "$DEST/index.ts"
  echo "即時預覽（編輯器端）已加入。前台預覽頁的設定見 TODOS.md"
  exit 0
fi

# 1. GEO 既有的三個檔案：只加擴充點
git -C "$GEO" apply --check "$HERE/geo/patches/01-editor-core.patch"
git -C "$GEO" apply "$HERE/geo/patches/01-editor-core.patch"

# 2. 新增的 yujun 模組
mkdir -p "$DEST/yujun"
cp "$HERE/src/components/templates/yujun/index.tsx" \
   "$HERE/src/components/templates/yujun/FieldInput.tsx" \
   "$HERE/src/components/templates/yujun/registry.ts" \
   "$HERE/src/components/templates/yujun/types.ts" \
   "$DEST/yujun/"

# 3. 對照表，拿掉即時預覽
grep -v 'yujun/preview/PreviewLayout' "$HERE/src/components/templates/index.ts" \
  | sed 's/yujun: { \.\.\.yujunTemplate, PreviewLayout },/yujun: yujunTemplate,/' > "$DEST/index.ts"

echo "編輯器已嫁接（不含即時預覽）。接著依 TODOS.md 修改 GEO 後端。"
