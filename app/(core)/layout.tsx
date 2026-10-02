import RootDocument from '@/components/site/RootDocument';
import { rootMetadata, rootViewport } from '@/lib/site/root-metadata';

export const metadata = rootMetadata;
export const viewport = rootViewport;

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <RootDocument lang="en-GB">{children}</RootDocument>;
}
