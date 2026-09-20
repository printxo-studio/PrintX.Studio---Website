const fs = require('fs');
const path = require('path');
const bosPkgPath = path.resolve('..', 'PrintXO - BOS', 'package.json');
const pkg = JSON.parse(fs.readFileSync(bosPkgPath, 'utf8'));
pkg.scripts.dev = "next dev -p 3001 --turbo";
fs.writeFileSync(bosPkgPath, JSON.stringify(pkg, null, 2) + '\n', 'utf8');
console.log('✓ Successfully updated BOS package.json with dev port 3001');
