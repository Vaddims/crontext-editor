import { SimulationRenderer, Vector } from "crontext";
import { useContext, useEffect, useMemo, useRef, useState } from "react";
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
  const renderer = useMemo(() => new SimulationRenderer(), []);
  const [ canvasElement, setCanvasElement ] = useState<HTMLCanvasElement | null>(null);
  const [ fullscreen, setFullscreen ] = useState(false);
  const wrapperRef = useRef<HTMLElement>(null);
  (window as any).crontext_editor_fullscreen = fullscreen;

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
  // const size = normal

  const render = () => (
    <section 
      className="editor-visual-component renderer simulation-renderer" 
      data-fullscreen={fullscreen} 
      dangerouslySetInnerHTML={renderer ? {__html: renderer.canvas}: undefined}
      ref={wrapperRef}
    >
    </section>
  )

  return {
    isLoading: !canvasElement && !renderer,
    renderer,
    render,
  } as EditorRendererConditionalResult;
}