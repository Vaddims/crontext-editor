import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { EditorContext } from 'renderer/pages/Editor';
import InspectorModule from '../InspectorModule';
import { Component, Engine, Entity } from 'crontext-engine';
import './inspector.scss';
import { useComponentForceRerender } from 'renderer/middleware/hooks/useComponentForceRerender';
import useSelectInputField from 'renderer/hooks/inputField/useSelectInputField';
import useTextInputField from 'renderer/hooks/inputField/useTextInputField';
import useCheckboxInputField from 'renderer/hooks/inputField/useCheckboxInputField';
import { Constructor } from 'objectra/dist/types/util.types';
import { EditorInspector } from 'renderer/services/inspector/editor-inspector';
import { faFileCode, faSearch, faShapes } from '@danieloi/pro-light-svg-icons';

export interface InspectorContextState {
  entity: Entity;
  forceRerender: () => void;
}

export const InspectorContext = createContext<InspectorContextState>({
  entity: null as any,
  forceRerender: () => void 0,
})

const ComponentRepresenter = (props: { componentConstructor: Constructor<Component>, entity: Entity }) => {
  const { entity } = props;
  const Inspector = EditorInspector.getConstuctorInspector(props.componentConstructor) as typeof EditorInspector | null;

  const s = useContext(EditorContext);

  const handleRepresenterClick = () => {
    entity.components.add(props.componentConstructor).resolve();
    s.forceRerender();
  }

  return (
    <div className='component-representer' onClick={handleRepresenterClick}>
      <FontAwesomeIcon icon={Inspector?.[EditorInspector.icon] ?? faFileCode} className='icon' size='2x' />
      <span>{props.componentConstructor.name}</span>
    </div>
  )
}

const Inspector: React.FC = () => {
  const editorContext = useContext(EditorContext);
  const rerender = useComponentForceRerender();
  const [ findComponentState, setFindComponentState ] = useState(false);
  const { inspector } = editorContext.simulationInspectorRenderer ?? {};
  const inspectorContentRef = useRef<HTMLElement>(null);
  const showcaseRef = useRef<HTMLDivElement>(null);

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
    placeholder: 'Search Component',
    inputIcon: faSearch,
    focusOnMount: true,
    fieldProps: {
      className: 'search-component-field'
    }
  });


  useEffect(() => {
    const interval = setInterval(() => {
      rerender()
    }, 200);
    return () => clearInterval(interval);
  })


  useEffect(() => {
    if (!showcaseRef.current || !inspectorContentRef.current || !findComponentState) {
      return;
    }

    inspectorContentRef.current.scrollBy({
      top: 1000,
      behavior: 'smooth',
    })
}, [showcaseRef.current, findComponentState])

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

  const componentConstructors = Component.getUsableComponentConstructors();
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

  const a = Component.getUsableComponentConstructors();
  const allInstances = [...entity.components.instances()];
  const existingInstances = allInstances.map(i => i.constructor);
  const searchInstances = a.filter(aa => aa.name.toUpperCase().includes(textInput.value.toUpperCase()))
  const addable = a.filter(b => !existingInstances.includes(b) && searchInstances.includes(b));
  const b = Component.getComponentsWithType(addable);
  

  return (
    <section className='editor-visual-component inspector'>
      <header>
        <FontAwesomeIcon icon={faShapes} className='entity-icon' />
        {useEntityCheckbox.render()}
        {nameInput.render()}
        {tagSelectInput.render()}
        {labelSelectInput.render()}
      </header>
      <main onClick={
        (event) => {
          setFindComponentState(false)
          textInput.clearValue();
        }}
        ref={inspectorContentRef}
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
          {findComponentState && textInput.render()}

          <div className='component-showcase' ref={showcaseRef}>
            {/* <div className='category recent'>
              <span>Recently Used</span>
              <div className='catalog'>
                {Component.getUsableComponentConstructors().map((constructor) => (
                  <ComponentRepresenter key={constructor.name} componentConstructor={constructor} entity={entity} />
                ))}
              </div>
            </div> */}
            <div className='category'>
              <span>Buildins</span>
              <div className='catalog'>
                {b.buildins.map((constructor) => (
                  <ComponentRepresenter key={constructor.name} componentConstructor={constructor} entity={entity} />
                ))}
              </div>
            </div>
            <div className='category'>
              <span>Customs</span>
              <div className='catalog'>
                {b.customs.map((constructor) => (
                  <ComponentRepresenter key={constructor.name} componentConstructor={constructor} entity={entity} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </section>
  )
}

export default Inspector;