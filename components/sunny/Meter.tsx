export interface MeterProps {
  label: string;
  value: number;
  max?: number;
  className?: string;
}

export function Meter({ label, value, max = 100, className = '' }: MeterProps) {
  const upper = Number.isFinite(max) && max > 0 ? max : 100;
  const current = Number.isFinite(value) ? Math.min(upper, Math.max(0, value)) : 0;
  const percent = current / upper * 100;
  return (
    <div className={`sunny-ui kid-meter ${className}`}>
      <div className="kid-meter-track" role="progressbar" aria-label={label} aria-valuemin={0} aria-valuemax={upper} aria-valuenow={current}>
        <span className="kid-meter-fill" style={{ width: `${percent}%` }} />
      </div>
      <span>{Math.round(percent)}% complete</span>
    </div>
  );
}
