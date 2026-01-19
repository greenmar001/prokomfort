export function stripWaVars(html: string) {
  return html.replace(/\{\$[^}]+\}/g, "");
}
