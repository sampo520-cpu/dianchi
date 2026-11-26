import React from 'react';
import {
  ArrowDown,
  ArrowRight,
  BadgeCheck,
  Building2,
  CircleHelp,
  ClipboardCheck,
  Database,
  ExternalLink,
  FileCheck2,
  Fingerprint,
  Globe2,
  KeyRound,
  LifeBuoy,
  Link2,
  Network,
  ShieldCheck,
  UserRoundCheck,
} from 'lucide-react';

const sources = {
  law: 'https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:02023R1542-20260813',
  registryAct: 'https://eur-lex.europa.eu/eli/reg_impl/2026/1778/oj/eng',
  faq: 'https://single-market-economy.ec.europa.eu/single-market/digital-product-passport/eu-digital-product-passport-faq-batteries_en',
  portal: 'https://single-market-economy.ec.europa.eu/single-market/digital-product-passport/batteries_en',
  test: 'https://registry.acc.product-passport.ec.europa.eu/',
  guide: 'https://single-market-economy.ec.europa.eu/document/download/079a45e2-469f-4eec-b1e5-32e8e05d1357_en?filename=dpp_registry_user_guide_for_economic_operators.pdf',
  dataPoints: 'https://single-market-economy.ec.europa.eu/document/download/cd1e5e6c-4a4a-4b99-995a-49eb6916187e_en?filename=Digital%20Batteries%20Passport%20-%20data%20point%20by%20category.pdf',
  helpdesk: 'https://single-market-economy.ec.europa.eu/single-market/digital-product-passport/dpp-registry_en',
  eidas: 'https://eur-lex.europa.eu/eli/reg/2014/910/oj/eng',
};

const entryLinks = [
  { title: '打开 Registry 测试环境', description: '熟悉账户、登记和测试操作；这是测试环境，不代表正式生产入口。', label: '进入测试环境', href: sources.test, Icon: Globe2, tone: 'green' },
  { title: '经济运营者操作手册', description: '查看 Registry 账户及登记工作流的官方说明。', label: '查看操作手册', href: sources.guide, Icon: FileCheck2, tone: 'blue' },
  { title: '电池护照数据点', description: '查看按电池类别整理的数据项，供内部资料准备参考。', label: '查看数据点文件', href: sources.dataPoints, Icon: Database, tone: 'amber' },
  { title: 'Registry 支持服务', description: '咨询 Registry 功能、账户开通和使用；政策解释请查阅欧委会资料。', label: '打开支持服务', href: sources.helpdesk, Icon: LifeBuoy, tone: 'purple' },
];

