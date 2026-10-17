import test from "node:test";
import assert from "node:assert/strict";
import { parseGscCsv, parseGscPageUrl, parseGscDate, splitGscCsv } from "../../lib/seo/gsc-csv-import.ts";

test("imports GSC Pages report with comma metrics, quoted values and BOM",()=>{
  const csv="\ufeffTop pages,Clicks,Impressions,CTR,Position\r\n"+
    '"https://www.getsocialrush.com/buy-instagram-likes-india","1,234","2,000",61.7%,8.2\r\n'+
    "https://www.getsocialrush.com/buy-instagram-comments-india,5,500,1%,19.3\r\n";
  const parsed=parseGscCsv(csv,"performance_pages");
  assert.equal(parsed.rows.length,2);
  assert.equal(parsed.rows[0].clicks,1234);
  assert.equal(parsed.rows[0].impressions,2000);
  assert.equal(parsed.rows[0].ctr,0.617);
  assert.equal(parsed.rows[0].canonical_path,"/instagram-likes");
  assert.equal(parsed.rows[0].source_path,"/buy-instagram-likes-india");
});

test("indexing URL examples retain a reason and do not invent metrics",()=>{
  const out=parseGscCsv("URL\nhttps://www.getsocialrush.com/buy-youtube-comments-india\n","indexing_examples","discovered_not_indexed");
  assert.equal(out.reason,"discovered_not_indexed");
  assert.equal(out.rows[0].clicks,null);
  assert.equal(out.rows[0].canonical_path,"/buy-youtube-comments-india");
});

test("rejects malformed and missing-column files",()=>{
  assert.throws(()=>splitGscCsv('Page,Clicks\n"https://www.getsocialrush.com/foo,5'));
  assert.throws(()=>parseGscCsv("Page,Clicks\nhttps://www.getsocialrush.com/foo,5","performance_pages"),/must include/);
  assert.throws(()=>parseGscCsv("URL\nhttps://www.getsocialrush.com/foo","indexing_examples",""),/reason/);
  assert.throws(()=>parseGscCsv("URL\nhttps://www.getsocialrush.com/foo\nhttps://www.getsocialrush.com/foo","indexing_examples","other"),/more than once/);
});

test("prevents hostile or unrelated domains and sensitive routes",()=>{
  for (const s of [
    "http://www.getsocialrush.com/services",
    "https://www.getsocialrush.com.evil.com/services",
    "https://user:pass@www.getsocialrush.com/services",
    "https://www.getsocialrush.com/admin/crm",
    "https://www.getsocialrush.com/checkout",
    "https://www.getsocialrush.com/services?page=1",
    "https://www.getsocialrush.com/%2fadmin",
  ]) assert.throws(()=>parseGscPageUrl(s),s);
});

test("rejects inconsistent GSC metrics instead of silently rewriting values",()=>{
  const header="Page,Clicks,Impressions,CTR,Position\n";
  assert.throws(()=>parseGscCsv(header+"https://www.getsocialrush.com/foo,11,10,10%,12","performance_pages"),/inconsistent/);
  assert.throws(()=>parseGscCsv(header+"https://www.getsocialrush.com/foo,5,10,10,12","performance_pages"),/CTR/);
  assert.throws(()=>parseGscCsv(header+"https://www.getsocialrush.com/foo,5,10,50%,0","performance_pages"),/inconsistent/);
});

test("date validation prevents impossible and future evidence dates",()=>{
  assert.equal(parseGscDate("2026-10-10"),"2026-10-10");
  assert.throws(()=>parseGscDate("2026-02-30"));
  assert.throws(()=>parseGscDate("2099-10-10"));
});
