"use client";

import { useEffect, useState } from "react";

type Language = "curl" | "javascript" | "php";
const examples: Record<"create" | "status", Record<Language,string>> = {
  create: {
    curl: `curl -X POST https://www.getsocialrush.com/api/orders \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"service": 1042, "link": "https://instagram.com/example", "quantity": 1000}'`,
    javascript: `const response = await fetch("https://www.getsocialrush.com/api/orders", {
  method: "POST",
  headers: {
    "Authorization": "Bearer YOUR_API_KEY",
    "Content-Type": "application/json"
  },
  body: JSON.stringify({
    service: 1042,
    link: "https://instagram.com/example",
    quantity: 1000
  })
});

const order = await response.json();`,
    php: `<?php
$response = file_get_contents(
  "https://www.getsocialrush.com/api/orders",
  false,
  stream_context_create(["http" => [
    "method" => "POST",
    "header" => "Authorization: Bearer YOUR_API_KEY\r\n" .
                "Content-Type: application/json\r\n",
    "content" => json_encode([
      "service" => 1042,
      "link" => "https://instagram.com/example",
      "quantity" => 1000
    ])
  ]])
);`,
  },
  status: {
    curl: `curl https://www.getsocialrush.com/api/orders/ORDER_ID \\
  -H "Authorization: Bearer YOUR_API_KEY"`,
    javascript: `const response = await fetch(
  "https://www.getsocialrush.com/api/orders/ORDER_ID",
  { headers: { "Authorization": "Bearer YOUR_API_KEY" } }
);

const status = await response.json();`,
    php: `<?php
$options = ["http" => [
  "header" => "Authorization: Bearer YOUR_API_KEY\r\n"
]];
$response = file_get_contents(
  "https://www.getsocialrush.com/api/orders/ORDER_ID",
  false,
  stream_context_create($options)
);`,
  },
};

function CodeBlock({ endpoint }: { endpoint: "create" | "status" }) {
  const [language, setLanguage] = useState<Language>("curl"); const [copied, setCopied] = useState(false); const code = examples[endpoint][language];
  async function copy() { await navigator.clipboard.writeText(code); setCopied(true); window.setTimeout(() => setCopied(false), 1500); }
  return <div className="overflow-hidden rounded-2xl border border-slate-800 bg-[#071225] shadow-xl"><div className="flex items-center justify-between border-b border-white/10 px-4 py-3"><div className="flex gap-1">{(["curl","javascript","php"] as Language[]).map((item) => <button key={item} onClick={() => setLanguage(item)} className={`rounded-lg px-3 py-1.5 text-[9px] font-bold uppercase ${language === item ? "bg-blue-600 text-white" : "text-slate-500 hover:text-white"}`}>{item}</button>)}</div><button onClick={copy} className="rounded-lg bg-white/5 px-3 py-1.5 text-[9px] font-bold text-slate-300">{copied ? "Copied ✓" : "Copy"}</button></div><pre className="max-h-[360px] overflow-auto p-5 text-xs leading-6 text-blue-100"><code>{code}</code></pre></div>;
}

