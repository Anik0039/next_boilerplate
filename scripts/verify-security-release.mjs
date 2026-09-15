const requiredEvidence = [
  "THREAT_MODEL_APPROVAL_ID",
  "WAF_POLICY_ID",
  "DAST_REPORT_ID",
  "PENETRATION_TEST_REPORT_ID",
];

const missing = requiredEvidence.filter(
  (name) => !process.env[name] || process.env[name].trim().length < 3,
);

if (missing.length > 0) {
  console.error(
    `Production security release gate failed. Missing evidence references: ${missing.join(", ")}`,
  );
  process.exitCode = 1;
} else {
  console.log("Production security release evidence is present.");
}
