'use client';

import { useEffect } from 'react';

const rules = [
  'Be respectful and professional',
  'Keep conversations focused on business and collaboration',
  'No spam, unsolicited DMs, or group links',
  'Give more than you take',
  'Treat all conversations as private and confidential',
  "Ask an admin if you're ever unsure about posting",
];

export default function Rules() {
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
    <section id="rules" className="py-20 bg-beige relative">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16 fade-in-on-scroll">
          <h2 className="text-4xl md:text-5xl font-bold text-navy mb-6">
            Community Guidelines
          </h2>
          <p className="text-lg text-gray-700">
            Simple rules that keep our community thriving
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {rules.map((rule, index) => (
            <div
              key={index}
              className="rule-card bg-white p-6 rounded-xl shadow-lg hover:shadow-2xl hover:scale-105 transition-all duration-300 fade-in-on-scroll border-l-4 border-saffron"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-gradient-to-br from-saffron to-orange-400 rounded-full flex items-center justify-center shadow-md">
                    <svg
                      className="w-5 h-5 text-white"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      ></path>
                    </svg>
                  </div>
                </div>
                <p className="text-gray-800 font-medium">{rule}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
