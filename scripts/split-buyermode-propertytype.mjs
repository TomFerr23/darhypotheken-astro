// One-off migration: split the ambiguous "Purchase Type" column into
//   - column G  "Alone or Together"  (from the registration form)
//   - column O  "Property Type"       (from the chatbot qualifier)
//
// Old 14-col headers (pre-migration):
//   A Name, B Surname, C Date of Birth, D City, E Country, F Email,
//   G Purchase Type, H Income, I Financing %, J Current Mortgage,
//   K Consent, L Timestamp, M Source, N Locale
//
// New 15-col headers:
//   A Name, B Surname, C Date of Birth, D City, E Country, F Email,
//   G Alone or Together, H Income, I Financing %, J Current Mortgage,
//   K Consent, L Timestamp, M Source, N Locale, O Property Type
//
// For each existing row we inspect column M (Source). If it's "form" the
// old G value is a buyer mode ("alone" / "together") — keep it in new G
// and leave new O empty. Otherwise (chatbot / chatbot-qualified) the old
// G is a property type — move it to new O and leave new G empty.

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
const NEW_HEADERS = [
  "Name",
  "Surname",
  "Date of Birth",
  "City",
  "Country",
  "Email",
  "Alone or Together",
  "Income",
  "Financing %",
  "Current Mortgage",
  "Consent",
  "Timestamp",
  "Source",
  "Locale",
  "Property Type",
];

async function main() {
  const env = loadEnv();
  const spreadsheetId = env.GOOGLE_SHEETS_SPREADSHEET_ID;
  const credsJson = env.GOOGLE_SHEETS_CREDENTIALS;
  const credentials = JSON.parse(credsJson);
  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });
  const sheets = google.sheets({ version: "v4", auth });

  const current = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: "Sheet1!A:O",
  });
  const rows = current.data.values ?? [];
  if (rows.length === 0) {
    console.log("Sheet is empty — nothing to migrate.");
    return;
  }

  const headers = rows[0];
  console.log("Current headers:", headers);

  // Idempotency: already migrated?
  if (headers.length >= 15 && headers[6] === "Alone or Together" && headers[14] === "Property Type") {
    console.log("Headers already split — nothing to do.");
    return;
  }

  // Sanity: expected old layout?
  for (let i = 0; i < OLD_HEADERS.length; i++) {
    if (headers[i] !== OLD_HEADERS[i]) {
      throw new Error(
        `Header mismatch at column ${i}: expected "${OLD_HEADERS[i]}" got "${headers[i]}"`,
      );
    }
  }

  const newRows = [NEW_HEADERS];
  let migrated = 0;
  for (let i = 1; i < rows.length; i++) {
    const r = rows[i];
    const source = r[12] ?? "";
    const oldPurchaseType = r[6] ?? "";

    const isForm = source === "form";
    const buyerMode = isForm ? oldPurchaseType : "";
    const propertyType = isForm ? "" : oldPurchaseType;

    newRows.push([
      r[0] ?? "", // Name
      r[1] ?? "", // Surname
      r[2] ?? "", // Date of Birth
      r[3] ?? "", // City
      r[4] ?? "", // Country
      r[5] ?? "", // Email
      buyerMode, // Alone or Together (column G)
      r[7] ?? "", // Income
      r[8] ?? "", // Financing %
      r[9] ?? "", // Current Mortgage
      r[10] ?? "", // Consent
      r[11] ?? "", // Timestamp
      r[12] ?? "", // Source
      r[13] ?? "", // Locale
      propertyType, // Property Type (column O)
    ]);
    migrated++;
  }
  console.log(`Migrating ${migrated} data rows.`);

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
    range: "Sheet1!A1:O1",
  });
  console.log(verify.data.values?.[0]);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
