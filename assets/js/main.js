(function () {
  function initMenu() {
    const toggle = document.querySelector(".menu-toggle");
    const nav = document.querySelector("#main-navigation");

    if (!toggle || !nav) {
      return;
    }

    function setOpen(isOpen) {
      toggle.setAttribute("aria-expanded", String(isOpen));
      toggle.setAttribute("aria-label", isOpen ? "Menü schließen" : "Menü öffnen");
      nav.classList.toggle("is-open", isOpen);
      document.body.classList.toggle("menu-open", isOpen);
    }

    toggle.addEventListener("click", () => {
      setOpen(toggle.getAttribute("aria-expanded") !== "true");
    });

    nav.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => setOpen(false));
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    });
  }

  function initReveal() {
    const elements = document.querySelectorAll(".reveal");

    if (!("IntersectionObserver" in window)) {
      elements.forEach((element) => element.classList.add("is-visible"));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.16 }
    );

    elements.forEach((element) => observer.observe(element));
  }

  function setFormMessage(form, message, type) {
    const output = form.querySelector(".form-message");

    if (!output) {
      return;
    }

    output.textContent = message;
    output.classList.toggle("is-error", type === "error");
    output.classList.toggle("is-success", type === "success");
  }

  function getFormPayload(form) {
    const formData = new FormData(form);
    const payload = {};

    formData.forEach((value, key) => {
      if (payload[key]) {
        payload[key] = `${payload[key]}, ${value}`;
        return;
      }

      payload[key] = value;
    });

    payload.page = window.location.href;

    return payload;
  }

  function initForms() {
    document.querySelectorAll("form").forEach((form) => {
      form.addEventListener("submit", async (event) => {
        event.preventDefault();

        const fields = form.querySelectorAll("input, select, textarea");
        fields.forEach((field) => field.classList.remove("field-error"));

        if (!form.checkValidity()) {
          const invalidField = form.querySelector(":invalid");

          if (invalidField) {
            invalidField.classList.add("field-error");
            invalidField.focus();
          }

          setFormMessage(form, "Bitte füllen Sie die markierten Pflichtfelder aus.", "error");
          return;
        }

        const button = form.querySelector('button[type="submit"]');
        const originalText = button ? button.textContent : "";

        if (button) {
          button.textContent = "Wird gesendet...";
          button.disabled = true;
        }

        setFormMessage(form, "Ihre Anfrage wird gesendet.", "");

        try {
          const response = await fetch("/api/contact", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(getFormPayload(form)),
          });

          const result = await response.json().catch(() => ({}));

          if (!response.ok) {
            throw new Error(result.error || "Die Anfrage konnte gerade nicht versendet werden.");
          }

          form.reset();
          setFormMessage(form, "Danke. Ihre Anfrage wurde versendet.", "success");
        } catch (error) {
          setFormMessage(form, error.message || "Die Anfrage konnte gerade nicht versendet werden.", "error");
        } finally {
          if (button) {
            button.textContent = originalText;
            button.disabled = false;
          }
        }
      });
    });
  }

  function initFaq() {
    const items = document.querySelectorAll(".faq-list details");

    items.forEach((item) => {
      item.addEventListener("toggle", () => {
        if (!item.open) {
          return;
        }

        items.forEach((otherItem) => {
          if (otherItem !== item) {
            otherItem.removeAttribute("open");
          }
        });
      });
    });
  }

  function initDynamicSeminarDates() {
    const tableBodies = document.querySelectorAll("[data-dynamic-seminar-dates]");

    if (!tableBodies.length) {
      return;
    }

    const statuses = [
      ["Plätze verfügbar", "status-open"],
      ["Wenige Plätze", "status-low"],
      ["Plätze verfügbar", "status-open"],
      ["Fast ausgebucht", "status-full"],
      ["Plätze verfügbar", "status-open"],
      ["Wenige Plätze", "status-low"],
    ];

    const formatDate = (date) => {
      const weekdays = ["So.", "Mo.", "Di.", "Mi.", "Do.", "Fr.", "Sa."];
      const day = String(date.getDate()).padStart(2, "0");
      const month = String(date.getMonth() + 1).padStart(2, "0");

      return `${weekdays[date.getDay()]} ${day}.${month}.${date.getFullYear()}`;
    };

    const today = new Date();
    const currentQuarter = Math.floor(today.getMonth() / 3);
    const nextQuarter = currentQuarter + 1;
    const year = today.getFullYear() + (nextQuarter > 3 ? 1 : 0);
    const quarterIndex = nextQuarter % 4;
    const quarterStart = new Date(year, quarterIndex * 3, 1);
    const quarterEnd = new Date(year, quarterIndex * 3 + 3, 0);
    const firstFriday = new Date(quarterStart);

    while (firstFriday.getDay() !== 5) {
      firstFriday.setDate(firstFriday.getDate() + 1);
    }

    tableBodies.forEach((tableBody) => {
      const city = tableBody.dataset.city || "Montabaur";
      const rows = [];

      for (let index = 0; index < statuses.length; index += 1) {
        const friday = new Date(firstFriday);
        friday.setDate(firstFriday.getDate() + index * 14);

        if (friday > quarterEnd) {
          break;
        }

        const sunday = new Date(friday);
        sunday.setDate(friday.getDate() + 2);

        const [label, className] = statuses[index];
        rows.push(`
          <tr>
            <td>${formatDate(friday)} - ${formatDate(sunday)}</td>
            <td>Wochenende</td>
            <td>${city}</td>
            <td><span class="status ${className}">${label}</span></td>
          </tr>
        `);
      }

      tableBody.innerHTML = rows.join("");
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    initMenu();
    initReveal();
    initForms();
    initFaq();
    initDynamicSeminarDates();
  });
})();
