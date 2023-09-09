import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import './inspector.scss';
import { faArrowsUpDownLeftRight, faBox, faShapes } from '@fortawesome/free-solid-svg-icons';
import CheckboxField from '../CheckboxField';
import TextInputField from '../TextInputField';
import AppSelectInput from '../SelectInputField';
import useTextInputField from 'renderer/middleware/hooks/useTextInputField';
import useCheckboxField from 'renderer/middleware/hooks/useCheckboxField';
import useSelectInputField from 'renderer/middleware/hooks/useSelectInputField';
import { createContext, useContext } from 'react';
import { EditorContext } from 'renderer/pages/Editor';
import InspectorModule from '../InspectorModule';
import { Entity } from 'crontext';
import InspectorTransformModule from '../InspectorTransformModule';

export interface InspectorContextState {
  entity: Entity;
}

export const InspectorContext = createContext<InspectorContextState>({
  entity: null as any,
})

const Inspector: React.FC = () => {
  const editorContext = useContext(EditorContext);
  const { inspector } = editorContext.simulationInspectorRenderer ?? {};

  if (!inspector || inspector.selectedEntities.size !== 1) {
    return (
      <section className='editor-visual-component inspector' />
    )
  }

  const entity = [...inspector.selectedEntities][0];

  const useEntityCheckbox = useCheckboxField({
    className: 'enable-entity-checkbox',
    value: true,
  });

  const nameInput = useTextInputField({
    inputPrefix: 'Name:',
    className: 'entity-name-field',
    value: entity.name,
    trackValue: true,
    onChange: (name) => {
      entity.name = name;
      editorContext.forceRerender()
    }
  });

  const tagSelectInput = useSelectInputField({
    className: 'entity-tag-field',
    inputPrefix: 'Tag:',
    options: [],
  })

  const labelSelectInput = useSelectInputField({
    options: [],
    inputPrefix: 'Layer:',
    className: 'entity-layer-field',
  })
  
  return (
    <section className='editor-visual-component inspector'>
      <header>
        <FontAwesomeIcon icon={faShapes} className='entity-icon' />
        {useEntityCheckbox.render()}
        {nameInput.render()}
        {tagSelectInput.render()}
        {labelSelectInput.render()}
      </header>
      <main>
        <InspectorContext.Provider value={{ entity }}>
          <InspectorTransformModule />
          {[...entity.components.instances()].map(component => (
            <InspectorModule component={component} />
          ))}
        </InspectorContext.Provider>
        <button className='add-component-action'>Add Component</button>
      </main>
    </section>
  )
}

export default Inspector;