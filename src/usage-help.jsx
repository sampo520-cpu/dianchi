import React, { useMemo, useState } from "react";
import {
  ArrowRight,
  PackageCheck,
  Layers3,
  QrCode,
  ScanLine,
  RefreshCw,
  FileText,
  Download,
  Printer,
  Search,
  ShieldCheck,
  CheckCircle2,
  ExternalLink,
  BookOpen,
} from "lucide-react";
import "./usage-help.css";

const steps = [
  ["01", "维护产品", "选择产品并维护共用参数、展示内容和资料。", PackageCheck],
  [
    "02",
    "创建批次与码",
    "填写批次信息，选择平台生成编号或导入已有编号；需要时再分次追加单体码。",
    Layers3,
  ],
  [
    "03",
    "预览展示并验码",
    "从二维码管理打开对应页面，核对产品、批次或单体信息与链接。",
    ScanLine,
  ],
  [
    "04",
    "导出并生产打印",
    "按对象筛选并选择文件方式；先打样、扫码核验，再批量打印贴标。",
    Printer,
  ],
  [
    "05",
    "持续维护与补打",
    "固定资料回到产品维护，批次和单体动态信息在各自记录维护；补打沿用原码。",
    RefreshCw,
  ],
];
const exportMethods = [
  [
    "单张 PNG",
    "产品码、批次码或少量补印",
    "下载二维码图片，用于说明书、包装或标签设计。",
    "产品码、批次码支持单张下载；单体码在二维码详情下载。",
  ],
  [
    "Excel 清单",
    "交接印刷厂、标签软件或产线系统",
    "导出编号与扫码链接等字段，作为排版软件的可变数据源。",
    "二维码管理支持按筛选结果导出单体码；产品码和批次码支持清单。",
  ],
  [
    "二维码 ZIP",
    "批量处理单体二维码图片",
    "下载后按编号文件名匹配，交付排版或印刷环节。",
    "当前单体码支持；产品码和批次码批量 ZIP 尚未提供。",
  ],
  [
    "A4 标签 PDF",
    "小批量生产、办公室打印",
    "配置行列、页边距和间距，匹配标签纸后以实际尺寸打印。",
    "当前单体码支持；产品码和批次码标签 PDF 尚未提供。",
  ],
  [
    "标签软件 + 打印机",
    "连续生产和批量标签",
    "导入 Excel，将扫码链接字段设置为二维码，编号字段设置为人眼可读文字。",
    "通过外部标签软件和设备完成；本系统不直连打印机。",
  ],
  [
    "产线喷码 / 激光打标",
    "自动化产线、大批量追溯",
    "由产线系统逐条提供编号和链接，设备打标后回读或抽检。",
    "需要企业设备、MES/API 集成；本系统当前未提供直连。",
  ],
];
const faqs = [
  [
    "导出文件会生成新码或激活码吗？",
    "不会。导出只是读取现有码及其链接，不生成新编号，也不改变现有码状态。",
  ],
  [
    "补打标签需要重新生成二维码吗？",
    "通常不需要。按原编号和原链接补打，避免旧标签与系统记录失去对应关系。",
  ],
  [
    "Excel 文件本身就是标签吗？",
    "不是。Excel 是编号、链接和其他字段的数据清单，需在标签软件中排版或由产线读取。",
  ],
  [
    "产品码、批次码和单体码可以混贴吗？",
    "应按实际用途明确标识层级。单体码需要逐件唯一对应；产品码和批次码分别指向产品或批次信息，不能冒充单体码。",
  ],
  [
    "本机导出的链接能直接给工厂扫码吗？",
    "只有部署在工厂可访问的 HTTPS 地址才适合跨设备扫码。本地 localhost 或浏览器本地数据不能作为外部生产地址。",
  ],
  [
    "如何验证打印质量？",
    "先用最终材料和设备打印样张，检查清晰度、留白、尺寸和贴附效果；用不同手机及预期网络环境扫码，确认打开目标记录。",
  ],
];
const groups = [
  {
    id: "tools",
    title: "工具查询",
    description: "快速查询适用范围并整理产品资料。",
    topics: [
      ["产品准备清单", "盘点产品、技术、语言和证据资料。", PackageCheck],
      ["护照适用查询", "按电池用途和类别初步了解适用范围。", ShieldCheck],
    ],
  },
  {
    id: "regulations",
    title: "法规与登记",
    description: "查看法规来源、登记流程和 Registry 中文操作手册。",
    topics: [
      ["欧盟电池法规", "浏览法规要点、时间安排及相关服务主题。", FileText],
      ["登记与合规指引", "查看官方入口、操作流程、问答与资料准备。", FileText],
      ["完整中文登记手册", "查看逐章翻译、官方截图和打印版本。", BookOpen],
    ],
  },
  {
    id: "help",
    title: "使用帮助",
    description: "了解资料维护、生码、展示、导出和生产打印。",
    topics: [
      ["系统使用与建档", "了解产品、批次和单体资料的维护关系。", Layers3],
      [
        "码的导出与生产打印",
        "对照导出格式规划打样、打印、贴标和验码。",
        Printer,
      ],
    ],
  },
  {
    id: "partners",
    title: "电池生态伙伴",
    description: "按企业需求查找可核验的官方资料和公开服务资源。",
    topics: [
      ["浏览生态资源", "筛选检测、供应链、回收、标识和系统服务资源。", Layers3],
    ],
  },
  {
    id: "news",
    title: "行业资讯",
    description: "查看法规原文、欧盟官方公告和技术资料来源。",
    topics: [["浏览行业资讯", "按法规进展、官方公告和技术资料筛选。", QrCode]],
  },
];
export default function UsageHelp({
  db,
  navigate,
  initialSection = "tools",
  initialTopic = "",
  initialResourceCategory,
  initialUpdateCategory,
  onCategoryChange,
  onTopicChange,
  change,
  setModal,
  notify,
}) {
  const [section, S] = useState(initialTopic || (initialSection==='partners'?'电池生态伙伴':initialSection==='news'?'行业资讯':'')),
    [category, C] = useState(initialSection),
    [mobileOpen, MO] = useState(false),
    [search, Q] = useState(""),
    [resourceCategory, RC] = useState(initialResourceCategory || "全部"),
    [updateCategory, UC] = useState(initialUpdateCategory || "全部");
  const startProduct = () => {
    sessionStorage.setItem("open-create-product", "1");
    navigate("/admin/products");
  };
  const startBatch = () => navigate("/admin/products");
  const goCodes = (type = "product") => navigate("/admin/batches?type=" + type);
  const select = (name) => {
    const topicCategory =
      {
        产品准备清单: "tools",
        护照适用查询: "tools",
        欧盟电池法规: "regulations",
        登记与合规指引: "regulations",
        完整中文登记手册: "regulations",
        系统使用与建档: "help",
        码的导出与生产打印: "help",
        电池生态伙伴: "partners",
        浏览生态资源: "partners",
        行业资讯: "news",
        浏览行业资讯: "news",
      }[name] || category;
    S(name);
    C(topicCategory);
    onTopicChange?.(name);
    onCategoryChange?.(topicCategory);
    MO(false);
    history.pushState(
      {},
      "",
      `/admin/insights?category=${topicCategory}&topic=${encodeURIComponent(name)}`,
    );
    window.scrollTo(0, 0);
  };
  const selectCategory = (id) => {
    const directTopic=id==='partners'?'电池生态伙伴':id==='news'?'行业资讯':'';
    C(id);
    S(directTopic);
    Q("");
    onCategoryChange?.(id);
    onTopicChange?.(directTopic);
    MO(false);
    history.pushState({}, "", `/admin/insights?category=${id}`);
    window.scrollTo(0, 0);
  };
  const backToCategory = () => {
    S("");
    onTopicChange?.("");
    history.pushState({}, "", `/admin/insights?category=${category}`);
  };
  const cards = [
    {
      title: "产品准备清单",
      desc: "盘点产品、技术、语言和证据资料。",
      go: () => select("产品准备清单"),
      icon: PackageCheck,
    },
    {
      title: "护照适用查询",
      desc: "按电池用途与类别初步了解适用范围。",
      go: () => select("护照适用查询"),
      icon: ShieldCheck,
    },
    {
      title: "登记与合规指引",
      desc: "查看 Registry 入口、流程、问答和中文手册。",
      go: () => select("登记与合规指引"),
      icon: FileText,
    },
    {
      title: "码的导出与生产打印",
      desc: "选择导出文件并规划打印、贴标和验码。",
      go: () => select("码的导出与生产打印"),
      icon: Printer,
    },
    {
      title: "电池生态伙伴",
      desc: "按企业需求浏览公开机构和官方资源。",
      go: () => select("电池生态伙伴"),
      icon: Layers3,
    },
    {
      title: "行业资讯",
      desc: "查看法规原文、官方公告与技术资料来源。",
      go: () => select("行业资讯"),
      icon: QrCode,
    },
  ];
  const matchingCards = useMemo(
    () =>
      cards.filter((c) =>
        (c.title + c.desc).toLowerCase().includes(search.toLowerCase()),
      ),
    [search],
  );
  const matchingResources = ecosystemResources.filter((r) =>
    [r.title, r.summary, r.category, r.provider, ...r.tags]
      .join(" ")
      .toLowerCase()
      .includes(search.toLowerCase()),
  );
  const matchingUpdates = industryUpdates.filter((r) =>
    [r.title, r.summary, r.category, r.source, ...r.tags]
      .join(" ")
      .toLowerCase()
      .includes(search.toLowerCase()),
  );
  return (
    <article className="usage-help">
      <button
        className="usage-mobile-nav"
        onClick={() => MO(!mobileOpen)}
        aria-expanded={mobileOpen}
      >
        {groups.find((g) => g.id === category)?.title || "工具查询"}{" "}
        <span>{mobileOpen ? "收起栏目" : "切换栏目"}</span>
      </button>
      <div className="support-layout">
        <aside
          className={"support-nav " + (mobileOpen ? "open" : "")}
          aria-label="支持中心栏目"
        >
          <strong className="support-nav-heading">工具资料</strong>
          {groups.map((group) => (
            <button
              className={
                "support-nav-item " + (category === group.id ? "active" : "")
              }
              key={group.id}
              onClick={() => selectCategory(group.id)}
            >
              {group.title}
            </button>
          ))}
        </aside>
        <div className="support-content">
          {section && !['partners','news'].includes(category) ? (
            <div className="support-topicbar">
              <button className="text-btn" onClick={backToCategory}>
                <ArrowRight size={15} />
                返回{groups.find((g) => g.id === category)?.title}
              </button>
            </div>
          ) : !section ? (
            <div className="support-titlebar">
              <div>
                <h1>{groups.find((g) => g.id === category)?.title}</h1>
                <p>{groups.find((g) => g.id === category)?.description}</p>
              </div>
            </div>
          ) : null}
          {!section && (
            <>
              <div className="support-search">
                <Search size={20} />
                <input
                  value={search}
                  onChange={(e) => Q(e.target.value)}
                  placeholder="搜索当前栏目内容"
                  aria-label="搜索当前栏目内容"
                />
                <span>标题、摘要和标签</span>
              </div>
              {search && (
                <section className="support-search-results">
                  <h2>搜索结果</h2>
                  {groups
                    .flatMap((g) =>
                      g.topics.map(([title, desc]) => ({
                        category: g.id,
                        title,
                        desc,
                      })),
                    )
                    .filter((x) =>
                      (x.title + x.desc)
                        .toLowerCase()
                        .includes(search.toLowerCase()),
                    )
                    .map((x) => (
                      <button
                        key={x.title}
                        onClick={() => {
                          C(x.category);
                          select(x.title);
                        }}
                      >
                        {x.title}
                        <small>
                          {groups.find((g) => g.id === x.category)?.title}
                        </small>
                      </button>
                    ))}
                  {matchingResources.map((r) => (
                    <button
                      key={r.id}
                      onClick={() => {
                        C("partners");
                        RC(r.category);
                        select("电池生态伙伴");
                      }}
                    >
                      {r.title}
                      <small>
                        {r.provider} · {r.category}
                      </small>
                    </button>
                  ))}
                  {matchingUpdates.map((r) => (
                    <button
                      key={r.id}
                      onClick={() => {
                        C("news");
                        UC(r.category);
                        select("行业资讯");
                      }}
                    >
                      {r.title}
                      <small>
                        {r.source} · {r.category}
                      </small>
                    </button>
                  ))}
                </section>
              )}
              <section className="category-landing">
                <div className="support-card-grid">
                  {groups
                    .find((g) => g.id === category)
                    ?.topics.map(([title, desc, Icon]) => (
                      <button
                        className="support-card"
                        key={title}
                        onClick={() => {
                          if (title === "浏览生态资源") select("电池生态伙伴");
                          else if (title === "浏览行业资讯") select("行业资讯");
                          else select(title);
                        }}
                      >
                        <Icon size={22} />
                        <strong>{title}</strong>
                        <span>{desc}</span>
                        <ArrowRight size={16} />
                      </button>
                    ))}
                </div>
              </section>
            </>
          )}
          {section === "系统使用与建档" && (
            <>
              <header className="support-section-head">
                <h2>系统使用与建档</h2>
                <p>按产品资料、生产批次和电池编号的关系组织维护。</p>
              </header>
              <section className="usage-flow">
                <div className="usage-flow-head">
                  <span>从资料到使用</span>
                  <p>
                    共享资料维护一次，生产信息按批次填写，单体信息跟随每个编号。
                  </p>
                </div>
                {steps
                  .filter((s) => s[0] !== "04")
                  .map(([n, title, desc, Icon]) => (
                    <article key={n} className="usage-step">
                      <span className="usage-step-number">{n}</span>
                      <Icon size={23} />
                      <div>
                        <h3>{title}</h3>
                        <p>{desc}</p>
                      </div>
                      <button
                        className="text-btn"
                        onClick={
                          title === "维护产品"
                            ? startProduct
                            : title === "创建批次与码"
                              ? startBatch
                              : () => goCodes("instance")
                        }
                      >
                        前往操作 <ArrowRight size={15} />
                      </button>
                    </article>
                  ))}
              </section>
              <div className="usage-level-table">
                <div className="usage-level-row usage-level-header">
                  <span>维护层级</span>
                  <span>内容示例</span>
                  <span>入口</span>
                </div>
                <div className="usage-level-row">
                  <strong>产品资料</strong>
                  <span>产品名称、技术参数、图文说明和共享文件</span>
                  <span>产品资料</span>
                </div>
                <div className="usage-level-row">
                  <strong>生产批次</strong>
                  <span>批次号、日期、工厂、生产数量和批次码</span>
                  <span>产品资料内下钻</span>
                </div>
                <div className="usage-level-row">
                  <strong>单体资料</strong>
                  <span>唯一电池编号、扫码链接、状态和生命周期更新</span>
                  <span>二维码管理</span>
                </div>
              </div>
            </>
          )}
          {section === "码的导出与生产打印" && (
            <>
              <header className="support-section-head">
                <h2>码的导出与生产打印</h2>
                <p>按码的层级选导出方式，先打样扫码，再批量打印贴标。</p>
                <button className="primary" onClick={() => goCodes("instance")}>
                  打开二维码管理 <ArrowRight size={16} />
                </button>
              </header>
              <section className="print-workflow">
                {steps.map(([n, title, desc, Icon]) => (
                  <div key={n}>
                    <span>{n}</span>
                    <Icon size={21} />
                    <strong>{title}</strong>
                    <p>{desc}</p>
                  </div>
                ))}
              </section>
              <div className="support-table-wrap">
                <table className="support-table">
                  <thead>
                    <tr>
                      <th>方式</th>
                      <th>适用场景</th>
                      <th>使用方法</th>
                      <th>当前支持</th>
                    </tr>
                  </thead>
                  <tbody>
                    {exportMethods.map((r) => (
                      <tr key={r[0]}>
                        {r.map((x, i) => (
                          <td key={i}>{x}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="support-callouts">
                <section>
                  <h3>
                    <Printer size={19} />
                    标签软件与打印机
                  </h3>
                  <p>
                    将 Excel
                    中的编号用于人眼可读文字，将扫码链接映射到二维码对象。确认每一行的数据源与标签同步，先打印少量样张。
                  </p>
                </section>
                <section>
                  <h3>
                    <CheckCircle2 size={19} />
                    打印前验收
                  </h3>
                  <p>
                    检查二维码对比度、空白区、图像比例和标签尺寸；使用最终材料打印并试扫，核对链接打开的产品、批次或单体记录。
                  </p>
                </section>
                <section>
                  <h3>
                    <Download size={19} />
                    交付印刷厂
                  </h3>
                  <p>
                    提供最终版标签稿、数据清单、文件编码说明、每行编号与链接对应规则、样张验收结果及补打方式。敏感资料按双方约定交付。
                  </p>
                </section>
              </div>
              <section className="support-faq">
                <h3>常见问题</h3>
                {faqs.map(([q, a]) => (
                  <details key={q}>
                    <summary>{q}</summary>
                    <p>{a}</p>
                  </details>
                ))}
              </section>
              <div className="support-warning">
                本地浏览器地址、localhost
                或未部署的演示链接不能用于跨设备生产扫码。生产地址和标签耐久性应按企业实际部署、材料及使用环境验证。
              </div>
            </>
          )}
          {section === "产品准备清单" && (
            <ReadinessTools
              db={db}
              change={change}
              setModal={setModal}
              notify={notify}
            />
          )}
          {section === "护照适用查询" && <PassportScopeTool db={db} />}
          {section === "登记与合规指引" && (
            <RegistrationGuide navigate={navigate} />
          )}
          {section === "完整中文登记手册" && (
            <div className="support-empty">
              <h2>完整中文登记手册</h2>
              <p>手册保留原文版本、页面截图及章节定位。</p>
              <button
                className="primary"
                onClick={() => navigate("/admin/insights/registry-manual")}
              >
                阅读完整中文手册
              </button>
            </div>
          )}
          {section === "欧盟电池法规" && (
            <RegulationGuide navigate={navigate} />
          )}
          {section === "电池生态伙伴" && (
            <EcosystemDirectory initialCategory={resourceCategory} />
          )}
          {section === "行业资讯" && (
            <IndustryUpdates initialCategory={updateCategory} />
          )}
        </div>
      </div>
    </article>
  );
}

import ReadinessTools from "./readiness-tools.jsx";
import PassportScopeTool from "./passport-scope.jsx";
import RegistrationGuide from "./registration-guide.jsx";
import RegulationGuide from "./regulation-guide.jsx";
import {
  ecosystemCategories,
  ecosystemResources,
  industryUpdates,
} from "./industry-resources.js";

function ResourceLink({ href, children }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer">
      {children}
      <ExternalLink size={14} />
    </a>
  );
}
function EcosystemDirectory({ initialCategory = "全部" }) {
  const [category, C] = useState(initialCategory),
    [q, Q] = useState(""),
    [active, A] = useState(null);
  const rows = ecosystemResources.filter(
    (r) =>
      (category === "全部" || r.category === category) &&
      [r.title, r.provider, r.summary, r.category, ...r.tags]
        .join(" ")
        .toLowerCase()
        .includes(q.toLowerCase()),
  );
  return (
    <section className="ecosystem-directory">
      <header className="support-section-head">
        <h2>电池生态伙伴与公开资源</h2>
        <p>
          按企业需求查找官方资料与公开服务信息，联系和资质请以来源页面为准。
        </p>
      </header>
      <div className="ecosystem-notice">
        <ShieldCheck size={18} />
        <span>
          “公开机构资源”不代表平台已建立合作、审核资质或推荐服务。已合作伙伴仅在双方正式确认后标识。
        </span>
      </div>
      <div className="ecosystem-filter">
        <label>
          <Search size={17} />
          <input
            placeholder="搜索机构、服务或关键词"
            value={q}
            onChange={(e) => Q(e.target.value)}
          />
        </label>
        <select
          aria-label="资源类别"
          value={category}
          onChange={(e) => C(e.target.value)}
        >
          <option>全部</option>
          {ecosystemCategories.map((x) => (
            <option key={x}>{x}</option>
          ))}
        </select>
        <span>{rows.length} 项资源</span>
      </div>
      <div className="ecosystem-list">
        {rows.map((r) => (
          <article key={r.id} className="ecosystem-item">
            <div className="ecosystem-item-main">
              <div>
                <span
                  className={
                    "resource-kind " + (r.kind === "官方资源" ? "official" : "")
                  }
                >
                  {r.kind}
                </span>
                <span className="resource-category">{r.category}</span>
              </div>
              <h3>{r.title}</h3>
              <p>{r.summary}</p>
              <div className="resource-tags">
                {r.tags.map((t) => (
                  <span key={t}>{t}</span>
                ))}
              </div>
              <small>
                {r.provider} · {r.region} · {r.languages}
              </small>
            </div>
            <div className="ecosystem-item-side">
              <button
                className="text-btn"
                onClick={() => A(active === r.id ? null : r.id)}
              >
                {active === r.id ? "收起详情" : "查看详情"}
              </button>
              <ResourceLink href={r.url}>来源与服务页面</ResourceLink>
            </div>
            {active === r.id && (
              <div className="resource-detail">
                <p>信息来源：{r.source}</p>
                <p>核对日期：{r.reviewedAt}</p>
                <p>
                  服务范围和资格应由企业直接向资源提供方核验。本平台不代办、背书或保证服务结果。
                </p>
                <ResourceLink href={r.url}>打开原始来源</ResourceLink>
              </div>
            )}
          </article>
        ))}
        {!rows.length && (
          <div className="support-empty">
            没有符合条件的资源，可更换关键词或类别。
          </div>
        )}
      </div>
    </section>
  );
}
function IndustryUpdates({ initialCategory = "全部" }) {
  const [category, C] = useState(initialCategory),
    [q, Q] = useState("");
  const rows = industryUpdates.filter(
    (r) =>
      (category === "全部" || r.category === category) &&
      [r.title, r.summary, r.source, ...r.tags]
        .join(" ")
        .toLowerCase()
        .includes(q.toLowerCase()),
  );
  return (
    <section className="industry-updates">
      <header className="support-section-head">
        <h2>行业资讯</h2>
        <p>收录官方原文及技术资料入口，中文内容为便于检索的摘要。</p>
      </header>
      <div className="ecosystem-filter">
        <label>
          <Search size={17} />
          <input
            placeholder="搜索资讯标题和摘要"
            value={q}
            onChange={(e) => Q(e.target.value)}
          />
        </label>
        <select value={category} onChange={(e) => C(e.target.value)}>
          <option>全部</option>
          {["法规进展", "官方公告", "技术资料"].map((x) => (
            <option key={x}>{x}</option>
          ))}
        </select>
        <span>{rows.length} 条</span>
      </div>
      <div className="update-list">
        {rows.map((r) => (
          <article key={r.id}>
            <div className="update-meta">
              <span>{r.category}</span>
              <time>{r.date}</time>
            </div>
            <h3>{r.title}</h3>
            <p>{r.summary}</p>
            <ResourceLink href={r.url}>{r.source} · 查看原文</ResourceLink>
          </article>
        ))}
      </div>
    </section>
  );
}
