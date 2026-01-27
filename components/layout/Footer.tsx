import Image from 'next/image';

export default function Footer() {
  return (
    <footer className="bg-navy text-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* Logo & Description */}
          <div className="text-center md:text-left">
            <Image
              src="/images/bizcelona-logo.png"
              alt="Bizcelona"
              width={120}
              height={32}
              className="h-8 w-auto mx-auto md:mx-0 mb-4 filter invert"
            />
            <p className="text-gray-400 text-sm">
              Barcelona's trusted business community for entrepreneurs and professionals.
            </p>
          </div>

          {/* Quick Links */}
          <div className="text-center">
            <h3 className="text-white font-bold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li>
                <a href="#about" className="hover:text-saffron transition-colors">
                  About Us
                </a>
              </li>
              <li>
                <a href="#rules" className="hover:text-saffron transition-colors">
                  Guidelines
                </a>
              </li>
              <li>
                <a href="#apply" className="hover:text-saffron transition-colors">
                  Apply to Join
                </a>
              </li>
            </ul>
          </div>

          {/* Community Resources */}
          <div className="text-center md:text-right">
            <h3 className="text-white font-bold mb-4">Community Resources</h3>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li>
                <a
                  href="https://www.linkedin.com/company/110331955"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-saffron transition-colors inline-flex items-center justify-center md:justify-end gap-2"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                  </svg>
                  LinkedIn
                </a>
              </li>
              <li>
                <a
                  href="https://barna.news"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-saffron transition-colors inline-flex items-center justify-center md:justify-end gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                  </svg>
                  Barna.News - Barcelona News
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-700 pt-8 text-center">
          <p className="text-gray-300 text-sm mb-2">&copy; 2025 Bizcelona. All rights reserved.</p>
          <p className="text-gray-400 text-sm">Built with love in Barcelona.</p>
        </div>
      </div>
    </footer>
  );
}
