'use client';

import { useEffect } from 'react';

const coreValues = [
  {
    number: 1,
    title: 'Give Before You Take',
    description: 'We foster a culture where members contribute their knowledge and support before seeking help themselves. Whether it\'s sharing advice, making introductions, or offering a helping hand, generosity strengthens our network and ensures it thrives for all. Members who consistently give are the ones who gain the most in return.'
  },
  {
    number: 2,
    title: 'Active Participation',
    description: 'We ask members to stay engaged. This means reading group messages regularly, contributing thoughtfully to discussions, and being present in the community. Passive membership dilutes the value we\'re building together. If you notice a fellow member needs help within your expertise, reach out. Active members drive the culture we all benefit from.'
  },
  {
    number: 3,
    title: 'Mutual Respect and Trust',
    description: 'Our community is built on professionalism, courtesy, and integrity. Treat every member with respect, honor your commitments, and assume positive intent in all interactions. We\'re building long-term relationships here, not transactional encounters.'
  },
  {
    number: 4,
    title: 'No Unsolicited Private Messages',
    description: 'Before sending a private message to a member, always ask permission in the group or ensure there\'s an existing relationship. Cold outreach, sales pitches, or unsolicited networking requests undermine trust. If you want to connect privately, introduce yourself in the group first and let relationships develop naturally.'
  },
  {
    number: 5,
    title: 'No Promotional Posts',
    description: 'This is not a marketing channel. Promotional content, hard sells, or thinly-veiled advertisements are not allowed. If your business, product, or service becomes relevant in a conversation, share it naturally and authentically. If you\'re unsure whether something is promotional, ask an admin first. Repeat offenders will be removed.'
  },
  {
    number: 6,
    title: 'Privacy and Confidentiality',
    description: 'What\'s shared in Bizcelona stays in Bizcelona. Do not screenshot, share, or republish group content without explicit permission. Respect the privacy of members and treat all discussions as confidential. Trust is the foundation of this community, and breaches of confidentiality are taken seriously.'
  },
  {
    number: 7,
    title: 'Tiered Involvement',
    description: 'Not everyone will engage at the same level, and that\'s okay. Some members will be highly active, while others will observe and contribute when relevant. We respect different levels of involvement, but we do expect everyone to respect the guidelines and add value when they do participate. If you\'re rarely active, consider whether this community is the right fit for you—our goal is mutual growth, not passive consumption.'
  }
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
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16 fade-in-on-scroll">
          <h2 className="text-4xl md:text-5xl font-bold text-navy mb-6">
            Core Values and Participation Guidelines
          </h2>
          <p className="text-lg text-gray-700 max-w-3xl mx-auto">
            At Bizcelona, we believe that the strength of our community lies in active participation, mutual generosity, and a shared sense of trust. Here are the core values and expectations we encourage every member to uphold:
          </p>
        </div>

        <div className="space-y-6">
          {coreValues.map((value, index) => (
            <div
              key={index}
              className="rule-card bg-white p-8 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 fade-in-on-scroll"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-saffron rounded-full flex items-center justify-center font-bold text-navy">
                    {value.number}
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-navy mb-2">
                    {value.title}
                  </h3>
                  <p className="text-gray-700 leading-relaxed">
                    {value.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
