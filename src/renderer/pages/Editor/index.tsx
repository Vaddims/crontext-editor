import { useSimulationRenderer } from 'renderer/middleware/hooks/useSimulationRenderer';
import './editor.scss';
import { Simulation, SimulationInspectorRenderer, SimulationRenderer } from 'crontext';
import { createContext, useEffect } from 'react';
import { useSimulationInspectorRenderer } from 'renderer/middleware/hooks/useSimulationInspectorRenderer';
import { Objectra } from 'objectra';
import SceneInspector from 'renderer/components/SceneInspector';
import { useComponentForceRerender } from 'renderer/middleware/hooks/useComponentForceRerender';
import Inspector from 'renderer/components/Inspector';

export interface EditorContextState {
  simulation: Simulation;
  simulationRenderer: SimulationRenderer;
  simulationInspectorRenderer: SimulationInspectorRenderer;
  forceRerender: () => void;
}

export const EditorContext = createContext<EditorContextState>({
  simulation: null as any,
  simulationRenderer: null as any,
  simulationInspectorRenderer: null as any
} as any);

const Editor: React.FC = () => {
  const forceRerender = useComponentForceRerender();

  const {
    isLoading: simulationRendererIsLoading,
    render: renderSimulation,
    renderer: simulationRenderer,
  } = useSimulationRenderer();

  const {
    isLoading: simulationInspectorRendererIsLoading,
    render: renderSimulationInspector,
    renderer: simulationInspectorRenderer,
  } = useSimulationInspectorRenderer(simulationRenderer?.simulation ?? null);

  useEffect(() => {
    (async () => {
      if (!simulationRendererIsLoading) {
        const sceneModel = await window.electron.ipcRenderer.readJson('scene'); 
        if (sceneModel) {
          const scene = Objectra.fromModel(sceneModel).compose();
          simulationRenderer.simulation.loadScene(scene);
        }

        simulationRenderer.simulation.start();
      }
    })()
  }, [simulationRendererIsLoading]);

  useEffect(() => {
    if (simulationInspectorRenderer) {
      const listener = () => {
        forceRerender();
      }

      setTimeout(() => {
        const firstEntity = simulationRenderer!.simulation.scene.getEntities()[0];
        if (!firstEntity) {
          return;
        }

        simulationInspectorRenderer?.inspector.selectEntities([firstEntity])
      }, 200)

      simulationInspectorRenderer.inspector.addInspectEntityChangeListener(listener);
      return () => simulationInspectorRenderer.inspector.removeInspectEntityChangeListener(listener);
    }
  }, [simulationInspectorRenderer]);

  return (
    <main className='editor'>
      {renderSimulation()}
      {renderSimulationInspector()}
      {simulationRenderer && simulationInspectorRenderer && (
        <EditorContext.Provider value={{
          simulationRenderer: simulationRenderer,
          simulation: simulationRenderer.simulation,
          simulationInspectorRenderer: simulationInspectorRenderer,
          forceRerender,
        }}>
          <SceneInspector />
          <Inspector />
        </EditorContext.Provider>
      )}
    </main>
  );
}

export default Editor;