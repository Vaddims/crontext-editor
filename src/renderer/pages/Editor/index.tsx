import { useSimulationRenderer } from 'renderer/middleware/hooks/useSimulationRenderer';
import './editor.scss';
import { Entity, MeshRenderer, Simulation, SimulationInspectorRenderer, SimulationRenderer, Space, TransformMode, Vector } from 'crontext';
import { createContext, useEffect, useMemo, useState } from 'react';
import { useSimulationInspectorRenderer } from 'renderer/middleware/hooks/useSimulationInspectorRenderer';
import { Objectra } from 'objectra';
import SceneInspector from 'renderer/components/SceneInspector';
import { useComponentForceRerender } from 'renderer/middleware/hooks/useComponentForceRerender';
import Inspector from 'renderer/components/Inspector';
import '../../../crontext-components';
import RendererDisplayer from 'renderer/components/RendererDisplayer';
import { nativeImage } from 'electron';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowsMaximize, faArrowsUpDownLeftRight, faExpand, faGlobe, faMapPin, faPause, faPlay, faRotate, faSidebar, faTextSize } from '@danieloi/pro-light-svg-icons';
import { faCompassDrafting } from '@fortawesome/free-solid-svg-icons';
import AppTitleBar from 'renderer/layouts/AppTitleBar';

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

const tryLoadLocallySavedScene = async (simulation: Simulation) => {
  try {
    const sceneModel = await window.electron.ipcRenderer.readJson('scene');
    if (sceneModel) {
      const scene = Objectra.fromModel(sceneModel).compose();
      const loadedScene = simulation.loadScene(scene);
      loadedScene['recacheSpatialPartition']();
    }
  } catch {}
}

const instantiateSimulationRenderer = () => {
  const simulationRenderer = new SimulationRenderer();
  tryLoadLocallySavedScene(simulationRenderer.simulation);
  // simulationRenderer.simulation.start();
  return simulationRenderer;
}

const instantiateSimulationInspectorRenderer = (simulationRenderer: SimulationRenderer) => {
  const simulationInspectorRenderer = new SimulationInspectorRenderer(simulationRenderer.simulation)
  // simulationInspectorRenderer.renderFrame = false;
  return simulationInspectorRenderer;
}

