const fs = require('fs');
const path = require('path');
const bosPkg = path.resolve('..', 'PrintXO - BOS', 'package.json');
const content = fs.readFileSync(bosPkg, 'utf8');
console.log('Length:', content.length);
console.log('Content:', JSON.stringify(content));
