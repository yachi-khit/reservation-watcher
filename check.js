const nodemailer = require("nodemailer");

const URL =
"https://ebicaapi-for-booking.ebica.jp/booking/v2_1/stocks";

const DATE = "2026-04-28";

const params = new URLSearchParams({
  shop_id: "33801",
  sitecd: "e014189501",
  reservation_date: DATE,
  headcount: "2"
});

async function run() {

  const res = await fetch(`${URL}?${params}`);
  const json = await res.json();

  const times = getAvailableTimes(json);

  if (times.length > 0) {
    console.log("空席あり:", times);
    await sendMail(times);
  } else {
    console.log("空席なし");
  }
}

function getAvailableTimes(json) {

  const result = new Set();

  for (const stock of json.stocks || []) {
    for (const t of stock.times || []) {

      const isAvailable =
        t.symbol === "o" ||
        t.symbol === "d" ||
        t.status === "vacant" ||
        t.status === "few";

      if (isAvailable && t.time) {
        result.add(t.time);
      }
    }
  }

  return [...result].sort();
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
    subject: `🎉【予約空き検知】${DATE} 空席あり`,
    text:
`以下の時間に空席があります：

${times.join("\n")}

予約ページ：
https://booking.ebica.jp/webrsv/vacant/e014189501/33801`
  });
}

run();
