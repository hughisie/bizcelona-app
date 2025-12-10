import Image from 'next/image';

export default function Footer() {
  return (
    <footer className="bg-navy text-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <Image
            src="/images/bizcelona-logo.png"
            alt="Bizcelona"
            width={120}
            height={32}
            className="h-8 w-auto mx-auto mb-4 filter invert"
          />
          <p className="text-gray-300 mb-2">&copy; 2025 Bizcelona. All rights reserved.</p>
          <p className="text-gray-400">Built with love in Barcelona.</p>
        </div>
      </div>
    </footer>
  );
}
