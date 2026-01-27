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
              About Bizcelona
            </h2>
            <p className="text-lg text-gray-700 mb-6 leading-relaxed">
              At Bizcelona, we are creating a <strong className="text-navy">trusted network of English-speaking entrepreneurs in Barcelona</strong>. Our mission is to cultivate a community where members build lasting, trust-based relationships, inspired by old-world guilds.
            </p>
            <p className="text-lg text-gray-700 mb-6 leading-relaxed">
              In Bizcelona, every member is both a resource and a friend, committing to help each other on a no-charge basis, so that support and advice flow freely both ways. By sharing our expertise generously, we all move closer to financial freedom and professional success.
            </p>
            <p className="text-lg text-gray-700 leading-relaxed">
              Bizcelona is <strong>more than a networking group</strong>; it is a close-knit community where each member is valued for their camaraderie and collective growth.
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
