'use client';

import { useEffect } from 'react';

export default function Apply() {
  useEffect(() => {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px',
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    }, observerOptions);

    const fadeElements = document.querySelectorAll('.fade-in-on-scroll');
    fadeElements.forEach((element) => {
      observer.observe(element);
    });

    return () => {
      fadeElements.forEach((element) => {
        observer.unobserve(element);
      });
    };
  }, []);

  const scrollToContact = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const element = document.querySelector('#contact');
    if (element) {
      const offsetTop = element.getBoundingClientRect().top + window.scrollY - 80;
      window.scrollTo({
        top: offsetTop,
        behavior: 'smooth'
      });
    }
  };

  return (
    <section id="apply" className="py-20 bg-gradient-to-br from-navy via-blue-900 to-navy relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-saffron/20 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-orange-400/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full h-full">
        <div className="absolute top-10 right-10 w-32 h-32 border-4 border-saffron/30 rounded-full"></div>
        <div className="absolute bottom-20 left-20 w-24 h-24 border-4 border-orange-400/30 rounded-full"></div>
        <div className="absolute top-1/3 left-10 w-16 h-16 bg-saffron/20 rounded-lg rotate-45"></div>
        <div className="absolute bottom-1/3 right-10 w-20 h-20 bg-orange-400/20 rounded-lg rotate-12"></div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
        <div className="fade-in-on-scroll">
          {/* Icon Badge */}
          <div className="flex justify-center mb-6">
            <div className="bg-saffron/20 backdrop-blur-sm border-2 border-saffron/40 rounded-full p-4 inline-block">
              <svg className="w-12 h-12 text-saffron" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>

          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Apply to Join Bizcelona
          </h2>
          <p className="text-lg text-gray-200 mb-8 leading-relaxed max-w-3xl mx-auto">
            Our community is <span className="font-semibold text-saffron">invite-only</span> to ensure it remains high quality and
            relevant. If you're a <span className="font-semibold text-saffron">business owner</span>, <span className="font-semibold text-saffron">entrepreneur</span>, <span className="font-semibold text-saffron">freelancer</span>, or <span className="font-semibold text-saffron">professional</span> in
            Barcelona, we'd love to hear from you.
          </p>

          {/* Feature Pills */}
          <div className="flex flex-wrap justify-center gap-3 mb-12">
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 px-4 py-2 rounded-full text-white text-sm font-medium">
              ✓ Curated Network
            </div>
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 px-4 py-2 rounded-full text-white text-sm font-medium">
              ✓ Business Focused
            </div>
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 px-4 py-2 rounded-full text-white text-sm font-medium">
              ✓ Quality Members
            </div>
          </div>

          <p className="text-lg text-gray-300 mb-12 leading-relaxed max-w-3xl mx-auto">
            Click the button below to submit your application. We review each one
            personally and will reach out via WhatsApp if approved.
          </p>
          <a
            href="#contact"
            onClick={scrollToContact}
            className="btn-primary inline-block bg-gradient-to-r from-saffron to-orange-400 text-navy px-12 py-6 rounded-xl font-bold text-xl hover:from-orange-400 hover:to-saffron transition-all duration-300 transform hover:scale-105 shadow-2xl hover:shadow-saffron/50"
          >
            Start Application →
          </a>
        </div>
      </div>
    </section>
  );
}
