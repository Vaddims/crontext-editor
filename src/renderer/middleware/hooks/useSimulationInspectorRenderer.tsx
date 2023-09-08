import { Entity, MeshRenderer, Simulation, SimulationInspectorRenderer, SimulationRenderer, Space, TransformMode, Vector } from "crontext";
import { Objectra } from "objectra";
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
  renderer: SimulationInspectorRenderer;
}

type EditorRendererConditionalResult =  EditorRendererPendingResult | EditorRendererFulfilledResult;

export const useSimulationInspectorRenderer = (simulation: Simulation | null): EditorRendererConditionalResult => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [ renderer, setRenderer ] = useState<SimulationInspectorRenderer | null>(null);

  useEffect(() => {
    if (canvasRef.current && simulation) {
      const sir = new SimulationInspectorRenderer(canvasRef.current, simulation);
      setRenderer(sir);
    }
  }, [canvasRef.current, simulation]);

  useEffect(() => {
    if (!canvasRef.current) {
      return;
    }

    canvasRef.current.addEventListener('contextmenu', contextMenuHandler)
    return () => canvasRef.current?.removeEventListener('contextmenu', contextMenuHandler)
  })

  const createEntity = (position = Vector.zero) => {
    if (!renderer) {
      return;
    }

    const entity = renderer.simulation.scene.instantEntityInstantiation(new Entity())!;
    entity.components.add(MeshRenderer);
    entity.transform.position = position;
  }

  const contextMenuHandler = async (event: MouseEvent) => {
    if (renderer) {
      renderer.mouseDown = false
    }

    const response = await window.electron.ipcRenderer.openSIRContextMenu();
    if (response && renderer) {
      const coords = renderer.canvasPointToCoordinates(renderer.inspector.optic, new Vector(event.offsetX, event.offsetY));
      createEntity(coords);
    }
  }

  const render = () => (
    <section className="editor-visual-component renderer simulation-inspector-renderer">
      <nav>
        <button onClick={() => renderer!.inspector.transformMode = TransformMode.Position}>Translate</button>
        <button onClick={() => renderer!.inspector.transformMode = TransformMode.Rotation}>Rotate</button>
        <button onClick={() => renderer!.inspector.transformMode = TransformMode.Scale}>Scale</button>
        <button onClick={() => renderer!.inspector.transformSpace = Space.global}>World</button>
        <button onClick={() => renderer!.inspector.transformSpace = Space.local}>Local</button>
        <button onClick={() => console.log(renderer!.simulation.scene)}>Show scene</button>
        <button onClick={async () => {
          if (!renderer) {
            throw new Error('could not save, renderer is undefined');
          }
          
          const obj = Objectra.from(renderer.simulation.scene);
          const model = obj.toModel();
          await window.electron.ipcRenderer.writeJson('scene', JSON.stringify(model))
        }}>
            Save scene
        </button>
      </nav>
      <canvas
        tabIndex={2}
        ref={canvasRef} 
        width={1920 / 2.8}
        height={1080 / 2.8}
      />
    </section>
  )

  return {
    isLoading: !canvasRef.current && !renderer,
    renderer,
    render,
  } as EditorRendererConditionalResult;
}