const steps = [
  {
    title: '确认谁负责登记',
    short: '确认责任主体',
    Icon: Building2,
    action: '确认具体成品电池、首次投放欧盟市场或投入使用的时间，并根据供应链确认负责的经济运营者。电池护照登记由将电池投放欧盟市场的经济运营者负责。',
    prepare: '企业法定名称和地址、企业角色、目标市场、联系人、内部经办人及授权关系。非欧盟运营者也须按 Registry 流程完成验证。',
    result: '形成一份明确的“谁负责、谁操作、谁提供资料”记录。书面授权可委托他方操作，但不会自动转移法定责任。',
    reference: '法规第 77(1)、77(4) 条；FAQ 2、3',
    href: sources.faq,
  },
  {
    title: '创建账户并验证身份',
    short: '账户与身份验证',
    Icon: UserRoundCheck,
    action: '从官方 Registry 入口按页面提示创建账户，再使用允许的电子身份方式完成经济运营者验证。普通邮箱注册不等于完成企业身份验证。',
    prepare: '企业成立/注册信息、经办人身份与授权、符合要求的电子印章或其他适用电子身份凭证。法人、自然人和个体经营者适用方式可能不同。',
    result: '获得已验证的 Registry 操作身份。验证有效期与身份凭证期限相关，且最迟需按规定周期重新验证。',
    reference: '实施法规 (EU) 2026/1778 第 4 条；FAQ 6.1–6.2',
    href: sources.registryAct,
  },
  {
    title: '准备护照数据和唯一标识',
    short: '数据与唯一标识',
    Icon: Fingerprint,
    action: '为具体电池准备护照数据，关联型号信息与单体信息；确认护照解析地址、数据访问安排和适用语言。',
    prepare: '按适用数据点整理字段、单位、值和来源；准备标准化唯一标识及其二维码/载体。内部序列号不重复，并不自动证明符合唯一标识标准。',
    result: '每个具体电池有可解析的标识，护照内容可访问且能对应到责任运营者。完整护照由企业或获书面授权的运营者托管。',
    reference: '法规第 77(2)–(5)、78 条；FAQ 5、6.5、7',
    href: sources.law,
  },
  {
    title: '选择登记方式并提交',
    short: '选择提交方式',
    Icon: Network,
    action: '根据企业数量和 IT 能力，按官方当前支持的方式进行手工登记、批量上传或 API 对接；首次可先在测试环境熟悉流程。',
    prepare: '待登记的标识及官方要求的数据；如采用批量或 API，按 Registry 最新技术说明准备文件结构、字段映射和错误处理。',
    result: '取得系统实际返回的处理结果。企业现有通用 Excel/ZIP 导出不应直接视为 Registry 合格上传文件。',
    reference: 'FAQ 5.1、Registry User Guide',
    href: sources.faq,
  },
  {
    title: '保存凭证并持续维护',
    short: '留存并维护',
    Icon: ClipboardCheck,
    action: '保存登记成功结果和相关标识，记录提交时间、操作人及后续更正；安排护照内容、访问权限和账户验证的持续维护。',
    prepare: 'Registry 返回的登记证明/结果、提交记录、护照版本、负责人、更新流程和备份方案。',
    result: '形成可追溯的内部登记记录。登记凭证不是产品认证证书，也不证明护照全部数据已通过实质性审查。',
    reference: '法规第 77(10) 条；FAQ 5.3、10',
    href: sources.faq,
  },
];

const preparations = [
  {
    role: '企业 / 法务',
    Icon: Building2,
    purpose: '确定法定责任主体和账户操作权限。',
    items: [
      ['主体信息', '示例：Fictional Energy GmbH；注册地 Berlin', '名称与注册证明不一致；地址未更新'],
      ['职责与授权', '示例：EU importer 负责登记；Quality Lead 为操作人', '只写“欧代负责”，没有核实投放市场角色或书面授权'],
      ['身份验证材料', '示例：企业验证方式、经办人授权和凭证有效期记录', '把邮箱登录当成企业身份验证完成'],
    ],
  },
  {
    role: '产品 / 质量',
    Icon: ShieldCheck,
    purpose: '整理型号资料、技术依据和对外展示内容。',
    items: [
      ['产品与类别资料', '示例：Model ESS-48；用途、化学体系及额定参数', '型号名称与技术文件/产品铭牌不同'],
      ['测试与声明文件', '示例：ESS-48_Performance_Test_v2.pdf；签发方及日期可追溯', '文件没有型号范围、版本或签发信息'],
      ['电池护照数据点', '示例：字段值 + 单位 + 来源文件/系统 + 维护责任人', '只有填写值，没有单位、来源或更新时间'],
    ],
  },
  {
    role: '生产 / 数据',
    Icon: Fingerprint,
    purpose: '把具体电池、生产记录和护照标识对应起来。',
    items: [
      ['单体与批次清单', '示例：批次 B-2026-08；序列号 QY26A000123', '序列号重复、漏号或与实物标签不一致'],
      ['标识与解析地址', '示例：唯一标识、二维码内容、护照解析 URL 三者映射表', '二维码指向临时网址或无法长期访问'],
      ['动态数据来源', '示例：BMS 提供运行期数据；记录字段、频率和责任系统', '把型号固定参数误当作单体动态信息'],
    ],
  },
  {
    role: 'IT / 服务商',
    Icon: KeyRound,
    purpose: '保证护照可以稳定访问、更新、授权和迁移。',
    items: [
      ['域名和托管', '示例：企业控制的 HTTPS 解析域名及服务责任人', '域名、证书或服务器到期无人维护'],
      ['提交与接口方案', '示例：先手工试用；评估规模后再选择批量或 API', '把本平台导出文件误认为官方 Registry 模板'],
      ['访问、备份与审计', '示例：公开/受限数据权限表、备份周期、事件记录', '没有权限责任人、恢复流程或变更记录'],
    ],
  },
];

