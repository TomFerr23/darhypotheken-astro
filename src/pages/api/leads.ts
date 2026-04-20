import type { APIRoute } from "astro";
import crypto from "crypto";

export const prerender = false;

interface LeadRequestBody {
  name: string;
  email: string;
  locale?: string;
  source?: string;
  surname?: string;
  dateOfBirth?: string;
  city?: string;
  country?: string;
  // "alone" | "together" — from the registration form. Maps to column G.
  buyerMode?: string;
  // "Nieuwbouw" | "Bestaande woning" | "Herfinanciering" | "Anders" — from
  // the chatbot qualifier. Maps to column O.
  purchaseType?: string;
  income?: string;
  financingPercentage?: string;
  currentMortgage?: string;
  dataConsent?: boolean;
  emailConsent?: boolean;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function jsonResponse(data: object, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

export const POST: APIRoute = async ({ request }) => {
  try {
    const body: LeadRequestBody = await request.json();
    const {
      name, email, locale = "nl", source = "chatbot",
      surname, dateOfBirth, city, country,
      buyerMode, purchaseType,
      income, financingPercentage, currentMortgage, dataConsent, emailConsent,
    } = body;

    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return jsonResponse({ error: "Name is required." }, 400);
    }
    if (!email || !EMAIL_REGEX.test(email)) {
      return jsonResponse({ error: "A valid email is required." }, 400);
    }

    const leadId = crypto.randomUUID();
    const timestamp = new Date().toISOString();

    const env = import.meta.env as Record<string, string | undefined>;
    const spreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID ?? env.GOOGLE_SHEETS_SPREADSHEET_ID;
    const credentialsJson = process.env.GOOGLE_SHEETS_CREDENTIALS ?? env.GOOGLE_SHEETS_CREDENTIALS;

    if (!spreadsheetId || !credentialsJson) {
      console.warn("Google Sheets not configured — lead stored locally only:", { leadId, name, email, locale, source, timestamp });
      return jsonResponse({ success: true, leadId });
    }

    try {
      const { google } = await import("googleapis");
      const credentials = JSON.parse(credentialsJson);
      const auth = new google.auth.GoogleAuth({
        credentials,
        scopes: ["https://www.googleapis.com/auth/spreadsheets"],
      });

      const sheets = google.sheets({ version: "v4", auth });

      await sheets.spreadsheets.values.append({
        spreadsheetId,
        range: "Sheet1!A:O",
        valueInputOption: "RAW",
        requestBody: {
          values: [[
            // A Name, B Surname, C Date of Birth, D City, E Country, F Email,
            // G Alone or Together, H Income, I Financing %, J Current Mortgage,
            // K Consent, L Timestamp, M Source, N Locale, O Property Type
            name ?? "",
            surname ?? "",
            dateOfBirth ?? "",
            city ?? "",
            country ?? "",
            email ?? "",
            buyerMode ?? "",
            income ?? "",
            financingPercentage ?? "",
            currentMortgage ?? "",
            emailConsent !== undefined ? String(emailConsent) : "",
            timestamp,
            source,
            locale,
            purchaseType ?? "",
          ]],
        },
      });
    } catch (sheetsError) {
      console.error("Failed to write to Google Sheets:", sheetsError);
    }

    return jsonResponse({ success: true, leadId });
  } catch (error) {
    console.error("Leads API error:", error);
    return jsonResponse({ error: "Internal server error." }, 500);
  }
};
