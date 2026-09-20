const fs = require('fs');
const path = require('path');

const bosDir = path.resolve(process.cwd(), '..', 'PrintXO - BOS');
console.log('BOS Directory:', bosDir);

if (!fs.existsSync(bosDir)) {
  console.error('BOS directory does not exist:', bosDir);
  process.exit(1);
}

// 1. Update BOS package.json port to 3001
const bosPkgPath = path.join(bosDir, 'package.json');
let bosPkg = fs.readFileSync(bosPkgPath, 'utf8');
if (!bosPkg.includes('-p 3001')) {
  bosPkg = bosPkg.replace('"dev": "next dev --turbo"', '"dev": "next dev -p 3001 --turbo"');
  bosPkg = bosPkg.replace('"dev": "next dev"', '"dev": "next dev -p 3001"');
  fs.writeFileSync(bosPkgPath, bosPkg, 'utf8');
  console.log('✓ Updated BOS package.json with port 3001');
} else {
  console.log('✓ BOS package.json already has port 3001');
}

// 2. Update BOS .env with Website URL & PrintX Studio name
const bosEnvPath = path.join(bosDir, '.env');
let bosEnv = fs.readFileSync(bosEnvPath, 'utf8');
if (!bosEnv.includes('NEXT_PUBLIC_WEBSITE_URL')) {
  bosEnv += '\n# Bridge Configuration with Website\nNEXT_PUBLIC_WEBSITE_URL="http://localhost:3000"\nWEBSITE_API_URL="http://localhost:3000"\nGEMINI_API_KEY=""\n';
}
bosEnv = bosEnv.replace(/NEXT_PUBLIC_COMPANY_NAME="[^"]*"/, 'NEXT_PUBLIC_COMPANY_NAME="PrintX Studio"');
bosEnv = bosEnv.replace(/OWNER_NAME="[^"]*"/, 'OWNER_NAME="PrintX Admin"');
fs.writeFileSync(bosEnvPath, bosEnv, 'utf8');
console.log('✓ Updated BOS .env configuration');
