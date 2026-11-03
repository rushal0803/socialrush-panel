// Test/build process only. No live database or payment-provider network access.
require('./packages-test-backend.cjs');
const fixtureFetch = globalThis.fetch;
globalThis.fetch = async (input, init) => {
  const url = new URL(typeof input === 'string' ? input : input.url || input.toString());
  if (url.hostname === 'finance-fixture.supabase.co' &&
      (url.pathname.startsWith('/auth/v1/') || url.pathname.startsWith('/rest/v1/'))) return fixtureFetch(input, init);
  if (['127.0.0.1', 'localhost', '[::1]'].includes(url.hostname)) return fixtureFetch(input, init);
  throw new Error('External network disabled in isolated financial verification');
};
