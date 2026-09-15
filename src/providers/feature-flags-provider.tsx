"use client";

import { createContext, useContext } from "react";

export type FeatureFlags = { demoAccounts: boolean };
const FeatureFlagsContext = createContext<FeatureFlags | null>(null);

export function FeatureFlagsProvider({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const flags: FeatureFlags = {
    demoAccounts: process.env.NEXT_PUBLIC_ENABLE_DEMO_FEATURES !== "false",
  };
  return (
    <FeatureFlagsContext.Provider value={flags}>
      {children}
    </FeatureFlagsContext.Provider>
  );
}

export function useFeatureFlags() {
  const value = useContext(FeatureFlagsContext);
  if (!value)
    throw new Error("useFeatureFlags must be used within FeatureFlagsProvider");
  return value;
}
