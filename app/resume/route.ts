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
    'Treasurer — MYTECH Career Fair (Feb 2026 — Present)',
    'Executive Assistant Finance — KRAIBURG TPE (Jun 2025 — Sep 2025)',
    'Treasurer — Code Fest X UM Alphathon (Oct 2025 — Dec 2025)',
    "Committee Member, Sponsorship & PR — Dean's Cup (Oct 2025 — Dec 2025)",
    'Treasurer — Mental Health Week (Sep 2025 — Nov 2025)',
    'Finance Intern — KRAIBURG TPE (Mar 2024 — Jun 2024)',
    'Assistant Head of Subject, Computer Science — KMNS PAL Leader Club (Jul 2024 — Dec 2024)',
    'Chairperson — Village Sports Club (Jul 2024 — Dec 2024)',
    'Representative — KPM Madani Leadership Course (Oct 2024)',
    '',
    'Projects',
    'BILAHUJAN — Intelligent disaster response mobile application (KitaHack 2026) — https://github.com/HowardWoon/BILAHUJAN-VHack2026.git',
    'Kuliah F3 (UM Hackathon) — Project built during UM Hackathon 2026 — https://github.com/HowardWoon/Kuliah-F3---UM-Hackathon-2026.git',
    'Catfish Detector (ML Models) — Machine learning models — https://github.com/HowardWoon/Catfish-Detector-ML-Models.git',
    'Slotify — Music app prototype — https://github.com/HowardWoon/Slotify.git',
    'Group Assignment — Buka — https://github.com/FSKTMCoders/group-assignment-5-5-buka.git',
    'Sensor X Sensei — Smart energy management system (UM Technothon 2026)',
    'BIOMELON — Population genetics data platform (PPAL 4.0 Innovation Day)',
    '',
    'Skills',
    'Java, Python, JavaScript/TypeScript, React, Flutter, Node.js, Firebase, RESTful APIs, Ollama, Claude Code, Google Colab, Git/GitHub, Figma, Canva, Draw.io'
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
