import { makeCatalogSymbol, symbolCategory } from './battery-symbols.js';
import { syncSimplePassports } from './workflow.js';

export const demoShowcase = [
  {id:'FULL-SAMPLE-ESS',feature:'工业储能 · 大容量系统 · 批次与使用数据',marks:['ce','ul','ccc','pse','ukca','rohs','reach','eu-battery','un383']},
  {id:'FULL-SAMPLE-EV',feature:'动力电池 · 车辆应用 · 生命周期数据',marks:['ce','ul','ccc','reach','eu-battery','un383']},
  {id:'FULL-SAMPLE-LMT',feature:'轻型交通 · 小型电池包 · 维修回收',marks:['ce','ul','ccc','pse','reach','eu-battery','un383']},
  {id:'GENERAL-SAMPLE-SLI',feature:'铅酸启动 · 客户扩展字段 · 非锂电体系',marks:['ce','ul','rohs','reach','eu-battery']},
  {id:'GENERAL-SAMPLE-SMALL',feature:'小容量工业 · 通用一码 · 紧凑型电池',marks:['ce','ul','ccc','pse','reach','eu-battery','un383']},
  {id:'DEMO-6F22',feature:'一次电池 · 9V 锌锰 · 图文与多语言',marks:['ce','ukca','rohs','reach','eu-battery']},
];
const redundantIds=new Set(['MOD-ESS-240','MOD-EV-082','MOD-LMT-014','GENERAL-SAMPLE-PORTABLE','DEMO-LR03-ALKALINE']);

// Archive display-only: retain old scan links, user edits and every historical record.
export function curateDemoShowcase(db) {
  if(db.demoShowcaseVersion===1)return db;
  const previous=structuredClone(db);
  for(const model of db.models)if(redundantIds.has(model.id))model.demoArchived=true;
  for(const item of demoShowcase) {
    const model=db.models.find(m=>m.id===item.id);
    if(!model)continue;
    model.demoFeature=item.feature;
    model.markings ||= [];
    for(const key of item.marks) {
      if(model.markings.some(mark=>mark.key===key || key==='ce'&&symbolCategory(mark)==='conformity'&&/\bCE\b/i.test(mark.id+' '+mark.nameEn)))continue;
      const symbol=makeCatalogSymbol(key,`${model.id}-SHOWCASE-${key}`);
      model.markings.push({...symbol,descriptionEn:symbol.category==='conformity'?'Demonstration reference only. This entry does not assert approval or applicability to this sample battery.':symbol.descriptionEn});
    }
  }
  syncSimplePassports(db,previous);
  db.demoShowcaseVersion=1;
  return db;
}

export function demoWorkspaceDb(db) {
  const models=db.models.filter(m=>!m.demoArchived),ids=new Set(models.map(m=>m.id));
  return {...db,models,instances:db.instances.filter(i=>ids.has(i.modelId)),productionBatches:db.productionBatches.filter(b=>ids.has(b.modelId)),codeRecords:db.codeRecords.filter(c=>ids.has(c.modelId))};
}
