'use client';

export default function Hero() {
  const scrollToApply = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const element = document.querySelector('#apply');
    if (element) {
      const offsetTop = element.getBoundingClientRect().top + window.scrollY - 80;
      window.scrollTo({
        top: offsetTop,
        behavior: 'smooth'
      });
    }
  };

  return (
    <section
      id="hero"
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
    >
      {/* Video Background */}
      <div className="absolute inset-0 z-0">
        <video
          autoPlay
          muted
          loop
          playsInline
          poster="/videos/hero-poster.jpg"
          className="absolute inset-0 w-full h-full object-cover"
          preload="metadata"
        >
          <source src="/videos/hero-video.webm" type="video/webm" />
          <source src="/videos/hero-video.mp4" type="video/mp4" />
        </video>
        {/* Dark overlay to hide blur and make text pop */}
        <div className="absolute inset-0 bg-black/50"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-gray-900/30 via-transparent to-gray-900/40"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 text-center text-white px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
        <h1
          className="text-5xl md:text-7xl font-bold mb-6 opacity-0 animate-fade-in-up"
          style={{
            animationDelay: '0.2s',
            textShadow: '0 4px 20px rgba(0, 0, 0, 0.8), 0 2px 8px rgba(0, 0, 0, 0.6), 0 0 40px rgba(0, 0, 0, 0.4)'
          }}
        >
          Bizcelona
        </h1>
        <p
          className="text-xl md:text-2xl mb-4 opacity-0 animate-fade-in-up font-light"
          style={{
            animationDelay: '0.4s',
            textShadow: '0 2px 12px rgba(0, 0, 0, 0.9), 0 1px 6px rgba(0, 0, 0, 0.7)'
          }}
        >
          Barcelona's Elite Business Community for Entrepreneurs & Executives
        </p>
        <p
          className="text-lg md:text-xl mb-8 opacity-0 animate-fade-in-up font-light"
          style={{
            animationDelay: '0.5s',
            textShadow: '0 2px 12px rgba(0, 0, 0, 0.9), 0 1px 6px rgba(0, 0, 0, 0.7)'
          }}
        >
          Invite-only network for business owners, digital nomads, and senior professionals
        </p>
        <a
          href="#apply"
          onClick={scrollToApply}
          className="btn-primary inline-block bg-saffron text-navy px-12 py-5 rounded-xl font-bold text-xl hover:bg-orange-400 transition-all duration-300 transform hover:scale-110 hover:shadow-2xl opacity-0 animate-fade-in-up border-4 border-saffron hover:border-orange-400"
          style={{
            animationDelay: '0.6s',
            boxShadow: '0 15px 40px rgba(246, 173, 85, 0.6), 0 8px 20px rgba(246, 173, 85, 0.4), 0 4px 12px rgba(0, 0, 0, 0.3)',
            backdropFilter: 'blur(10px)'
          }}
        >
          Apply to Join
        </a>
      </div>

      {/* Scroll Indicator */}
      <div
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-white opacity-0 animate-fade-in-up"
        style={{ animationDelay: '1s' }}
      >
        <div className="animate-bounce">
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 14l-7 7m0 0l-7-7m7 7V3"
            ></path>
          </svg>
        </div>
      </div>
    </section>
  );
}
