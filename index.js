import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { getSheetsClient } from "./googleSheets.js";

dotenv.config(); // Зчитує змінні з .env

const app = express();
const PORT = process.env.PORT || 3000;

const BOT_TOKEN = process.env.BOT_TOKEN;
const CHAT_ID = process.env.CHAT_ID;

app.use(cors());
app.use(express.json());

// Відправка повідомлення в Telegram
const sendToTelegram = async (text) => {
  const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: CHAT_ID,
      text,
      parse_mode: "HTML",
    }),
  });

  const data = await response.json();
  if (!data.ok) {
    throw new Error(data.description || "Unknown Telegram error");
  }
};

// Приймає тільки POST-запити на /send-message

//

const SPREADSHEET_ID = process.env.SPREADSHEET_ID;

app.post("/send-message", async (req, res) => {
  const { name, email, message, dataid } = req.body;

  if (!name || !email) {
    return res.status(400).json({ error: "поля ім'я та email обовʼязкові" });
  }

  const text = `
<b>📩 Івент ${dataid}:</b>
👤 <b>Імʼя:</b> ${name}
📧 <b>Email:</b> ${email}
💬 <b>Повідомлення:</b> ${message}
  `.trim();

  try {
    await sendToTelegram(text);

    // Запис у Google Таблицю
    const sheets = await getSheetsClient();
    await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: "Лист1", // або "Лист1!A1", залежно від назви листа
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: [
          [new Date().toISOString(), dataid, name, email, message || "—"],
        ],
      },
    });

    res.status(200).json({
      success: true,
      message: "Надіслано в Telegram і записано у Google Таблицю!",
    });
  } catch (error) {
    console.error("Telegram/Sheets error:", error.message);
    res.status(500).json({ error: "Не вдалося обробити запит" });
  }
});

// Відхиляє всі інші типи запитів
app.all("*", (req, res) => {
  res
    .status(405)
    .json({ error: "Дозволено лише POST-запити на /send-message" });
});

app.listen(PORT, () => {
  console.log(`✅ Сервер працює на порту ${PORT}`);
});
