import Link from 'next/link';

export default async function ConnectionConfirmedPage({
  searchParams,
}: {
  searchParams: Promise<{ reply?: string }>;
}) {
  const { reply } = await searchParams;
  const replied = reply === 'true';

  return (
    <div className="min-h-screen bg-beige flex items-center justify-center px-4">
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm max-w-md w-full overflow-hidden">
        <div className="h-2 bg-[#1a202c]" />
        <div className="p-8 text-center">
          <div className="w-14 h-14 rounded-full bg-saffron/20 flex items-center justify-center mx-auto mb-5">
            <span className="text-2xl">{replied ? '✓' : '—'}</span>
          </div>
          <h1 className="text-xl font-bold text-navy mb-3">
            {replied ? 'Great to hear it!' : 'Thanks for letting us know.'}
          </h1>
          <p className="text-sm text-gray-600">
            {replied
              ? "We've noted that they replied. Connections are what Bizcelona is all about."
              : "We hope they get back to you soon. Good connections take time."}
          </p>
          <Link
            href="/members"
            className="mt-6 inline-block px-5 py-2.5 bg-[#1a202c] text-white text-sm font-medium rounded-md hover:bg-navy/90"
          >
            Back to members
          </Link>
        </div>
      </div>
    </div>
  );
}