const Editor: React.FC = () => {
  const [isSidebarCollapsed, setSidebarCollapsed] = useState(true);
  const [ rendererWrapper, setRendererWrapper ] = useState<HTMLDivElement>();
  const forceRerender = useComponentForceRerender();

  const [simulationRenderer] = useState(instantiateSimulationRenderer);
  const [simulationInspectorRenderer] = useState(instantiateSimulationInspectorRenderer(simulationRenderer));

  // useEffect(() => {
  //   const handler = () => {
  //     console.log('now')
  //     forceRerender();
  //   }

  //   simulationRenderer.simulation.scene.subs.add(handler);
  //   return () => {
  //     simulationRenderer.simulation.scene.subs.delete(handler)
  //   };
  // }, []);

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

  const handleSceneSave = async () => {
    if (!simulationRenderer) {
      throw new Error('could not save, renderer is undefined');
    }
    
    const obj = Objectra.from(simulationRenderer.simulation.scene);
    const model = obj.toModel();

    try {
      Objectra.fromModel(model).compose();
      new Notification('Scene saved', {
        silent: true,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : error;
      alert(`Objectra could not reinstantiate primitive model. For safety scene will not be saved.\n${message}`)
      return;
    }

    await window.electron.ipcRenderer.writeJson('scene', JSON.stringify(model))
  }

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if (event.metaKey && event.key.toUpperCase() === 'S') {
        handleSceneSave();
      }
    };

    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  const handleSidebarToggle = () => {
    setSidebarCollapsed((state) => !state);
  }

  const handleSimulationPlay = () => {
    (window as any).canvas_bigpicture = !((window as any).canvas_bigpicture ?? false);
    forceRerender()
  }

  const handleSimulationRendererCanvasWrapperMount = (element: HTMLDivElement) => {
    setRendererWrapper(element);
  }

  const handleInspectorTransformModeClick = (mode: TransformMode) => {
    return () => {
      simulationInspectorRenderer.inspector.transformMode = mode;
      forceRerender();
    }
  }

  const createTransformModeControllerProps = (mode: TransformMode) => {
    return {
      size: 'lg',
      className: 'controller',
      onClick: handleInspectorTransformModeClick(mode),
      ['aria-selected']: simulationInspectorRenderer.inspector.transformMode === mode, 
    } as const;
  }

  const handleSpaceModeClick = (space: Space) => {
    return () => {
      simulationInspectorRenderer.inspector.transformSpace = space;
      forceRerender();
    }
  }

  const createSpaceModeControllerProps = (space: Space) => {
    return {
      size: 'lg',
      className: 'controller',
      onClick: handleSpaceModeClick(space),
      ['aria-selected']: simulationInspectorRenderer.inspector.transformSpace === space, 
    } as const;
  }

  return (
    <main className='editor'>
      <header className='app sidebar-header' aria-hidden={isSidebarCollapsed}>
        <FontAwesomeIcon className='toggler' icon={faSidebar} onClick={handleSidebarToggle}/>
      </header>
      <div className='app sidebar' aria-hidden={isSidebarCollapsed}>
        <section>
          <h3>Project Name</h3>
          <div className='option'>
            <FontAwesomeIcon  size='xs' icon={faCompassDrafting} />
            <span>Editor</span>
          </div>
          <h3></h3>
        </section>
      </div>

      <section className='content'>
        <AppTitleBar>
          <div></div>
          <div className='simulation-controls'>
            <FontAwesomeIcon icon={faPause} size='lg' className='simulation-control pause' title='Pause Simulation' />
            <FontAwesomeIcon icon={faPlay} size='lg' className='simulation-control play' title='Start Simulation' onClick={handleSimulationPlay} />
          </div>
          <div></div>
        </AppTitleBar>

        <main>
          <RendererDisplayer
            bigpicture={(window as any).canvas_bigpicture}
            className='editor-visual-component renderer simulation-renderer' 
            renderer={simulationRenderer}
            onMount={handleSimulationRendererCanvasWrapperMount}
          />
          <RendererDisplayer 
            className='editor-visual-component renderer simulation-inspector-renderer' 
            renderer={simulationInspectorRenderer}
          >
            <div className='control-floater'>
              <div className='transformation-controlers controllers'>
                <FontAwesomeIcon 
                  icon={faArrowsUpDownLeftRight} 
                  title='Translate' 
                  {...createTransformModeControllerProps(TransformMode.Position)}
                />
                <FontAwesomeIcon 
                  icon={faArrowsMaximize} 
                  title='Scale'
                  {...createTransformModeControllerProps(TransformMode.Scale)}
                />
                <FontAwesomeIcon 
                  icon={faRotate} 
                  title='Rotate'
                  {...createTransformModeControllerProps(TransformMode.Rotation)}
                />
              </div>
              <hr />
              <div className='space-controllers controllers'>
                <FontAwesomeIcon
                  icon={faGlobe}
                  {...createSpaceModeControllerProps(Space.global)}
                />
                <FontAwesomeIcon
                  icon={faMapPin}
                  {...createSpaceModeControllerProps(Space.local)}
                />
              </div>
            </div>
          </RendererDisplayer>
          <EditorContext.Provider value={{
            simulationRenderer: simulationRenderer,
            simulation: simulationRenderer.simulation,
            simulationInspectorRenderer: simulationInspectorRenderer,
            forceRerender,
          }}>
            <SceneInspector />
            <Inspector />
          </EditorContext.Provider>
        </main>
      </section>
    </main>
  );
}

export default Editor;