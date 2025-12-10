'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';

export default function About() {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

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
      window.removeEventListener('scroll', handleScroll);
      fadeElements.forEach((element) => {
        observer.unobserve(element);
      });
    };
  }, []);

  return (
    <section id="about" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="fade-in-on-scroll">
            <h2 className="text-4xl md:text-5xl font-bold text-navy mb-6">
              Barcelona's Premier Business Network
            </h2>
            <p className="text-lg text-gray-700 mb-6 leading-relaxed">
              <strong>Bizcelona</strong> is Barcelona's exclusive, invite-only business community designed specifically for
              <strong className="text-navy"> entrepreneurs</strong>, <strong className="text-navy">senior executives</strong>,{' '}
              <strong className="text-navy">business owners</strong>, and <strong className="text-navy">digital nomads</strong>{' '}
              who are serious about collaboration and growth.
            </p>
            <p className="text-lg text-gray-700 mb-6 leading-relaxed">
              Whether you're a C-level executive, startup founder, digital nomad on Spain's digital nomad visa,
              or established business owner in Barcelona, our curated community connects you with
              like-minded professionals who value meaningful partnerships over superficial networking.
            </p>
            <p className="text-lg text-gray-700 mb-6 leading-relaxed">
              We bring together Barcelona's most talented entrepreneurs and business leaders who want to collaborate,
              share ideas, invest together, and grow their ventures. From venture capital connections to
              strategic partnerships, this space was made for serious professionals.
            </p>
            <p className="text-lg text-gray-700 leading-relaxed">
              Our community is <strong>closed, carefully vetted, and focused on quality over
              quantity</strong>. Join Barcelona's elite network of business professionals and surround yourself
              with the energy, ideas, and trusted relationships that drive real business growth.
            </p>
          </div>
          <div
            className="fade-in-on-scroll"
            style={{
              transform: `translateY(${scrollY * 0.1}px)`,
              transition: 'transform 0.1s ease-out'
            }}
          >
            <div className="relative overflow-hidden rounded-lg shadow-2xl">
              <Image
                src="/images/BarcelonaSunset-optimized.jpg"
                alt="Barcelona Architecture"
                width={800}
                height={600}
                className="rounded-lg w-full transform hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-navy/30 to-transparent rounded-lg"></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
