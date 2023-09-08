import { constants } from "renderer/config/constants";

const textMesurementCanvas = document.createElement("canvas");
const textMesurementCanvasContext = textMesurementCanvas.getContext("2d")!;
export function getTextWidth(text: string, font = `${constants.page.font.size} ${constants.page.font.family}`) {
  textMesurementCanvasContext.font = font;
  const metrics = textMesurementCanvasContext.measureText(text);
  return metrics.width;
}