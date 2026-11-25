import React, { useEffect, useState } from 'react';
import { BookOpen, BatteryCharging, Leaf, QrCode, FileText, ArrowUpRight, CalendarDays, Battery, Car, Bike, Factory, Zap, FlaskConical, Recycle, ShieldCheck, ChevronDown, ExternalLink } from 'lucide-react';
import './regulation-guide.css';

const legal = 'https://eur-lex.europa.eu/eli/reg/2023/1542/2026-08-13/eng/';
const ul = 'https://www.ul.com/services/eu-battery-regulation-compliance';
const amendment = 'https://eur-lex.europa.eu/eli/reg/2025/1561/oj';
const ulBatteryImage = '/ul-battery-hero.jpg';
const sections = [['scope','适用范围'],['requirements','主要要求'],['dates','关键时间'],['lifecycle','生命周期方法'],['offerings','UL 服务主题'],['faq','常见问题'],['sources','参考来源']];
const ulOfferings = [
  ['电池测试与认证服务', ShieldCheck, '覆盖电池安全、性能、耐久性及相关认证服务。具体测试方案、标准和认证范围以 UL 官方说明为准。', 'https://www.ul.com/services/battery-safety-testing'],
  ['供应链可持续性支持', Leaf, '关注生命周期影响、碳足迹、再生材料和供应链尽职调查相关支持。', 'https://www.ul.com/services/product-carbon-footprint-verification'],
  ['化学合规与供应链透明度', FlaskConical, '关注物质数据、化学合规资料和供应链信息管理。', 'https://www.ul.com/software/ultrus/chemical-data-compliance-management'],
];
const faqs = [
  ['哪些企业和电池会受到法规影响？', '法规覆盖电池生命周期相关经营者。具体义务按电池类别、容量、企业角色及适用条款判断，不能仅凭一池一码页面判断是否完成法定义务。'],
  ['近期需要关注哪些关键日期？', '不同义务的生效时间不同。电池护照与尽职调查义务有明确日期，碳足迹和再生材料要求还需要结合类别及配套法案。可在本页时间线查看并打开官方法规核对。'],
  ['哪些行业需要优先整理资料？', '电动汽车、储能、消费电子、轻型交通及工业应用均可能涉及不同要求。企业应先明确电池类别、在供应链中的角色和销售市场。'],
  ['电池护照是否等于合规认证？', '不是。护照用于按规定关联和提供信息，不取代测试、符合性评定、技术文件或经营者应履行的其他义务。'],
  ['企业如何开始准备？', '建立产品资料清单、确认供应链与责任主体、收集测试和材料证据，并按类别和适用时间安排评估；持续维护批次与单体信息。'],
  ['软件工具在准备过程中能做什么？', '工具可以帮助整理材料、追踪数据和管理记录；其输出不能自动代替适用性判断、实验室测试、第三方评定或法律意见。'],
];
const timeline = [
  ['2023', [
    ['法规生效', '《欧盟电池和废电池法规》(EU) 2023/1542 生效，取代原《电池指令》2006/66/EC。', '法规生效不代表所有条款同日开始适用。'],
  ]],
  ['2024', [
    ['性能与耐久性 · 第 10 条', '图示针对 LMT、电动汽车及容量大于 2 kWh 的可充电工业电池；一次电池不在该项范围内。', '需按法规类别及适用日期核实具体要求。'],
    ['固定式储能安全 · 第 12 条', '固定式电池储能系统需要满足安全要求，并准备相应安全参数和测试资料。', '适用标准与验证方式应结合配套要求确认。'],
    ['标签、标识与信息 · 第 17–20 条', '图示列出自 2024 年 8 月 18 日起适用于各类电池的标签和信息要求。', '部分标签要求存在后续过渡安排，见第 13、77 条及附件 VI。'],
    ['有害物质限制 · 第 6 条', '关注电池中的受限物质要求；图示特别提到便携式电池中的铅限制。', '核对法规附件 I、豁免和后续修订。'],
    ['健康状态与预期寿命信息 · 第 14 条', '图示涉及带电池管理系统的 LMT、电动汽车和固定式储能电池信息。', '信息获取和访问范围须按法规及数据权限规定处理。'],
  ]],
  ['2025', [
    ['标签信息补充 · 附件 VI', '图示注明需使用“分类收集”标识，并标示电池是否含镉或铅。', '标识尺寸、豁免和适用时间以现行法规及实施规则为准。'],
  ]],
  ['2026', [
    ['工业电池碳足迹 · 第 7 条', '图示列出容量大于 2 kWh 的工业电池碳足迹要求，并排除不可充电电池。', '具体申报节点还取决于适用的授权法案或实施法案。'],
    ['电动汽车电池碳足迹 · 第 7 条', '图示以相关授权或实施法案生效后 12 个月作为预期节点。', '这是相对日期，不宜仅按日历年份判断。'],
  ]],
  ['2027', [
    ['可拆卸与可更换性 · 第 11 条', '图示列出便携式和 LMT 电池相关要求。', '需结合产品类别、例外情形和后续修订核实。'],
    ['供应链尽职调查 · 第七章', '图示列出各类电池的尽职调查要求。', '修订法规 (EU) 2025/1561 将相关适用日期延期至 2027 年 8 月 18 日，并设有适用范围及豁免条件。'],
    ['电池护照 · 第 77 条', '电动汽车电池、LMT 电池及容量大于 2 kWh 的工业电池应建立电池护照。', '法规规定自 2027 年 2 月 18 日起适用。'],
  ]],
  ['2028', [
    ['便携式通用电池性能与耐久性 · 第 9 条', '图示列出便携式通用电池相关要求。', '具体执行要求结合第 9 条及适用配套规则。'],
    ['LMT 电池碳足迹 · 第 7 条', '图示以相关授权或实施法案生效后 18 个月作为预期节点。', '以法规规定和最终配套法案发布日期计算。'],
    ['再生材料含量 · 第 8 条', '图示列出电动汽车、SLI 及容量大于 2 kWh 的工业电池，再生材料含量相关要求；排除液流电池。', '具体信息披露、目标比例与时点需分开核对。'],
  ]],
  ['2033', [
    ['LMT 电池再生材料含量 · 第 8 条', '图示列出 LMT 电池再生材料要求节点。', '适用时点和目标要求以现行法规及配套规则为准。'],
  ]],
];
const topics = [
  ['材料与可持续性', Leaf, '关注物质限制、碳足迹、再生材料和供应链尽职调查；适用范围与实施日期需逐项确认。', '第 6–8、47–53 条'],
  ['性能、安全与标识', BatteryCharging, '按电池类别准备性能、耐久性、安全、标签和符合性资料。不能以一份通用证书代替所有要求。', '第 9–14、17–20 条'],
  ['信息与电池护照', QrCode, '将型号资料与单体信息关联，通过二维码访问；公开信息与受限信息分别管理。', '第 77–78 条、附件 XIII'],
  ['回收与责任', FileText, '关注生产者责任、收集、处理和回收要求，结合目标市场明确责任主体与执行安排。', '第 VIII 章'],
];

