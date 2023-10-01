import InputField, { InputFieldCommonProps } from '../InputField';
import './select-input-field.scss';
import { composeClassNames } from '../../../utilities/reactComponent.util';

interface AppSelectInputFieldProps extends InputFieldCommonProps {
  readonly inputProps?: React.DetailedHTMLProps<React.SelectHTMLAttributes<HTMLSelectElement>, HTMLSelectElement>;
  readonly children?: React.ReactNode;
}

const SelectInputField: React.FC<AppSelectInputFieldProps> = (props) => {
  return (
    <InputField
      {...props}
      key={props.reactKey}
      fieldProps={{
        ...props.fieldProps,
        className: composeClassNames('select-input-field', props.fieldProps?.className),
      }}
    >
      <select 
        {...props.inputProps}
      >
        { props.children }
      </select>
    </InputField>
  )
}

export default SelectInputField;