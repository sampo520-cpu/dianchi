import React,{useState} from 'react';
import { AlertTriangle, Zap, Glasses, BookOpen, BatteryWarning, BatteryCharging, Flame, Droplet, Baby, Hand, Thermometer, Recycle, Trash2, ShieldCheck, FileCheck2, FileText, Shapes } from 'lucide-react';
import { symbolGroups, symbolCategory, symbolStatus, symbolCatalog, makeCatalogSymbol } from './battery-symbols.js';
import { id } from './data.js';
import './battery-symbols.css';
import {PassportText} from './passport-i18n';

const icons={warning:AlertTriangle,zap:Zap,glasses:Glasses,book:BookOpen,battery:BatteryWarning,charge:BatteryCharging,flame:Flame,droplet:Droplet,baby:Baby,hand:Hand,temperature:Thermometer,recycle:Recycle,bin:Trash2,shield:ShieldCheck,declaration:FileCheck2,file:FileText};
export function BatterySymbol({mark,compact=false}) {
  const Icon=icons[mark.icon] || (symbolCategory(mark)==='conformity'?ShieldCheck:Shapes);
  const code=compact&&!mark.imageUrl&&({reach:'REACH',rohs:'RoHS','eu-battery':'EU 2023/1542',un383:'UN 38.3'})[mark.key];
  return <span className={`battery-symbol ${!mark.imageUrl && mark.prohibited?'battery-symbol-prohibited':''} ${code?'battery-symbol-document':''}`} aria-hidden="true">{mark.imageUrl?<img src={mark.imageUrl} alt=""/>:<><Icon strokeWidth={1.8}/>{code&&<b>{code}</b>}</>}</span>;
}
export function BatteryMarkings({model,adminHints}) {
  return <PassportText>{symbolGroups.map(group=>{
    const marks=(model.markings||[]).filter(m=>symbolCategory(m)===group.id);
    if (!marks.length) return null;
    const GroupIcon=group.id==='conformity'?ShieldCheck:group.id==='recycling'?Recycle:AlertTriangle;
    return <section key={group.id} className={`ps-rich-block ps-symbol-section ps-symbol-${group.id}`}><h2><GroupIcon aria-hidden="true"/>{group.en}{adminHints && <small className="ps-zh-label">{group.zh}</small>}</h2>
      <ul className="ps-symbol-icons" aria-label={group.en}>{marks.map(mark=><li key={mark.id} title={mark.nameEn||group.en} aria-label={mark.nameEn||group.en} tabIndex={0}><BatterySymbol mark={mark} compact/><span className="ps-symbol-caption">{mark.nameEn||group.en}</span></li>)}</ul>
    </section>;
  })}</PassportText>;
}

export function BatteryMarkingEditor({form,onChange}) {
  const all=form.markings||[];
  const [customDrafts,setCustomDrafts]=useState({});
  const toggle=(item,group)=>{
    const selected=all.some(mark=>mark.key===item.key&&symbolCategory(mark)===group.id);
    onChange({...form,markings:selected?all.filter(mark=>!(mark.key===item.key&&symbolCategory(mark)===group.id)):[...all,{...makeCatalogSymbol(item.key,id('MARK')),category:group.id}]});
  };
  const remove=mark=>onChange({...form,markings:all.filter(m=>m.id!==mark.id)});
  const upload=(e,group)=>{
    const file=e.target.files?.[0];
    if (!file) return;
    if (!['image/png','image/jpeg','image/webp','image/gif'].includes(file.type)||file.size>1024*1024) { e.target.setCustomValidity('请选择 1 MB 以内的 PNG、JPG、WebP 或 GIF 图片');e.target.reportValidity();e.target.value='';return; }
    e.target.setCustomValidity('');const reader=new FileReader();reader.onload=()=>setCustomDrafts(d=>({...d,[group.id]:{...d[group.id],imageUrl:reader.result}}));reader.readAsDataURL(file);e.target.value='';
  };
  const saveCustom=group=>{
    const draft=customDrafts[group.id];
    if(!draft?.title?.trim()||!draft.imageUrl)return;
    onChange({...form,markings:[...all,{id:id('MARK'),key:'custom-'+id('ICON'),category:group.id,nameEn:draft.title.trim(),imageUrl:draft.imageUrl,icon:'file'}]});
    setCustomDrafts(d=>({...d,[group.id]:{title:'',imageUrl:''}}));
  };
  return <div className="battery-marking-editor"><h2>图标与标识</h2>{symbolGroups.map(group=>{
    const items=symbolCatalog.filter(s=>s.category===group.id);
    const selectedCustom=all.filter(mark=>symbolCategory(mark)===group.id&&!items.some(item=>item.key===mark.key));
    const draft=customDrafts[group.id]||{title:'',imageUrl:''};
    return <section className="symbol-editor-group" key={group.id}><h3>{group.zh}</h3>
      <div className="symbol-catalog">{items.map(item=>{const selected=all.some(mark=>mark.key===item.key&&symbolCategory(mark)===group.id);return <button type="button" key={item.key} aria-pressed={selected} className={selected?'selected':''} onClick={()=>toggle(item,group)} title={selected?'取消选择':'选择'+item.zh}><BatterySymbol mark={item}/><span>{item.zh}</span></button>;})}</div>
      {selectedCustom.length>0&&<div className="symbol-custom-selected">{selectedCustom.map(mark=><div className="symbol-custom-chip" key={mark.id}><BatterySymbol mark={mark}/><span>{mark.nameEn||'自定义图标'}</span><button type="button" className="text-btn" onClick={()=>remove(mark)}>移除</button></div>)}</div>}
      <div className="symbol-custom-upload"><strong>自定义图标</strong><label className="form-field">标题<input value={draft.title} onChange={e=>setCustomDrafts(d=>({...d,[group.id]:{...draft,title:e.target.value}}))}/></label><label className="form-field">上传图片<input type="file" accept="image/png,image/jpeg,image/webp,image/gif" onChange={e=>upload(e,group)}/></label>{draft.imageUrl&&<img className="symbol-custom-preview" src={draft.imageUrl} alt="图标预览"/>}<button type="button" className="outline" disabled={!draft.title.trim()||!draft.imageUrl} onClick={()=>saveCustom(group)}>添加图标</button></div>
    </section>;
  })}</div>;
}
