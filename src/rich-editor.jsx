import React, { useEffect, useRef, useState } from 'react';
import { Bold, Italic, Underline, List, ListOrdered, Heading3, ImagePlus } from 'lucide-react';
import { sanitizeRichHtml } from './rich-content.js';
import './rich-editor.css';

export default function RichEditor({ label, value = '', onChange, placeholder = '输入内容…' }) {
  const editor = useRef(null), file = useRef(null), [focused, F] = useState(false);
  useEffect(() => { if (editor.current && !focused) editor.current.innerHTML = sanitizeRichHtml(value); }, [value, focused]);
  const command = (name, arg) => { editor.current?.focus(); document.execCommand(name, false, arg); onChange(sanitizeRichHtml(editor.current?.innerHTML || '')); };
  const insertImage = e => {
    const image = e.target.files?.[0];
    if (!image) return;
    if (!['image/png', 'image/jpeg', 'image/webp', 'image/gif'].includes(image.type) || image.size > 1024 * 1024) { e.target.value = ''; return; }
    const reader = new FileReader();
    reader.onload = () => { editor.current?.focus(); document.execCommand('insertImage', false, reader.result); onChange(sanitizeRichHtml(editor.current?.innerHTML || '')); };
    reader.readAsDataURL(image);
    e.target.value = '';
  };
  return <div className="rich-editor">
    <label>{label}</label>
    <div className="rich-toolbar" role="toolbar" aria-label={`${label}格式工具`}>
      {[[Bold,'bold','加粗'],[Italic,'italic','斜体'],[Underline,'underline','下划线'],[List,'insertUnorderedList','项目符号'],[ListOrdered,'insertOrderedList','编号列表'],[Heading3,'formatBlock','小标题']].map(([Icon,cmd,title]) => <button key={cmd} type="button" title={title} aria-label={title} onMouseDown={e=>e.preventDefault()} onClick={()=>command(cmd,cmd==='formatBlock'?'h3':undefined)}><Icon size={16}/></button>)}
      <button type="button" title="插入图片（1 MB以内）" aria-label="插入图片" onMouseDown={e=>e.preventDefault()} onClick={()=>file.current?.click()}><ImagePlus size={16}/></button>
      <input ref={file} hidden type="file" accept="image/png,image/jpeg,image/webp,image/gif" onChange={insertImage}/>
    </div>
    <div ref={editor} className="rich-editable" contentEditable suppressContentEditableWarning role="textbox" aria-multiline="true" data-placeholder={placeholder} onFocus={()=>F(true)} onBlur={()=>{F(false);onChange(sanitizeRichHtml(editor.current?.innerHTML||''));}} onInput={()=>onChange(sanitizeRichHtml(editor.current?.innerHTML||''))} onPaste={e=>{e.preventDefault();document.execCommand('insertText',false,e.clipboardData.getData('text/plain'));}} />
  </div>;
}
