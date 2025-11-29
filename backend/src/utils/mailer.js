const net = require("net");
const tls = require("tls");
const { once } = require("events");

const SMTP_HOST = process.env.SMTP_HOST;
const SMTP_PORT = Number(process.env.SMTP_PORT || 587);
const SMTP_SECURE = process.env.SMTP_SECURE === "true";
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;
const SMTP_FROM = process.env.SMTP_FROM || SMTP_USER;
const SMTP_CLIENT_ID = process.env.SMTP_CLIENT_ID || "localhost";
const NODE_ENV = process.env.NODE_ENV || "development";
const ALLOW_CONSOLE_FALLBACK =
  process.env.SMTP_CONSOLE_FALLBACK !== "false" && NODE_ENV !== "production";

function isMailerConfigured() {
  return Boolean(SMTP_HOST && SMTP_FROM);
}

function waitForResponse(socket, expectedCodes) {
  return new Promise((resolve, reject) => {
    let buffer = "";

    const cleanup = () => {
      socket.off("data", onData);
      socket.off("error", onError);
      socket.off("end", onEnd);
    };

    const onError = (err) => {
      cleanup();
      reject(err);
    };

    const onEnd = () => {
      cleanup();
      reject(new Error("Koneksi SMTP terputus sebelum selesai."));
    };

    const onData = (chunk) => {
      buffer += chunk.toString();

      // Cek apakah sudah menerima baris akhir (kode + spasi)
      const lines = buffer.split(/\r?\n/).filter(Boolean);
      const last = lines[lines.length - 1] || "";
      const match = last.match(/^(\d{3})([ -])(.*)$/);

      if (match && match[2] === " ") {
        const code = Number(match[1]);
        const isExpected = !expectedCodes || expectedCodes.includes(code);

        cleanup();
        if (!isExpected) {
          return reject(new Error(`SMTP ${code}: ${last}`));
        }
        return resolve({ code, message: buffer.trim() });
      }
    };

    socket.on("data", onData);
    socket.on("error", onError);
    socket.on("end", onEnd);
  });
}

async function sendCommand(socket, command, expectedCodes) {
  if (command) {
    socket.write(`${command}\r\n`);
  }
  return waitForResponse(socket, expectedCodes);
}

async function sendMail({ to, subject, text }) {
  if (!isMailerConfigured()) {
    throw new Error("Konfigurasi SMTP belum lengkap.");
  }

  const socket = SMTP_SECURE
    ? tls.connect({ host: SMTP_HOST, port: SMTP_PORT })
    : net.createConnection({ host: SMTP_HOST, port: SMTP_PORT });

  const connectEvent = SMTP_SECURE ? "secureConnect" : "connect";
  await once(socket, connectEvent);

  try {
    await waitForResponse(socket, [220]); // greeting
    await sendCommand(socket, `EHLO ${SMTP_CLIENT_ID}`, [250]);

    if (SMTP_USER && SMTP_PASS) {
      await sendCommand(socket, "AUTH LOGIN", [334]);
      await sendCommand(socket, Buffer.from(SMTP_USER).toString("base64"), [334]);
      await sendCommand(socket, Buffer.from(SMTP_PASS).toString("base64"), [235]);
    }

    await sendCommand(socket, `MAIL FROM:<${SMTP_FROM}>`, [250]);
    await sendCommand(socket, `RCPT TO:<${to}>`, [250, 251]);
    await sendCommand(socket, "DATA", [354]);

    const payload = [
      `From: ${SMTP_FROM}`,
      `To: ${to}`,
      `Subject: ${subject}`,
      "Content-Type: text/plain; charset=utf-8",
      "",
      text,
      ".",
      "",
    ].join("\r\n");

    socket.write(`${payload}\r\n`);
    await waitForResponse(socket, [250]);
    await sendCommand(socket, "QUIT", [221]);
  } finally {
    socket.end();
  }
}

function logFallbackMail({ to, subject, text }, reason) {
  const header = reason
    ? `[MAILER DEV FALLBACK] ${reason}`
    : "[MAILER DEV FALLBACK] SMTP dilewati";
  console.warn(header);
  console.info(`To: ${to}`);
  console.info(`Subject: ${subject}`);
  console.info("Body:\n" + text);
}

function buildVerificationMessage(name, code, expiresAt) {
  const expires = expiresAt
    ? new Intl.DateTimeFormat("id-ID", {
        dateStyle: "medium",
        timeStyle: "short",
      }).format(expiresAt)
    : null;

  return [
    `Halo ${name || "pengguna"},`,
    "",
    "Berikut kode verifikasi akun Portal Magang UNSIKA Anda:",
    `Kode: ${code}`,
    expires ? `Berlaku hingga: ${expires} (WIB)` : null,
    "",
    "Masukkan kode ini pada halaman verifikasi untuk mengaktifkan akun Anda.",
    "Jika Anda tidak meminta kode ini, abaikan email ini.",
    "",
    "Terima kasih.",
  ]
    .filter(Boolean)
    .join("\n");
}

async function sendVerificationEmail({ to, name, code, expiresAt }) {
  const subject = "Kode Verifikasi Portal Magang UNSIKA";
  const text = buildVerificationMessage(name, code, expiresAt);
  if (!isMailerConfigured()) {
    if (!ALLOW_CONSOLE_FALLBACK) {
      throw new Error(
        "SMTP belum dikonfigurasi dan fallback console dimatikan. Aktifkan SMTP atau setel SMTP_CONSOLE_FALLBACK=true untuk pengembangan."
      );
    }
    logFallbackMail({ to, subject, text }, "Konfigurasi SMTP belum lengkap.");
    return;
  }

  try {
    await sendMail({ to, subject, text });
  } catch (err) {
    if (!ALLOW_CONSOLE_FALLBACK) {
      throw err;
    }
    logFallbackMail({ to, subject, text }, err.message);
  }
}

module.exports = {
  sendVerificationEmail,
};