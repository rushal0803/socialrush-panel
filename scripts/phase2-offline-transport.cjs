// Explicit test-process preload only. Never imported by application code.
globalThis.fetch = async () => { throw new Error('Phase2 fixture: outbound network disabled'); };
for (const name of ['node:http', 'node:https']) {
  const transport = require(name);
  transport.request = transport.get = () => { throw new Error('Phase2 fixture: outbound HTTP disabled'); };
}
require('node:net').Socket.prototype.connect = function () { throw new Error('Phase2 fixture: outbound sockets disabled'); };
