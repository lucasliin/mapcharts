import clsx from "clsx";
import React, { HTMLInputTypeAttribute } from "react";

interface TextInputProps {
  label?: string;
  value: string;
  className?: string;
  placeholder?: string;
  type?: HTMLInputTypeAttribute;
  onChange: (val: string) => void;
}

const TextInput: React.FC<TextInputProps> = (props) => {
  const {
    label,
    value,
    onChange,
    className,
    type = "text",
    placeholder = "",
  } = props;

  return (
    <div style={{ display: "flex", height: "32px" }}>
      {label ? (
        <label className="lexicaltheme__textinputlabel">{label}</label>
      ) : null}
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className={clsx("lexicaltheme__textinput", className)}
      />
    </div>
  );
};

export default TextInput;
