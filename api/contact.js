const SITE_URL = "https://ledajess.de";
const LOGO_URL = `${SITE_URL}/medien/ledajess%20logo.png`;

const FIELD_LABELS = {
  name: "Name",
  company: "Unternehmen",
  role: "Rolle / Position",
  email: "E-Mail",
  phone: "Telefon",
  participants: "Anzahl Teilnehmende",
  format: "Gewünschtes Format",
  topic: "Thema",
  timeline: "Zeitraum",
  location: "Standort",
  message: "Nachricht",
  quizLeadershipLevel: "Führungserfahrung",
  quizChallenge: "Größte Herausforderung",
  quizFormat: "Passendes Format",
  quizParticipants: "Teilnehmende",
  source: "Quelle",
  page: "Seite",
};

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function normalizeBody(req) {
  if (!req.body) {
    return {};
  }

  if (typeof req.body === "string") {
    try {
      return JSON.parse(req.body);
    } catch {
      return {};
    }
  }

  return req.body;
}

function pickFields(body) {
  return Object.entries(body)
    .filter(([key, value]) => {
      if (["website", "consent"].includes(key)) {
        return false;
      }

      return value !== undefined && value !== null && String(value).trim() !== "";
    })
    .map(([key, value]) => [FIELD_LABELS[key] || key, String(value).trim()]);
}

function sourcePageLabel(pageUrl) {
  if (!pageUrl) {
    return "ledajess.de";
  }

  try {
    const url = new URL(pageUrl);
    return `${url.hostname}${url.pathname}`.replace(/\/$/, "") || url.hostname;
  } catch {
    return pageUrl;
  }
}

function whatsappNumber(phone) {
  if (!phone) {
    return "";
  }

  const digits = phone.replace(/[^\d+]/g, "");

  if (digits.startsWith("+")) {
    return digits.slice(1);
  }

  if (digits.startsWith("0")) {
    return `49${digits.slice(1)}`;
  }

  return digits;
}

function buildActionButtons({ email, phone }) {
  const buttons = [];

  if (phone) {
    buttons.push({ label: "Anrufen", href: `tel:${phone.replace(/\s+/g, "")}`, color: "#16243c" });
  }

  if (email) {
    buttons.push({ label: "E-Mail schreiben", href: `mailto:${email}`, color: "#2f6f4f" });
  }

  if (phone) {
    buttons.push({ label: "WhatsApp", href: `https://wa.me/${whatsappNumber(phone)}`, color: "#25d366" });
  }

  if (!buttons.length) {
    return "";
  }

  const cells = buttons
    .map(
      (button) => `
        <td style="padding:0 8px 0 0;">
          <a href="${escapeHtml(button.href)}" style="display:inline-block;background:${button.color};color:#ffffff;text-decoration:none;font-weight:600;font-size:14px;padding:12px 20px;border-radius:8px;">${escapeHtml(button.label)}</a>
        </td>
      `
    )
    .join("");

  return `
    <table style="border-collapse:collapse;margin:24px 0;">
      <tbody><tr>${cells}</tr></tbody>
    </table>
  `;
}

function buildEmail({ fields, subject, pageUrl, email, phone }) {
  const rows = fields
    .map(([label, value]) => {
      return `
        <tr>
          <th style="padding:12px 14px;text-align:left;border-bottom:1px solid #e6e8ec;color:#16243c;width:220px;">${escapeHtml(label)}</th>
          <td style="padding:12px 14px;border-bottom:1px solid #e6e8ec;color:#4b5563;">${escapeHtml(value).replace(/\n/g, "<br>")}</td>
        </tr>
      `;
    })
    .join("");

  const pageLabel = sourcePageLabel(pageUrl);
  const pageLink = pageUrl
    ? `<a href="${escapeHtml(pageUrl)}" style="color:#2f6f4f;text-decoration:none;">${escapeHtml(pageLabel)}</a>`
    : escapeHtml(pageLabel);

  const actionButtons = buildActionButtons({ email, phone });

  const text = [
    subject,
    `Ursprungs-Webseite: ${pageLabel}${pageUrl ? ` (${pageUrl})` : ""}`,
    "",
    ...fields.map(([label, value]) => `${label}: ${value}`),
  ].join("\n");

  return {
    html: `
      <div style="font-family:Inter,Arial,sans-serif;line-height:1.55;color:#4b5563;background:#f4f5f7;padding:32px 16px;">
        <div style="max-width:640px;margin:0 auto;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #e6e8ec;">
          <div style="background:#16243c;padding:28px 32px;text-align:center;">
            <img src="${LOGO_URL}" alt="Ledajess" width="56" height="56" style="display:block;margin:0 auto 12px;">
            <span style="color:#ffffff;font-size:13px;letter-spacing:0.04em;text-transform:uppercase;opacity:0.8;">Neue Anfrage über Ledajess</span>
          </div>
          <div style="padding:32px;">
            <h1 style="color:#16243c;font-size:22px;margin:0 0 8px;">${escapeHtml(subject)}</h1>
            <p style="margin:0 0 20px;font-size:14px;color:#6b7280;">Ursprungs-Webseite: ${pageLink}</p>
            ${actionButtons}
            <table style="border-collapse:collapse;width:100%;border:1px solid #e6e8ec;border-radius:8px;overflow:hidden;">
              <tbody>${rows}</tbody>
            </table>
          </div>
        </div>
      </div>
    `,
    text,
  };
}

module.exports = async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.CONTACT_TO_EMAIL;
  const from = process.env.CONTACT_FROM_EMAIL || "Ledajess <onboarding@resend.dev>";

  if (!apiKey || !to) {
    return res.status(500).json({
      error: "E-Mail-Versand ist noch nicht konfiguriert.",
      missing: {
        RESEND_API_KEY: !apiKey,
        CONTACT_TO_EMAIL: !to,
      },
    });
  }

  const body = normalizeBody(req);

  if (body.website) {
    return res.status(200).json({ ok: true });
  }

  if (!body.name || !body.message) {
    return res.status(400).json({ error: "Bitte füllen Sie die Pflichtfelder aus." });
  }

  const pageUrl = body.page || req.headers.referer || "";
  const pageLabel = sourcePageLabel(pageUrl);
  const source = body.source || "Kontaktformular";
  const subject = `Neue Ledajess Anfrage (${source})`;
  const fields = pickFields({
    ...body,
    page: pageUrl,
  });
  const email = buildEmail({
    fields,
    subject,
    pageUrl,
    email: body.email || "",
    phone: body.phone || "",
  });

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to,
      subject,
      html: email.html,
      text: email.text,
      reply_to: body.email || undefined,
    }),
  });

  if (!response.ok) {
    const details = await response.text();
    console.error("Resend error", details);
    return res.status(502).json({ error: "Die Anfrage konnte gerade nicht versendet werden." });
  }

  return res.status(200).json({ ok: true });
};
