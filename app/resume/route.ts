export const runtime = 'nodejs';

function escapePdfText(value: string) {
  return value.replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)');
}

function createResumePdf() {
  const lines = [
    'Howard Woon Hao Zhe',
    'First-year Computer Science (Software Engineering) student at the University of Malaya',
    '',
    'Summary',
    'Builder across software engineering, finance, AI systems, and smart energy products.',
    '',
    'Experience',
    'Assistant Finance Executive - Kraiburg TPE Technology (M) Sdn. Bhd.',
    'Treasurer & Leadership Roles - UM Alphathon 2025, MYTECH Career Fair 2026, PEKOM CODEFEST / Mental Health Week',
    '',
    'Projects',
    'BILAHUJAN - Intelligent disaster response mobile application',
    'Sensor X Sensei - Smart energy management system',
    'BIOMELON - Population genetics data platform',
    '',
    'Skills',
    'Java, Python, React, Flutter, Node.js, Firebase, RESTful APIs, Ollama, Claude Code, Google Colab, Git/GitHub, Figma, Canva, Draw.io'
  ];

  const contentLines = [
    'BT',
    '/F1 22 Tf',
    '72 760 Td'
  ];

  lines.forEach((line, index) => {
    const text = escapePdfText(line);
    if (index === 0) {
      contentLines.push(`(${text}) Tj`);
    } else {
      contentLines.push('T*');
      contentLines.push(`(${text}) Tj`);
    }
  });
  contentLines.push('ET');

  const stream = contentLines.join('\n');
  const objects = [
    '<< /Type /Catalog /Pages 2 0 R >>',
    '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>',
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',
    `<< /Length ${Buffer.byteLength(stream)} >>\nstream\n${stream}\nendstream`
  ];

  let pdf = '%PDF-1.4\n';
  const offsets = [0];

  objects.forEach((object, index) => {
    offsets.push(Buffer.byteLength(pdf));
    pdf += `${index + 1} 0 obj\n${object}\nendobj\n`;
  });

  const xrefOffset = Buffer.byteLength(pdf);
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  for (let index = 1; index < offsets.length; index += 1) {
    pdf += `${offsets[index].toString().padStart(10, '0')} 00000 n \n`;
  }
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;

  return Buffer.from(pdf, 'binary');
}

export async function GET() {
  const pdf = createResumePdf();

  return new Response(pdf, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'attachment; filename="Howard-Woon-Hao-Zhe-Resume.pdf"',
      'Cache-Control': 'no-store, max-age=0'
    }
  });
}
