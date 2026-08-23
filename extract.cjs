const fs = require('fs');

const extractAndReplace = (file, arrayName, siteDataPath) => {
  let content = fs.readFileSync(file, 'utf8');
  
  // Find everything from 'const [arrayName]: [Type][] = [' to the matching '];'
  // Using a simpler approach since regex on huge multi-line arrays is tricky
  
  const arrayStartStr = 'const ' + arrayName;
  const startIndex = content.indexOf(arrayStartStr);
  
  if (startIndex === -1) {
    console.log('Could not find ' + arrayName + ' in ' + file);
    return;
  }
  
  const arrayDec = content.substring(startIndex, startIndex + 100);
  if (!arrayDec.includes('[')) return;
  
  // Actually, wait, let's just use the fact that they end with '];' at the root level.
  let endIndex = content.indexOf('];', startIndex);
  if (endIndex === -1) return;
  
  // Also we need to extract the interface/type if it exists.
  // But wait, the interface is needed in the component too!
  // If we move the array, the component still needs the type.
  // Let's just leave the type in the component and only move the array.
  // But site-data.ts needs the type.
  // This is too messy to do mechanically without an AST parser.