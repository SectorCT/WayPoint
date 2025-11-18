#!/bin/bash
# Patch React Native graphicsConversions.h to fix std::format issue
# This script should be run before building

FILES=$(find ~/.gradle/caches -name "graphicsConversions.h" -type f 2>/dev/null)

if [ -z "$FILES" ]; then
    echo "⚠️  graphicsConversions.h not found. It will be created during the build."
    echo "   The build script will patch it automatically after first failure."
    exit 0
fi

echo "📝 Patching React Native graphicsConversions.h files..."

PATCHED=0
for FILE in $FILES; do
    if grep -q 'std::format("{}%", dimension.value)' "$FILE" 2>/dev/null; then
        sed -i 's/return std::format("{}%", dimension.value);/return std::to_string(dimension.value) + "%";/' "$FILE"
        echo "   ✅ Patched: $FILE"
        PATCHED=$((PATCHED + 1))
    fi
done

if [ $PATCHED -gt 0 ]; then
    echo "✅ Successfully patched $PATCHED file(s)!"
else
    echo "ℹ️  No files needed patching (already patched or no std::format found)."
fi

