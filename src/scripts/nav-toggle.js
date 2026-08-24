export function nextAriaExpanded(current) {
  return current === "true" ? "false" : "true";
}

export function initNavToggle() {
  const toggle = document.querySelector("[data-nav-toggle]");
  const menu = document.querySelector("[data-nav-menu]");
  if (!toggle || !menu) return;

  toggle.addEventListener("click", () => {
    const expanded = toggle.getAttribute("aria-expanded") ?? "false";
    const next = nextAriaExpanded(expanded);
    toggle.setAttribute("aria-expanded", next);
    menu.toggleAttribute("data-open", next === "true");
  });
}
