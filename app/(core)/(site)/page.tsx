import HomePage from '@/components/site/HomePage';
import { homeMetadata } from '@/lib/site/seo';

export const metadata = homeMetadata('en');

export default function Home() {
  return <HomePage locale="en" />;
}
