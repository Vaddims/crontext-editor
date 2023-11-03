import { Entity } from 'crontext-engine';
import './scene-inspector-item.scss';
import { useContext, useEffect, useState, Fragment } from "react";
import { EditorContext } from "renderer/pages/Editor";
import { useComponentForceRerender } from "renderer/middleware/hooks/useComponentForceRerender";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAngleRight } from "@fortawesome/free-solid-svg-icons";
import { getTextWidth } from "renderer/utilities/text-mesurement";

export interface SceneInspectorItemProps {
  readonly entity: Entity;
  readonly nestLevel: number;
  readonly collapsed?: boolean;
}

const SceneInspectorItem = (props: SceneInspectorItemProps) => {
  const { entity } = props;
  const editorContext = useContext(EditorContext);
  const [ useNameChanger, setNameChangerStatus ] = useState(false)
  const [ childrenShouldCollapse, setChildrenShouldCollapse ] = useState(false);
  const forceRerender = useComponentForceRerender();

  const scene = editorContext.simulation.scene;

  const {
    inspector,
  } = editorContext.simulationInspectorRenderer;

  const entityChildren = entity.getChildren();

  const handleSceneInspectorItemMouseDown: React.MouseEventHandler<HTMLDivElement> = (event) => {
    event.stopPropagation();
    const selectedEntities = inspector.getSelectedEntities();

    if (selectedEntities.has(entity)) {
      if (event.metaKey) {
        selectedEntities.delete(entity);
      }

      selectedEntities.clear();
      selectedEntities.add(entity)
    } else {
      if (event.metaKey) {
        selectedEntities.add(entity);
      } else {
        selectedEntities.clear();
        selectedEntities.add(entity);
      }
    }

    inspector.selectEntities(selectedEntities);
  }

  const uncolapseSelectedChildrenTree = (selectedEntities: Set<Entity>) => {
    const flattenChildren = entity.getFlattenChildren();
    for (const child of flattenChildren) {
      for (const selectedEntity of selectedEntities) {
        if (child === selectedEntity) {
          setChildrenShouldCollapse(false);
        }
      }
    }

    forceRerender()
  }

  useEffect(() => {
    const handler = (ev: MouseEvent) => {
      setNameChangerStatus(false);
    }

    document.addEventListener('click', handler);
    return () => document.removeEventListener('click', handler);
  }, [])

  useEffect(() => {
    editorContext.simulationInspectorRenderer.inspector.addInspectEntityChangeListener(uncolapseSelectedChildrenTree);
    return () => editorContext.simulationInspectorRenderer.inspector.removeInspectEntityChangeListener(uncolapseSelectedChildrenTree);
  }, []);

  const handleSceneInspectorItemClick: React.MouseEventHandler<HTMLDivElement> = (event) => {
    event.stopPropagation()
  }

  const handleinspectorItemDragStart: React.DragEventHandler<HTMLDivElement> = (event) => {
    event.dataTransfer.setData("entity/text", entity.id);
  }

  const handleInspectorItemDragOver: React.DragEventHandler<HTMLDivElement> = (event) => {
    event.preventDefault();
  }

  const handleInspectorItemDrop: React.DragEventHandler<HTMLDivElement> = (event) => {
    event.preventDefault()
    event.stopPropagation()
    const id = event.dataTransfer.getData("entity/text");
    if (id === entity.id) {
      return;
    }

    const target = scene.getEntities().find(entity => entity.id === id)!;
    scene.instantResolve(scene.requestEntityTransformation(target, entity))
    editorContext.forceRerender()
  }

  const handleInspectorItemDoubleClick: React.MouseEventHandler<HTMLDivElement> = (event) => {
    event.stopPropagation();
    setNameChangerStatus(true);
  }

  const handleItemCollapserMouseDown: React.MouseEventHandler<HTMLButtonElement> = (event) => {
    event.stopPropagation();
    event.preventDefault()
    setChildrenShouldCollapse((state) => !state);
  }

  const handleItemCollapserDoubleClick: React.MouseEventHandler<HTMLButtonElement> = (event) => {
    event.stopPropagation();
  }

  const handleEntityNameReferenceReceive: React.LegacyRef<HTMLInputElement> = (event) => {
    event?.focus()
  }

  const handleEntityNameChange: React.ChangeEventHandler<HTMLInputElement> = (event) => {
    entity.name = event.target.value;
    editorContext.forceRerender()
  }

  const sceneInspectorItemStyle: React.CSSProperties = {
    paddingLeft: `${1 + props.nestLevel * 1}rem`,
  }

  const entityNameInputStyle: React.CSSProperties = {
    width: `calc(.6rem + ${getTextWidth(entity.name)}px)`,
  }

  return (
    <Fragment>
      <div 
        className="scene-inspector-item"
        aria-hidden={props.collapsed}
        style={sceneInspectorItemStyle}
        aria-selected={inspector.getSelectedEntities().has(entity)}
        aria-level={props.nestLevel}
        onMouseDown={handleSceneInspectorItemMouseDown}
        onClick={handleSceneInspectorItemClick}
        onDragStart={handleinspectorItemDragStart}
        onDragOver={handleInspectorItemDragOver}
        onDrop={handleInspectorItemDrop}
        onDoubleClick={handleInspectorItemDoubleClick}
        draggable={!useNameChanger}
      >
        <button 
          className="collapse-action"
          aria-hidden={entity.getChildren().length === 0}  
          aria-orientation={childrenShouldCollapse ? 'horizontal' : 'vertical'}
          onMouseDown={handleItemCollapserMouseDown}
          onDoubleClick={handleItemCollapserDoubleClick}
        >
          <FontAwesomeIcon icon={faAngleRight} className="collapse-icon" />
        </button>
        <input
          data-state={(forceRerender as any).state}
          className="entity-name-input" 
          ref={handleEntityNameReferenceReceive}
          onChange={handleEntityNameChange}
          value={entity.name}
          style={entityNameInputStyle}
          disabled={!useNameChanger}
        />
      </div>
      {entityChildren.map((entity) => (
        <SceneInspectorItem
          collapsed={childrenShouldCollapse || props.collapsed}
          key={entity.id} 
          entity={entity}  
          nestLevel={props.nestLevel + 1} 
        />
      ))}
    </Fragment>
  )
}

export default SceneInspectorItem;
