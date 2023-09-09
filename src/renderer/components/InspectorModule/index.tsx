import { Component } from 'crontext';
import './inspector-module.scss';
import useCheckboxField from 'renderer/middleware/hooks/useCheckboxField';
import { IconDefinition, faAngleRight, faArrowRight, faQuestion } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useEffect, useState } from 'react';
import { useComponentForceRerender } from 'renderer/middleware/hooks/useComponentForceRerender';

interface InspectorModuleProps {
  name?: string;
  icon?: IconDefinition;
  component?: Component;
  children?: React.ReactNode;
  className?: string;
}

const InspectorModule: React.FC<InspectorModuleProps> = (props) => {
  const [ contentShouldCollapse, setContentShouldCollapse ] = useState(false);

  const classNameComposition = ['inspector-module', props.className].join(' ');

  return (
    <section className={classNameComposition}>
      <header>
        <FontAwesomeIcon icon={faAngleRight} className='collapse-action' />
        <FontAwesomeIcon icon={props.icon ?? faQuestion} className='icon' />
        <span className='name'>{props.component?.constructor.name ?? props.name ?? 'Untitled'}</span>
      </header>
      <main>
        {props.children}
      </main>
    </section>
  )
}

export default InspectorModule;