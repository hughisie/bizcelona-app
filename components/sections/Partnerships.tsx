'use client';

import { useEffect } from 'react';

export default function Partnerships() {
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
    <section id="partnerships" className="py-20 bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 fade-in-on-scroll">
          <h2 className="text-4xl md:text-5xl font-bold text-navy mb-6">
            Partnerships
          </h2>
          <p className="text-lg text-gray-700 leading-relaxed max-w-3xl mx-auto">
            At Bizcelona, we believe in building meaningful, trust-based partnerships that align with our community's values and mission.
          </p>
        </div>

        <div className="fade-in-on-scroll bg-beige rounded-lg p-8 mb-8">
          <h3 className="text-2xl font-bold text-navy mb-4">Our Partnership Ethos</h3>
          <p className="text-lg text-gray-700 mb-4 leading-relaxed">
            We're not interested in transactional sponsorships or superficial brand deals. Instead, we seek partnerships with organizations, businesses, and individuals who share our commitment to mutual support, genuine collaboration, and long-term community growth.
          </p>
          <p className="text-lg text-gray-700 mb-4 leading-relaxed">
            The right partnerships should enhance the member experience, provide real value to our community, and align with our core principle: <strong>give before you take</strong>. Whether it's exclusive member benefits, educational opportunities, or resource sharing, we prioritize quality and relevance over everything else.
          </p>
          <p className="text-lg text-gray-700 leading-relaxed">
            If you represent an organization that resonates with our values and want to explore how we might work together, we'd love to hear from you. But know that we protect this community fiercely and will only pursue partnerships that genuinely serve our members' interests.
          </p>
        </div>

        <div className="text-center fade-in-on-scroll">
          <p className="text-gray-600 mb-6">Interested in partnering with Bizcelona?</p>
          <a
            href="#contact"
            className="inline-block bg-saffron text-navy px-8 py-4 rounded-lg font-semibold text-lg hover:bg-orange-400 transition-all duration-300 transform hover:scale-105 shadow-lg"
          >
            Get in Touch
          </a>
        </div>
      </div>
    </section>
  );
}
