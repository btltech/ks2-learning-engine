import { describe, expect, it } from 'vitest';
import { famousArtworks } from './artResources';

// Wikimedia production sizes, checked 5 November 2026:
// https://www.mediawiki.org/wiki/Common_thumbnail_sizes
const allowedWidths = new Set([20, 40, 60, 120, 250, 330, 500, 960, 1280, 1920, 3840]);

describe('configured artwork image URLs', () => {
  it.each(famousArtworks)('$title uses an allowed width for both cards and details', artwork => {
    for (const key of ['thumbnailUrl', 'imageUrl'] as const) {
      const url = new URL(artwork[key]);
      expect(url.protocol).toBe('https:');
      expect(url.hostname).toBe('upload.wikimedia.org');
      const path = url.pathname.match(/^\/wikipedia\/(commons|en)\/thumb\/[^/]+\/[^/]+\/([^/]+)\/(\d+)px-(.+)$/);
      expect(path, `${artwork.title} ${key} must request a sized Wikimedia image`).not.toBeNull();
      if (!path) throw new Error(`Missing thumbnail width: ${url}`);
      expect(allowedWidths.has(Number(path[3])), `${artwork.title} ${key}: ${path[3]}px is not a standard width`).toBe(true);
      expect(path[4]).toBe(path[2]);
    }
    // The card and detail views must still request the same underlying file.
    expect(artwork.thumbnailUrl.slice(0, artwork.thumbnailUrl.lastIndexOf('/')))
      .toBe(artwork.imageUrl.slice(0, artwork.imageUrl.lastIndexOf('/')));
  });
});
