import express from "express";
import cors from "cors";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Приймає лише POST-запити
app.post("/send-message", (req, res) => {
  console.log("Отримано POST-запит:");
  console.log("Тіло запиту:", req.body);

  res.status(200).json({ success: true, message: "Запит прийнято!" });
});

// Відхиляє все інше
app.all("*", (req, res) => {
  res.status(405).json({ error: "Дозволено тільки POST на /send-message" });
});

app.listen(PORT, () => {
  console.log(`Сервер працює на порту ${PORT}`);
});
