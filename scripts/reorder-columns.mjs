// One-off migration: reorder Sheet1 columns to match the preferred layout.
//
// Old 14-col order: Name, Surname, Email, Date of Birth, City, Country,
//   Purchase Type, Income, Financing %, Current Mortgage, Consent, Source,
//   Locale, Timestamp.
// New 14-col order: Name, Surname, Date of Birth, City, Country, Email,
//   Purchase Type, Income, Financing %, Current Mortgage, Consent,
//   Timestamp, Source, Locale.
//
// Reads all rows, rewrites them in the new order, preserves cell formatting
// (values.clear + values.update don't touch formatting).
//
// Idempotent: if the header row already matches the new layout, the script
// exits without changes.

import fs from "node:fs";
import path from "node:path";
import { google } from "googleapis";

function loadEnv() {
  const envPath = path.resolve(process.cwd(), ".env.local");
  const raw = fs.readFileSync(envPath, "utf8");
  const out = {};
  for (const line of raw.split("\n")) {
    if (!line || line.startsWith("#")) continue;
    const eq = line.indexOf("=");
    if (eq < 0) continue;
    const k = line.slice(0, eq).trim();
    let v = line.slice(eq + 1).trim();
    if (
      (v.startsWith("'") && v.endsWith("'")) ||
      (v.startsWith('"') && v.endsWith('"'))
    ) {
      v = v.slice(1, -1);
    }
    out[k] = v;
  }
  return out;
}

const OLD_HEADERS = [
  "Name",
  "Surname",
  "Email",
  "Date of Birth",
  "City",
  "Country",
  "Purchase Type",
  "Income",
  "Financing %",
  "Current Mortgage",
  "Consent",
  "Source",
  "Locale",
  "Timestamp",
];
const NEW_HEADERS = [
  "Name",
  "Surname",
  "Date of Birth",
  "City",
  "Country",
  "Email",
  "Purchase Type",
  "Income",
  "Financing %",
  "Current Mortgage",
  "Consent",
  "Timestamp",
  "Source",
  "Locale",
];

const OLD_IDX = Object.fromEntries(OLD_HEADERS.map((h, i) => [h, i]));

async function main() {
  const env = loadEnv();
  const spreadsheetId = env.GOOGLE_SHEETS_SPREADSHEET_ID;
  const credsJson = env.GOOGLE_SHEETS_CREDENTIALS;
  if (!spreadsheetId || !credsJson) {
    throw new Error("Missing env in .env.local");
  }
  const credentials = JSON.parse(credsJson);
  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });
  const sheets = google.sheets({ version: "v4", auth });

  const current = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: "Sheet1!A:N",
  });
  const rows = current.data.values ?? [];
  if (rows.length === 0) {
    console.log("Sheet is empty — nothing to migrate.");
    return;
  }

  const currentHeaders = rows[0];
  console.log("Current headers:", currentHeaders);

  // Idempotency check — if headers already match new layout, abort
  if (currentHeaders.every((h, i) => h === NEW_HEADERS[i])) {
    console.log("Headers already in new order — nothing to do.");
    return;
  }

  // Sanity check — headers must match the known old layout
  for (const required of OLD_HEADERS) {
    if (!currentHeaders.includes(required)) {
      throw new Error(
        `Expected to find header "${required}" in current sheet but didn't. Aborting.`,
      );
    }
  }

  const newRows = [NEW_HEADERS];
  for (let i = 1; i < rows.length; i++) {
    const r = rows[i];
    newRows.push([
      r[OLD_IDX["Name"]] ?? "",
      r[OLD_IDX["Surname"]] ?? "",
      r[OLD_IDX["Date of Birth"]] ?? "",
      r[OLD_IDX["City"]] ?? "",
      r[OLD_IDX["Country"]] ?? "",
      r[OLD_IDX["Email"]] ?? "",
      r[OLD_IDX["Purchase Type"]] ?? "",
      r[OLD_IDX["Income"]] ?? "",
      r[OLD_IDX["Financing %"]] ?? "",
      r[OLD_IDX["Current Mortgage"]] ?? "",
      r[OLD_IDX["Consent"]] ?? "",
      r[OLD_IDX["Timestamp"]] ?? "",
      r[OLD_IDX["Source"]] ?? "",
      r[OLD_IDX["Locale"]] ?? "",
    ]);
  }

  console.log(
    `Migrating ${newRows.length - 1} data rows to the new column order.`,
  );

  // Clear the range then write the reordered data
  await sheets.spreadsheets.values.clear({
    spreadsheetId,
    range: "Sheet1!A:Z",
  });
  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: "Sheet1!A1",
    valueInputOption: "RAW",
    requestBody: { values: newRows },
  });

  console.log("Done. New headers:");
  const verify = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: "Sheet1!A1:N1",
  });
  console.log(verify.data.values?.[0]);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
