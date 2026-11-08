import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const source = readFileSync(new URL("../../lib/crm/prospect-enrichment.ts", import.meta.url), "utf8");

test("prospect enrichment bounds response bytes before decoding HTML", () => {
  assert.match(source, /const MAX_HTML_BYTES = 1_500_000/);
  assert.match(source, /response\.body\.getReader\(\)/);
  assert.match(source, /bytesRead \+= value\.byteLength/);
  assert.match(source, /if \(bytesRead > MAX_HTML_BYTES\) return null/);
  assert.match(source, /new TextDecoder\(\)\.decode\(Buffer\.concat\(chunks\)\)/);
  assert.doesNotMatch(source, /await response\.text\(\)/);
});

test("prospect enrichment retains request timeout and safe response checks", () => {
  assert.match(source, /const FETCH_TIMEOUT_MS = 8_000/);
  assert.match(source, /if \(contentLength > MAX_HTML_BYTES\) return null/);
  assert.match(source, /reader\.cancel\(\)\.catch/);
  assert.match(source, /reader\.releaseLock\(\)/);
  assert.match(source, /controller\.abort\(\)/);
});

test("prospect redirects are manually followed with bounded hops and preflight validation", () => {
  assert.match(source, /const MAX_REDIRECTS = 3/);
  assert.match(source, /redirect: "manual"/);
  assert.match(source, /new URL\(location, currentUrl\)/);
  assert.match(source, /redirects === MAX_REDIRECTS/);
  assert.match(source, /!domainMatches\(currentUrl\.hostname, businessDomain\)/);
  assert.match(source, /!\(await publicHostname\(currentUrl\.hostname\)\)/);
  assert.match(source, /currentUrl\.username \|\| currentUrl\.password/);
  assert.doesNotMatch(source, /redirect: "follow"/);
});
