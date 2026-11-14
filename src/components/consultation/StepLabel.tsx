export function StepLabel({ number, label }: { number: number; label: string }) {
  return (
    <div className="mb-4 flex items-center gap-3">
      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-teal">
        <span className="text-[13px] font-bold text-white">{number}</span>
      </div>
      <span className="font-display text-base font-bold text-ink">{label}</span>
    </div>
  );
}
