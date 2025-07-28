import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import axios from "axios";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.post("/send-message", async (req, res) => {
  const { name, email, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ error: "Missing fields" });
  }

  const text = `📩 Заявка з форми:\n👤 Ім'я: ${name}\n📧 Email: ${email}\n💬 Повідомлення: ${message}`;

  try {
    await axios.post(
      `https://api.telegram.org/bot${process.env.BOT_TOKEN}/sendMessage`,
      {
        chat_id: process.env.CHAT_ID,
        text,
      }
    );

    res.status(200).json({ success: true });
  } catch (error) {
    console.error("Telegram error:", error.message);
    res.status(500).json({ error: "Failed to send to Telegram" });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
