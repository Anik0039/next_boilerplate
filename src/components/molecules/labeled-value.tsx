import { Text } from "@/components/atoms";

export function LabeledValue({
  label,
  value,
}: Readonly<{ label: string; value: React.ReactNode }>) {
  return (
    <div className="space-y-1">
      <Text>{label}</Text>
      <div className="font-semibold text-slate-950">{value}</div>
    </div>
  );
}
