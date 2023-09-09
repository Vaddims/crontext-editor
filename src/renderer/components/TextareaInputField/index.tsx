import InputField, { InputFieldCommonProps, extractInputFieldProps } from "../InputField";
import './textarea-input-field.scss';

interface TextareaInputFieldProps extends InputFieldCommonProps, React.DetailedHTMLProps<React.TextareaHTMLAttributes<HTMLTextAreaElement>, HTMLTextAreaElement> {
  children?: React.ReactNode;
}

const TextareaField: React.FC<TextareaInputFieldProps> = (props) => {
  return (
    <InputField
      {...extractInputFieldProps(props)}
      className="textarea-input-field"
    >
      <textarea {...props} />
    </InputField>
  )
}

export default TextareaField;