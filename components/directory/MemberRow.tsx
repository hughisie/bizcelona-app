import Link from 'next/link';
import { WhatsAppButton } from '@/components/profile/WhatsAppButton';

export type DirectoryMember = {
  id: string;
  slug: string;
  full_name: string;
  business_role: string | null;
  company: string | null;
  industry: string | null;
  headline: string | null;
  profile_picture_url: string | null;
  whatsapp_number: string | null;
  show_whatsapp: boolean;
  help_offered: string[];
  help_needed: string[];
};

export function MemberRow({ m }: { m: DirectoryMember }) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 flex gap-4 items-start hover:border-saffron transition">
      <Link href={`/members/${m.slug}`} className="w-12 h-12 rounded-full bg-gray-200 overflow-hidden flex-shrink-0">
        {m.profile_picture_url
          ? <img src={m.profile_picture_url} alt="" className="w-full h-full object-cover"/>
          : <div className="w-full h-full bg-gradient-to-br from-saffron to-navy"/>}
      </Link>
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-baseline gap-3">
          <Link href={`/members/${m.slug}`} className="font-semibold text-navy hover:underline truncate">{m.full_name}</Link>
          {m.industry && <span className="text-xs text-gray-500 flex-shrink-0">{m.industry}</span>}
        </div>
        <div className="text-xs text-gray-600">{[m.business_role, m.company].filter(Boolean).join(' at ')}</div>
        {m.headline && <div className="text-xs text-navy mt-1 line-clamp-2">{m.headline}</div>}
        <div className="mt-2 flex flex-wrap gap-1">
          {m.help_offered.slice(0, 3).map((t) => (
            <span key={`o-${t}`} className="px-2 py-0.5 bg-green-50 border border-green-200 rounded-full text-[10px] text-green-700">Helps: {t}</span>
          ))}
          {m.help_needed.slice(0, 2).map((t) => (
            <span key={`n-${t}`} className="px-2 py-0.5 bg-amber-50 border border-amber-200 rounded-full text-[10px] text-amber-700">Needs: {t}</span>
          ))}
        </div>
      </div>
      {m.show_whatsapp && m.whatsapp_number && (
        <div className="flex-shrink-0">
          <WhatsAppButton number={m.whatsapp_number} name={m.full_name} />
        </div>
      )}
    </div>
  );
}
