import { baseApi } from "@/store/base-api";

import {
  accountSchema,
  balanceEventSchema,
  type Account,
} from "../model/account";

export const accountsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAccounts: builder.query<Account[], void>({
      query: () => "demo/accounts",
      keepUnusedDataFor: 0,
      transformResponse: (response: unknown) =>
        accountSchema.array().parse(response),
      async onCacheEntryAdded(
        _argument,
        { cacheDataLoaded, cacheEntryRemoved, updateCachedData },
      ) {
        if (typeof EventSource === "undefined") return;
        await cacheDataLoaded;
        const source = new EventSource("/api/demo/accounts/stream");
        source.addEventListener("balance", (message) => {
          try {
            const parsed = balanceEventSchema.safeParse(
              JSON.parse(message.data),
            );
            if (!parsed.success) return;
            updateCachedData((accounts) => {
              const account = accounts.find(({ id }) => id === parsed.data.id);
              if (account)
                account.availableBalance = parsed.data.availableBalance;
            });
          } catch {
            // Ignore malformed untrusted stream events; production adds telemetry.
          }
        });
        await cacheEntryRemoved;
        source.close();
      },
    }),
  }),
});

export const { useGetAccountsQuery } = accountsApi;
