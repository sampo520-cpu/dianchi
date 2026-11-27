import {passportFieldCatalog} from './passport-field-catalog.js';
const richKeys=['productOverviewEn','safetyEn','cautionEn','wasteEn','extinguishingEn','substanceStatementEn','criticalMaterialsEn','conformityEn','referenceInfoEn','disclaimerEn'];
export function translationFields(model) {
  const fields=[];
  const add=(path,label,value,rich=false)=>{if(typeof value==='string'&&value.trim())fields.push({path,label,source:value,rich,translatable:true});};
  add('nameEn','产品名称',model.nameEn);
  for(const key of richKeys)add(key,({productOverviewEn:'产品概览',safetyEn:'安全警告',cautionEn:'注意事项',wasteEn:'回收说明',extinguishingEn:'应急说明',substanceStatementEn:'物质声明',criticalMaterialsEn:'原材料',conformityEn:'法规说明',referenceInfoEn:'参考来源',disclaimerEn:'信息声明'})[key],model[key],true);
  for(const key of ['materialsEn','life','power','efficiency','resistance','hazardous','parts','compositionEn','disassemblyEn','carbonEn','recycledEn','diligenceEn'])add(key,key,model[key]);
  for(const key of ['nameEn','addressEn','operatorEn','operatorAddress','factoryEn'])add(`company.${key}`,`企业 · ${key}`,model.company?.[key]);
  for(const field of model.passportFields||[]){const definition=model.templateConfig?.fields?.find(item=>item.id===field.id)||passportFieldCatalog.find(item=>item.id===field.id);if((model.passportFieldOverrides?.[field.id]?.translatable??definition?.translatable)&&definition)add(`passportFields.${field.id}`,definition.label,field.value);}
  for(const field of model.passportCustomFields||[])if(field.translatable&&field.value)add(`passportCustomFields.${field.id}`,field.label,field.value);
  for(const group of ['markings','characteristics','regulatoryNotes','referenceLinks'])for(const item of model[group]||[])for(const key of ({markings:['nameEn','descriptionEn','scopeNote'],characteristics:['name','condition','note'],regulatoryNotes:['title','text'],referenceLinks:['label']})[group])add(`${group}.${item.id}.${key}`,`${({markings:'图标',characteristics:'测试',regulatoryNotes:'注释',referenceLinks:'参考文件'})[group]} · ${item.nameEn||item.name||item.title||item.label} · ${key}`,item[key]);
  return fields;
}
export function translationStatus(model,language,field) {
  const entry=model.localizedContent?.[language]?.[field.path];
  if(!entry)return '待翻译';
  const source=model.translationMeta?.[language]?.[field.path];
  if(typeof entry==='string')return source&&source!==field.source?'需更新':'已审核';
  return source!==field.source?'需更新':entry.status||'待审核';
}
export function translationValue(model,language,path) {
  const entry=model.localizedContent?.[language]?.[path];
  return typeof entry==='string'?entry:entry?.text||'';
}
export function approvedTranslationValue(model,language,path) {
  const entry=model.localizedContent?.[language]?.[path];
  if(typeof entry==='string')return entry;
  const source=model.translationMeta?.[language]?.[path];
  return entry?.status==='已审核'&&source===translationFields(model).find(field=>field.path===path)?.source?entry.text||'':'';
}
export function storeTranslation(model,language,field,text,status='待审核') {
  const values={...(model.localizedContent?.[language]||{}),[field.path]:{text,status}};
  const translationMeta={...(model.translationMeta||{}),[language]:{...(model.translationMeta?.[language]||{}),[field.path]:field.source}};
  return {...model,localizedContent:{...model.localizedContent,[language]:values},translationMeta};
}
export function localizeModel(model,language) {
  if(language==='en'||!model.localizedContent?.[language])return model;
  const output={...model,company:{...model.company}};
  for(const key of ['markings','characteristics','regulatoryNotes','referenceLinks'])output[key]=(model[key]||[]).map(item=>({...item}));
  output.passportFields=(model.passportFields||[]).map(item=>({...item}));
  output.passportCustomFields=(model.passportCustomFields||[]).map(item=>({...item}));
  for(const field of translationFields(model)) {
    const text=approvedTranslationValue(model,language,field.path);
    if(typeof text!=='string'||!text.trim())continue;
    const parts=field.path.split('.');
    if(parts.length===1)output[parts[0]]=text;
    else if(parts[0]==='company')output.company[parts[1]]=text;
    else if(parts[0]==='passportFields'){const item=output.passportFields.find(item=>item.id===parts.slice(1).join('.'));if(item)item.value=text;}
    else if(parts[0]==='passportCustomFields'){const item=output.passportCustomFields.find(item=>item.id===parts[1]);if(item)item.value=text;}
    else {const item=output[parts[0]].find(item=>item.id===parts[1]);if(item)item[parts[2]]=text;}
  }
  return output;
}
