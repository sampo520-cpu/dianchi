import React,{useMemo,useState} from 'react';
import {Languages, WandSparkles} from 'lucide-react';
import {passportLanguages} from './passport-locales.js';
import {storeTranslation,translationFields,translationStatus,translationValue} from './product-translations.js';
import RichEditor from './rich-editor';

const demoTerms={
  fr:{'Safety warning':'Avertissement de sécurité','Caution':'Attention','Waste battery prevention and management':'Prévention et gestion des déchets de batteries','Disassembly sequence':'Séquence de démontage','Professional operation safety measures':'Mesures de sécurité pour les opérations professionnelles'},
  de:{'Safety warning':'Sicherheitshinweis','Caution':'Vorsicht','Waste battery prevention and management':'Vermeidung und Bewirtschaftung von Altbatterien','Disassembly sequence':'Demontagesequenz'},
};
function demoDraft(source,language) {
  const value=demoTerms[language]?.[source.trim()];
  if(value)return value;
  const prefix={fr:'[Brouillon de démonstration] ',de:'[Demoentwurf] ',es:'[Borrador de demostración] ',it:'[Bozza dimostrativa] ',pt:'[Rascunho de demonstração] ',nl:'[Demovoorbeeld] ',pl:'[Szkic demonstracyjny] ',zh:'[演示草稿] '}[language]||'[Demo draft] ';
  return prefix+source.replace(/<[^>]*>/g,' ').replace(/\s+/g,' ').trim();
}

export default function ProductLanguages({form,onChange}) {
  const [language,L]=useState('fr'),[search,S]=useState(''),[notice,N]=useState('');
  const fields=useMemo(()=>translationFields(form),[form]),values=form.localizedContent?.[language]||{};
  const statuses=fields.map(field=>translationStatus(form,language,field));
  const set=(field,value)=>onChange(storeTranslation(form,language,field,value,'已审核'));
  const generate=()=>{
    const pending=fields.filter((field,index)=>field.translatable&&statuses[index]!=='已保存');
    const count=pending.length;
    if(!count){N('没有需要生成的字段');return;}
    let next=form;
    for(const field of pending)if(translationStatus(next,language,field)==='待翻译')next=storeTranslation(next,language,field,demoDraft(field.source,language),'演示草稿 · 待审核');
    onChange(next);
    N(`已生成 ${count} 项演示草稿。当前未连接真实机器翻译服务；请勿将演示内容作为正式译文发布。`);
  };
  return <section className="product-languages"><h2><Languages size={20}/>多语言内容</h2>
    <p>默认语言内容只需填写一次。选择目标语言后可逐项查看和修改译文；数值、单位、型号及编号不参与翻译。</p>
    <div className="translation-toolbar"><label className="form-field">目标语言<select aria-label="产品翻译目标语言" value={language} onChange={e=>{L(e.target.value);N('');}}>{Object.entries(passportLanguages).filter(([code])=>code!=='en').map(([code,name])=><option key={code} value={code}>{name}</option>)}</select></label><button type="button" className="outline" onClick={generate}><WandSparkles size={16}/>生成待译稿</button></div>
    {notice&&<p className="translation-notice" role="status">{notice}</p>}
    <p>已保存 {statuses.filter(s=>s==='已保存'||s==='已修改').length} 项 · 待翻译 {statuses.filter(s=>s==='待翻译').length} 项 · 需更新 {statuses.filter(s=>s==='需更新').length} 项</p>
    <label className="form-field">查找翻译字段<input value={search} onChange={e=>S(e.target.value)}/></label>
    <div className="product-language-fields">{fields.filter(f=>(f.label+f.source).toLowerCase().includes(search.toLowerCase())).map(field=>{const status=translationStatus(form,language,field),value=translationValue(form,language,field.path);return <details key={`${language}-${field.path}`}><summary>{field.label}<span className={`translation-status ${status==='需更新'?'stale':''}`}>{status}</span></summary><label className="form-field">默认语言原文<textarea readOnly value={field.source}/></label>{field.rich?<RichEditor label={`${passportLanguages[language]} · ${field.label}`} value={value} onChange={next=>set(field,next)}/>:<label className="form-field">{passportLanguages[language]}<textarea value={value} onChange={e=>set(field,e.target.value)}/></label>}</details>})}</div>
  </section>;
}
