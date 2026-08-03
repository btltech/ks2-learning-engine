import { describe, expect, it } from 'vitest';
import { buildProviderPayload } from './gemini';

describe('Gemini proxy provider payload', () => {
  it('keeps output limits and safety policy under server control', () => {
    const payload = buildProviderPayload('Teach fractions.', {
      temperature: 2,
      maxOutputTokens: 999999,
      responseMimeType: 'application/json',
      responseSchema: { type: 'OBJECT' },
      safetySettings: [],
    });

    expect(payload.generationConfig.temperature).toBe(0.5);
    expect(payload.generationConfig.maxOutputTokens).toBe(8192);
    expect(payload.generationConfig.responseMimeType).toBe('application/json');
    expect(payload.safetySettings).toHaveLength(4);
    expect(payload.safetySettings.find((setting) => setting.category === 'HARM_CATEGORY_SEXUALLY_EXPLICIT')?.threshold).toBe('BLOCK_LOW_AND_ABOVE');
  });

  it('does not forward a schema without the approved JSON MIME type', () => {
    const payload = buildProviderPayload('Explain rocks.', {
      responseMimeType: 'text/html',
      responseSchema: { type: 'OBJECT' },
    });
    expect(payload.generationConfig).not.toHaveProperty('responseMimeType');
    expect(payload.generationConfig).not.toHaveProperty('responseSchema');
  });
});
