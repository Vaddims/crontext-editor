import { SimulationRenderer, Vector } from "crontext";
import { useContext, useEffect, useRef, useState } from "react";
import { EditorContext } from "renderer/pages/Editor";

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
  const [ fullscreen, setFullscreen ] = useState(false);

  const onCanvasMount = (providedCanvasElement: HTMLCanvasElement) => {
    if (providedCanvasElement && providedCanvasElement !== canvasElement) {
      setCanvasElement(providedCanvasElement);
      const simulationRenderer = new SimulationRenderer(providedCanvasElement);
      setRenderer(simulationRenderer);
    }
  }

  useEffect(() => {
    const listener = (event: KeyboardEvent) => {
      if (event.ctrlKey && event.key.toUpperCase() === 'F') {
        setFullscreen((state) => !state);
      }
    }

    document.addEventListener('keyup', listener);
    return () => document.removeEventListener('keydown', listener);
  }, []);

  const normal = new Vector(1920, 1080).divide(2.8);
  const fullscreenSize = new Vector(window.innerWidth, window.innerHeight);
  const size = fullscreen ? fullscreenSize : normal;

  const render = () => (
    <section className="editor-visual-component renderer simulation-renderer" data-fullscreen={fullscreen}>
      <canvas 
        tabIndex={1}
        id={renderer?.simulation.scene.name}
        ref={onCanvasMount} 
        width={size.x}
        height={size.y}
      />
    </section>
  )

  return {
    isLoading: !canvasElement && !renderer,
    renderer,
    render,
  } as EditorRendererConditionalResult;
}