export default function ApiDocsPage() {
  const [apiKey, setApiKey] = useState(""); const [visible, setVisible] = useState(false); const [copyLabel, setCopyLabel] = useState("Copy key"); const [generating, setGenerating] = useState(false);
  useEffect(() => { void fetch("/api/api-key").then((response) => response.json()).then((payload: { data?: string }) => setApiKey(payload.data || "")); }, []);
  async function generate() { setGenerating(true); const response = await fetch("/api/api-key", { method: "POST" }); const payload = await response.json() as { data?: string }; setApiKey(payload.data || ""); setVisible(true); setGenerating(false); }
  async function copyKey() { if (!apiKey) return; await navigator.clipboard.writeText(apiKey); setCopyLabel("Copied ✓"); window.setTimeout(() => setCopyLabel("Copy key"), 1500); }
  return <main className="min-h-[calc(100vh-5rem)] bg-[linear-gradient(180deg,#07111f,#081a2d)] text-slate-100"><div className="mx-auto grid max-w-[1650px] lg:grid-cols-[260px_1fr]"><aside className="hidden min-h-[calc(100vh-5rem)] border-r border-white/10 bg-[#08162a]/90 p-6 lg:block"><p className="text-[9px] font-bold uppercase tracking-[.18em] text-slate-400">Developer documentation</p><nav className="mt-5 space-y-1 text-xs">{[["Introduction","#introduction"],["API keys","#api-key"],["Authentication","#authentication"],["Create order","#create-order"],["Order status","#order-status"],["Response codes","#responses"],["Rate limits","#rate-limits"]].map(([label,href],index) => <a key={href} href={href} className={`block rounded-lg px-3 py-2.5 font-semibold ${index === 0 ? "bg-cyan-500/15 text-cyan-200" : "text-slate-400 hover:bg-white/5 hover:text-cyan-200"}`}>{label}</a>)}</nav><div className="mt-8 rounded-xl border border-white/10 bg-[#071225] p-4"><p className="text-[9px] font-bold uppercase text-slate-400">API status</p><p className="mt-2 flex items-center gap-2 text-xs font-bold text-emerald-300"><i className="h-2 w-2 rounded-full bg-emerald-400"/>Operational</p><p className="mt-2 text-[9px] text-slate-500">Version 1.0</p></div></aside>
    <div className="min-w-0 px-5 py-8 sm:px-8 lg:px-12"><section id="introduction" className="max-w-4xl"><span className="text-[10px] font-bold uppercase tracking-[.2em] text-cyan-300">SocialRUSH Developers</span><h1 className="mt-3 text-4xl font-bold tracking-[-.04em] text-white">Build campaign automation with our API.</h1><p className="mt-5 max-w-2xl text-base leading-8 text-slate-300">Programmatically create growth campaigns, retrieve delivery status, and connect SocialRUSH to your applications and client workflows.</p><div className="mt-6 inline-flex items-center gap-3 rounded-xl border border-white/10 bg-[#0A1628] px-4 py-3"><span className="text-[9px] font-bold uppercase text-slate-400">Base URL</span><code className="text-xs font-semibold text-cyan-200">https://www.getsocialrush.com/api</code><button onClick={() => void navigator.clipboard.writeText("https://www.getsocialrush.com/api")} className="text-[9px] font-bold text-slate-400 hover:text-cyan-200">Copy</button></div></section>
      <section id="api-key" className="mt-12 max-w-4xl rounded-3xl border border-cyan-400/20 bg-gradient-to-br from-[#0b1d35] to-[#0a1628] p-6 shadow-2xl shadow-slate-950/40 sm:p-8"><div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-start"><div><p className="text-[9px] font-bold uppercase tracking-wider text-cyan-300">Credentials</p><h2 className="mt-2 text-xl font-bold text-white">Your API key</h2><p className="mt-2 max-w-xl text-xs leading-6 text-slate-300">This key grants access to your account. Store it securely and never expose it in browser code or public repositories.</p></div><button onClick={generate} disabled={generating} className="rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 px-4 py-3 text-xs font-bold text-white shadow-lg shadow-blue-600/20">{generating ? "Generating..." : apiKey ? "Regenerate key" : "Generate API key"}</button></div><div className="mt-5 flex items-center gap-2 rounded-xl border border-white/10 bg-[#071225] p-3"><code className="min-w-0 flex-1 truncate text-xs text-slate-300">{apiKey ? visible ? apiKey : `sr_live_${"•".repeat(28)}` : "No API key generated"}</code>{apiKey && <><button onClick={() => setVisible(!visible)} className="rounded-lg bg-white/5 px-3 py-2 text-[9px] font-bold text-slate-200">{visible ? "Hide" : "Reveal"}</button><button onClick={copyKey} className="rounded-lg bg-cyan-500/15 px-3 py-2 text-[9px] font-bold text-cyan-200">{copyLabel}</button></>}</div></section>
      <section id="authentication" className="mt-14 max-w-4xl"><p className="text-[9px] font-bold uppercase tracking-wider text-cyan-300">Authentication</p><h2 className="mt-2 text-2xl font-bold text-white">Authenticate every request</h2><p className="mt-3 text-sm leading-7 text-slate-300">Send your API key as a Bearer token in the Authorization header.</p><div className="mt-5 rounded-xl border border-white/10 bg-[#071225] p-4"><code className="text-xs text-slate-200">Authorization: Bearer YOUR_API_KEY</code></div></section>
      <section id="create-order" className="mt-16 grid max-w-6xl gap-8 xl:grid-cols-[.75fr_1.25fr]"><div><span className="rounded-full bg-cyan-500/15 px-2.5 py-1 text-[9px] font-bold text-cyan-200">POST</span><h2 className="mt-4 text-2xl font-bold text-white">Create an order</h2><p className="mt-3 text-sm leading-7 text-slate-300">Create a campaign using a service identifier, destination link, and quantity.</p><div className="mt-5 space-y-3 text-xs">{[["service","integer","Required service ID"],["link","string","Public campaign destination"],["quantity","integer","Requested service quantity"]].map(([name,type,text]) => <div key={name} className="border-b border-white/10 pb-3"><code className="font-bold text-cyan-200">{name}</code><span className="ml-2 text-[9px] text-slate-500">{type}</span><p className="mt-1 text-slate-300">{text}</p></div>)}</div></div><CodeBlock endpoint="create"/></section>
      <section id="order-status" className="mt-16 grid max-w-6xl gap-8 xl:grid-cols-[.75fr_1.25fr]"><div><span className="rounded-full bg-emerald-500/15 px-2.5 py-1 text-[9px] font-bold text-emerald-200">GET</span><h2 className="mt-4 text-2xl font-bold text-white">Check order status</h2><p className="mt-3 text-sm leading-7 text-slate-300">Retrieve current campaign status, investment, and fulfillment details using its order ID.</p></div><CodeBlock endpoint="status"/></section>
      <div className="mt-16 grid max-w-4xl gap-5 md:grid-cols-2"><section id="responses" className="rounded-2xl border border-white/10 bg-[#0A1628] p-6"><h2 className="text-lg font-bold text-white">Response codes</h2><div className="mt-5 space-y-3">{[["200","Request successful","bg-emerald-500/15 text-emerald-200"],["201","Resource created","bg-cyan-500/15 text-cyan-200"],["400","Invalid request","bg-amber-500/15 text-amber-200"],["401","Authentication failed","bg-rose-500/15 text-rose-200"],["429","Rate limit exceeded","bg-violet-500/15 text-violet-200"]].map(([code,text,color]) => <div key={code} className="flex items-center gap-3 text-xs"><span className={`rounded-md px-2 py-1 font-bold ${color}`}>{code}</span><span className="text-slate-300">{text}</span></div>)}</div></section><section id="rate-limits" className="rounded-2xl bg-[#07152f] p-6 text-white"><h2 className="text-lg font-bold">Rate limits</h2><p className="mt-4 text-sm leading-7 text-slate-400">API clients may submit up to <b className="text-white">120 requests per minute</b>. Limit and remaining-request values are returned in response headers.</p><div className="mt-5 rounded-xl bg-white/5 p-4 font-mono text-[10px] text-blue-300">X-RateLimit-Limit: 120<br/>X-RateLimit-Remaining: 119</div></section></div>
    </div></div></main>;
}
