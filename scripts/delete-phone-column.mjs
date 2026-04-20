// One-off migration: delete column D (Phone) from the DAR leads sheet.
// Kept in-repo for reproducibility — safe to re-run, idempotent in the sense
// that after the column is gone the "Phone" header no longer exists and the
// script will refuse to proceed.
//
// Usage:
//   node scripts/delete-phone-column.mjs
//
// Reads credentials from .env.local (GOOGLE_SHEETS_SPREADSHEET_ID +
// GOOGLE_SHEETS_CREDENTIALS JSON string, same vars the API uses).

import fs from "node:fs";
import path from "node:path";
import { google } from "googleapis";

function loadEnv() {
  const envPath = path.resolve(process.cwd(), ".env.local");
  if (!fs.existsSync(envPath)) {
    throw new Error(`No .env.local at ${envPath}`);
  }
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

async function main() {
  const env = loadEnv();
  const spreadsheetId = env.GOOGLE_SHEETS_SPREADSHEET_ID;
  const credsJson = env.GOOGLE_SHEETS_CREDENTIALS;
  if (!spreadsheetId || !credsJson) {
    throw new Error(
      "Missing GOOGLE_SHEETS_SPREADSHEET_ID or GOOGLE_SHEETS_CREDENTIALS in .env.local",
    );
  }
  const credentials = JSON.parse(credsJson);
  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });
  const sheets = google.sheets({ version: "v4", auth });

  // Find Sheet1 (first tab) and its sheetId
  const meta = await sheets.spreadsheets.get({ spreadsheetId });
  const sheet = meta.data.sheets?.find((s) => s.properties?.title === "Sheet1");
  if (!sheet?.properties?.sheetId && sheet?.properties?.sheetId !== 0) {
    throw new Error("Could not locate Sheet1");
  }
  const sheetId = sheet.properties.sheetId;

  // Confirm column D is still the Phone column (defensive — abort if it isn't)
  const headerRow = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: "Sheet1!A1:O1",
  });
  const headers = headerRow.data.values?.[0] ?? [];
  console.log("Current headers:", headers);
  if (headers[3] !== "Phone") {
    console.log(
      `Column D header is "${headers[3]}", not "Phone" — already deleted? Exiting without changes.`,
    );
    return;
  }

  // Delete column D (0-indexed: startIndex=3, endIndex=4)
  await sheets.spreadsheets.batchUpdate({
    spreadsheetId,
    requestBody: {
      requests: [
        {
          deleteDimension: {
            range: {
              sheetId,
              dimension: "COLUMNS",
              startIndex: 3,
              endIndex: 4,
            },
          },
        },
      ],
    },
  });

  console.log("Column D (Phone) deleted. New headers:");
  const after = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: "Sheet1!A1:N1",
  });
  console.log(after.data.values?.[0]);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
