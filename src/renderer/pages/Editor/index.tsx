import { useSimulationRenderer } from 'renderer/middleware/hooks/useSimulationRenderer';
import './editor.scss';
import { Entity, MeshRenderer, Simulation, SimulationInspectorRenderer, SimulationRenderer, Vector } from 'crontext';
import { createContext, useEffect, useState } from 'react';
import { useSimulationInspectorRenderer } from 'renderer/middleware/hooks/useSimulationInspectorRenderer';
import { Objectra } from 'objectra';
import SceneInspector from 'renderer/components/SceneInspector';
import { useComponentForceRerender } from 'renderer/middleware/hooks/useComponentForceRerender';
import Inspector from 'renderer/components/Inspector';
import '../../../crontext-components';

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

        // for (let i = 0; i < 50; i++) {
        //   const entity = simulationRenderer.simulation.scene.instantEntityInstantiation(new Entity())!;
        //   entity.components.add(MeshRenderer);
        //   entity.transform.position = Vector.random().multiply(100);
        //   entity.transform.rotation = Math.random();
        //   entity.transform.scale = Vector.random().multiply(2);
        // }
      }
    })()
  }, [simulationRendererIsLoading]);

  useEffect(() => {
    if (simulationInspectorRenderer) {
      const listener = (ents: Set<Entity>) => {
        forceRerender();
        const f = [...ents][0]?.id
        if (!f) {
          localStorage.removeItem('te');
          return;
        }
        
        localStorage.setItem('te', f)
      }

      setTimeout(() => {
        const id = localStorage.getItem('te');
        const entities = simulationRenderer!.simulation.scene.getEntities();
        const target = id !== null ? entities.find(entity => entity.id === id) : entities[0];
        if (!target) {
          return;
        }

        simulationInspectorRenderer?.inspector.selectEntities([target])
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