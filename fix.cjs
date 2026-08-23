const fs = require('fs');

let meshContent = fs.readFileSync('components/particle-mesh.tsx', 'utf8');
meshContent = meshContent.replace(/ctx\.strokeStyle = \\gba/, 'ctx.strokeStyle = gba');
meshContent = meshContent.replace(/11, \\\)\\\;/, '11, );');
fs.writeFileSync('components/particle-mesh.tsx', meshContent);

let tiltContent = fs.readFileSync('components/tilt-card.tsx', 'utf8');
tiltContent = tiltContent.replace(/className=\{\\elative perspective-1000 \\\\\}/, 'className={elative perspective-1000 }');
fs.writeFileSync('components/tilt-card.tsx', tiltContent);

let cursorContent = fs.readFileSync('components/custom-cursor.tsx', 'utf8');
// Check if cursor has any broken template literals