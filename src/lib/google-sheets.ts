import "server-only";

import crypto from "crypto";

/**
 * Lightweight Google Sheets helper — NO `googleapis` dependency.
 * Uses manual JWT signing (Node.js built-in crypto) + raw fetch
 * to the Sheets REST API. This keeps Vercel serverless bundles
 * tiny (~KB instead of ~40MB with googleapis).
 */

/* ── Service-account credentials ── */
function getCredentials() {
  if (process.env.GOOGLE_CLIENT_EMAIL && process.env.GOOGLE_PRIVATE_KEY) {
    return {
      client_email: process.env.GOOGLE_CLIENT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, "\n"),
    };
  }

  const raw = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;
  if (!raw) {
    throw new Error(
      "GOOGLE_SERVICE_ACCOUNT_KEY or GOOGLE_CLIENT_EMAIL/PRIVATE_KEY environment variables are not set"
    );
  }

  try {
    const parsed = JSON.parse(raw);
    return {
      client_email: parsed.client_email as string,
      private_key: (parsed.private_key as string).replace(/\\n/g, "\n"),
    };
  } catch {
    throw new Error("GOOGLE_SERVICE_ACCOUNT_KEY is not valid JSON.");
  }
}

/* ── JWT → access-token exchange ── */
let cachedToken: { token: string; expiry: number } | null = null;

