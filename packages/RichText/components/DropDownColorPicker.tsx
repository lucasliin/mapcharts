import * as React from 'react';

import ColorPicker from './ColorPicker';
import DropDown from './DropDown';

interface DropdownColorPickerProps {
  color: string;
  disabled?: boolean;
  icon?: React.ReactNode;
  stopCloseOnClickSelf?: boolean;
  onChange?: (color: string, skipHistoryStack: boolean) => void;
}

const DropdownColorPicker: React.FC<DropdownColorPickerProps> = (props) => {
  const { color, disabled, icon, stopCloseOnClickSelf, onChange, ...rest } =
    props;
  return (
    <DropDown
      {...rest}
      type="button"
      buttonLabel={icon}
      disabled={disabled}
      stopCloseOnClickSelf={stopCloseOnClickSelf}
    >
      <ColorPicker color={color} onChange={onChange} />
    </DropDown>
  );
};

export default DropdownColorPicker;
