type ProgressBarProps = {
  label: string;
  completed: number;
  total: number;
  percentage: number;
};

export function ProgressBar({
  label,
  completed,
  total,
  percentage,
}: ProgressBarProps) {
  const clamped = Math.max(0, Math.min(100, Math.round(percentage)));

  return (
    <div className="w-full">
      <div className="mb-1 flex items-center justify-between gap-2 text-xs text-[#64748B]">
        <span>{label}</span>
        <span className="font-medium text-[#263746]">
          {completed} of {total} ({clamped}%)
        </span>
      </div>
      <div
        role="progressbar"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={clamped}
        className="h-2 w-full overflow-hidden rounded-full bg-[#EEF3F6] border border-[#D8E1E8]"
      >
        <div
          className="h-full bg-[#245B78] transition-all duration-200"
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  );
}

