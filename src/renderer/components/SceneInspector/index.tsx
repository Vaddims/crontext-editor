import { useContext, useEffect, useState } from 'react';
import { EditorContext } from 'renderer/pages/Editor';
import './scene-inspector.scss';
import SceneInspectorItem from '../SceneInspectorItem';
import { useComponentForceRerender } from 'renderer/middleware/hooks/useComponentForceRerender';
import { Entity } from 'crontext';

const SceneInspector = () => {
  const editorContext = useContext(EditorContext);

  const {
    simulation,
    inspector,
  } = editorContext.simulationInspectorRenderer ?? {};

  const hoistedEntities = editorContext.simulation.scene.getHoistedEntities();

  const forceRerender = useComponentForceRerender();

  useEffect(() => {
    setTimeout(() => forceRerender(), 200)
  }, []);

  useEffect(() => {
    if (!editorContext.simulationInspectorRenderer) {
      return;
    }

    const handler = (entities: Set<Entity>) => {
      forceRerender()
    }
    editorContext.simulationInspectorRenderer.inspector.addInspectEntityChangeListener(handler);
    return () => editorContext.simulationInspectorRenderer.inspector.removeInspectEntityChangeListener(handler);
  }, []);

  const handleSceneInspectorClick: React.MouseEventHandler<HTMLElement> = () => {
    const selectedEntities = inspector.getSelectedEntities();
    if (selectedEntities.size > 0) {
      inspector.selectEntities([]);
    }
  }

  const deleteAction = () => {
    const scene = editorContext.simulationInspectorRenderer.simulation.scene;
    const selectedEntities = inspector.getSelectedEntities();
    selectedEntities.forEach((entity) => {
      scene.instantResolve(scene.requestEntityDestruction(entity));
    });

    inspector.selectEntities([]);
  }

  const handleSceneInspectorKeyDown: React.KeyboardEventHandler<HTMLElement> = (event) => {
    switch(event.key.toUpperCase()) {
      case 'BACKSPACE':
        if (event.metaKey) {
          deleteAction();
        }
        break;
    }
  }

  const handleDragOver: React.DragEventHandler<HTMLDivElement> = (event) => {
    event.preventDefault();
  }

  const handleSceneInspectorItemsDrop: React.DragEventHandler<HTMLDivElement> = (event) => {
    if (!simulation) {
      return;
    }

    event.preventDefault()
    const scene = simulation.scene;

    const id = event.dataTransfer.getData("entity/text");
    if (scene.getHoistedEntities().some(entity => entity.id === id)) {
      return;
    }

    const target = scene.getEntities().find(entity => entity.id === id)!;
    scene.instantResolve(scene.requestEntityTransformation(target, null));
    editorContext.forceRerender()
  }

  return (
    <section
      className='editor-visual-component scene-inspector'
      onClick={handleSceneInspectorClick}
      onKeyDown={handleSceneInspectorKeyDown}
      tabIndex={1} // To use key events
    >
      <header>
        <h3>Scene</h3>
      </header>
      <div 
        className='items'
        onDragOver={handleDragOver}
        onDrop={handleSceneInspectorItemsDrop}
      >
        {hoistedEntities.map(entity => (
          <SceneInspectorItem key={entity.id} entity={entity} nestLevel={0} />
        ))}
      </div>
    </section>
  )
}

export default SceneInspector;