
import { composeClassNames } from 'renderer/utilities/reactComponent.util';
import InputField, { InputFieldCommonProps } from '../inputField/InputField';
import './textarea-input-field.scss';

interface TextareaInputFieldProps extends InputFieldCommonProps {
  inputProps?: React.DetailedHTMLProps<React.TextareaHTMLAttributes<HTMLTextAreaElement>, HTMLTextAreaElement>;
  children?: React.ReactNode;
}

const TextareaField: React.FC<TextareaInputFieldProps> = (props) => {
  return (
    <InputField
      fieldProps={{
        ...props.fieldProps,
        className: composeClassNames("textarea-input-field", props.fieldProps?.className)
      }}
    >
      <textarea {...props.inputProps} />
    </InputField>
  )
}

export default TextareaField;