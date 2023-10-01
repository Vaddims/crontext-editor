import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowsUpDownLeftRight, faBox, faQuestion, faSearch, faShapes } from '@fortawesome/free-solid-svg-icons';
import { createContext, useContext, useRef, useState } from 'react';
import { EditorContext } from 'renderer/pages/Editor';
import InspectorModule from '../InspectorModule';
import { Component, Engine, Entity } from 'crontext';
import './inspector.scss';
import { useComponentForceRerender } from 'renderer/middleware/hooks/useComponentForceRerender';
import useSelectInputField from 'renderer/hooks/inputField/useSelectInputField';
import useTextInputField from 'renderer/hooks/inputField/useTextInputField';
import useCheckboxInputField from 'renderer/hooks/inputField/useCheckboxInputField';

export interface InspectorContextState {
  entity: Entity;
  forceRerender: () => void;
}

export const InspectorContext = createContext<InspectorContextState>({
  entity: null as any,
  forceRerender: () => void 0,
})

const Inspector: React.FC = () => {
  const editorContext = useContext(EditorContext);
  const rerender = useComponentForceRerender();
  const [ findComponentState, setFindComponentState ] = useState(false);
  const { inspector } = editorContext.simulationInspectorRenderer ?? {};
  const ref = useRef<HTMLElement>(null);

  const entity = [...inspector.selectedEntities][0];

  const tagSelectInput = useSelectInputField({
    fieldProps: {
      className: 'entity-tag-field',
    },
    inputPrefix: 'Tag:',
    options: [],
  })

  const labelSelectInput = useSelectInputField({
    options: [],
    inputPrefix: 'Layer:',
    fieldProps: {
      className: 'entity-layer-field',
    },
  })

  const textInput = useTextInputField({
    placeholder: 'Find Component',
    inputIcon: faSearch,
    // focusOnMount: true,
  });

  // TODO Change to enable entity
  const useEntityCheckbox = useCheckboxInputField({
    fieldProps: {
      className: 'enable-entity-checkbox',
    },
    value: true,
  });

  const nameInput = useTextInputField({
    inputPrefix: 'Name:',
    fieldProps: {
      className: 'entity-name-field',
    },
    value: entity?.name ?? '',
    trackValue: true,
    onChange: (name) => {
      if (!entity) {
        return;
      }

      entity.name = name;
      editorContext.forceRerender()
    }
  });

  const componentConstructors = Engine.getInheritedConstructors(Component);
  const unappliedComponentConstructors = entity ? componentConstructors
    .filter(componentConstructor => (
      componentConstructor.name.toLowerCase().includes(textInput.value.toLowerCase()) &&
      !entity.components.find(componentConstructor)
    )) : [];

  if (!inspector || inspector.selectedEntities.size !== 1) {
    return (
      <section className='editor-visual-component inspector' />
    )
  }

  return (
    <section className='editor-visual-component inspector'
    ref={ref}
    >
      <header>
        <FontAwesomeIcon icon={faShapes} className='entity-icon' />
        {useEntityCheckbox.render()}
        {nameInput.render()}
        {tagSelectInput.render()}
        {labelSelectInput.render()}
      </header>
      <main onClick={(event) => {
        setFindComponentState(false)
        textInput.clearValue();
      }}
      >
        <InspectorContext.Provider value={{ entity, forceRerender: rerender }}>
          <InspectorModule component={entity.transform} />
          {[...entity.components.instances()].map(component => (
            <InspectorModule component={component} key={component.constructor.name} />
          ))}
        </InspectorContext.Provider>
        <button 
          className='add-component-action' 
          aria-hidden={findComponentState}
          onClick={(event) => {
            event.stopPropagation()
            setFindComponentState(true)
          }}
        >Add Component</button>

        <div aria-hidden={!findComponentState} className='component-management' onClick={(event) => event.stopPropagation()}>
          {textInput.render()}
          <div className='component-viewer' ref={(reff) => {
            if (!reff || !ref.current || !findComponentState) {
              return;
            }

            ref.current.scrollBy({
              top: 1000,
              behavior: 'smooth',
            })
          }}>
            {unappliedComponentConstructors.length > 0 ? unappliedComponentConstructors.map((componentConstructor) => (
              <div 
                className='component-viewer-item' 
                key={componentConstructor.name}
                onClick={() => {
                  setFindComponentState(false)
                  textInput.clearValue();
                  const selectedEntity = [...editorContext.simulationInspectorRenderer.inspector.selectedEntities][0];
                  editorContext.simulationRenderer.simulation.scene.instantResolve(selectedEntity.components.add(componentConstructor))
                }}
              >
                <FontAwesomeIcon icon={faQuestion} />
                <span>{componentConstructor.name}</span>
              </div>
            )) : (
              <div className='empty-text-wrapper'>
                <span>No components found</span>
              </div>
            )}
          </div>
        </div>
      </main>
    </section>
  )
}

export default Inspector;