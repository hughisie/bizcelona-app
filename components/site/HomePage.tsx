import Hero from '@/components/sections/Hero';
import About from '@/components/sections/About';
import Outcomes from '@/components/sections/Outcomes';
import Band from '@/components/sections/Band';
import Wins from '@/components/sections/Wins';
import TimeBank from '@/components/sections/TimeBank';
import Rhythm from '@/components/sections/Rhythm';
import ForWhom from '@/components/sections/ForWhom';
import Rules from '@/components/sections/Rules';
import Partnerships from '@/components/sections/Partnerships';
import Faq from '@/components/sections/Faq';
import Apply from '@/components/sections/Apply';
import { getContent } from '@/lib/site/content';
import { homeStructuredData } from '@/lib/site/seo';
import type { Locale } from '@/lib/site/locales';

export default function HomePage({ locale }: { locale: Locale }) {
  const c = getContent(locale);
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(homeStructuredData(locale, c)) }} />
      <Hero c={c} />
      <About c={c} />
      <Outcomes c={c} />
      <Band c={c} />
      <Wins c={c} />
      <TimeBank c={c} />
      <Rhythm c={c} locale={locale} />
      <ForWhom c={c} />
      <Rules c={c} />
      <Partnerships c={c} />
      <Faq c={c} />
      <Apply c={c} />
    </>
  );
}
