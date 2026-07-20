(function () {
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
      { threshold: 0.14 }
    );

    elements.forEach((element) => observer.observe(element));
  }

  function initForms() {
    document.querySelectorAll("form").forEach((form) => {
      form.addEventListener("submit", (event) => {
        event.preventDefault();
        const button = form.querySelector('button[type="submit"]');

        if (!button) {
          return;
        }

        const originalText = button.textContent;
        button.textContent = "Anfrage vorbereitet";
        button.disabled = true;

        window.setTimeout(() => {
          button.textContent = originalText;
          button.disabled = false;
        }, 2400);
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
    initReveal();
    initForms();
    initFaq();
  });
})();