const questions = [
  ['到底由谁提交电池护照登记？', '根据欧委会 FAQ，电池护照应由将电池投放欧盟市场或投入使用的经济运营者登记。具体主体要结合实际供应链和法律角色确认，不能只凭生产地点或“欧代”称呼判断。'],
  ['Registry 会保存完整电池护照吗？', '不会。欧委会 FAQ 说明，完整护照由经济运营者或获书面授权的运营者托管；Registry 主要记录登记和元数据，并在法规规定时协助主管机关访问。'],
  ['登记成功是否代表产品通过欧盟认证？', '不是。Registry 登记、适用的产品符合性评估、EU 符合性声明以及各成员国生产者登记/EPR 是不同事项。登记回执不等于产品认证或对所有数据的认可。'],
  ['手工、批量上传和 API 应该怎么选？', '官方 FAQ 列明 Registry 支持手工登记，也可批量上传或通过 API 集成。可以先在测试环境试用；再结合记录数量、现有系统和官方最新技术说明选择。'],
  ['企业内部序列号能直接作为法规唯一标识吗？', '不一定。法规要求唯一标识符合规定的标准要求；企业内部不重复的编号本身并不能证明符合标准。应核对适用标准并确认标识与二维码、护照 URL 的关联。'],
  ['测试环境和正式登记有什么区别？', '当前页面提供的是欧委会公开的 Registry 测试环境入口，用来熟悉功能和流程。它不是正式生产入口；测试操作、数据和结果不应当作真实登记凭证。正式入口和流程以欧委会后续公布的信息为准。'],
  ['登记后需要保存哪些记录？', '至少保留实际返回的登记结果/证明、关联唯一标识、提交时间、操作人及更正记录，并维护护照版本和访问安排。具体凭证格式以 Registry 实际流程为准。'],
  ['本系统现在能代替 Registry 提交吗？', '不能。本系统目前用于维护产品、批次、单体码、护照展示和导出；尚未连接真实 Registry 账户验证或登记接口。系统中的保存、发布和导出都不等于完成官方登记。'],
];

function OfficialLink({ href, children, className = '' }) {
  return <a className={className} href={href} target="_blank" rel="noopener noreferrer">{children}<ExternalLink size={15} aria-hidden="true"/></a>;
}

