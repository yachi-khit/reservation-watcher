const nodemailer = require("nodemailer");

const DATE = "2026-04-28";

const URL =
`https://ebicaapi-for-booking.ebica.jp/booking/v2_1/stocks
?shop_id=33801
&sitecd=e014189501
&reservation_date=${DATE}
&headcount=2`;

async function check() {

  const res = await fetch(URL, {
    headers: {
      "User-Agent": "Mozilla/5.0"
    }
  });

  const json = await res.json();

  // ⭐ sets方式
  const stock = json.stocks.find(s => s.headcount === 2);

  if (!stock) {
    console.log("データなし");
    return;
  }

  const availableTimes =
    stock.times
      .filter(t => t.sets > 0)
      .map(t => t.time);

  if (availableTimes.length === 0) {
    console.log("空席なし");
    return;
  }

  console.log("空席あり:", availableTimes);

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
    subject: `🎉【予約空き検知】${DATE}`,
    text:
`空席があります

${times.join("\n")}

予約ページ:
https://booking.ebica.jp/webrsv/vacant/e014189501/33801`
  });

  console.log("メール送信完了");
}

check();
