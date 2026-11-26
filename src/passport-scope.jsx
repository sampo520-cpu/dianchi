import React,{useState} from 'react';
import {Search,ExternalLink} from 'lucide-react';
import {batteryCategories} from './templates.js';
import {queryPassportScope} from './passport-scope.js';
const law='https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:02023R1542-20260813';
export default function PassportScopeTool({db}) {
  const [form,F]=useState({category:'',energy:'',date:'2027-02-18',market:'yes',finished:'yes',exception:'no',operation:'original'}),[answer,A]=useState(null);
  const set=(key,value)=>{F({...form,[key]:value});A(null);};
  return <section className="scope-tool"><h2>电池护照适用查询</h2><form onSubmit={e=>{e.preventDefault();A(queryPassportScope(form));}}><div className="form-grid">
    <label className="form-field">从已有产品带入<select defaultValue="" onChange={e=>{const m=db.models.find(m=>m.id===e.target.value);if(m){F({...form,category:m.type,energy:m.energy??''});A(null);}}}><option value="">手动填写</option>{db.models.filter(m=>!m.demoArchived).map(m=><option value={m.id} key={m.id}>{m.name}</option>)}</select></label>
    <label className="form-field">法定用途类别<select value={form.category} onChange={e=>set('category',e.target.value)}><option value="">请选择</option>{batteryCategories.map(c=><option key={c}>{c}</option>)}</select></label>
    <label className="form-field">是否涉及欧盟投放市场或投入使用<select value={form.market} onChange={e=>set('market',e.target.value)}><option value="yes">是</option><option value="no">否</option><option value="unknown">不确定</option></select></label>
    <label className="form-field">是否为可安全供电的成品电池<select value={form.finished} onChange={e=>set('finished',e.target.value)}><option value="yes">是，已确认成品边界</option><option value="unknown">电芯 / 模组 / 系统边界不确定</option></select></label>
    <label className="form-field">额定能量（kWh）<input type="number" min="0" step="any" value={form.energy} onChange={e=>set('energy',e.target.value)}/></label>
    <label className="form-field">本次投放或投入使用日期<input type="date" value={form.date} onChange={e=>set('date',e.target.value)}/></label>
    <label className="form-field">是否可能涉及第 1 条排除情形<select value={form.exception} onChange={e=>set('exception',e.target.value)}><option value="no">否</option><option value="review">军事 / 太空 / 特殊设备等，需确认</option><option value="unknown">不确定</option></select></label>
    <label className="form-field">本次业务场景<select value={form.operation} onChange={e=>set('operation',e.target.value)}><option value="original">首次投放 / 普通维修后的原电池</option><option value="repurposed">准备再使用 / 准备转用 / 改变用途 / 再制造后投放</option></select></label>
  </div><button className="primary"><Search size={16}/>查询适用范围</button></form>
  {answer&&<div className={'scope-result scope-'+answer.status} role="status"><h3>{answer.title}</h3><ul>{answer.reasons.map(r=><li key={r}>{r}</li>)}</ul><p>依据：法规 (EU) 2023/1542 第 1、77 条；查询按所填信息给出初步范围判断，不代表资料已合规或产品已认证。</p></div>}
  <div className="scope-reference"><h3>判断依据</h3><p>第 77(1) 条中文概括：自 2027 年 2 月 18 日起，投放市场或投入使用的每个轻型交通工具电池、能量大于 2 kWh 的工业电池和电动汽车电池，应具有电子记录（电池护照）。</p><p>类别由实际用途及法规定义确定，不按化学体系单独判断；不要求护照不等于免除二维码、标签或其他义务。中文为非官方概括，正式投放前需复核最新修订与具体产品事实。</p><a href={law} target="_blank" rel="noopener noreferrer">法规原文：第 1、3、13、77 条 <ExternalLink size={14}/></a><a href="https://single-market-economy.ec.europa.eu/single-market/digital-product-passport/eu-digital-product-passport-faq-batteries_en#ref-3-what-constitutes-the-finished-battery" target="_blank" rel="noopener noreferrer">欧委会问答：成品电池边界 <ExternalLink size={14}/></a></div>
  </section>;
}
