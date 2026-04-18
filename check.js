const { chromium } = require("playwright");
const nodemailer = require("nodemailer");

const URL =
"https://booking.ebica.jp/webrsv/vacant/e014189501/33801";

async function run() {

  const browser = await chromium.launch();
  const page = await browser.newPage();

  await page.goto(URL, { waitUntil: "networkidle" });

  await page.waitForTimeout(5000);

  const html = await page.content();

  if (html.includes("4/28") && html.includes("空席")) {
    await sendMail();
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
    subject: "🎉予約に空きが出ました",
    text: URL
  });
}

run();
