import { chmod, mkdir, writeFile } from 'node:fs/promises';
import { networkInterfaces } from 'node:os';
import { resolve } from 'node:path';
import { spawnSync } from 'node:child_process';

const root = process.cwd();
const certDir = resolve(root, 'certs');
const certFile = resolve(certDir, 'cert.pem');
const keyFile = resolve(certDir, 'key.pem');
const tmpConfig = resolve(certDir, '.openssl.cnf');

function getLanIpv4Addresses() {
  const interfaces = networkInterfaces();
  const addresses = new Set();
  for (const values of Object.values(interfaces)) {
    for (const entry of values || []) {
      if (entry.family === 'IPv4' && !entry.internal) {
        addresses.add(entry.address);
      }
    }
  }
  return [...addresses];
}

function buildSanEntries() {
  const entries = ['DNS:localhost', 'IP:127.0.0.1'];
  for (const ip of getLanIpv4Addresses()) {
    entries.push(`IP:${ip}`);
  }
  return entries;
}

function runOpenSsl(args) {
  return spawnSync('openssl', args, { stdio: 'inherit' });
}

function runMkcert(args) {
  return spawnSync('mkcert', args, { stdio: 'inherit' });
}

function hasCommand(name) {
  const check = spawnSync('bash', ['-lc', `command -v ${name}`], {
    stdio: 'ignore',
  });
  return check.status === 0;
}

async function main() {
  await mkdir(certDir, { recursive: true });

  const sanEntries = buildSanEntries();

  if (hasCommand('mkcert')) {
    console.log('mkcert detected. Generating trusted local certs...');
    const install = runMkcert(['-install']);
    if (install.status !== 0) {
      process.exit(install.status ?? 1);
    }
    const mkcertArgs = ['-key-file', keyFile, '-cert-file', certFile, 'localhost', '127.0.0.1'];
    const ips = sanEntries
      .filter((entry) => entry.startsWith('IP:'))
      .map((entry) => entry.replace('IP:', ''))
      .filter((ip) => ip !== '127.0.0.1');
    mkcertArgs.push(...ips);

    const generated = runMkcert(mkcertArgs);
    if (generated.status !== 0) {
      process.exit(generated.status ?? 1);
    }
    await chmod(keyFile, 0o600);
    console.log('Generated mkcert dev TLS certs:');
    console.log(`- ${certFile}`);
    console.log(`- ${keyFile}`);
    return;
  }

  console.log('mkcert not found. Falling back to OpenSSL self-signed certs.');
  const config = [
    '[req]',
    'distinguished_name=req_distinguished_name',
    'x509_extensions=v3_req',
    'prompt=no',
    '',
    '[req_distinguished_name]',
    'CN=localhost',
    '',
    '[v3_req]',
    `subjectAltName=${sanEntries.join(',')}`,
    '',
  ].join('\n');

  await writeFile(tmpConfig, config, 'utf8');

  const result = runOpenSsl([
    'req',
    '-x509',
    '-nodes',
    '-newkey',
    'rsa:2048',
    '-sha256',
    '-days',
    '825',
    '-keyout',
    keyFile,
    '-out',
    certFile,
    '-config',
    tmpConfig,
    '-extensions',
    'v3_req',
  ]);

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }

  await chmod(keyFile, 0o600);
  await writeFile(tmpConfig, '', 'utf8');

  console.log('Generated dev TLS certs:');
  console.log(`- ${certFile}`);
  console.log(`- ${keyFile}`);
  console.log('');
  console.log('LAN names in cert SAN:');
  for (const entry of sanEntries) {
    console.log(`- ${entry}`);
  }
}

main().catch((error) => {
  console.error('Failed to generate certs:', error);
  process.exitCode = 1;
});
