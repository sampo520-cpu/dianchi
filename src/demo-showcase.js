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
const demoLanguageCodes=['en','de','fr','es','it','pt','nl','pl','zh'];
const demoModelIds=/^(MOD-(ESS-240|EV-082|LMT-014)|FULL-SAMPLE-(ESS|EV|LMT)|GENERAL-SAMPLE-(PORTABLE|SLI|SMALL)|DEMO-LR03-ALKALINE|DEMO-6F22)$/;

function useEnglishDemoValues(db) {
  const models=db.models.filter(model=>demoModelIds.test(model.id));
  for(const model of models) {
    model.name=model.nameEn||model.name;
    for(const key of ['materials','composition','disassembly','carbon','recycled','diligence'])
      if(model[key+'En'])model[key]=model[key+'En'];
    if(model.company) {
      for(const key of ['name','address','factory','operator'])
        if(model.company[key+'En'])model.company[key]=model.company[key+'En'];
    }
  }
  const ids=new Set(models.map(model=>model.id));
  for(const batch of db.productionBatches||[]) {
    const model=models.find(item=>item.id===batch.modelId);
    if(model?.company?.factory)batch.factory=model.company.factory;
  }
  for(const instance of db.instances.filter(item=>ids.has(item.modelId))) {
    if(instance.state==='在役')instance.state='In service';
  }
  for(const event of db.events||[]) {
    const instance=db.instances.find(item=>item.id===event.instanceId);
    if(instance&&ids.has(instance.modelId)&&event.noteEn)event.note=event.noteEn;
  }
  for(const document of db.documents||[]) {
    const model=models.find(item=>item.id===document.target);
    if(model&&document.nameEn)document.name=document.nameEn;
  }
  for(const evidence of db.applicableMaterials||[]) {
    if(ids.has(evidence.modelId))evidence.name=evidence.nameEn||evidence.name.replace('（虚构示例）',' (fictional sample)');
  }
}

// Archive display-only: retain old scan links, user edits and every historical record.
export function curateDemoShowcase(db) {
  if(db.demoShowcaseVersion>=3)return db;
  const previous=structuredClone(db);
  for(const model of db.models)if(redundantIds.has(model.id))model.demoArchived=true;
  for(const item of demoShowcase) {
    const model=db.models.find(m=>m.id===item.id);
    if(!model)continue;
    model.enabledLanguages ||= [...demoLanguageCodes];
    model.defaultLanguage ||= 'en';
    model.demoFeature=item.feature;
    model.markings ||= [];
    for(const key of item.marks) {
      if(model.markings.some(mark=>mark.key===key || key==='ce'&&symbolCategory(mark)==='conformity'&&/\bCE\b/i.test(mark.id+' '+mark.nameEn)))continue;
      const symbol=makeCatalogSymbol(key,`${model.id}-SHOWCASE-${key}`);
      model.markings.push({...symbol,descriptionEn:symbol.category==='conformity'?'Demonstration reference only. This entry does not assert approval or applicability to this sample battery.':symbol.descriptionEn});
    }
  }
  useEnglishDemoValues(db);
  syncSimplePassports(db,previous);
  db.demoShowcaseVersion=3;
  return db;
}

export function demoWorkspaceDb(db) {
  const models=db.models.filter(m=>!m.demoArchived),ids=new Set(models.map(m=>m.id));
  return {...db,models,instances:db.instances.filter(i=>ids.has(i.modelId)),productionBatches:db.productionBatches.filter(b=>ids.has(b.modelId)),codeRecords:db.codeRecords.filter(c=>ids.has(c.modelId))};
}
