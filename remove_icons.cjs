const fs = require('fs');
const path = require('path');
const files = ['caesar.ts', 'columnar.ts', 'extras.ts', 'railfence.ts', 'substitution.ts', 'vigenere.ts', 'xor.ts'];
files.forEach(f => {
  let p = path.join('src', 'ciphers', f);
  let c = fs.readFileSync(p, 'utf8');
  c = c.replace(/\s*icon:\s*['"'].*?['"'],/g, '');
  fs.writeFileSync(p, c);
});
