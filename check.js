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

  const vacantTimes = getVacantTimes(json);

  if (vacantTimes.length > 0) {
    console.log("空席あり:", vacantTimes);
    await sendMail(vacantTimes);
  } else {
    console.log("空席なし");
  }
}

function getVacantTimes(json) {

  const times = [];

  for (const stock of json.stocks) {
    for (const t of stock.times || []) {

      if (t.status === "vacant" || t.status === "few") {
        times.push(`${t.time}（${stock.headcount}名）`);
      }
    }
  }

  return [...new Set(times)];
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
    subject: "🎉【予約空き検知】空席あり",
    text: `空席時間:\n${times.join("\n")}`
  });
}

run();
