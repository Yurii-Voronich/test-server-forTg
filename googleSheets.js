import { google } from "googleapis";
import { readFile } from "fs/promises";

let sheetsClient;

export const getSheetsClient = async () => {
  if (sheetsClient) return sheetsClient;

  const auth = new google.auth.GoogleAuth({
    credentials: JSON.parse(
      await readFile(
        process.env.GOOGLE_CREDENTIALS_PATH || "./credentials.json",
        "utf-8"
      )
    ),
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });

  sheetsClient = google.sheets({ version: "v4", auth });
  return sheetsClient;
};
