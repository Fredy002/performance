import { describe, expect, it } from 'vitest';
import { assertCatalogParity, translate } from './index';
import { localizeServiceMessage } from './messages/services';
import { getExerciseDisplay, pendingExercises } from '@/exercises/registry';

describe('internationalization catalogs', () => {
  it('keeps Spanish and English message keys in parity', () => {
    expect(assertCatalogParity()).toEqual({ missingInEs: [], missingInEn: [] });
  });

  it('resolves both locales and interpolates variables', () => {
    expect(translate('es', 'common.home')).toBe('Inicio');
    expect(translate('en', 'common.home')).toBe('Home');
    expect(translate('en', 'common.noResults', { query: 'fuel' })).toBe('No results for “fuel”');
  });

  it('fails explicitly when a translation key is missing', () => {
    expect(() => translate('en', 'not.a.real.key')).toThrow('Missing en translation for not.a.real.key');
  });

  it('localizes pending exercise details without changing written answers', () => {
    for (const exercise of pendingExercises()) {
      const writtenAnswers = exercise.expected.map((step) => step.written);
      const localized = getExerciseDisplay(exercise, 'en');
      expect(localized.statement).toHaveLength(exercise.statement.length);
      expect(localized.questions).toHaveLength(exercise.questions.length);
      expect(localized.assumptions).toHaveLength(exercise.assumptions.length);
      expect(localized.remarks).toHaveLength(exercise.remarks.length);
      expect(localized.expectedLabels).toHaveLength(exercise.expected.length);
      expect(localized.expectedLabels).not.toEqual(exercise.expected.map((step) => step.label));
      expect(exercise.expected.map((step) => step.written)).toEqual(writtenAnswers);
    }
  });

  it('localizes known OCR/backend errors without changing the Spanish default', () => {
    expect(localizeServiceMessage('es', 'Usa una imagen JPEG, PNG, GIF o WebP.')).toBe('Usa una imagen JPEG, PNG, GIF o WebP.');
    expect(localizeServiceMessage('en', 'Usa una imagen JPEG, PNG, GIF o WebP.')).toBe('Use a JPEG, PNG, GIF, or WebP image.');
    expect(localizeServiceMessage('en', 'Claude returned an invalid ICAO code.')).toBe('Claude returned an invalid ICAO code.');
  });
});
