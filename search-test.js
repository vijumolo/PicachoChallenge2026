const fs = require('fs');
const pdfjsLib = require('pdfjs-dist/legacy/build/pdf.js');

async function search() {
  const pdfPath = '../Challenge Picacho/Fondo Completo/Diplomas Challenge Completo/DIPLOMAS CHALLENGE COMPLETO.pdf';
  const data = new Uint8Array(fs.readFileSync(pdfPath));
  const doc = await pdfjsLib.getDocument({ data }).promise;

  // Build a complete index: for each page, extract the name and ALL text
  const nameIndex = [];
  for (let i = 1; i <= doc.numPages; i++) {
    const page = await doc.getPage(i);
    const tc = await page.getTextContent();
    const name = tc.items[2]?.str?.trim() || '';
    const allText = tc.items.map(item => item.str).join(' ');
    nameIndex.push({ page: i, name, allText });
  }

  // Check: does RODRÍGUEZ JORGE exist as a name?
  console.log('=== All names containing RODRIGUEZ ===');
  nameIndex.filter(e => e.name.toUpperCase().includes('RODRIGUEZ')).forEach(e => {
    console.log(`  Page ${e.page}: "${e.name}"`);
  });

  // Check: does any page have JORGE in the name AND RODRIGUEZ in the name?
  console.log('\n=== Names with JORGE ===');
  nameIndex.filter(e => e.name.toUpperCase().includes('JORGE')).forEach(e => {
    console.log(`  Page ${e.page}: "${e.name}"`);
  });

  // Maybe the name in our data is wrong? Check: what category is RODRIGUEZ JORGE in?
  // Let's also search by time: 03:52:56
  console.log('\n=== Searching for time 03:52:56 in diploma text ===');
  for (const entry of nameIndex) {
    if (entry.allText.includes('03:52:56')) {
      console.log(`  Page ${entry.page}: name="${entry.name}"`);
    }
  }
  
  // Also check: search for name "JORGE" anywhere in ANY text item (not just name)
  console.log('\n=== Pages where any text item contains JORGE ===');
  let jorgeCount = 0;
  for (const entry of nameIndex) {
    const rawItems = entry.allText;
    if (/\bJORGE\b/i.test(rawItems)) {
      jorgeCount++;
      if (jorgeCount <= 5) {
        console.log(`  Page ${entry.page}: name="${entry.name}"`);
      }
    }
  }
  console.log(`Total: ${jorgeCount}`);
}

search().catch(console.error);
