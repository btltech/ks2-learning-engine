import { describe, expect, it } from 'vitest';
import { firestoreFields, getCors, parseFirestoreFields } from './firebase-admin';

describe('shared Firebase REST helpers', () => {
  it('round-trips nested application data through Firestore values', () => {
    const original = {
      title: 'Fractions',
      count: 10,
      active: true,
      classes: ['one', 'two'],
      progress: { Maths: 84 },
    };
    expect(parseFirestoreFields(firestoreFields(original))).toEqual(original);
  });

  it('allows same-origin requests that omit Origin and blocks foreign origins', () => {
    const sameOrigin = getCors(new Request('https://demiwuraks2.co.uk/api/classes'), {});
    expect(sameOrigin.allowed).toBe(true);

    const foreign = getCors(new Request('https://demiwuraks2.co.uk/api/classes', {
      headers: { Origin: 'https://evil.example' },
    }), {});
    expect(foreign.allowed).toBe(false);
  });
});