async function getAccessToken(): Promise<string> {
  // Reuse token if still valid (with 60s buffer)
  if (cachedToken && Date.now() < cachedToken.expiry - 60_000) {
    return cachedToken.token;
  }

  const { client_email, private_key } = getCredentials();
  const now = Math.floor(Date.now() / 1000);

  const header = { alg: "RS256", typ: "JWT" };
  const payload = {
    iss: client_email,
    scope: "https://www.googleapis.com/auth/spreadsheets",
    aud: "https://oauth2.googleapis.com/token",
    iat: now,
    exp: now + 3600,
  };

  const encode = (obj: object) =>
    Buffer.from(JSON.stringify(obj)).toString("base64url");

  const unsigned = `${encode(header)}.${encode(payload)}`;
  const signature = crypto
    .createSign("RSA-SHA256")
    .update(unsigned)
    .sign(private_key, "base64url");

  const jwt = `${unsigned}.${signature}`;

  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: `grant_type=urn%3Aietf%3Aparams%3Aoauth%3Agrant-type%3Ajwt-bearer&assertion=${jwt}`,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Sheets token exchange failed: ${text}`);
  }

  const data = await res.json();
  cachedToken = {
    token: data.access_token,
    expiry: Date.now() + data.expires_in * 1000,
  };
  return cachedToken.token;
}

/* ── Sheet definitions ── */
const SHEETS = {
  registrations: {
    title: "Registrations",
    headers: [
      "Student ID", "Full Name", "Email", "Phone", "Branch", "Year",
      "Payment Proof", "Registered At", "Status",
    ],
  },
  preRegistrations: {
    title: "Pre-Registrations",
    headers: ["Name", "Email", "Phone", "Requested At", "Status"],
  },
  submissions: {
    title: "Submissions",
    headers: [
      "Submission ID", "Student ID", "Student Name", "Phase ID", "Day ID",
      "Day Title", "Type", "Submitted At", "Status", "Points", "Content URL",
    ],
  },
  examAttempts: {
    title: "Exam Attempts",
    headers: [
      "Attempt ID", "Student ID", "Student Name", "Phase ID", "Day ID",
      "Started At", "Submitted At", "Score", "Max Score", "Warning Count", "Status",
    ],
  },
  assignments: {
    title: "Assignments",
    headers: [
      "Assignment Type", "Owner ID", "Owner Name", "Target ID", "Target Name",
      "Starts At", "Ends At", "Updated At",
    ],
  },
} as const;

export type SheetKey = keyof typeof SHEETS;

/* ── Helper: raw Sheets API fetch ── */
const SHEETS_BASE = "https://sheets.googleapis.com/v4/spreadsheets";

async function sheetsGet(path: string): Promise<Record<string, unknown>> {
  const token = await getAccessToken();
  const res = await fetch(`${SHEETS_BASE}/${path}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Sheets GET ${path} failed (${res.status}): ${text}`);
  }
  return res.json();
}

async function sheetsPost(
  path: string,
  body: unknown,
  method: "POST" | "PUT" = "POST"
): Promise<Record<string, unknown>> {
  const token = await getAccessToken();
  const res = await fetch(`${SHEETS_BASE}/${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Sheets ${method} ${path} failed (${res.status}): ${text}`);
  }
  return res.json();
}

/* ── Ensure sheet tab exists with headers ── */
async function ensureSheet(key: SheetKey) {
  const sheetId = process.env.GOOGLE_SHEET_ID;
  if (!sheetId) throw new Error("GOOGLE_SHEET_ID environment variable is not set");

  const definition = SHEETS[key];

  // Get existing sheets
  const metadata = (await sheetsGet(
    `${sheetId}?fields=sheets.properties`
  )) as { sheets?: Array<{ properties?: { title?: string; sheetId?: number } }> };

  let sheet = metadata.sheets?.find(
    (s) => s.properties?.title === definition.title
  );

  if (!sheet) {
    // Create the sheet tab
    await sheetsPost(`${sheetId}:batchUpdate`, {
      requests: [
        {
          addSheet: {
            properties: {
              title: definition.title,
              gridProperties: { frozenRowCount: 1 },
            },
          },
        },
      ],
    });

    // Re-fetch to get the new sheet's numeric ID
    const refreshed = (await sheetsGet(
      `${sheetId}?fields=sheets.properties`
    )) as typeof metadata;
    sheet = refreshed.sheets?.find(
      (s) => s.properties?.title === definition.title
    );
  }

  // Write headers to row 1
  await sheetsPost(
    `${sheetId}/values/'${encodeURIComponent(definition.title)}'!A1?valueInputOption=RAW`,
    { values: [[...definition.headers]] },
    "PUT"
  );

  // Format header row
  const numericId = sheet?.properties?.sheetId;
  if (numericId !== undefined) {
    await sheetsPost(`${sheetId}:batchUpdate`, {
      requests: [
        {
          updateSheetProperties: {
            properties: {
              sheetId: numericId,
              gridProperties: { frozenRowCount: 1 },
            },
            fields: "gridProperties.frozenRowCount",
          },
        },
        {
          repeatCell: {
            range: {
              sheetId: numericId,
              startRowIndex: 0,
              endRowIndex: 1,
            },
            cell: {
              userEnteredFormat: {
                backgroundColor: { red: 0.1, green: 0.15, blue: 0.25 },
                textFormat: {
                  bold: true,
                  foregroundColor: { red: 1, green: 1, blue: 1 },
                },
              },
            },
            fields: "userEnteredFormat(backgroundColor,textFormat)",
          },
        },
        {
          autoResizeDimensions: {
            dimensions: { sheetId: numericId, dimension: "COLUMNS" },
          },
        },
      ],
    });
  }

  return { sheetId, definition };
}

/* ── Public API ── */
export async function appendSheetRecord(
  key: SheetKey,
  values: (string | number | boolean)[]
) {
  const { sheetId, definition } = await ensureSheet(key);
  const range = encodeURIComponent(`'${definition.title}'!A:A`);

  await sheetsPost(
    `${sheetId}/values/${range}:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`,
    { values: [values] }
  );
}

export async function readFromSheet(range: string) {
  const sheetId = process.env.GOOGLE_SHEET_ID;
  if (!sheetId) throw new Error("GOOGLE_SHEET_ID environment variable is not set");

  const data = (await sheetsGet(
    `${sheetId}/values/${encodeURIComponent(range)}`
  )) as { values?: unknown[][] };

  return data.values || [];
}
