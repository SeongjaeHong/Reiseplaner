import { useState } from 'react';

type TypeTextareaAutoResize = {
  className?: string;
  rows?: number;
};

export default function TextareaAutoResize({
  className = '',
  rows = 15,
}: TypeTextareaAutoResize) {
  const [contents, setContents] = useState(
    Array(rows - 1)
      .fill('\n')
      .join('')
  );

  const handleChangeTextarea = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContents(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = e.target.scrollHeight + 'px';
  };

  return (
    <textarea
      className={'p-1 resize-none w-full ' + className}
      name='contents'
      value={contents}
      rows={rows}
      onChange={handleChangeTextarea}
    />
  );
}
