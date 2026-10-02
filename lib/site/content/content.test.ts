import { describe, expect, it } from 'vitest';
import { getContent } from './index';
import { LOCALES, absoluteUrl, languageAlternates, localePath, pageOf } from '../locales';

const en = getContent('en');

// Every string in a content tree, with its path, so the checks below can name the offender.
function strings(node: unknown, path = ''): [string, string][] {
  if (typeof node === 'string') return [[path, node]];
  if (Array.isArray(node)) return node.flatMap((v, i) => strings(v, `${path}[${i}]`));
  if (node && typeof node === 'object') return Object.entries(node).flatMap(([k, v]) => strings(v, path ? `${path}.${k}` : k));
  return [];
}
function shape(node: unknown): unknown {
  if (Array.isArray(node)) return node.map(shape);
  if (node && typeof node === 'object') return Object.fromEntries(Object.keys(node).sort().map((k) => [k, shape((node as Record<string, unknown>)[k])]));
  return typeof node;
}

describe('public site copy', () => {
  it.each(LOCALES)('%s has exactly the same structure as English', (l) => {
    expect(shape(getContent(l))).toEqual(shape(en));
  });

  it.each(LOCALES)('%s has no em dashes, emojis or empty strings', (l) => {
    for (const [path, text] of strings(getContent(l))) {
      expect(text.trim(), `${l}:${path} is empty`).not.toBe('');
      expect(text, `${l}:${path} has an em dash`).not.toMatch(/—/);
      expect(text, `${l}:${path} has an emoji`).not.toMatch(/[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}]/u);
    }
  });

  it.each(LOCALES)('%s never mentions a council or committee', (l) => {
    const all = strings(getContent(l)).map(([, t]) => t).join(' ');
    expect(all).not.toMatch(/\b(council|committee|consejo|comit[eé]|consell)\b/i);
  });

  it('keeps Owen’s own words exactly in English', () => {
    expect(en.hero.h1).toBe('Building wealth through community.');
    expect(en.hero.lede).toBe('Where Barcelona’s founders and professionals collaborate, share insight, and scale together.');
    expect(en.band.quote).toBe('Like the guilds of old, we don’t just share a space; we actively champion each other’s success.');
    expect(en.band.cite).toBe('Owen Hughes, founder');
    expect(en.rules.items.map((r) => r.title)).toEqual([
      'Give Before You Take',
      'Active Participation',
      'Mutual Respect and Trust',
      'No Unsolicited Private Messages',
      'No Promotional Posts',
      'Privacy and Confidentiality',
      'Tiered Involvement',
    ]);
  });

  it('says the events are at least monthly, approval takes up to a week, and the community language is English', () => {
    const text = (k: string) => strings(en).filter(([p]) => p.startsWith(k)).map(([, t]) => t).join(' ');
    expect(text('rhythm.cards[1]')).toMatch(/at least/i);
    expect(text('faq.items')).toMatch(/(up to|as long as) (a week|seven days)/);
    expect(text('apply')).toMatch(/(up to|as long as) (a week|seven days)/);
    expect(text('forWhom')).toMatch(/English is the language of our community|community language is English/);
    expect(text('faq.items')).toMatch(/English is the language we use as a community|community language is English/);
    expect(text('meta')).toMatch(/at least one/);
    expect(text('events')).toMatch(/at least one/);
    expect(en.faq.items.map((f) => f.q)).toContain('What happens at a co-working day?');
    expect(en.rules.items[1].body).toMatch(/members’ achievements|members’ successes/);
  });

  it('keeps SEO text within sensible lengths in every language', () => {
    for (const l of LOCALES) {
      const c = getContent(l);
      expect(c.meta.title.length, `${l} title`).toBeLessThanOrEqual(70);
      expect(c.meta.description.length, `${l} description`).toBeLessThanOrEqual(165);
      expect(c.events.title.length, `${l} events title`).toBeLessThanOrEqual(70);
      expect(c.events.description.length, `${l} events description`).toBeLessThanOrEqual(165);
    }
  });
});

describe('language routing', () => {
  it('puts English at the root and the others under their own prefix', () => {
    expect(localePath('en', '/')).toBe('/');
    expect(localePath('es', '/')).toBe('/es');
    expect(localePath('ca', '/events/public')).toBe('/ca/events/public');
    expect(absoluteUrl('en', '/')).toBe('https://bizcelona.com');
    expect(absoluteUrl('es', '/events/public')).toBe('https://bizcelona.com/es/events/public');
  });

  it('finds the same page in another language', () => {
    expect(pageOf('/')).toEqual({ locale: 'en', page: '/' });
    expect(pageOf('/es')).toEqual({ locale: 'es', page: '/' });
    expect(pageOf('/ca/events/public')).toEqual({ locale: 'ca', page: '/events/public' });
    expect(pageOf('/events/public')).toEqual({ locale: 'en', page: '/events/public' });
  });

  it('lists every language and x-default for each page, with matching URLs', () => {
    const alt = languageAlternates('/');
    expect(Object.keys(alt).sort()).toEqual(['ca', 'en', 'es', 'x-default']);
    expect(alt['x-default']).toBe(alt.en);
    for (const url of Object.values(alt)) expect(url).toMatch(/^https:\/\/bizcelona\.com(\/(es|ca))?$/);
  });
});
