import type { HTMLAttributes } from "react";

import { cn } from "@/lib/cn";

type HeadingProps = HTMLAttributes<HTMLHeadingElement> & {
  level?: 1 | 2 | 3;
};

export function Heading({ level = 2, className, ...props }: HeadingProps) {
  const Tag = `h${level}` as const;
  const sizes = { 1: "text-3xl", 2: "text-2xl", 3: "text-lg" };
  return (
    <Tag
      className={cn("font-bold tracking-tight", sizes[level], className)}
      {...props}
    />
  );
}
