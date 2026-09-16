// Copyright 2026 Personal VPN Contributors
// SPDX-License-Identifier: Apache-2.0
import {readFile, readdir, writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import path from 'node:path';

const root = 'output/client/electron/build';
const installers = (await readdir(root)).filter(n => /^PersonalVPN-.*-Setup\.exe$/.test(n));
if (installers.length !== 1) throw new Error('Expected exactly one installer');
const files = [
  path.join(root, installers[0]),
  path.join(root, 'win-ia32-unpacked', 'Personal VPN.exe'),
  path.join(root, 'win-ia32-unpacked', 'resources', 'app.asar.unpacked', 'output', 'client', 'windows-386', 'backend.dll'),
  path.join(root, 'win-ia32-unpacked', 'resources', 'app.asar.unpacked', 'output', 'client', 'windows-386', 'tun2socks.exe'),
  'client/electron/windows/OutlineService/OutlineService/bin/OutlineService.exe',
];
for (const file of files) {
  const data = await readFile(file);
  const offset = data.readUInt32LE(0x3c);
  if (data.toString('ascii', 0, 2) !== 'MZ' || data.toString('ascii', offset, offset + 4) !== 'PE\0\0') {
    throw new Error(`Invalid Windows executable: ${file}`);
  }
  if (data.readUInt16LE(offset + 4) !== 0x14c) throw new Error(`Expected x86 executable: ${file}`);
}
const installer = installers[0];
const sha256 = createHash('sha256').update(await readFile(path.join(root, installer))).digest('hex');
await writeFile(path.join(root, 'SHA256SUMS.txt'), `${sha256}  ${installer}\n`);
await writeFile(path.join(root, 'package-manifest.json'), JSON.stringify({
  product: 'Personal VPN', version: '0.1.0', installer, sha256,
  architecture: 'x86 (runs on Intel/AMD x64 Windows)',
  intended_os: 'Windows 10 / 11',
  service: 'PersonalVPNService',
  publisher_signature: 'unsigned', automatic_updates: false,
  validation: 'PE headers and required native binaries checked; device VPN test pending',
}, null, 2));
console.log('Installer and native binary structure verified.');
