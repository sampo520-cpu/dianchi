import React,{useState} from 'react';
import {Languages} from 'lucide-react';
import {passportLanguages} from './passport-locales.js';
import {translationFields} from './product-translations.js';
import RichEditor from './rich-editor';

export default function ProductLanguages({form,onChange}) {
  const [language,L]=useState('zh'),[search,S]=useState('');
  const fields=translationFields(form),values=form.localizedContent?.[language]||{};
  const set=(key,value)=>onChange({...form,localizedContent:{...form.localizedContent,[language]:{...values,[key]:value}}});
  return <section className="product-languages"><h2><Languages size={20}/>多语言内容</h2>
    <p>扫码页仅切换参数名、栏目和按钮；字段值与图文统一保留基础资料原文。以下历史译文保留供编辑，不会随扫码页语言自动替换。</p>
    <label className="form-field">目标语言<select aria-label="产品翻译目标语言" value={language} onChange={e=>L(e.target.value)}>{Object.entries(passportLanguages).filter(([code])=>code!=='en').map(([code,name])=><option key={code} value={code}>{name}</option>)}</select></label>
    <p>已填写 {fields.filter(f=>values[f.path]?.trim()).length} / {fields.length} 项</p>
    <label className="form-field">查找翻译字段<input value={search} onChange={e=>S(e.target.value)}/></label>
    <div className="product-language-fields">{fields.filter(f=>(f.label+f.source).toLowerCase().includes(search.toLowerCase())).map(field=><details key={`${language}-${field.path}`}><summary>{field.label}{values[field.path]?.trim()?' · 已填写':' · 待翻译'}</summary><label className="form-field">英文原文<textarea readOnly value={field.source}/></label>{field.rich?<RichEditor label={`${passportLanguages[language]} · ${field.label}`} value={values[field.path]||''} onChange={value=>set(field.path,value)}/>:<label className="form-field">{passportLanguages[language]}<textarea value={values[field.path]||''} onChange={e=>set(field.path,e.target.value)}/></label>}<button type="button" className="text-btn" onClick={()=>set(field.path,'')}>清空译文并使用原文</button></details>)}</div>
  </section>;
}
