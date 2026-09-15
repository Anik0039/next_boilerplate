"use client";

import { FeatureFlagsProvider } from "./feature-flags-provider";
import { StoreProvider } from "./store-provider";

export function AppProviders({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <StoreProvider>
      <FeatureFlagsProvider>{children}</FeatureFlagsProvider>
    </StoreProvider>
  );
}
