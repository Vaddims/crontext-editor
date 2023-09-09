import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import './checkbox-field.scss';
import { faCheck, faLayerGroup } from '@fortawesome/free-solid-svg-icons';
import { InputFieldCommonProps } from '../InputField';

interface CheckboxFieldProps extends InputFieldCommonProps {
  readonly select?: boolean;
  readonly onClick?: React.MouseEventHandler<HTMLButtonElement>;
}

const CheckboxField: React.FC<CheckboxFieldProps> = (props) => {
  const fieldIdNumber = ((Math.random() * 10) ** 10).toFixed(0);
  const fieldId = `CHECKBOX-${fieldIdNumber}`;

  return (
    <label
      htmlFor={fieldId} 
      aria-selected={props.select}
      aria-current={props.mixedValuesState ?? false}
      className='checkbox-field'
    >
      <button 
        id={fieldId}
        className='checkbox'
        onClick={props.onClick}
      >
        <FontAwesomeIcon 
          icon={faLayerGroup}
          size='lg'
          className='checkbox-icon mixed-values'
        />
        <FontAwesomeIcon 
          icon={faCheck} 
          size='lg' 
          className='checkbox-icon tick' 
        />
      </button>
      { props.label && (
        <span className='label'>{ props.label }</span>
      ) }
    </label>
  )
}

export default CheckboxField;