import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import compression from 'compression';
import fetch from 'node-fetch'; // اگر Node <18 است نصبش کنید

const app = express();

app.use(cors());
app.use(compression());
app.use(express.json({ limit: '10mb' }));

// مسیر پروکسی
app.post('/', async (req, res) => {
  try {
    const { model, key } = req.query;

    if (!model || !key) {
      return res.status(400).json({ error: 'model و key الزامی هستند' });
    }

    // آدرس سرور اصلی گوگل
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`;

    // ارسال درخواست به API گوگل
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(req.body) // همان داده‌ای که کاربر فرستاده
    });

    const data = await response.json();

    // ارسال پاسخ به کلاینت
    res.status(response.status).json(data);
  } catch (err) {
    console.error('❌ Proxy Error:', err);
    res.status(500).json({ error: 'خطا در برقراری ارتباط با سرور اصلی' });
  }
});

// health check
app.get('/health', (_req, res) => {
  res.json({
    ok: true,
    timestamp: new Date().toISOString()
  });
});

// start server
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`🚀 Proxy Server running at http://localhost:${port}`);
});
