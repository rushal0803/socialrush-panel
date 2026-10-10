// Publish lossless review images in the existing PR; never copy auth state/logs.
const fs = require('node:fs');
const path = require('node:path');
const sharp = require('sharp');
const output = 'docs/design/pr-630';
async function main() {
  fs.mkdirSync(output, { recursive: true });
  const rows = [];
  for (const page of ['home', 'services', 'login', 'register']) {
    for (const width of [390, 1440]) {
      for (const stage of ['before', 'after']) {
        const input = `artifacts/premium-design/${stage === 'before' ? 'before' : 'followup-after'}/${page}-${width}.png`;
        const metadata = await sharp(input).metadata();
        await sharp(input).extract({ left: 0, top: 0, width, height: Math.min(metadata.height, 900) }).png({ compressionLevel: 9 }).toFile(path.join(output, `${stage}-${page}-${width}.png`));
      }
      rows.push(`| ${page} / ${width === 390 ? 'mobile (390px)' : 'desktop (1440px)'} | ![${page} before redesign at ${width} CSS pixels](before-${page}-${width}.png) | ![${page} after readability refinement at ${width} CSS pixels](after-${page}-${width}.png) |`);
    }
  }
  for (const width of [390, 1440]) {
    await sharp(`artifacts/premium-design/followup-after/home-workspace-${width}.png`).png({ compressionLevel: 9 }).toFile(path.join(output, `workspace-${width}.png`));
    await sharp(`artifacts/premium-design/followup/services-cards-before-${width}.png`).png({ compressionLevel: 9 }).toFile(path.join(output, `before-cards-${width}.png`));
    await sharp(`artifacts/services-v2/${width}-cards.png`).png({ compressionLevel: 9 }).toFile(path.join(output, `after-cards-${width}.png`));
    rows.push(`| service-card detail / ${width}px | ![Service card before this readability follow-up at ${width} CSS pixels](before-cards-${width}.png) | ![Service card after larger description and requirement text at ${width} CSS pixels](after-cards-${width}.png) |`);
  }
  fs.writeFileSync(path.join(output, 'README.md'), '# PR #630 visual review\n\nOriginal-to-final desktop and mobile viewport comparisons from local production builds with the same viewport and synthetic backend. Original baseline: `4f968b5235a40e1554945d2b84d54ccd198dad8a`. Card-detail before images are from Phase 1 before this follow-up; after images include the readability refinements. All images are committed lossless PNGs with descriptive alternative text. Open images for their native resolution; they do not depend on local artifact paths or preview authentication.\n\n| View | Before | After |\n| --- | --- | --- |\n' + rows.join('\n') + '\n\nNo real accounts, paid orders or payment submissions were used. The existing Vercel preview remains on the previous revision because this follow-up must not deploy. Phase 2 remains deferred until Phase 1 approval.\n');
  fs.appendFileSync(path.join(output, 'README.md'), '\nFull workspace detail (sample data):\n\n![Readable workspace labels and stacked status rows at 390px](workspace-390.png)\n\n![Readable workspace labels and statuses at 1440px](workspace-1440.png)\n');
  console.log(`Published ${rows.length * 2 + 2} review images to ${output}`);
}
main().catch(error => { console.error(error); process.exitCode = 1; });
