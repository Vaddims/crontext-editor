import { Entity, MeshRenderer, Simulation, SimulationInspectorRenderer, SimulationRenderer, Space, TransformMode, Vector } from "crontext";
import { Objectra } from "objectra";
import { useEffect, useMemo, useRef, useState } from "react";
import { openContextMenu } from "renderer/services/context-menu/context-menu";
import { newEntityContextMenuPrebuild } from "renderer/services/context-menu/prebuilds/new-entity.cmp";

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
  // const inspectorRenderer = useMemo(() => new SimulationInspectorRenderer(simulation), []);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [ renderer, setRenderer ] = useState<SimulationInspectorRenderer | null>(null);

  // useEffect(() => {
  //   if (canvasRef.current && simulation) {
  //     const sir = new SimulationInspectorRenderer(simulation);
  //     setRenderer(sir);
  //   }
  // }, [canvasRef.current, simulation]);

  useEffect(() => {
    if (!canvasRef.current) {
      return;
    }

    canvasRef.current.addEventListener('contextmenu', contextMenuHandler)
    return () => canvasRef.current?.removeEventListener('contextmenu', contextMenuHandler)
  })

  const contextMenuHandler = async (event: MouseEvent) => {
    if (!renderer) {
      return;
    }

    renderer.mouseDown = false;

    const sceneCoordinates = renderer.canvasPointToCoordinates(renderer.inspector.optic, new Vector(event.offsetX, event.offsetY));

    const entityCreationCmp = newEntityContextMenuPrebuild(renderer!, renderer!.inspector.optic, sceneCoordinates);
    

    const payload = await openContextMenu([
      {
        label: 'New Entity',
        submenu: entityCreationCmp.template,
      },
    ]);

    entityCreationCmp.handle(payload);

    // const response = await window.electron.ipcRenderer.openSIRContextMenu();
    // if (response && renderer) {
    //   const coords = renderer.canvasPointToCoordinates(renderer.inspector.optic, new Vector(event.offsetX, event.offsetY));
    //   createEntity(coords);
    // }
  }

  if (renderer) {
    renderer.renderFrame = !(window as any).crontext_editor_fullscreen
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

          try {
            Objectra.fromModel(model).compose();
          } catch (error) {
            const message = error instanceof Error ? error.message : error;
            alert(`Objectra could not reinstantiate primitive model. For safety scene will not be saved.\n${message}`)
            return;
          }

          await window.electron.ipcRenderer.writeJson('scene', JSON.stringify(model))
        }}>
            Save scene
        </button>
      </nav>
      {/* <canvas
        tabIndex={2}
        ref={canvasRef} 
        width={1920 / 2.8}
        height={1080 / 2.8}
      /> */}
    </section>
  )

  return {
    isLoading: !canvasRef.current && !renderer,
    renderer,
    render,
  } as EditorRendererConditionalResult;
}