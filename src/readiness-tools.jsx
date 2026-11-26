import React,{useMemo,useState} from 'react';
import {ArrowRight,Clock3,FileText,Languages,ListChecks,TriangleAlert} from 'lucide-react';
import {applicable} from './data.js';
import {templateIncludes} from './templates.js';
import {passportLanguages} from './passport-locales.js';

const law='https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:02023R1542-20260813';
const roadmap=[
  ['scope','确认成品电池边界、用途类别及预计投放市场/投入使用日期'],
  ['operator','确认负责投放市场的经济运营者及内部/外部资料维护授权'],
  ['model','建立型号资料：制造商、生产地点、类别、化学体系和基础参数'],
  ['evidence','按产品和期间整理测试、物质、材料、声明及适用文件'],
  ['data','逐项核对附件 VI、附件 XIII 数据点的值、单位、条件和来源'],
  ['access','区分公开、专业合法利益及机构专属资料，确定访问责任'],
  ['language','确认销售成员国要求的终端用户语言及非语言中立内容译文'],
  ['identifier','确认成品边界、唯一标识标准、二维码解析地址和实物标签'],
  ['registry','根据 Registry 最新正式流程完成主体验证、护照登记及回执存档'],
  ['operations','建立动态数据更新、权限续期、数据备份和责任移交机制'],
];
const contentFields=[['productOverviewEn','产品概览'],['safetyEn','安全警告'],['cautionEn','注意事项'],['wasteEn','废电池处置'],['extinguishingEn','应急信息'],['substanceStatementEn','物质声明'],['criticalMaterialsEn','关键原材料说明'],['conformityEn','法规与责任说明'],['disclaimerEn','资料说明']];
function readValue(db,model,instance,rule){const [owner,key]=rule.code.split('.');const source=owner==='company'?(model.company||db.company):owner==='instance'?instance:model;return source?.[key];}
function initialPlan(modelId){return {modelId,market:'',targetDate:'',tasks:roadmap.map(([key,title])=>({key,title,status:'待开始',owner:'',dueDate:''})),updatedAt:new Date().toISOString()};}

