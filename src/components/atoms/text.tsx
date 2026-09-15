import type { HTMLAttributes } from "react";

import { cn } from "@/lib/cn";

export function Text({
  className,
  ...props
}: HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      className={cn("text-sm leading-6 text-slate-600", className)}
      {...props}
    />
  );
}
