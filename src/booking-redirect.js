// The public landing page keeps its visual interaction, but all booking CTAs
// must enter the authenticated client flow backed by Laravel.
document.addEventListener(
  "click",
  (event) => {
    const target = event.target.closest?.(
      ".nav-book, .hero-actions .primary, .service-bottom button, .cta .primary",
    );
    if (target && !target.closest(".modal-backdrop")) {
      event.preventDefault();
      window.location.href = "/client.html?mode=register";
    }
  },
  true,
);
