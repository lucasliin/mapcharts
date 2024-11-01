import clsx from 'clsx';
import { first } from 'lodash';
import React, { useState } from 'react';

interface FileInputProps {
  label: string;
  accept?: string;
  onChange: (files: FileList | null) => void;
}
const FileInput: React.FC<FileInputProps> = (props) => {
  const { accept, label, onChange } = props;

  const inputRef = React.useRef<HTMLInputElement>(null);

  const [fileName, setFileName] = useState<string>();

  return (
    <>
      <label
        className={clsx(
          'flex flex-1 text-[#666] whitespace-nowrap items-center',
          'after:content-[":"] ms-0.5 me-2'
        )}
      >
        {label}
      </label>
      <div
        onClick={() => inputRef.current?.click()}
        className="rounded-md border-solid border border-[#d9d9d9] text-gray-300 py-1 px-3 hover:border-primary hover:text-primary cursor-pointer w-full whitespace-nowrap"
      >
        {fileName || '选择文件'}
      </div>
      <input
        type="file"
        ref={inputRef}
        accept={accept}
        multiple={false}
        onChange={(e) => {
          onChange(e.target.files);
          setFileName(first(e.target.files)?.name);
        }}
        className="hidden border border-solid border-[#999] py-2 px-2.5 rounded min-w-0"
      />
    </>
  );
};

export default FileInput;
