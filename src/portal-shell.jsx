import React, { useState } from 'react';
import { Activity, Store, Sparkles, Search, GraduationCap, ShoppingCart, Cpu, BriefcaseBusiness, ChevronDown, ChevronRight, Home, QrCode } from 'lucide-react';
export function PortalTop({ notify, navigate }) {
  return <div className="portal-top">
    <a className="portal-brand" href="/admin/products" aria-label="数字门户"><img src="/portal-logo.png" alt="数字门户" /></a>
    <nav aria-label="系统导航">{['工作台', '门户运营', '营销中心', '客户中心', '业务中心', '服务中心', '更多'].map(label => <button key={label} onClick={() => label === '工作台' ? navigate('/admin/dashboard') : notify(label + '为原系统入口，本原型仅接入电池溯源码')} >{label}{label === '更多' && <ChevronDown size={12}/>}</button>)}<i/>{['AI智能中心', '全球化发展', '行业竞争力', '数字化服务'].map(label => <button key={label} onClick={() => notify(label + '为原系统入口')}>{label}</button>)}</nav>
    <div className="portal-tools">{[[Activity,'数据看板'],[Store,'应用中心'],[Sparkles,'AI'],[Search,'搜索'],[GraduationCap,'学习中心']].map(([Icon,label]) => <button title={label} aria-label={label} key={label} onClick={() => notify(label + '为原系统入口')}><Icon size={19}/>{label === 'AI' && 'AI'}</button>)}<span>qzzhangzhenbo@300.cn</span></div>
  </div>;
}
export function PortalSide({ nav, tab, navigate, db, notify, open }) {
  const [expanded, E] = useState(true);
  return <aside className={'portal-side ' + (open ? 'open' : '')}>
    <div className="portal-side-title"><BriefcaseBusiness size={16}/>业务中心</div>
    <button className="portal-parent" onClick={() => notify('订购支付为原系统入口')}><ShoppingCart size={16}/>订购支付<ChevronDown size={14}/></button>
    <button className="portal-parent" onClick={() => notify('产品智能选型为原系统入口')}><Cpu size={16}/>产品智能选型<ChevronDown size={14}/></button>
    <button className="portal-parent portal-current" onClick={() => E(!expanded)} aria-expanded={expanded}><QrCode size={16}/>电池溯源码{expanded ? <ChevronDown size={14}/> : <ChevronRight size={14}/>}</button>
    {expanded && <nav>{nav.filter(([key]) => key !== 'dashboard').map(([key,label]) => <button key={key} className={tab === key ? 'active' : ''} onClick={() => navigate('/admin/' + key)}>{label}{key === 'requests' && db.requests.some(r => r.status === '待处理') && <small>{db.requests.filter(r => r.status === '待处理').length}</small>}</button>)}</nav>}
  </aside>;
}
export function PortalCrumb({ label, navigate, items=[] }) {
  return <div className="portal-crumb"><span>业务中心</span><ChevronRight size={13}/><button onClick={() => navigate('/admin/products')}><Home size={14}/>首页</button><ChevronRight size={13}/><span>业务中心</span><ChevronRight size={13}/><span>电池溯源码</span><ChevronRight size={13}/>{items.length?<><button onClick={()=>navigate('/admin/insights')}>{label}</button>{items.map((item,index)=><React.Fragment key={index}><ChevronRight size={13}/>{item.path?<button onClick={()=>navigate(item.path)}>{item.label}</button>:<b>{item.label}</b>}</React.Fragment>)}</>:<b>{label}</b>}</div>;
}
