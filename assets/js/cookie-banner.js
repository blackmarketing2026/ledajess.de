// Minimalistischer Cookie-Consent-Banner (Grundgerüst, ohne Design)
// Speichert die Entscheidung in localStorage unter "cookieConsent": "accepted" | "declined"

(function () {
  const CONSENT_KEY = "cookieConsent";

  function getConsent() {
    return localStorage.getItem(CONSENT_KEY);
  }

  function setConsent(value) {
    localStorage.setItem(CONSENT_KEY, value);
  }

  function createBanner() {
    const banner = document.createElement("div");
    banner.id = "cookie-banner";
    banner.setAttribute("role", "dialog");
    banner.setAttribute("aria-label", "Cookie-Hinweis");

    banner.innerHTML = `
      <p>
        Diese Website verwendet Cookies. Weitere Informationen findest du in unserer
        <a href="datenschutz.html">Datenschutzerklärung</a>.
      </p>
      <div class="cookie-banner-actions">
        <button type="button" id="cookie-accept">Akzeptieren</button>
        <button type="button" id="cookie-decline">Ablehnen</button>
      </div>
    `;

    document.body.appendChild(banner);

    document.getElementById("cookie-accept").addEventListener("click", function () {
      setConsent("accepted");
      banner.remove();
    });

    document.getElementById("cookie-decline").addEventListener("click", function () {
      setConsent("declined");
      banner.remove();
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    if (!getConsent()) {
      createBanner();
    }
  });
})();
