import { SimulationRenderer } from "crontext";
import { useEffect, useRef, useState } from "react";

interface EditorRendererResult {
  isLoading: boolean;
  render: () => JSX.Element;
}

interface EditorRendererPendingResult extends EditorRendererResult {
  isLoading: true;
  renderer: null;
}

interface EditorRendererFulfilledResult extends EditorRendererResult {
  isLoading: false;
  renderer: SimulationRenderer;
}

type EditorRendererConditionalResult =  EditorRendererPendingResult | EditorRendererFulfilledResult;

export const useSimulationRenderer = (): EditorRendererConditionalResult => {
  const [ renderer, setRenderer ] = useState<SimulationRenderer | null>(null);
  const [ canvasElement, setCanvasElement ] = useState<HTMLCanvasElement | null>(null);

  const onCanvasMount = (providedCanvasElement: HTMLCanvasElement) => {
    if (providedCanvasElement && providedCanvasElement !== canvasElement) {
      setCanvasElement(providedCanvasElement);
      const simulationRenderer = new SimulationRenderer(providedCanvasElement);
      setRenderer(simulationRenderer);
    }
  }

  const render = () => (
    <section className="editor-visual-component renderer simulation-renderer">
      <canvas 
        tabIndex={1}
        id={renderer?.simulation.scene.name}
        ref={onCanvasMount} 
        width={1920 / 2.8}
        height={1080 / 2.8}
      />
    </section>
  )

  return {
    isLoading: !canvasElement && !renderer,
    renderer,
    render,
  } as EditorRendererConditionalResult;
}