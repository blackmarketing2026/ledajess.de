const FIELD_LABELS = {
  name: "Name",
  company: "Unternehmen",
  role: "Rolle / Position",
  email: "E-Mail",
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

function buildEmail(fields, subject) {
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

  const text = fields.map(([label, value]) => `${label}: ${value}`).join("\n");

  return {
    html: `
      <div style="font-family:Inter,Arial,sans-serif;line-height:1.55;color:#4b5563;">
        <h1 style="color:#16243c;font-size:24px;margin:0 0 18px;">${escapeHtml(subject)}</h1>
        <table style="border-collapse:collapse;width:100%;max-width:760px;border:1px solid #e6e8ec;">
          <tbody>${rows}</tbody>
        </table>
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

  const source = body.source || "Kontaktformular";
  const subject = `Neue Ledajess Anfrage: ${source}`;
  const fields = pickFields({
    ...body,
    page: body.page || req.headers.referer || "",
  });
  const email = buildEmail(fields, subject);

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
