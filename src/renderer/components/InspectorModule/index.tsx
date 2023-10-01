import { Color, Component, EntityTransform } from 'crontext';
import './inspector-module.scss';
import { IconDefinition, faAngleRight, faArrowRight, faEllipsisVertical, faQuestion } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useContext, useEffect, useState } from 'react';
import { useComponentForceRerender } from 'renderer/middleware/hooks/useComponentForceRerender';
import { EditorInspector } from 'renderer/services/inspector/editor-inspector';
import '../../services/inspector/editor-inspector.preload';
import '../../services/inspector/custom-inspectors/entity-transform.inspector';
import { splitCaseMixedString } from 'renderer/utilities/text.utils';
import { InspectorContext } from '../Inspector';
import ColorInputField from '../inputField/ColorInputField';
import useSelectInputField, { defaultSelectInputFieldOption } from 'renderer/hooks/inputField/useSelectInputField';
import useTextInputField from 'renderer/hooks/inputField/useTextInputField';
import { InputFieldUtils } from 'renderer/hooks/inputField/useInputField';
import CheckboxField from '../inputField/CheckboxField';
import SelectInputRenderer from './SelectInputRenderer';
import GenericInputRenderer from './GenericInputRenderer';
import LabelRenderer from './LabelRenderer';
import ColorInputRenderer from './ColorInputRenderer';
import EditorModuleTreeRenderer from './EditorModuleTreeRenderer';

interface InspectorModuleProps {
  name?: string;
  icon?: IconDefinition;
  component: EntityTransform | Component;
  children?: React.ReactNode;
  className?: string;
}

export interface RendererEntryProps<T extends EditorInspector.HierarchyEntryType = EditorInspector.HierarchyEntryType> {
  readonly entry: T;
  readonly rerenderRoot: () => void;
}

const InspectorModule: React.FC<InspectorModuleProps> = (props) => {
  const rerender = useComponentForceRerender();

  const inspectorContext = useContext(InspectorContext);
  const [ contentShouldCollapse, setContentShouldCollapse ] = useState(false);

  const classNameComposition = ['inspector-module', props.className].join(' ');

  const inspectorEditor = EditorInspector.createFromObject(props.component);

  useEffect(() => {
    const interval = setInterval(() => {
      rerender()
    }, 200);
    return () => clearInterval(interval);
  })

  return (
    <section className={classNameComposition} data-content-hidden={contentShouldCollapse}>
      <header>
        <FontAwesomeIcon icon={faAngleRight} className='collapse-action' onClick={(e) => {
          e.preventDefault();
          setContentShouldCollapse((state) => !state)}
        } />
        <FontAwesomeIcon icon={inspectorEditor.icon} className='icon' />
        <span className='name'>{splitCaseMixedString(props.component.constructor.name ?? props.name ?? 'Untitled').join(' ')}</span>
        {!(props.component instanceof EntityTransform) && (
          <FontAwesomeIcon className='additional-actions' icon={faEllipsisVertical} onClick={async () => {
            const response = await window.electron.ipcRenderer.openCIEContextMenu();
            if (!response) {
              return;
            }

            if (props.component instanceof EntityTransform) {
              return;
            }

            props.component.entity.scene?.instantResolve(props.component.destroy());
            inspectorContext.forceRerender()
          }} /> 
        )}
      </header>
      <main>
        {props.children}
        {inspectorEditor && inspectorEditor.entries.map((entry: any) => (
          <EditorModuleTreeRenderer entry={entry} rerenderRoot={rerender} key={entry.path} />
        ))}
      </main>
    </section>
  )
}

export default InspectorModule;