const fetch = require("node-fetch");
const nodemailer = require("nodemailer");

const URL = "API_URLをここに";

async function check() {
  const res = await fetch(URL);
  const json = await res.json();

  // 例：2名予約を見る（変更OK）
  const stock = json.stocks.find(s => s.headcount === 2);

  if (!stock) {
    console.log("データなし");
    return;
  }

  // ✅ sets > 0 の時間だけ取得
  const availableTimes = stock.times
    .filter(t => t.sets > 0)
    .map(t => t.time);

  if (availableTimes.length === 0) {
    console.log("空席なし");
    return;
  }

  console.log("空席あり");

  await sendMail(availableTimes);
}

async function sendMail(times) {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_PASS
    }
  });

  await transporter.sendMail({
    from: process.env.GMAIL_USER,
    to: process.env.GMAIL_USER,
    subject: "予約空席あり",
    text:
`空席があります！

空き時間：
${times.join(", ")}`
  });

  console.log("メール送信完了");
}

check();
