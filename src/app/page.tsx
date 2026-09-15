import { ApplicationShell } from "@/components/templates";
import { AccountsOverview } from "@/features/accounts";

export default function HomePage() {
  return (
    <ApplicationShell>
      <AccountsOverview />
    </ApplicationShell>
  );
}
