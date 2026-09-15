export function StatusPill({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <span className="inline-flex rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-800">
      {children}
    </span>
  );
}
