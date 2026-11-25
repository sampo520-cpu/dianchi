import React from 'react';
import RichEditor from './rich-editor';
import { id } from './data.js';

export default function ProductReferenceFields({form, onChange}) {
  const update = (key,value)=>onChange({...form,[key]:value});
  return <>
    <h2>声明、来源与法规注释</h2>
    <p>填写适用依据、说明和来源；参考资料不能直接作为本产品的检测或认证结论。</p>
    {[
      ['substanceStatementEn','有害物质与 SVHC 说明（英文）'],['criticalMaterialsEn','关键原材料说明（英文）'],
      ['conformityEn','法规适用与责任说明（英文）'],['referenceInfoEn','参考来源及原厂信息（英文）'],['disclaimerEn','信息声明（英文）'],
    ].map(([key,label])=><RichEditor key={key} label={label} value={form[key] || ''} onChange={v=>update(key,v)}/>)}
    <h3>法规注释</h3>
    {(form.regulatoryNotes||[]).map((note,index)=><fieldset className="product-note-editor" key={note.id}><legend>注释 {index+1}</legend>
      {Object.entries({title:'标题（英文）',reference:'法规及条款',text:'适用说明（英文）',url:'官方来源 HTTPS 链接',reviewedAt:'资料核对日期'}).map(([key,label])=><label className="form-field" key={key}>{label}{key==='text'?<textarea value={note[key]||''} onChange={e=>update('regulatoryNotes',form.regulatoryNotes.map((n,i)=>i===index?{...n,[key]:e.target.value}:n))}/>:<input type={key==='reviewedAt'?'date':key==='url'?'url':'text'} value={note[key]||''} onChange={e=>update('regulatoryNotes',form.regulatoryNotes.map((n,i)=>i===index?{...n,[key]:e.target.value}:n))}/>}</label>)}
      <button type="button" className="text-btn" onClick={()=>update('regulatoryNotes',form.regulatoryNotes.filter((_,i)=>i!==index))}>删除注释</button>
    </fieldset>)}
    <button type="button" className="outline" onClick={()=>update('regulatoryNotes',[...(form.regulatoryNotes||[]),{id:id('NOTE'),title:'',reference:'',text:'',url:'',reviewedAt:''}])}>添加法规注释</button>
    <h3>第三方参考文件链接</h3>
    {(form.referenceLinks||[]).map((doc,index)=><fieldset className="product-note-editor" key={doc.id}><legend>参考文件 {index+1}</legend>
      <label className="form-field">文件名称（英文）<input value={doc.label} onChange={e=>update('referenceLinks',form.referenceLinks.map((d,i)=>i===index?{...d,label:e.target.value}:d))}/></label>
      <label className="form-field">HTTPS 来源链接<input type="url" value={doc.url} onChange={e=>update('referenceLinks',form.referenceLinks.map((d,i)=>i===index?{...d,url:e.target.value}:d))}/></label>
      <button type="button" className="text-btn" onClick={()=>update('referenceLinks',form.referenceLinks.filter((_,i)=>i!==index))}>删除参考文件</button>
    </fieldset>)}
    <button type="button" className="outline" onClick={()=>update('referenceLinks',[...(form.referenceLinks||[]),{id:id('REF'),label:'',url:''}])}>添加参考文件</button>
  </>;
}
