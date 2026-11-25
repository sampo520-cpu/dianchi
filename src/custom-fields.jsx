import React from 'react';
export function CustomValues({ definitions = [], level, values = {}, onChange, language = 'en' }) {
  return definitions.filter(f => f.level === level).map(f => {
    const label=f.labels?.[language]||f.labels?.en||f.label;
    const common={required:f.required,value:values[f.id] ?? '',onChange:e=>onChange({...values,[f.id]:e.target.value})};
    const control=f.dataType==='长文本'?<textarea {...common} rows={3}/>:f.dataType==='布尔值'?<select {...common}><option value="">请选择</option><option value="true">是</option><option value="false">否</option></select>:<input {...common} type={f.dataType==='数值'?'number':f.dataType==='日期'?'date':'text'} step={f.dataType==='数值'?'any':undefined}/>;
    return <label className="form-field" key={f.id}>{label} {f.required ? '（必填）' : ''}{control}</label>;
  });
}
