import { z } from "zod";

import { redactUrl } from "./audit-log";

const shortText = z.string().max(256).optional();
const urlText = z.string().max(4096).optional();

const legacyBodySchema = z
  .object({
    "blocked-uri": urlText,
    "document-uri": urlText,
    "effective-directive": shortText,
    "violated-directive": shortText,
    "source-file": urlText,
    disposition: z.enum(["enforce", "report"]).optional(),
    "line-number": z.number().int().nonnegative().optional(),
    "column-number": z.number().int().nonnegative().optional(),
    status: z.number().int().min(0).max(599).optional(),
  })
  .passthrough();

const reportingBodySchema = z
  .object({
    blockedURL: urlText,
    documentURL: urlText,
    effectiveDirective: shortText,
    sourceFile: urlText,
    disposition: z.enum(["enforce", "report"]).optional(),
    lineNumber: z.number().int().nonnegative().optional(),
    columnNumber: z.number().int().nonnegative().optional(),
    statusCode: z.number().int().min(0).max(599).optional(),
  })
  .passthrough();

const legacyReportSchema = z
  .object({ "csp-report": legacyBodySchema })
  .strict();
const reportingReportSchema = z
  .array(
    z
      .object({
        type: z.literal("csp-violation"),
        age: z.number().nonnegative().optional(),
        body: reportingBodySchema,
      })
      .passthrough(),
  )
  .max(20);

export const cspReportSchema = z.union([
  legacyReportSchema,
  reportingReportSchema,
]);

export type NormalizedCspReport = Readonly<{
  blockedUrl?: string;
  documentUrl?: string;
  effectiveDirective?: string;
  sourceFile?: string;
  disposition?: string;
  statusCode?: number;
}>;

export function normalizeCspReports(
  report: z.infer<typeof cspReportSchema>,
): NormalizedCspReport[] {
  if (Array.isArray(report)) {
    return report.map(({ body }) => ({
      blockedUrl: redactUrl(body.blockedURL),
      documentUrl: redactUrl(body.documentURL),
      effectiveDirective: body.effectiveDirective,
      sourceFile: redactUrl(body.sourceFile),
      disposition: body.disposition,
      statusCode: body.statusCode,
    }));
  }

  const body = report["csp-report"];
  return [
    {
      blockedUrl: redactUrl(body["blocked-uri"]),
      documentUrl: redactUrl(body["document-uri"]),
      effectiveDirective:
        body["effective-directive"] ?? body["violated-directive"],
      sourceFile: redactUrl(body["source-file"]),
      disposition: body.disposition,
      statusCode: body.status,
    },
  ];
}
