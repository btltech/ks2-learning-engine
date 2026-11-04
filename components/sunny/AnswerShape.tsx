/** Shapes supplement answer labels, so no answer relies on colour alone. */
export function AnswerShape({ index }: { index: number }) {
  return <svg className="sunny-answer-shape" width="48" height="48" viewBox="0 0 48 48" aria-hidden="true" stroke="#172033" strokeWidth="3" strokeLinejoin="round">
    {index % 4 === 0 && <path d="M24 6 44 40H4Z" fill="#3D8BFF" />}
    {index % 4 === 1 && <circle cx="24" cy="24" r="18" fill="#FF6FB5" />}
    {index % 4 === 2 && <rect x="7" y="7" width="34" height="34" rx="6" fill="#2FC27A" />}
    {index % 4 === 3 && <path d="m24 4 6 12.5 13.5 2-9.8 9.5 2.3 13.5L24 35l-12 6.5L14.3 28l-9.8-9.5 13.5-2Z" fill="#FFC93C" />}
  </svg>;
}
