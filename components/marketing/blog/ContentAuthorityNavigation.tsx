import Link from "next/link";

const paths=[
 {href:"/services",title:"Services",text:"Compare the live catalog and current order options."},
 {href:"/blog",title:"Growth Library",text:"Continue researching practical platform strategies."},
 {href:"/help-center",title:"Help Center",text:"Understand links, checkout, delivery and refill guidance."},
 {href:"/trust",title:"Trust Center",text:"Review safety guidance before making a purchase decision."},
];
export default function ContentAuthorityNavigation(){return <nav aria-label="SocialRUSH authority paths" className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{paths.map(item=><Link key={item.href} href={item.href} className="rounded-2xl border border-white/10 bg-white/[.03] p-4 transition hover:-translate-y-0.5 hover:border-orange-400/50"><span className="font-extrabold text-white">{item.title}</span><span className="mt-1 block text-xs leading-5 text-slate-400">{item.text}</span></Link>)}</nav>}
