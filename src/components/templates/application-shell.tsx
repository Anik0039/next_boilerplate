import { SiteHeader } from "@/components/organisms";

export function ApplicationShell({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-6 py-10">{children}</main>
    </div>
  );
}
