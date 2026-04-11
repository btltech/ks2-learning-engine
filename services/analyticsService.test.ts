import { describe, it, expect, beforeEach, vi } from 'vitest';
import { analyticsService } from './analyticsService';

describe('AnalyticsService', () => {
  beforeEach(() => {
    localStorage.clear();
    analyticsService.clearData();
    vi.clearAllMocks();
  });

  it('tracks feature usage', () => {
    analyticsService.trackFeatureUsage('test_feature', { foo: 'bar' });
    
    const stored = JSON.parse(localStorage.getItem('ks2_feature_usage') || '[]');
    expect(stored).toHaveLength(1);
    expect(stored[0]).toMatchObject({
      feature: 'test_feature',
      details: { foo: 'bar' }
    });
    expect(stored[0].timestamp).toBeDefined();
  });

  it('tracks quiz abandonment', () => {
    analyticsService.trackQuizAbandonment('Maths', 'Algebra', 5, 10);
    
    const stored = JSON.parse(localStorage.getItem('ks2_feature_usage') || '[]');
    expect(stored).toHaveLength(1);
    expect(stored[0]).toMatchObject({
      feature: 'quiz_abandoned',
      details: {
        subject: 'Maths',
        topic: 'Algebra',
        questionsAnswered: 5,
        progress: 0.5
      }
    });
  });
});
