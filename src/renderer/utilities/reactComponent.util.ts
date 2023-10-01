import { FalsyType } from "./types";

export const composeClassNames = (...classNames: (string | FalsyType)[]) => (
  classNames.filter(className => !!className).join(' ')
);

export const hasChildElement = (element: Element, targetElement: Element): boolean => {
  if (element === targetElement) {
    return true;
  }

  return Array.from(element.children).some((child) => hasChildElement(child, targetElement));
}