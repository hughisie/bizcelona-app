import Link from 'next/link';
import { WhatsAppButton } from './WhatsAppButton';

export function ProfileHero({
  fullName, role, company, industry, headline, pictureUrl,
  linkedinUrl, whatsappNumber, showWhatsapp, isOwnProfile, signedIn, profileId,
}: {
  fullName: string; role: string | null; company: string | null; industry: string | null;
  headline: string | null; pictureUrl: string | null;
  linkedinUrl: string | null; whatsappNumber: string | null;
  showWhatsapp: boolean; isOwnProfile: boolean; signedIn: boolean; profileId: string;
}) {
  return (
    <div>
      <div className="h-28 bg-gradient-to-r from-navy to-navy/80"></div>
      <div className="px-6 pb-6 relative">
        <div className="absolute -top-10 left-6 w-20 h-20 rounded-full border-4 border-off-white overflow-hidden bg-gray-200">
          {pictureUrl ? <img src={pictureUrl} alt="" className="w-full h-full object-cover"/> : <div className="w-full h-full bg-gradient-to-br from-saffron to-navy"/>}
        </div>
        <div className="pt-12 flex flex-wrap justify-between items-start gap-3">
          <div>
            <h1 className="text-xl font-bold text-navy">{fullName}</h1>
            <div className="text-sm text-gray-600">
              {[role, company].filter(Boolean).join(' · ')}
              {industry && <span className="text-gray-400"> · {industry}</span>}
            </div>
          </div>
          <div className="flex gap-2">
            {isOwnProfile && (
              <Link href="/profile" className="px-3 py-2 text-sm border border-gray-300 rounded-md text-navy">Edit</Link>
            )}
            {signedIn && showWhatsapp && whatsappNumber && (
              <WhatsAppButton number={whatsappNumber} name={fullName} recipientId={profileId} />
            )}
            {signedIn && linkedinUrl && (
              <a href={linkedinUrl} target="_blank" rel="noopener noreferrer"
                 className="px-3 py-2 bg-navy text-white text-sm rounded-md">LinkedIn</a>
            )}
          </div>
        </div>
        {headline && <p className="mt-3 text-sm text-navy">{headline}</p>}
      </div>
    </div>
  );
}
