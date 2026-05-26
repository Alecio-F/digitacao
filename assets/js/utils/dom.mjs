export function qs(selector, root = document) {
  return root?.querySelector?.(selector) || null;
}

export function qsa(selector, root = document) {
  return Array.from(root?.querySelectorAll?.(selector) || []);
}

export function on(element, event, handler, options) {
  if (!element) return () => {};
  element.addEventListener(event, handler, options);
  return () => element.removeEventListener(event, handler, options);
}

export function setText(selectorOrElement, text) {
  const element = typeof selectorOrElement === "string" ? qs(selectorOrElement) : selectorOrElement;
  if (element) element.textContent = text;
}
