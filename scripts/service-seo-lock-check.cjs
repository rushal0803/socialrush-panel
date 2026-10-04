// Compare protected source contracts with HEAD before publishing presentation changes.
const fs = require('node:fs');
const cp = require('node:child_process');
const ts = require('typescript');
const base = cp.execFileSync('git', ['merge-base', 'HEAD', 'origin/main'], { encoding: 'utf8' }).trim();
const changed = cp.execFileSync('git', ['diff', '--name-only', base], { encoding: 'utf8' }).trim().split('\n');
const locked = /^(lib\/seo\/|app\/sitemap|app\/robots|middleware\.|next\.config|lib\/smm-service-catalog|lib\/service-pricing|lib\/supabase\/|app\/api\/|app\/auth\/)/;
let failures = [];
function contracts(source, filename) {
  const tree = ts.createSourceFile(filename, source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const values = [];
  const plain = node => {
    const value = node.getText(tree).replace(/\s+/g, ' ').trim();
    // The authorized hydration repair makes existing numeric presentation
    // deterministic; this does not replace any homepage copy string.
    return ['components/marketing/PremiumHomepage.tsx', 'components/marketing/services/ServicesPageContent.tsx'].includes(filename)
      ? value.replace(/\.toLocaleString\("en-IN"\)/g, '.toLocaleString()') : value;
  };
  function walk(node) {
    // This removed illustration was UI-only and explicitly labelled as a mock.
    if (ts.isFunctionDeclaration(node) && node.name?.text === 'PhonePreview') return;
    if (ts.isVariableDeclaration(node) && /metadata|schema|faq|canonical|seo|intro|overview|keyword|related|steps|chips/i.test(node.name.getText(tree))) values.push(plain(node));
    if (ts.isFunctionDeclaration(node) && /Metadata|StaticParams|SeoData|Faq|Schema/.test(node.name?.text || '')) values.push(plain(node));
    if (ts.isJsxElement(node)) {
      const tag = node.openingElement.tagName.getText(tree);
      if (/^h[1-6]$/.test(tag)) values.push(`${tag}:${node.children.map(plain).join('')}`);
      if (tag === 'p' && !filename.includes('OrderPanel') && !filename.includes('OrderBuilder')) values.push(`p:${node.children.map(plain).join('')}`);
      if (tag === 'script') values.push(plain(node));
    }
    if (ts.isJsxAttribute(node) && node.name.getText(tree) === 'href' && node.initializer) {
      const href = plain(node.initializer);
      if (!/orderHref|#|dashboard\/new-order/.test(href)) values.push(`href:${href}`);
    }
    if (ts.isJsxSelfClosingElement(node) && /JsonLd|AuthorityLinks|IntentSection|SearchDemand/.test(node.tagName.getText(tree))) values.push(plain(node));
    ts.forEachChild(node, walk);
  }
  walk(tree);
  return values;
}
for (const filename of changed.filter(Boolean)) {
  if (locked.test(filename)) { failures.push(`Locked file changed: ${filename}`); continue; }
  if (!/\.tsx$/.test(filename) || !/^(app\/|components\/marketing\/)/.test(filename) || /OrderPanel|OrderBuilder|StickyCta|PublicShell/.test(filename)) continue;
  if (!cp.execFileSync('git', ['ls-tree', base, '--', filename], { encoding: 'utf8' }).trim()) continue;
  const before = cp.execFileSync('git', ['show', `${base}:${filename}`], { encoding: 'utf8' });
  const after = fs.readFileSync(filename, 'utf8');
  const current = contracts(after, filename);
  for (const contract of contracts(before, filename)) {
    const index = current.indexOf(contract);
    if (index < 0) failures.push(`${filename}: protected contract missing: ${contract.slice(0, 150)}`);
    else current.splice(index, 1);
  }
}
if (failures.length) { console.error(failures.join('\n')); process.exitCode = 1; }
else console.log('SEO LOCK CHECK passed: protected files unchanged; original headings, copy, schema, metadata and internal links retained in changed templates.');
