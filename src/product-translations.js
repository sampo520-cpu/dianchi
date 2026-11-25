const richKeys=['productOverviewEn','safetyEn','cautionEn','wasteEn','extinguishingEn','substanceStatementEn','criticalMaterialsEn','conformityEn','referenceInfoEn','disclaimerEn'];
export function translationFields(model) {
  const fields=[];
  const add=(path,label,value,rich=false)=>{if(typeof value==='string'&&value.trim())fields.push({path,label,source:value,rich});};
  add('nameEn','产品名称',model.nameEn);
  for(const key of richKeys)add(key,({productOverviewEn:'产品概览',safetyEn:'安全警告',cautionEn:'注意事项',wasteEn:'回收说明',extinguishingEn:'应急说明',substanceStatementEn:'物质声明',criticalMaterialsEn:'原材料',conformityEn:'法规说明',referenceInfoEn:'参考来源',disclaimerEn:'信息声明'})[key],model[key],true);
  for(const key of ['materialsEn','life','power','efficiency','resistance','hazardous','parts','compositionEn','disassemblyEn','carbonEn','recycledEn','diligenceEn'])add(key,key,model[key]);
  for(const key of ['nameEn','addressEn','operatorEn','operatorAddress','factoryEn'])add(`company.${key}`,`企业 · ${key}`,model.company?.[key]);
  for(const group of ['markings','characteristics','regulatoryNotes','referenceLinks'])for(const item of model[group]||[])for(const key of ({markings:['nameEn','descriptionEn','scopeNote','market','standard'],characteristics:['name','condition','note'],regulatoryNotes:['title','text'],referenceLinks:['label']})[group])add(`${group}.${item.id}.${key}`,`${({markings:'图标',characteristics:'测试',regulatoryNotes:'注释',referenceLinks:'参考文件'})[group]} · ${item.nameEn||item.name||item.title||item.label} · ${key}`,item[key]);
  return fields;
}
export function localizeModel(model,language) {
  if(language==='en'||!model.localizedContent?.[language])return model;
  const output={...model,company:{...model.company}};
  for(const key of ['markings','characteristics','regulatoryNotes','referenceLinks'])output[key]=(model[key]||[]).map(item=>({...item}));
  for(const field of translationFields(model)) {
    const text=model.localizedContent[language][field.path];
    if(typeof text!=='string'||!text.trim())continue;
    const parts=field.path.split('.');
    if(parts.length===1)output[parts[0]]=text;
    else if(parts[0]==='company')output.company[parts[1]]=text;
    else {const item=output[parts[0]].find(item=>item.id===parts[1]);if(item)item[parts[2]]=text;}
  }
  return output;
}