export default function RegistrationGuide({navigate}) {
  return <article className="registration-guide">
    <header className="registration-hero">
      <span className="registration-kicker">登记操作指南</span>
      <h2>从企业验证到电池护照登记</h2>
      <p>先看官方入口，再按步骤确认责任主体、准备资料并了解登记方式。</p>
      <small>内容核对：2026-11-26 · 中文为非官方概括，以欧委会最新流程及有效法规为准。</small>
      <div className="registration-manual-entry"><div><strong>需要跟着官方界面逐步操作？</strong><p>阅读完整中文图文手册，查看组织验证、合格签署和登记错误处理。</p></div><button className="primary" onClick={() => navigate('/admin/insights/registry-manual')}><FileCheck2 size={18}/>阅读完整中文手册<ArrowRight size={16}/></button></div>
    </header>

    <section className="registration-entry" id="registration-entry">
      <div className="registration-section-title"><div><span>01 / 官方入口</span><h3>官方入口与资料</h3></div><p>Registry 外部入口 · 新窗口打开</p></div>
      <div className="registration-entry-grid">{entryLinks.map(({ title, description, label, href, Icon, tone }) => <article className={'registration-entry-card '+tone} key={title}>
        <span className="registration-entry-icon"><Icon size={21}/></span><h4>{title}</h4><p>{description}</p><OfficialLink href={href}>{label}</OfficialLink>
      </article>)}</div>
      <div className="registration-note"><CircleHelp size={19}/><p>电池护照目前应在 DPP Registry 登记，但 Registry 不等于护照托管平台，也不颁发统一的“电池护照认证”。本系统尚未连接真实 Registry。</p></div>
    </section>

    <section className="registration-steps-section" id="registration-steps">
      <div className="registration-section-title"><div><span>02 / 登记流程</span><h3>五步了解登记流程</h3></div><p>每一步都列出需要准备的内容和预期结果</p></div>
      <div className="registration-flow" aria-label="电池护照登记五步流程">{steps.map(({ title, short, Icon }, index) => <React.Fragment key={title}>
        <a className="registration-flow-step" href={'#registration-step-'+index}><span>{String(index+1).padStart(2,'0')}</span><i><Icon size={20}/></i><strong>{short}</strong></a>
        {index < steps.length-1 && <ArrowRight className="registration-flow-arrow" size={17} aria-hidden="true"/>}
      </React.Fragment>)}</div>
      <div className="registration-step-list">{steps.map(({ title, Icon, action, prepare, result, reference, href }, index) => <article className="registration-step" id={'registration-step-'+index} key={title}>
        <div className="registration-step-top"><span>{String(index+1).padStart(2,'0')}</span><Icon size={22}/><h4>{title}</h4></div>
        <div className="registration-step-columns"><div><strong>操作说明</strong><p>{action}</p></div><div><strong>提前准备</strong><p>{prepare}</p></div><div><strong>完成后得到</strong><p>{result}</p></div></div>
        <OfficialLink href={href}>{reference} 官方依据</OfficialLink>
        {index < steps.length-1 && <ArrowDown className="registration-step-down" size={17} aria-hidden="true"/>}
      </article>)}</div>
    </section>

    <section className="registration-preparation" id="registration-preparation">
      <div className="registration-section-title"><div><span>03 / 资料准备</span><h3>资料准备清单与填写示例</h3></div><p>按团队分工整理；以下企业、型号、编号和文件名均为虚构参考</p></div>
      <div className="registration-sample-banner"><BadgeCheck size={19}/><p>示例用于说明资料长什么样，不是欧盟官方模板，也不代表该示例已经符合登记或认证要求。</p></div>
      <div className="registration-role-list">{preparations.map(({ role, Icon, purpose, items }) => <details className="registration-role" key={role}>
        <summary><span className="registration-role-icon"><Icon size={20}/></span><span><strong>{role}</strong><small>{purpose}</small></span><span className="registration-role-toggle">展开清单</span></summary>
        <div className="registration-material-table-wrap"><table className="registration-material-table"><thead><tr><th>资料项目</th><th>参考示例</th><th>常见缺项</th></tr></thead><tbody>{items.map(([name, example, gap]) => <tr key={name}><th scope="row">{name}</th><td>{example}</td><td>{gap}</td></tr>)}</tbody></table></div>
      </details>)}</div>
      <div className="registration-preparation-foot"><Link2 size={17}/><p>平台内的“产品准备清单”用于盘点已录入字段和关联文件；本指引用于理解 Registry 外部操作和团队资料分工。两者都不表示已完成官方登记。</p></div>
    </section>

    <section className="registration-faq" id="registration-faq">
      <div className="registration-section-title"><div><span>04 / 常见问答</span><h3>常见问题</h3></div><p>点击问题展开说明</p></div>
      {questions.map(([question, answer], index) => <details key={question} className="registration-faq-item" open={index===0}>
        <summary><span>{question}</span><span aria-hidden="true">+</span></summary><p>{answer}</p>
      </details>)}
    </section>

    <section className="registration-boundaries" id="registration-boundaries">
      <h3>平台能力与法规边界</h3>
      <p>本平台可维护产品资料、创建批次和单体码、预览多语言信息页及导出资料；目前没有接入 Registry 账户验证、标准标识发行、登记提交或官方回执查询。保存、发布和导出均不等于完成欧盟登记。</p>
      <p>本页中文内容是对欧委会 FAQ、操作手册及法规的非官方概括。费用、处理时限和正式生产入口如官方资料未明确，不作推测。登记与产品符合性评估、CE/EU 符合性声明和成员国 EPR 应分别安排。</p>
      <div><OfficialLink href={sources.faq}>欧委会电池护照 FAQ</OfficialLink><OfficialLink href={sources.registryAct}>Registry 实施法规 (EU) 2026/1778</OfficialLink><OfficialLink href={sources.eidas}>eIDAS 法规原文</OfficialLink><OfficialLink href={sources.portal}>欧委会电池护照专题</OfficialLink></div>
    </section>
  </article>;
}
