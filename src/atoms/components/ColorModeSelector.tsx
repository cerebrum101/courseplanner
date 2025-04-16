import React, { ChangeEventHandler } from 'react';
import { ColorMode } from '@xyflow/react';

interface ColorModeSelectorProps {
  onChange: ChangeEventHandler<HTMLSelectElement>;
  value: ColorMode;
}

const ColorModeSelector: React.FC<ColorModeSelectorProps> = ({ onChange, value }) => {
  return (
    <select 
      onChange={onChange} 
      value={value}
      data-testid="colormode-select"
      className="ml-10 bg-gray-600 text-white rounded-md px-2 py-1"
    >
      <option value="dark">dark</option>
      <option value="light">light</option>
      <option value="system">system</option>
    </select>
  );
};

export default ColorModeSelector; 