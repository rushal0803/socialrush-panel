import Link from 'next/link';
import { batch4ServiceFaqs, batch4CatalogGuides } from '@/lib/seo/service-batch4-content';

export default function ServiceRequirementLinks({ serviceCode }: { serviceCode: string }) {
  if (!Object.hasOwn(batch4ServiceFaqs, serviceCode)) return null;
  const platform = serviceCode.startsWith('telegram-') ? 'telegram' : 'twitter-x';
  const links = batch4CatalogGuides[platform].links.filter(([href]) => href !== `/services/${serviceCode}`);
  return <nav data-service-requirement-links aria-label="Related service requirements" className="mt-8 flex flex-wrap gap-4 rounded-2xl border border-orange-400/20 bg-[#0d1118] p-6 text-sm">
    <Link href={`/services/${platform}`} className="font-bold text-orange-300 underline">Compare {platform === 'telegram' ? 'Telegram' : 'X'} actions</Link>
    {links.map(([href, label]) => <Link key={href} href={href} className="font-bold text-orange-300 underline">{label}</Link>)}
    <Link href="/refund-policy" className="font-bold text-orange-300 underline">Read refund conditions</Link>
  </nav>;
}
