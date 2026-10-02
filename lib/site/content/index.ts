import en from './en.json';
import es from './es.json';
import ca from './ca.json';
import type { Locale } from '../locales';

export type Content = typeof en;

// Spanish and Catalan are translations of the English file and must have exactly the same shape.
// content.test.ts checks that, and that no language has gone missing a key.
const CONTENT: Record<Locale, Content> = { en, es: es as unknown as Content, ca: ca as unknown as Content };

export function getContent(locale: Locale): Content {
  return CONTENT[locale];
}
