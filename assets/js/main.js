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

  function initForms() {
    document.querySelectorAll("form").forEach((form) => {
      form.addEventListener("submit", (event) => {
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

        if (button) {
          const originalText = button.textContent;
          button.textContent = "Anfrage vorbereitet";
          button.disabled = true;

          window.setTimeout(() => {
            button.textContent = originalText;
            button.disabled = false;
          }, 2400);
        }

        setFormMessage(form, "Danke. Ihre Anfrage ist vorbereitet.", "success");
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

  document.addEventListener("DOMContentLoaded", () => {
    initMenu();
    initReveal();
    initForms();
    initFaq();
  });
})();
