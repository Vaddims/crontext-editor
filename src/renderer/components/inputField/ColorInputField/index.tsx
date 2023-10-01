import { Color } from "crontext";
import InputField, { InputFieldCommonProps } from "../InputField";
import './color-input-field.scss';
import { splitCaseMixedString } from "renderer/utilities/text.utils";
import { composeClassNames } from "renderer/utilities/reactComponent.util";

interface ColorInputFieldProps extends InputFieldCommonProps {
  inputProps?: React.DetailedHTMLProps<React.InputHTMLAttributes<HTMLInputElement>, HTMLInputElement>;
  children?: React.ReactNode;
}

const ColorInputField: React.FC<ColorInputFieldProps> = (props) => {
  const color = Color.createFromHex(props.inputProps?.value as string);
  return (
    <InputField
      key={props.reactKey}
      fieldProps={{
        ...props.fieldProps,
        className: composeClassNames('color-input-field', props.fieldProps?.className),
      }}
    >
      <input {...props.inputProps} type='color' />
      <span 
        className="color-name"
        style={{
          color: color.getContrastingColor().toHexString(),
        }}
      >{splitCaseMixedString(color.getClosestColorName() ?? '').join(' ')}</span>
    </InputField>
  )
}

export default ColorInputField;