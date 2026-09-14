#!/usr/bin/env bash
# Copyright 2026 Personal iOS Client Contributors
# SPDX-License-Identifier: Apache-2.0
set -euo pipefail
cd "$(dirname "$0")"

if ! xcrun --find xcodebuild >/dev/null 2>&1; then
  echo '需要完整 Xcode 和 iPhoneOS SDK；Command Line Tools 无法生成 IPA。' >&2
  exit 1
fi
xcrun --sdk iphoneos --show-sdk-path >/dev/null
command -v node >/dev/null
command -v go >/dev/null

npm run action client/src/cordova/setup ios -- --buildMode=release --versionName=0.2.0

task_output=$(mktemp -d "$PWD/output/personal-ios.XXXXXX")
xcodebuild archive \
  -workspace client/src/cordova/apple/client.xcworkspace \
  -scheme Outline \
  -configuration Release \
  -destination 'generic/platform=iOS' \
  -archivePath "$task_output/PersonalClient.xcarchive" \
  CODE_SIGNING_ALLOWED=NO CODE_SIGNING_REQUIRED=NO CODE_SIGN_IDENTITY= \
  DEVELOPMENT_TEAM= MARKETING_VERSION=0.2.0

task_app="$task_output/PersonalClient.xcarchive/Products/Applications/Outline.app"
test -d "$task_app"
test -d "$task_app/PlugIns"
mkdir -p "$task_output/Payload"
ditto "$task_app" "$task_output/Payload/Outline.app"
# Match the extension's version to the generated host version before signing.
task_plist="$task_output/Payload/Outline.app/Info.plist"
task_extension_plist="$task_output/Payload/Outline.app/PlugIns/VpnExtension.appex/Info.plist"
for task_key in CFBundleShortVersionString CFBundleVersion; do
  task_value=$(/usr/libexec/PlistBuddy -c "Print :$task_key" "$task_plist")
  /usr/libexec/PlistBuddy -c "Set :$task_key $task_value" "$task_extension_plist"
done
(
  cd "$task_output"
  /usr/bin/zip -qry PersonalClient-unsigned.ipa Payload
  shasum -a 256 PersonalClient-unsigned.ipa > SHA256SUMS.txt
)
python3 validate-personal-ipa.py "$task_output/PersonalClient-unsigned.ipa" > "$task_output/package-manifest.json"
cp PERSONAL-SIGNING.md "$task_output/PERSONAL-SIGNING.md"
echo "未签名 IPA：$task_output/PersonalClient-unsigned.ipa"
echo '此文件不能直接安装；App 和 VPN 扩展均需有效签名和对应的描述文件。'
