#!/bin/bash
# Patch React Native graphicsConversions.h to fix std::format issue
# This script should be run before building or after build failures

echo "📝 Patching React Native graphicsConversions.h files..."

# Find all graphicsConversions.h files in Gradle cache
FILES=$(find ~/.gradle/caches -name "graphicsConversions.h" -type f 2>/dev/null)

PATCHED=0
if [ -n "$FILES" ]; then
    for FILE in $FILES; do
        # Check if file contains std::format that needs patching
        if grep -q 'std::format("{}%", dimension.value)' "$FILE" 2>/dev/null; then
            # Create backup
            cp "$FILE" "$FILE.bak" 2>/dev/null
            # Replace std::format with std::to_string
            sed -i 's/return std::format("{}%", dimension.value);/return std::to_string(dimension.value) + "%";/' "$FILE"
            echo "   ✅ Patched: $FILE"
            PATCHED=$((PATCHED + 1))
        # Also check if it's already patched (contains std::to_string)
        elif grep -q 'std::to_string(dimension.value) + "%"' "$FILE" 2>/dev/null; then
            echo "   ✓ Already patched: $FILE"
        fi
    done
fi

# Also check in node_modules (though less likely to be there)
NODE_FILES=$(find node_modules -name "graphicsConversions.h" -type f 2>/dev/null | head -5)
if [ -n "$NODE_FILES" ]; then
    for FILE in $NODE_FILES; do
        if grep -q 'std::format("{}%", dimension.value)' "$FILE" 2>/dev/null; then
            cp "$FILE" "$FILE.bak" 2>/dev/null
            sed -i 's/return std::format("{}%", dimension.value);/return std::to_string(dimension.value) + "%";/' "$FILE"
            echo "   ✅ Patched: $FILE"
            PATCHED=$((PATCHED + 1))
        fi
    done
fi

if [ $PATCHED -gt 0 ]; then
    echo "✅ Successfully patched $PATCHED file(s)!"
elif [ -z "$FILES" ] && [ -z "$NODE_FILES" ]; then
    echo "ℹ️  graphicsConversions.h not found yet. It will be created during the build."
    echo "   If build fails with std::format error, run this script again."
else
    echo "ℹ️  No files needed patching (already patched or no std::format found)."
fi

