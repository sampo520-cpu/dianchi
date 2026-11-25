import React from 'react';
import { ArrowRight, PackageCheck, Layers3, QrCode, ScanLine, RefreshCw, FileText } from 'lucide-react';
import './usage-help.css';

const steps = [
  ['01','维护产品','先选产品模板，填写同款电池共用的名称、参数、图文说明和资料。',PackageCheck,'/admin/products','进入产品与批次'],
  ['02','创建生产批次','从产品进入新批次，填写生产日期、工厂和编号规则；选择平台生成编号或导入企业已有编号。',Layers3,'/admin/batches','进入批次与二维码'],
  ['03','查看扫码展示','每个电池编号对应一条展示记录。扫描标签二维码可打开该电池的展示页面。公开页面不需要再放一个重复二维码。',ScanLine,'/admin/batches','查看批次与二维码'],
  ['04','持续维护资料','产品共用内容回到产品中更新；批次信息在批次中更新；单体信息和后续状态在具体电池记录中维护。',RefreshCw,'/admin/products','维护产品资料'],
];

export default function UsageHelp({db,navigate}) {
  const startProduct = () => {
    sessionStorage.setItem('open-create-product','1');
    navigate('/admin/products');
  };
  const startBatch = () => {
    const model = db.models.find(item => !item.demoArchived) || db.models[0];
    if (!model) return navigate('/admin/products');
    sessionStorage.setItem('new-batch-product',model.id);
    navigate('/admin/batches');
  };
  const openProductList = () => navigate('/admin/products');
  const actions = { '进入产品与批次':startProduct, '进入批次与二维码':startBatch, '查看批次与二维码':openProductList, '维护产品资料':openProductList };
  return <article className="usage-help">
    <div className="page-title"><div><h1>使用帮助</h1><p>按“产品 → 批次 → 电池编号”的顺序建立和维护资料。</p></div></div>
    <section className="usage-flow"><div className="usage-flow-head"><span>操作流程</span><p>共享资料先维护一次，生产信息按批次填写，单体信息跟随每个编号。</p></div>{steps.map(([num,title,description,Icon,path,action])=><article key={num} className="usage-step"><span className="usage-step-number">{num}</span><Icon size={23}/><div><h2>{title}</h2><p>{description}</p></div><button className="text-btn" onClick={actions[action]}>{action}<ArrowRight size={15}/></button></article>)}</section>
    <section className="usage-levels"><div className="usage-flow-head"><span>资料维护层级</span><p>扫码页展示会把各层级资料组合起来；维护时按资料所属层级录入。</p></div><div className="usage-level-table"><div className="usage-level-row usage-level-header"><span>资料层级</span><span>维护内容示例</span><span>维护入口</span></div><div className="usage-level-row"><strong>产品资料</strong><span>产品名称、化学体系、技术参数、通用说明和图文资料</span><span>产品与批次 → 选择产品</span></div><div className="usage-level-row"><strong>生产批次</strong><span>生产日期、工厂、批次号，以及平台生成或导入的电池编号</span><span>批次与二维码 → 选择批次</span></div><div className="usage-level-row"><strong>单体资料</strong><span>单体序列号、状态和后续更新记录</span><span>批次与二维码 → 查看电池记录</span></div></div></section>
    <section className="usage-note"><FileText size={20}/><p>字段类型设置决定资料录入时的输入方式。产品资料内容本身仍在产品编辑中维护；系统可用于多种电池一码展示，不限定为欧盟电池护照。</p></section>
  </article>;
}
