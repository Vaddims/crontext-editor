import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import './checkbox-field.scss';
import { faCheck, faLayerGroup } from '@fortawesome/free-solid-svg-icons';
import { InputFieldCommonProps } from '../InputField';
import { nanoid } from 'nanoid';
import { composeClassNames } from 'renderer/utilities/reactComponent.util';
import { useMemo } from 'react';

interface CheckboxFieldProps extends InputFieldCommonProps {
  readonly select?: boolean;
  readonly checkboxProps?: React.DetailedHTMLProps<React.ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement>;
}

const CheckboxField: React.FC<CheckboxFieldProps> = (props) => {
  const fieldId = useMemo(() => `chbx-${nanoid()}`, []);

  return (
    <label
      {...props.fieldProps}
      key={props.reactKey}
      htmlFor={fieldId} 
      aria-selected={props.select}
      aria-current={props.mixedValuesState ?? false}
      className={composeClassNames('checkbox-field')}
      data-label-only={!props.helperText}
    >
      <button 
        {...props.checkboxProps}
        id={fieldId}
        className='checkbox'
        onClick={props.checkboxProps?.onClick}
      >
        <FontAwesomeIcon 
          icon={faLayerGroup}
          size='1x'
          className='checkbox-icon mixed-values'
        />
        <FontAwesomeIcon 
          icon={faCheck} 
          size='1x'
          className='checkbox-icon tick' 
        />
      </button>
      { props.label && (
        <span className='label'>{ props.label }</span>
      ) }
      { props.helperText && (
        <span className='helper-text'>{props.helperText}</span>
      )}
    </label>
  )
}

export default CheckboxField;