export default function ReadinessTools({db,change,setModal,notify}) {
  const visibleModels=db.models.filter(model=>!model.demoArchived);
  const [productId,P]=useState(visibleModels[0]?.id||'');
  const model=visibleModels.find(item=>item.id===productId);
  const instance=model&&db.instances.find(item=>item.modelId===model.id);
  const rules=model?db.rules.filter(rule=>applicable(rule,model)&&templateIncludes(rule,model)):[];
  const fieldRows=rules.map(rule=>({rule,value:readValue(db,model,instance,rule)}));
  const missing=fieldRows.filter(row=>row.rule.required==='必填'&&(row.value==null||String(row.value).trim()===''));
  const docs=model?db.documents.filter(doc=>doc.target===model.id):[];
  const plan=db.readinessPlans?.find(item=>item.modelId===productId);
  const [draft,D]=useState(()=>plan||initialPlan(productId));
  const languageContent=useMemo(()=>contentFields.filter(([key])=>String(model?.[key]||'').replace(/<[^>]*>/g,' ').trim()),[model]);
  const planStats={done:(draft.tasks||[]).filter(task=>task.status==='已完成').length,total:(draft.tasks||[]).length};
  async function savePlan(next=draft){return change(data=>{data.readinessPlans||=[];const value={...next,updatedAt:new Date().toISOString()};const i=data.readinessPlans.findIndex(item=>item.modelId===productId);if(i<0)data.readinessPlans.push(value);else data.readinessPlans[i]=value;},'实施路线图已保存');}
  function selectProduct(value){P(value);const existing=db.readinessPlans?.find(item=>item.modelId===value);D(existing||initialPlan(value));}
  const openProduct=()=>model&&setModal({type:'model',value:model});
  const setTask=(index,patch)=>D({...draft,tasks:draft.tasks.map((task,i)=>i===index?{...task,...patch}:task)});
  if(!model)return <section className="readiness-tools"><h2>产品准备工具</h2><p>请先建立产品资料，再查看对应准备情况。</p><button className="primary" onClick={()=>setModal({type:'model'})}>新建产品</button></section>;
  return <section className="readiness-tools">
    <div className="readiness-toolbar"><label className="form-field">选择产品<select value={productId} onChange={e=>selectProduct(e.target.value)}>{visibleModels.map(item=><option key={item.id} value={item.id}>{item.name}</option>)}</select></label><button className="outline" onClick={openProduct}>编辑产品资料</button></div>
    <nav className="readiness-anchor"><a href="#readiness-check">产品准备清单</a><a href="#readiness-roadmap">实施路线图</a><a href="#readiness-language">目标市场语言</a><a href="#readiness-evidence">证据资料</a></nav>
    <section id="readiness-check" className="readiness-section"><div className="readiness-heading"><div><h2><ListChecks size={21}/>产品准备清单</h2><p>{model.name} · 反映当前录入状态和字段配置，不作法律适用性或产品合规结论。</p></div><span className="readiness-count">{missing.length} 个“系统必填”字段待补 / {fieldRows.length} 个模板字段</span></div>
      <div className="readiness-summary"><div><strong>{fieldRows.length-missing.length}</strong><span>字段已录入或无需必填</span></div><div><strong>{docs.length}</strong><span>关联文件</span></div><div><strong>{db.applicableMaterials.filter(item=>item.modelId===model.id).length}</strong><span>适用资料记录</span></div><div><strong>{planStats.done}/{planStats.total}</strong><span>路线图任务完成</span></div></div>
      <div className="readiness-table-wrap"><table><thead><tr><th>字段</th><th>维护层级</th><th>系统配置</th><th>当前资料</th><th>来源</th></tr></thead><tbody>{fieldRows.map(({rule,value})=><tr key={rule.code}><td><strong>{rule.zh}</strong><small>{rule.code}</small></td><td>{{company:'企业/产品责任',model:'产品',instance:'单体',batch:'批次'}[rule.level]||rule.level}</td><td>{rule.required==='必填'?'字段设置为必填':rule.required}</td><td><span className={value!=null&&String(value).trim()?'readiness-present':'readiness-missing'}>{value!=null&&String(value).trim()?'已录入':'未录入'}</span></td><td>{rule.source||'企业资料'}</td></tr>)}</tbody></table></div>
      <small className="readiness-disclaimer">“字段设置为必填”是当前系统配置，不代表该字段在所有电池类别、投放日期和市场均有相同法定义务。字段目录见附件 VI、VII、XIII。</small>
    </section>
    <section id="readiness-roadmap" className="readiness-section"><div className="readiness-heading"><div><h2><Clock3 size={21}/>实施路线图</h2><p>将法规准备拆成企业内部任务；状态、负责人和日期由企业自行维护。</p></div><button className="outline" onClick={()=>{D(initialPlan(productId));notify('已载入标准准备任务，请保存后开始维护')}}>重新载入标准任务</button></div>
      <div className="readiness-form-grid"><label className="form-field">目标销售市场<input value={draft.market||''} placeholder="例如：德国、法国" onChange={e=>D({...draft,market:e.target.value})}/></label><label className="form-field">计划投放日期<input type="date" value={draft.targetDate||''} onChange={e=>D({...draft,targetDate:e.target.value})}/></label></div>
      <div className="readiness-roadmap">{draft.tasks.map((task,index)=><article key={task.key} className="readiness-task"><span className="readiness-task-index">{String(index+1).padStart(2,'0')}</span><strong>{task.title}</strong><select aria-label={task.title+'状态'} value={task.status} onChange={e=>setTask(index,{status:e.target.value})}><option>待开始</option><option>进行中</option><option>待外部确认</option><option>已完成</option></select><input aria-label={task.title+'负责人'} placeholder="负责人" value={task.owner} onChange={e=>setTask(index,{owner:e.target.value})}/><input type="date" aria-label={task.title+'计划日期'} value={task.dueDate} onChange={e=>setTask(index,{dueDate:e.target.value})}/></article>)}</div><button className="primary" onClick={()=>savePlan()}>保存路线图</button>
    </section>
    <section id="readiness-language" className="readiness-section"><div className="readiness-heading"><div><h2><Languages size={21}/>目标市场语言检查</h2><p>参数名译文与产品说明语言是两类资料，请分别确认。</p></div></div><div className="readiness-form-grid"><label className="form-field">目标销售市场<input value={draft.market||''} placeholder="请输入成员国/销售区域" onChange={e=>D({...draft,market:e.target.value})}/></label><label className="form-field">准备核对的终端用户语言<select value={draft.targetLanguage||''} onChange={e=>D({...draft,targetLanguage:e.target.value})}><option value="">请选择</option>{Object.entries(passportLanguages).map(([code,name])=><option value={code} key={code}>{name}</option>)}</select></label></div><div className="readiness-language-note"><TriangleAlert size={18}/><p>国家/语言关系和具体法律文本要求需由企业按目标市场确认；本工具不自动判断某国的法定语言。界面参数名译文已配置 {Object.keys(passportLanguages).length} 种语言；产品当前开放 {(model.enabledLanguages||['en']).length} 种。</p></div>{languageContent.length?<div className="readiness-list">{languageContent.map(([key,label])=><div key={key}><span>{label}</span><strong>{draft.targetLanguage&&draft.targetLanguage!=='en'?'已填写英文源文；需由企业确认是否需要提供所选语言内容':'已填写英文内容'}</strong></div>)}</div>:<p>该产品尚未填写产品说明类图文内容。</p>}<p className="readiness-disclaimer">数据值、企业声明、安全警告、拆解和回收说明不因参数名称已翻译而自动满足语言要求。机器翻译仅可作编辑辅助，正式文本由企业确认。目标市场、语言与路线图由同一产品计划保存。</p><a href="https://single-market-economy.ec.europa.eu/single-market/digital-product-passport/eu-digital-product-passport-faq-batteries_en#ref-7-data-requirements-applicability-and-language" target="_blank" rel="noopener noreferrer">欧委会 FAQ：语言与数据适用性 <ArrowRight size={14}/></a></section>
    <section id="readiness-evidence" className="readiness-section"><div className="readiness-heading"><div><h2><FileText size={21}/>证据资料</h2><p>按文件信息和适用资料记录提供盘点提示，不评价文件真伪或法律充分性。</p></div><button className="outline" onClick={()=>setModal({type:'document',value:{target:model.id}})}>关联/上传文件</button></div><div className="readiness-evidence-grid">{[['产品指南/技术文件',/guide|manual|technical|product/i,[]],['性能测试报告',/test|performance|capacity/i,[]],['EU 符合性声明',/declaration.*conform|conform.*declaration/i,[]],['材料/物质说明',/material|substance|composition/i,[]],['碳足迹/再生/尽调依据',/carbon|recycl|diligence|supply/i,['carbon','recycled','diligence']],['拆解/维修/安全资料',/disassembl|repair|safety/i,[]]].map(([title,pattern,kinds])=>{const matchedDocs=docs.filter(doc=>pattern.test((doc.name||'')+' '+(doc.nameEn||'')));const matchedEvidence=(db.applicableMaterials||[]).filter(item=>item.modelId===model.id&&kinds.includes(item.kind));const count=new Set([...matchedDocs.map(doc=>doc.id),...matchedEvidence.map(item=>item.id)]).size;return <div key={title}><strong>{title}</strong><span>{count?count+' 条已关联记录':'尚未识别到关联记录'}</span><button className="text-btn" onClick={()=>setModal({type:'document',value:{target:model.id}})}>维护文件 →</button></div>;})}</div><p className="readiness-disclaimer">计数只按名称/类型及资料关联关系识别，名称不规范时可能无法识别。文件存在不等于证据适用；企业需核对型号、工厂、期间、版本、签发主体及适用范围。</p></section>
    <section className="readiness-reference"><strong>依据与边界</strong><p>字段结构参考法规 (EU) 2023/1542 附件 VI、VII、XIII；适用日期、访问规则和成员国语言需结合现行法规及官方后续文件复核。此工具帮助分工和资料盘点，不是认证结论或法律意见。</p><a href={law} target="_blank" rel="noopener noreferrer">现行合并法规原文<ArrowRight size={14}/></a></section>
  </section>;
}
