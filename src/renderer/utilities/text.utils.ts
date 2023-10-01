export function splitCaseMixedString(text: string) {
  const validText = text.charAt(0).toUpperCase() + text.slice(1);
  const parts = validText.split(/([A-Z][a-z]+)/);
  const textParts = parts.filter(part => !!part) // remove empty parts
  return textParts;
}
