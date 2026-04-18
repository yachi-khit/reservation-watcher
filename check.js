const { chromium } = require("playwright");
const nodemailer = require("nodemailer");

const URL =
"https://booking.ebica.jp/webrsv/vacant/e014189501/33801";

async function run() {

  const browser = await chromium.launch({
    headless: true
  });

  const page = await browser.newPage();

  await page.goto(URL, { waitUntil: "networkidle" });

  // ===== カレンダー読み込み待ち =====
  await page.waitForTimeout(7000);

  // ===== 4/29 をクリック =====
  const targetDay = await page.locator("text=28").first();

  await targetDay.click();

  // 時間表示待ち
  await page.waitForTimeout(5000);

  // ===== 空席ボタン検知 =====
  const available = await page.locator("text=予約").count();

  if (available > 0) {
    console.log("空席あり！");
    await sendMail();
  } else {
    console.log("空席なし");
  }

  await browser.close();
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
    subject: "🎉【予約空き検知】4/29に空きあり",
    text: URL
  });
}

run();
