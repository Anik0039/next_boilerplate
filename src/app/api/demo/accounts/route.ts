import { NextResponse } from "next/server";

import { SENSITIVE_RESPONSE_HEADERS } from "@/security/server/cache-policy";
import {
  demoApiDisabledResponse,
  isDemoApiEnabled,
} from "@/security/server/demo-api";

const demoAccounts = [
  {
    id: "operating-bdt",
    name: "Operating Account",
    maskedNumber: "•••• 1842",
    currency: "BDT",
    availableBalance: 12450000,
    status: "Active",
  },
  {
    id: "payroll-bdt",
    name: "Payroll Account",
    maskedNumber: "•••• 7701",
    currency: "BDT",
    availableBalance: 3820000,
    status: "Active",
  },
] as const;

export async function GET() {
  if (!isDemoApiEnabled()) return demoApiDisabledResponse();

  return NextResponse.json(demoAccounts, {
    headers: SENSITIVE_RESPONSE_HEADERS,
  });
}
