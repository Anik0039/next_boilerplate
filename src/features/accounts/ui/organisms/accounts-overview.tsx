"use client";

import { Heading, StatusPill, Text } from "@/components/atoms";
import { LabeledValue } from "@/components/molecules";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useFeatureFlags } from "@/providers/feature-flags-provider";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { toggleBalanceMask } from "@/store/slices/ui-slice";
import { useGetAccountsQuery } from "../../api/accounts-api";

function formatAmount(value: number, currency: string) {
  return new Intl.NumberFormat("en-BD", { style: "currency", currency }).format(
    value,
  );
}

export function AccountsOverview() {
  const { demoAccounts } = useFeatureFlags();
  const { data, isLoading, isError } = useGetAccountsQuery(undefined, {
    skip: !demoAccounts,
  });
  const maskBalances = useAppSelector((state) => state.ui.maskBalances);
  const dispatch = useAppDispatch();

  return (
    <section aria-labelledby="accounts-heading" className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <Heading id="accounts-heading">Account summary</Heading>
          <Text>
            Demonstrates feature ownership, RTK Query and an optional live
            balance stream.
          </Text>
        </div>
        <Button
          variant="secondary"
          onClick={() => dispatch(toggleBalanceMask())}
        >
          {maskBalances ? "Show balances" : "Hide balances"}
        </Button>
      </div>

      {!demoAccounts && <Card>Demo features are disabled.</Card>}
      {isLoading && <Card role="status">Loading account summary…</Card>}
      {isError && (
        <Card role="alert">The demo account service is unavailable.</Card>
      )}
      <div className="grid gap-4 md:grid-cols-2">
        {data?.map((account) => (
          <Card key={account.id} className="space-y-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <Heading level={3}>{account.name}</Heading>
                <Text>{account.maskedNumber}</Text>
              </div>
              <StatusPill>{account.status}</StatusPill>
            </div>
            <LabeledValue
              label="Available balance"
              value={
                maskBalances
                  ? "••••••••"
                  : formatAmount(account.availableBalance, account.currency)
              }
            />
          </Card>
        ))}
      </div>
    </section>
  );
}
