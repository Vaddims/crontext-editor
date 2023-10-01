import { faLayerGroup, faRotateBack, faXmark, IconDefinition } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { ReactNode, useEffect, useRef } from 'react';
import { composeClassNames, hasChildElement } from '../../../utilities/reactComponent.util';
import './InputField.scss';
import { InputFieldUtils } from '../../../hooks/inputField/useInputField';
import { FalsyType } from 'renderer/utilities/types';

export interface InputFieldCommonOptions {
  readonly reactKey?: string;
  readonly label?: string;
  readonly labelIcon?: IconDefinition;
  readonly inputIcon?: IconDefinition;
  readonly inputPrefix?: string;
  readonly markAsRequired?: boolean;
  readonly status?: InputFieldUtils.Status;
  readonly fieldProps?: React.DetailedHTMLProps<React.LabelHTMLAttributes<HTMLLabelElement>, HTMLLabelElement>;
  readonly mixedValuesState?: boolean | undefined; // boolean - show / undefined - hide
}

export interface InputFieldCommonProps extends InputFieldCommonOptions {
  readonly helperText?: string | FalsyType;
  readonly onInputRestore?: React.MouseEventHandler<HTMLButtonElement> | FalsyType;
  readonly onInputClear?: React.MouseEventHandler<HTMLButtonElement> | FalsyType;
  readonly onMixedValueStateClick?: () => void;
  readonly onUnbound?: (event: MouseEvent) => void;
}

export interface InputFieldProps extends InputFieldCommonProps {
  readonly children?: ReactNode;
}

export const InputField: React.FC<InputFieldProps> = (props) => {
  const labelRef = useRef(null);

  useEffect(() => {
    const handler = (event: MouseEvent) => {
      if (labelRef.current && !hasChildElement(labelRef.current, event.target as Element)) {
        props.onUnbound?.(event);
      }
    }

    document.body.addEventListener('mouseup', handler);
    return () => {
      document.body.removeEventListener('mouseup', handler);
    }
  })

  return (
    <label
      key={props.reactKey}
      {...props.fieldProps}
      className={composeClassNames('input-field', props.fieldProps?.className)}
      data-status={props.status}
      ref={labelRef}
      data-mixed-values={props.mixedValuesState}
    >
      {props.label && (
        <header>
          { props.labelIcon && (
            <FontAwesomeIcon icon={props.labelIcon} className='label-icon' />
          )}
          <label>
            <span className='label-title'>{props.label}</span>
            { !props.markAsRequired && (
              <>
                <span className='optional-divider'> - </span>
                <span className='optional-label'>Optional</span>
              </>
            )}
          </label>
        </header>
      )}
      <section className="input-section">
        <div className='input-icon-wrapper'>
          { props.inputIcon && <FontAwesomeIcon icon={props.inputIcon} className='input-icon' /> }
          { props.inputPrefix && <span className='text'>{props.inputPrefix}</span> }
        </div>
        { props.children }
        <div className='input-management-actions'>
          { props.onInputRestore && (
            <button className='action-icon' onClick={props.onInputRestore} title='Restore input'>
              <FontAwesomeIcon icon={faRotateBack} size='lg' />
            </button>
          )}
          { props.onInputClear && (
            <button className='action-icon' onClick={props.onInputClear} title='Clear input'>
              <FontAwesomeIcon icon={faXmark} size='lg' />
            </button>
          )}
          {(typeof props.mixedValuesState !== 'undefined' && props.onMixedValueStateClick) && (
            <button 
              onClick={props.onMixedValueStateClick} 
              className='action-icon mixed-value-state' 
              title='Use Existing value' 
              aria-checked={props.mixedValuesState}
            >
              <FontAwesomeIcon icon={faLayerGroup} size='xl' />
            </button>
          )}
        </div>
      </section>
      { props.helperText && (
        <span className='helper-text'>{props.helperText}</span>
      )}
    </label>
  )
}

export default InputField;
