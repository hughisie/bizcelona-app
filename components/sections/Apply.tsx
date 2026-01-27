'use client';

import { useEffect } from 'react';
import Link from 'next/link';

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

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="text-center mb-12 fade-in-on-scroll">
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
          <p className="text-lg text-gray-200 mb-6 leading-relaxed max-w-3xl mx-auto">
            Our community is <span className="font-semibold text-saffron">invite-only</span> to ensure it remains high quality and
            relevant. If you're a <span className="font-semibold text-saffron">business owner</span>, <span className="font-semibold text-saffron">entrepreneur</span>, <span className="font-semibold text-saffron">freelancer</span>, or <span className="font-semibold text-saffron">professional</span> in
            Barcelona, we'd love to hear from you.
          </p>

          <p className="text-lg text-gray-300 leading-relaxed max-w-3xl mx-auto">
            <strong>We review all applications individually, but aim to get back to all applicants as soon as possible.</strong> If approved, we'll reach out via WhatsApp to welcome you to the community.
          </p>
        </div>

        {/* Two Column Layout */}
        <div className="grid md:grid-cols-2 gap-8 items-center">
          {/* Left side - Benefits */}
          <div className="fade-in-on-scroll space-y-4">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-saffron to-orange-400 rounded-full flex items-center justify-center mt-1">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h3 className="font-bold text-white text-lg">Curated Community</h3>
                <p className="text-gray-300">Join Barcelona's trusted business network</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-saffron to-orange-400 rounded-full flex items-center justify-center mt-1">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h3 className="font-bold text-white text-lg">Meaningful Connections</h3>
                <p className="text-gray-300">Network with entrepreneurs and executives</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-saffron to-orange-400 rounded-full flex items-center justify-center mt-1">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h3 className="font-bold text-white text-lg">Personal Review</h3>
                <p className="text-gray-300">Individual attention to each application</p>
              </div>
            </div>
          </div>

          {/* Right side - CTA Card */}
          <div className="bg-white p-8 rounded-2xl shadow-2xl fade-in-on-scroll border-t-4 border-saffron">
            <div className="space-y-6">
              <Link
                href="/signup"
                className="btn-primary block bg-gradient-to-r from-saffron to-orange-400 text-navy px-8 py-4 rounded-xl font-bold text-lg hover:from-orange-400 hover:to-saffron transition-all duration-300 transform hover:scale-105 shadow-lg text-center"
              >
                Create Account & Apply
              </Link>

              <p className="text-sm text-gray-600 text-center">
                Already have an account?{' '}
                <Link
                  href="/login"
                  className="font-bold text-saffron hover:text-orange-400"
                >
                  Sign in
                </Link>
              </p>
            </div>

            <div className="mt-8 pt-8 border-t border-gray-200">
              <p className="text-gray-600 mb-4 text-sm text-center font-medium">Questions about Bizcelona?</p>
              <a
                href="https://www.linkedin.com/company/110331955"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center text-saffron hover:text-orange-400 font-bold text-sm bg-saffron/10 px-6 py-3 rounded-lg hover:bg-saffron/20 transition-all"
              >
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                </svg>
                Connect on LinkedIn
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
