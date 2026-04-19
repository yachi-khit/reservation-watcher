const nodemailer = require("nodemailer");

const URL =
"https://ebicaapi-for-booking.ebica.jp/booking/v2_1/stocks";

const params = new URLSearchParams({
  shop_id: "33801",
  sitecd: "e014189501",
  reservation_date: "2026-04-28"
});

async function run() {

  const res = await fetch(`${URL}?${params}`);
  const json = await res.json();

  console.log(json);

  // ⭐ 正しい空席判定
  const hasVacancy = json.stocks.some(
    s => s.times && s.times.length > 0
  );

  if (hasVacancy) {
    console.log("空席あり！");
    await sendMail();
  } else {
    console.log("空席なし");
  }
}

async function sendMail() {

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
    subject: "🎉【予約空き検知】空席あり",
    text: "https://booking.ebica.jp/webrsv/vacant/e014189501/33801"
  });
}

run();
