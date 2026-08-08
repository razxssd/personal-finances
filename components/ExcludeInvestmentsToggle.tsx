"use client";

export function ExcludeInvestmentsToggle({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="flex items-center gap-2 text-xs text-muted-foreground cursor-pointer select-none">
      <input
        type="checkbox"
        className="size-3.5 accent-foreground"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
      Exclude “Investments”
    </label>
  );
}
