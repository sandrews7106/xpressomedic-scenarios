#!/bin/bash
# Safe Android sync — preserves Android-specific files
npx cap sync android
git checkout android/app/src/main/assets/public/index.html
git checkout android/app/src/main/assets/public/js/menu.js
echo "Android sync complete — index.html and menu.js restored."
