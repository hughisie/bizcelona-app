'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function Contact() {
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
    <section id="contact" className="py-20 bg-gradient-to-b from-beige to-white relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-saffron/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-navy/5 rounded-full blur-3xl"></div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="fade-in-on-scroll mb-12 text-center">
          {/* Icon Badge */}
          <div className="flex justify-center mb-6">
            <div className="bg-gradient-to-br from-saffron to-orange-400 rounded-full p-4 inline-block shadow-lg">
              <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
          </div>

          <h2 className="text-4xl md:text-5xl font-bold text-navy mb-6">
            Ready to Join Bizcelona?
          </h2>
          <p className="text-lg text-gray-700 mb-4 max-w-2xl mx-auto">
            Create your account to start your membership application
          </p>
        </div>

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
                <h3 className="font-bold text-navy text-lg">Curated Community</h3>
                <p className="text-gray-600">Join Barcelona's most exclusive business network</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-saffron to-orange-400 rounded-full flex items-center justify-center mt-1">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h3 className="font-bold text-navy text-lg">Meaningful Connections</h3>
                <p className="text-gray-600">Network with entrepreneurs and executives</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-saffron to-orange-400 rounded-full flex items-center justify-center mt-1">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h3 className="font-bold text-navy text-lg">Fast Approval</h3>
                <p className="text-gray-600">Personal review within 48 hours</p>
              </div>
            </div>
          </div>

          {/* Right side - CTA Card */}
          <div className="bg-white p-8 rounded-2xl shadow-2xl fade-in-on-scroll border-t-4 border-saffron">
            <div className="space-y-6">
              <Link
                href="/signup"
                className="btn-primary block bg-gradient-to-r from-saffron to-orange-400 text-white px-8 py-4 rounded-xl font-bold text-lg hover:from-orange-400 hover:to-saffron transition-all duration-300 transform hover:scale-105 shadow-lg text-center"
              >
                Create Account
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
