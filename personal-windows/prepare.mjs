// Copyright 2026 Personal VPN Contributors
// SPDX-License-Identifier: Apache-2.0
import {readFile, writeFile} from 'node:fs/promises';

// Run only in a clean Windows build checkout. Keep upstream source filenames,
// but give the installed service and IPC endpoint their own names.
const patches = [
  ['client/electron/routing_service.ts', 'OutlineServicePipe', 'PersonalVPNServicePipe'],
  ['client/electron/windows/OutlineService/OutlineService/OutlineService.cs', '"OutlineServicePipe"', '"PersonalVPNServicePipe"'],
  ['client/electron/windows/OutlineService/OutlineService/OutlineService.cs', '"OutlineService"', '"PersonalVPNService"'],
  ['client/electron/windows/OutlineService/OutlineService/OutlineService.Designer.cs', '"OutlineService"', '"PersonalVPNService"'],
  ['client/electron/install_windows_service.bat', 'OutlineService', 'PersonalVPNService'],
  ['client/electron/custom_install_steps.nsh', 'net stop OutlineService', 'net stop PersonalVPNService'],
  ['client/electron/custom_install_steps.nsh', 'sc query OutlineService', 'sc query PersonalVPNService'],
  ['client/electron/custom_install_steps.nsh', 'sc delete OutlineService', 'sc delete PersonalVPNService'],
  ['client/web/index_electron.html', '<title>Outline</title>', '<title>Personal VPN</title>'],
];
for (const [file, before, after] of patches) {
  const source = await readFile(file, 'utf8');
  if (!source.includes(before)) throw new Error(`Patch target missing: ${file}: ${before}`);
  let result = source.replaceAll(before, after);
  if (file.endsWith('install_windows_service.bat')) {
    result = result.replaceAll('PersonalVPNService.exe', 'OutlineService.exe');
  }
  await writeFile(file, result);
}
console.log('Configured independent PersonalVPNService and IPC pipe.');
