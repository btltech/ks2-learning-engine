import { beforeEach, describe, expect, it } from 'vitest';
import { contentQualityService } from './contentQualityService';

describe('contentQualityService', () => {
  beforeEach(() => {
    localStorage.clear();
    contentQualityService.getPendingFeedback().forEach((feedback) => {
      contentQualityService.resolveFeedback(feedback.id);
    });
  });

  it('keeps flagged content pending until it is resolved', () => {
    const id = contentQualityService.flagContent('question-1', 'student-1', 'confusing', 'The wording is unclear');

    const pending = contentQualityService.getPendingFeedback();
    expect(pending).toHaveLength(1);
    expect(pending[0]).toMatchObject({
      id,
      contentId: 'question-1',
      reason: 'confusing',
      message: 'The wording is unclear',
      resolved: false,
    });

    contentQualityService.resolveFeedback(id);
    expect(contentQualityService.getPendingFeedback()).toEqual([]);
  });
});
