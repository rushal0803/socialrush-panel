"use client";

import { useEffect, useState } from "react";

type TocItem = { id: string; label: string };

export default function BlogArticleEnhancements({ toc, articleUrl, showProgress, mobileToc = true, desktopToc = true, showShare = true }: { toc: TocItem[]; articleUrl: string; showProgress: boolean; mobileToc?: boolean; desktopToc?: boolean; showShare?: boolean }) {
  const [progress, setProgress] = useState(0);
  const [activeId, setActiveId] = useState(toc[0]?.id);
  const [copied, setCopied] = useState(false);
  const [open, setOpen] = useState(false);
  useEffect(() => {
    if (!showProgress) return;
    const update = () => { const article = document.getElementById("article-body"); if (!article) return; const rect = article.getBoundingClientRect(); setProgress(Math.max(0, Math.min(100, ((-rect.top) / Math.max(1, rect.height - innerHeight)) * 100))); };
    update(); window.addEventListener("scroll", update, { passive: true }); window.addEventListener("resize", update); return () => { window.removeEventListener("scroll", update); window.removeEventListener("resize", update); };
  }, [showProgress]);
  useEffect(() => { const observer = new IntersectionObserver((entries) => { const visible = entries.filter((entry) => entry.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0]; if (visible) setActiveId(visible.target.id); }, { rootMargin: "-20% 0px -65% 0px" }); toc.forEach(({ id }) => { const el = document.getElementById(id); if (el) observer.observe(el); }); return () => observer.disconnect(); }, [toc]);
  const copy = async () => { await navigator.clipboard?.writeText(articleUrl); setCopied(true); window.setTimeout(() => setCopied(false), 1800); };
  const links = <ol className="grid gap-2">{toc.map((item) => <li key={item.id}><a href={`#${item.id}`} aria-current={activeId === item.id ? "location" : undefined} className={`block rounded-lg px-2 py-2 text-sm font-semibold transition ${activeId === item.id ? "bg-orange-100 text-[#C75F00]" : "text-[#8A4800] hover:bg-[#FFF8F1]"}`}>{item.label}</a></li>)}</ol>;
  return <>
    {showProgress ? <div aria-label="Article reading progress" className="fixed left-0 right-0 top-0 z-[10000] h-1 bg-transparent"><div className="h-full bg-[#FF7A00] motion-reduce:transition-none" style={{ width: `${progress}%` }} /></div> : null}
    {toc.length && mobileToc ? <div className="mt-6 lg:hidden"><button type="button" aria-expanded={open} aria-controls="mobile-toc" onClick={() => setOpen(!open)} className="flex min-h-11 w-full items-center justify-between rounded-xl border border-[#FFF3E0] bg-[#FFF8F1] px-4 text-left font-extrabold text-[#0B0B0F]">Table of contents <span aria-hidden="true">{open ? "−" : "+"}</span></button>{open ? <nav id="mobile-toc" aria-label="Table of contents" className="mt-2 rounded-xl border border-[#FFF3E0] bg-white p-3">{links}</nav> : null}</div> : null}
    {toc.length && desktopToc ? <aside className="sticky top-28 hidden self-start rounded-2xl border border-[#FFF3E0] bg-white/90 p-4 shadow-sm lg:block"><h2 className="mb-3 text-sm font-extrabold text-[#0B0B0F]">On this page</h2><nav aria-label="Table of contents">{links}</nav></aside> : null}
    {showShare ? <div className="mt-5 flex flex-wrap gap-2" aria-label="Share this article"><button type="button" onClick={copy} className="min-h-11 rounded-xl border border-[#FFF3E0] bg-[#FFF8F1] px-4 text-sm font-bold text-[#0B0B0F]">{copied ? "Link copied" : "Copy link"}</button><a className="inline-flex min-h-11 items-center rounded-xl border border-[#FFF3E0] bg-[#FFF8F1] px-4 text-sm font-bold text-[#0B0B0F]" href={`https://wa.me/?text=${encodeURIComponent(articleUrl)}`} target="_blank" rel="noopener noreferrer">WhatsApp</a><a className="inline-flex min-h-11 items-center rounded-xl border border-[#FFF3E0] bg-[#FFF8F1] px-4 text-sm font-bold text-[#0B0B0F]" href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(articleUrl)}`} target="_blank" rel="noopener noreferrer">LinkedIn</a><span className="sr-only" aria-live="polite">{copied ? "Link copied" : ""}</span></div> : null}
  </>;
}
