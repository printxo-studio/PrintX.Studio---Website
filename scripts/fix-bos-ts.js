const fs = require('fs');
const path = require('path');

const bosDir = path.resolve('..', 'PrintXO - BOS');
const files = [
  path.join(bosDir, 'src', 'app', 'api', 'shipping', 'route.ts'),
  path.join(bosDir, 'src', 'app', 'api', 'shipping', '[id]', 'route.ts')
];

files.forEach(f => {
  let content = fs.readFileSync(f, 'utf8');
  content = content.replace(/catch \(e\) {/g, 'catch (e: any) {');
  fs.writeFileSync(f, content, 'utf8');
  console.log('✓ Fixed catch (e: any) in', f);
});