export default function RegulationGuide({ navigate }) {
  const [activeSection, setActiveSection] = useState(() => location.hash.replace('#reg-', '') || 'scope');
  useEffect(() => {
    const nodes = sections.map(([id]) => document.getElementById('reg-' + id)).filter(Boolean);
    let frame = 0;
    const updateActive = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const marker = 170;
        const current = nodes.filter(node => node.getBoundingClientRect().top <= marker).at(-1);
        setActiveSection(current?.id.replace('reg-', '') || 'scope');
      });
    };
    window.addEventListener('scroll', updateActive, { passive: true });
    window.addEventListener('hashchange', updateActive);
    const initialTarget = document.getElementById(location.hash.replace('#', ''));
    if (initialTarget) requestAnimationFrame(() => initialTarget.scrollIntoView());
    updateActive();
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', updateActive);
      window.removeEventListener('hashchange', updateActive);
    };
  }, []);
  return <article className="reg-guide">
    <section className="reg-hero">
      <img src={ulBatteryImage} alt="圆柱型电池产品" width="1920" height="1080"/>
      <div className="reg-hero-copy"><span className="reg-kicker">法规专题 · (EU) 2023/1542</span><h1>欧盟电池法规<br/>合规性介绍</h1><p>连接产品信息与全生命周期责任，<br/>从一份清晰、可追溯的电池资料开始。</p><a href={legal} target="_blank" rel="noreferrer">阅读欧盟法规原文 <ArrowUpRight size={18}/></a></div>
    </section>
    <div className="reg-reading"><span><BookOpen size={16}/>企业资料准备指南</span><span>资料核对：2026.11.25</span></div>
    <nav className="reg-anchor" aria-label="法规介绍目录">{sections.map(([id, label]) => <a key={id} className={activeSection === id ? 'active' : ''} aria-current={activeSection === id ? 'location' : undefined} href={'#reg-'+id} onClick={() => setActiveSection(id)}>{label}</a>)}</nav>
    <section id="reg-scope" className="reg-section"><div className="reg-section-heading"><span>01 / 适用范围</span><h2>覆盖不同电池，明确各自责任</h2></div><p>欧盟电池法规涵盖五类电池。先明确用途与法规类别，再确认容量、是否可充电、市场角色及销售目的地；不能只根据化学体系判断适用要求。</p><div className="reg-categories">{[[Battery,'便携式电池','日常设备与便携应用'],[Zap,'SLI 电池','启动、照明与点火'],[Bike,'LMT 电池','轻型交通工具'],[Car,'电动汽车电池','电动汽车动力应用'],[Factory,'工业电池','工业设备与储能应用']].map(([Icon,label,desc]) => <div key={label}><Icon size={34} strokeWidth={1.5}/><h3>{label}</h3><p>{desc}</p></div>)}</div><p className="reg-note">本系统支持其他电池的一池一码管理；建立溯源页面不等于该电池属于强制电池护照范围。<a href={legal} target="_blank" rel="noreferrer">查看第 1 条及相关定义 ↗</a></p></section>
    <section id="reg-requirements" className="reg-section"><div className="reg-section-heading"><span>02 / 核心议题</span><h2>从材料到回收，贯穿电池生命周期</h2></div><div className="reg-topics">{topics.map(([title, Icon, text, article],index) => <div key={title}><div className="reg-topic-top"><Icon size={28}/><span>0{index+1}</span></div><h3>{title}</h3><p>{text}</p><a href={legal} target="_blank" rel="noreferrer">{article} <ArrowUpRight size={13}/></a></div>)}</div></section>
    <section className="reg-passport-band"><div><QrCode size={38}/><h2>电池护照，让信息随电池同行</h2><p>产品共用资料、批次生产信息与单体身份，通过同一个二维码连接。内容按权限提供，为后续维护、再利用和回收保留信息入口。</p><a href={legal} target="_blank" rel="noreferrer">了解第 77–78 条与附件 XIII <ArrowUpRight size={16}/></a></div><div className="reg-identity-flow">{[[Factory,'产品','共享技术与责任资料'],[BatteryCharging,'批次','关联生产日期与工厂'],[QrCode,'单体','关联序列号与后续记录']].map(([Icon,title,text])=><div key={title}><Icon size={24}/><span><strong>{title}</strong><small>{text}</small></span></div>)}</div></section>
    <section id="reg-dates" className="reg-section"><div className="reg-section-heading"><span>03 / 法规时间线</span><h2>欧盟电池法规关键期限</h2></div><p>以下依据 UL Solutions 时间线图识别并整理为中文，保留图中 2023–2033 年节点。图示是预期执行时间概览；相关法规及配套法案可能更新，具体适用日期请核对官方文本。</p><a className="reg-outline-link" href={ul} target="_blank" rel="noreferrer">查看 UL 原文时间线说明 <ArrowUpRight size={15}/></a><div className="reg-full-timeline">{timeline.map(([year,events])=><section className="reg-year" key={year}><h3>{year}</h3><div className="reg-year-events">{events.map(([title,text,note])=><article key={title}><h4>{title}</h4><p>{text}</p><small>{note}</small><a href={title.includes('尽职')?amendment:legal} target="_blank" rel="noreferrer">查看法规依据 <ArrowUpRight size={13}/></a></article>)}</div></section>)}</div></section>
    <section id="reg-lifecycle" className="reg-lifecycle"><div className="reg-lifecycle-photo"><img src={ulBatteryImage} alt="电池产品图，图片来源 UL Solutions" loading="lazy"/><a href={ul} target="_blank" rel="noreferrer">图片来源：UL Solutions 原页面 <ExternalLink size={14}/></a></div><div className="reg-lifecycle-copy"><span>04 / 全生命周期</span><h2>以整体视角覆盖电池生命周期</h2><p>法规议题贯穿原材料、产品设计、制造、投放市场、使用、再利用和回收。企业需要将技术资料、供应链证据和生命周期记录组织起来，按产品类别与责任角色维护。</p><p>UL Solutions 在其原页面介绍了面向法规准备的测试认证、可持续性与化学合规相关服务。下方提供主题摘要与原文入口，服务由 UL Solutions 提供，与本平台无关。</p><a href={ul} target="_blank" rel="noreferrer" className="reg-inline-link">查看 UL Solutions 服务原文 <ArrowUpRight size={16}/></a></div></section>
    <section id="reg-offerings" className="reg-section"><div className="reg-section-heading"><span>05 / 服务主题参考</span><h2>UL Solutions 页面介绍的服务方向</h2><p>以下为服务主题的中文概述，非本平台服务承诺。点击卡片可在新窗口查看 UL 官方服务信息。</p></div><div className="reg-offerings">{ulOfferings.map(([title,Icon,description,href])=><a href={href} target="_blank" rel="noreferrer" key={title}><Icon size={28}/><span>UL SOLUTIONS · 服务介绍</span><h3>{title}</h3><p>{description}</p><b>查看原文 <ArrowUpRight size={15}/></b></a>)}</div><div className="reg-service-image-grid"><a href={ul} target="_blank" rel="noreferrer"><img src="/ul-battery-safety-icon.png" alt="UL Solutions 电池安全与测试图标" loading="lazy"/><span>电池测试与认证服务 · UL 来源</span></a><a href={ul} target="_blank" rel="noreferrer"><img src="/ul-sustainability-icon.png" alt="UL Solutions 可持续发展图标" loading="lazy"/><span>供应链可持续性 · UL 来源</span></a><a href={ul} target="_blank" rel="noreferrer"><img src="/ul-chemical-icon.png" alt="UL Solutions 化学合规图标" loading="lazy"/><span>化学合规与透明度 · UL 来源</span></a></div><div className="reg-support-grid">{[[ShieldCheck,'综合测试与认证','安全、性能、耐久性测试及认证服务'],[Leaf,'供应链可持续性','生命周期、碳足迹和可持续供应链议题'],[FlaskConical,'化学合规与透明度','化学数据管理与供应链信息透明']].map(([Icon,title,desc])=><div key={title}><Icon size={22}/><strong>{title}</strong><span>{desc}</span></div>)}</div></section>
    <section id="reg-faq" className="reg-section reg-faq"><div className="reg-section-heading"><span>07 / FAQ</span><h2>常见问题</h2><p>根据法规范围和本系统功能整理。涉及具体产品和经营者的判断，请结合正式法规及专业意见。</p></div>{faqs.map(([q,a],index)=><details key={q} open={index===0}><summary>{q}<ChevronDown size={18}/></summary><p>{a}</p><a href={index===1?legal:ul} target="_blank" rel="noreferrer">{index===1?'查看 EUR-Lex 法规原文':'查看 UL 页面相关说明'} <ArrowUpRight size={14}/></a></details>)}</section>
    <section id="reg-sources" className="reg-section reg-sources"><div className="reg-section-heading"><span>08 / 参考来源</span><h2>法规原文与服务资料</h2></div><p>资料核对：2026 年 11 月 25 日。中文内容为重新整理的导读，非官方译文；具体要求以正式法律文本及适用配套法案为准。</p><a href={legal} target="_blank" rel="noreferrer">EUR-Lex · 欧盟电池法规整合文本（2026-08-13）<ArrowUpRight size={16}/></a><a href={amendment} target="_blank" rel="noreferrer">EUR-Lex · 尽职调查修订法规 (EU) 2025/1561<ArrowUpRight size={16}/></a><a href={ul} target="_blank" rel="noreferrer">UL Solutions · EU Battery Regulation Compliance<ArrowUpRight size={16}/></a><p className="reg-note">UL Solutions 名称、服务描述和引用图片均归其权利人所有。本页仅作为资料导航，不代表本平台与 UL Solutions 存在合作、认可或服务代理关系。</p></section>
  </article>;
}
