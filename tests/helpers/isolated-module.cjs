const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');

// Execute actual TS/TSX source with an explicit import allowlist and no host env/network.
// This isolates test dependencies; vm is not a security sandbox for untrusted code.
module.exports = function load(relativePath, imports = {}, globals = {}) {
  const filename = path.resolve(__dirname, '../..', relativePath);
  const code = ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
    fileName: filename,
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX },
  }).outputText;
  const module = { exports: {} };
  const requireStub = name => {
    if (!Object.hasOwn(imports, name)) throw new Error(`Unstubbed import: ${name}`);
    return imports[name];
  };
  vm.runInNewContext(`(function(require,module,exports){${code}\n})`, {
    URL, URLSearchParams, Buffer, console,
    process: { env: {} },
    fetch: () => { throw new Error('Network disabled in isolated test'); },
    ...globals,
  }, { filename, timeout: 3000 })(requireStub, module, module.exports);
  return module.exports;
};
