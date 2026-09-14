#!/usr/bin/env python3
# Copyright 2026 Personal iOS Client Contributors
# SPDX-License-Identifier: Apache-2.0
"""Check package consistency; this does not validate signing or device support."""
import json
import plistlib
import struct
import sys
import zipfile


def inspect(path):
    with zipfile.ZipFile(path) as package:
        names = package.namelist()
        hosts = [n for n in names if n.startswith('Payload/')
                 and n.count('/') == 2 and n.endswith('.app/Info.plist')]
        if len(hosts) != 1:
            raise ValueError('Expected exactly one host app')
        host_path = hosts[0].removesuffix('Info.plist')
        extension_path = host_path + 'PlugIns/VpnExtension.appex/'
        host = plistlib.loads(package.read(hosts[0]))
        extension = plistlib.loads(package.read(extension_path + 'Info.plist'))
        bundle_id = host['CFBundleIdentifier']
        if bundle_id != 'io.github.huazhu624tech.shadowsocks':
            raise ValueError('Unexpected personal bundle ID')
        if extension['CFBundleIdentifier'] != bundle_id + '.VpnExtension':
            raise ValueError('VPN extension bundle ID must match the host')
        group = host.get('PersonalAppGroup')
        if group != 'group.' + bundle_id or extension.get('PersonalAppGroup') != group:
            raise ValueError('Shared App Group configuration does not match')
        if extension.get('NSExtension', {}).get('NSExtensionPointIdentifier') != \
                'com.apple.networkextension.packet-tunnel':
            raise ValueError('Missing packet tunnel extension point')
        for key in ('CFBundleVersion', 'CFBundleShortVersionString'):
            if not host.get(key) or host[key] != extension.get(key):
                raise ValueError('Host and extension versions differ: ' + key)
        for prefix, info in ((host_path, host), (extension_path, extension)):
            header = package.read(prefix + info['CFBundleExecutable'])[:8]
            if len(header) != 8 or struct.unpack('<II', header) != (0xFEEDFACF, 0x0100000C):
                raise ValueError('Expected an arm64 Mach-O executable: ' + prefix)
        return {
            'bundle_id': bundle_id,
            'extension_bundle_id': extension['CFBundleIdentifier'],
            'app_group': group,
            'version': host['CFBundleShortVersionString'],
            'build': host['CFBundleVersion'],
            'minimum_ios': host.get('MinimumOSVersion'),
            'architecture': 'arm64',
            'required_network_extension_entitlement': ['packet-tunnel-provider'],
            'signing_status': 'Not verified; unsigned build requires signing of both targets',
            'device_test_status': 'Not tested on iPhone 15 Pro Max / iOS 26.5.2',
        }


if __name__ == '__main__':
    try:
        print(json.dumps(inspect(sys.argv[1]), ensure_ascii=False, indent=2))
    except (ValueError, KeyError, IndexError, zipfile.BadZipFile) as error:
        sys.exit('IPA validation failed: ' + str(error))
