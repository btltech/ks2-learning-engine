/** Static tone guidance, shared by pronunciation practice and the recording library. */
export function YorubaToneGuide({ compact = false }: { compact?: boolean }) {
  return (
    <div className="sunny-tone-guide" data-compact={compact || undefined}>
      {!compact && <p className="sunny-tone-title">🎵 Yoruba is a TONAL language!</p>}
      <div className="sunny-tone-chips">
        <div data-tone="high"><span lang="yo">á</span><strong>↑ HIGH</strong><span>Voice goes UP</span></div>
        <div data-tone="mid"><span lang="yo">a</span><strong>→ MID</strong><span>Normal voice</span></div>
        <div data-tone="low"><span lang="yo">à</span><strong>↓ LOW</strong><span>Voice goes DOWN</span></div>
      </div>
      {!compact && <p>💡 The same word with different tones can mean different things!</p>}
    </div>
  );
}
