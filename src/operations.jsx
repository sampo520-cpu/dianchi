import React, { useEffect, useRef, useState } from "react";
import {
  LayoutDashboard,
  BatteryCharging,
  PackageCheck,
  FileText,
  ShieldCheck,
  Settings2,
  Search,
  Plus,
  ArrowUpRight,
  ChevronRight,
  QrCode,
  Download,
  Eye,
  CheckCircle2,
  Clock3,
  AlertTriangle,
  X,
  Menu,
  Languages,
  Database,
  Building2,
  FolderOpen,
  ExternalLink,
  ArrowLeft,
  Copy,
  Upload,
  Pencil,
  Trash2,
  LogOut,
  Leaf,
  Activity,
  Globe,
  ArrowRight,
  Printer,
  Hash,
  Ban,
  ClipboardList,
} from "lucide-react";
import { QRCodeSVG, QRCodeCanvas } from "qrcode.react";
import {
  categories,
  fields,
  RULE_VERSION,
  createSeed,
  repository,
  check,
  snapshot,
  latest,
  id,
  log,
  validateImport,
  download,
  applicable,
  ensureCodeData,
  batchCode,
  makePassportId,
  resolverUrl,
} from "./data";
import { fieldDataTypes, inferFieldDataType } from './field-types.js';
import { passportLanguages } from './passport-locales.js';
import "./operations.css";
import "./codes.css";
import Workflow from "./workflow-ui";
import Products from "./products";
import BatchMetadata from "./batch-metadata";
import { PageEditor, PassportSurface } from "./page-editor";
import { ensureWorkflow, effectiveDb, syncSimplePassports } from "./workflow";
import { addFullSamples } from "./full-samples";
import { PortalTop, PortalSide, PortalCrumb } from './portal-shell';
import { codeStatus } from './code-status.js';
import { batteryDashboard } from './dashboard-data.js';
import './portal-shell.css';
import { addAccessSamples } from './access.js';
import { CustomValues } from './custom-fields';
import { templates, euScope } from './templates.js';
import RegulationGuide from './regulation-guide.jsx';
import UsageHelp from './usage-help.jsx';

const nav = [
  ["dashboard", "工作台", Activity],
  ["products", "产品与批次", PackageCheck],
  ["batches", "批次与二维码", QrCode],
  ["requests", "访问管理", ShieldCheck],
  ["insights", "数据与资料", FileText],
  ["settings", "系统设置", Settings2],
];
const today = () =>
  new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Shanghai" });
const fmt = (s) =>
  new Date(s).toLocaleString("zh-CN", {
    timeZone: "Asia/Shanghai",
    hour12: false,
  });
const links = {
  law: "https://eur-lex.europa.eu/eli/reg/2023/1542/oj/eng",
  faq: "https://single-market-economy.ec.europa.eu/single-market/digital-product-passport/eu-digital-product-passport-faq-batteries_en",
};
const typeEn = {
  工业储能: "Industrial / stationary storage",
  电动汽车: "Electric vehicle",
  轻型交通工具: "Light means of transport",
};
const statusEn = {
  在役: "In service",
  已回收: "Recycled",
  再利用: "Repurposed",
  再制造: "Remanufactured",
  生产: "Manufactured",
  维修: "Maintenance",
  检查: "Inspection",
};
function Tag({ value }) {
  return (
    <span
      className={
        "badge " +
        (["已发布", "已批准", "在役"].includes(value)
          ? "ok"
          : ["待审核", "待处理"].includes(value)
            ? "wait"
            : "neutral")
      }
    >
      <i />
      {value}
    </span>
  );
}
function Empty({ text = "暂无记录", action }) {
  return (
    <div className="empty">
      <Database size={28} />
      <p>{text}</p>
      {action}
    </div>
  );
}
function Modal({ title, subtitle, children, onClose, wide = false }) {
  useEffect(() => {
    const fn = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, []);
  return (
    <div
      className="modal-backdrop"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={"modal " + (wide ? "wide" : "")}
      >
        <div className="modal-head">
          <div>
            <h2>{title}</h2>
            {subtitle && <p>{subtitle}</p>}
          </div>
          <button aria-label="关闭" onClick={onClose}>
            <X size={20} />
          </button>
        </div>
        {children}
      </section>
    </div>
  );
}
function Field({ label, children, required = false }) {
  return (
    <label className="form-field">
      {label}
      {required && <span className="required"> *</span>}
      {children}
    </label>
  );
}
function Stat({ title, value, caption, icon: Icon, tone }) {
  return (
    <div className="metric">
      <div>
        <p>{title}</p>
        <strong>{value}</strong>
        <small>{caption}</small>
      </div>
      <div className={"metric-icon " + tone}>
        <Icon size={20} />
      </div>
    </div>
  );
}
function PageTitle({ title, description, children }) {
  return (
    <div className="page-title">
      <div>
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
      {children && <div className="title-actions">{children}</div>}
    </div>
  );
}
function Dashboard({ db, navigate, embedded = false }) {
  const [modelId, M] = useState('全部');
  const [from, F] = useState('');
  const [to, T] = useState('');
  const [category, C] = useState('全部');
  const [template, P] = useState('全部');
  const stats = batteryDashboard(db, { from, to, category, template, modelId });
  const open = (tab, filter) => {
    if (filter) sessionStorage.setItem('battery-dashboard-filter', JSON.stringify({...filter, ...(modelId !== '全部' ? {modelId} : {})}));
    else sessionStorage.removeItem('battery-dashboard-filter');
    navigate('/admin/' + tab);
  };
  return <>
    {!embedded && <PageTitle title="工作台" description="汇总当前浏览器中的产品、批次、二维码和待处理事项。">
      <button className="primary" onClick={() => navigate('/admin/products')}>新建产品</button>
      <button className="outline" onClick={() => navigate('/admin/batches')}>新建生码批次</button>
    </PageTitle>}
    <div className="filter-row dashboard-filters">
      <select aria-label="统计产品筛选" value={modelId} onChange={e => M(e.target.value)}><option value="全部">全部产品</option>{db.models.filter(m => !m.demoArchived).map(m => <option key={m.id} value={m.id}>{m.name}</option>)}</select>
      <label>生产日期从<input aria-label="统计开始日期" type="date" value={from} onChange={e => F(e.target.value)} /></label>
      <label>至<input aria-label="统计结束日期" type="date" value={to} onChange={e => T(e.target.value)} /></label>
      <select aria-label="类别筛选" value={category} onChange={e => C(e.target.value)}><option>全部</option>{categories.map(x => <option key={x}>{x}</option>)}</select>
      <select aria-label="模板筛选" value={template} onChange={e => P(e.target.value)}><option value="全部">全部模板</option>{Object.entries(templates).map(([k,v]) => <option key={k} value={k}>{v}</option>)}</select>
    </div>
    <div className="metric-grid dashboard-metrics">
      {[['产品',stats.productCount,'产品列表',{tab:'products',filter:{category,template}}],['批次',stats.batchCount,'批次列表',{tab:'batches',filter:{from,to,category,template}}],['电池码',stats.codeCount,'查看二维码',{tab:'batches',filter:{from,to,category,template}}],['可访问护照',stats.accessibleCount,'查看可访问记录',{tab:'batches',filter:{status:'可访问',from,to,category,template}}]].map(([label,value,caption,target]) => <button className="metric dashboard-metric" key={label} onClick={() => open(target.tab,target.filter)}><span><b>{label}</b><strong>{value}</strong><small>{caption}</small></span></button>)}
    </div>
    <div className="reg-stats-strip"><span>当前筛选：可访问 <strong>{stats.accessibleCount}</strong> 个</span><button className="text-btn" onClick={() => open('batches',{status:'已作废',from,to,category,template})}>已作废 <strong>{stats.voidCount}</strong> 个 <ArrowRight size={15}/></button></div>
    <section className="dashboard-worklists">
      <div className="panel table-panel"><div className="panel-head"><div><h2>待处理</h2><p>需要补资料的电池和等待审批的申请</p></div></div>
        <button className="dashboard-task" onClick={() => open('products',{status:'资料待补充',category,template})}>资料待补充 <strong>{stats.missingCount}</strong><span>查看对应电池 →</span></button>
        <button className="dashboard-task" onClick={() => open('requests')}>访问申请待处理 <strong>{stats.pendingRequests}</strong><span>进入访问管理 →</span></button>
      </div>
      <div className="panel table-panel"><div className="panel-head"><div><h2>最近批次</h2><p>按生产日期倒序</p></div><button className="text-btn" onClick={() => open('batches')}>查看全部 →</button></div>
        <table><thead><tr><th>批次号</th><th>产品</th><th>日期 / 工厂</th><th>数量</th><th></th></tr></thead><tbody>{stats.batches.slice().sort((a,b) => b.date.localeCompare(a.date)).slice(0,5).map(b => <tr key={b.id}><td><button className="text-btn" onClick={() => {sessionStorage.setItem('battery-dashboard-filter',JSON.stringify({batchId:b.id}));navigate('/admin/batches')}}>{b.name}</button></td><td>{db.models.find(m=>m.id===b.modelId)?.name}</td><td>{b.date}<small>{b.factory}</small></td><td>{db.instances.filter(i=>i.productionBatchId===b.id).length}</td><td><button className="text-btn" onClick={() => {sessionStorage.setItem('battery-dashboard-filter',JSON.stringify({batchId:b.id}));navigate('/admin/batches')}}>查看 →</button></td></tr>)}</tbody></table>
      </div>
    </section>
  </>;
}

export default function OperationalApp() {
  const [db, setDb] = useState(null),
    [fatal, setFatal] = useState(""),
    [saving, setSaving] = useState(false),
    [toast, setToast] = useState(""),
    [route, setRoute] = useState(location.pathname),
    [query, setQuery] = useState(""),
    [menu, setMenu] = useState(false),
    [modal, setModal] = useState(null);
  const current = useRef(null),
    queue = useRef(Promise.resolve()),
    timer = useRef();
  const tab = route.split("/")[2] || "products";
  const navTab = tab === 'regulations' ? 'insights' : tab;
  useEffect(() => {
    (async () => {
      try {
        let value = await repository.read();
        if (!value) value = createSeed();
        ensureCodeData(value);
        ensureWorkflow(value);
        value.rules.forEach(rule => { rule.dataType ||= inferFieldDataType(rule.code, rule.unit); });
        addFullSamples(value);
        addAccessSamples(value);
        await repository.write(value);
        current.current = value;
        setDb(value);
      } catch (e) {
        setFatal("本地数据库无法打开：" + e.message);
      }
    })();
    const fn = () => {
      setRoute(location.pathname);
      setQuery("");
    };
    window.addEventListener("popstate", fn);
    return () => window.removeEventListener("popstate", fn);
  }, []);
  function notify(message) {
    setToast(message);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setToast(""), 3500);
  }
  function navigate(path) {
    history.pushState({}, "", path);
    setRoute(path);
    setQuery("");
    setMenu(false);
    window.scrollTo(0, 0);
  }
  async function change(fn, message) {
    setSaving(true);
    const operation = queue.current
      .then(async () => {
        const next = structuredClone(current.current);
        fn(next);
        ensureCodeData(next);
        ensureWorkflow(next);
        syncSimplePassports(next, current.current);
        await repository.write(next);
        current.current = next;
        setDb(next);
        if (message) notify(message);
        return true;
      })
      .catch((e) => {
        notify("未保存：" + e.message);
        return false;
      });
    queue.current = operation;
    return operation.finally(() => setSaving(false));
  }
  if (fatal)
    return (
      <div className="startup">
        <AlertTriangle />
        <h2>无法读取浏览器数据</h2>
        <p>{fatal}</p>
        <p>请允许此站点使用 IndexedDB 后刷新。</p>
      </div>
    );
  if (!db)
    return (
      <div className="startup">
        <div className="logo">D</div>
        <p>正在载入电池护照工作区…</p>
      </div>
    );
  const ctx = { db, change, notify, navigate, setModal, query, saving };
  const publicId = route.startsWith("/passport/")
    ? decodeURIComponent(route.split("/")[2] || "")
    : null;
  return (
    <>
      {publicId ? (
        <PublicPassport {...ctx} passportId={publicId} />
      ) : (
        <div className="app portal-app">
          <PortalTop notify={notify} navigate={navigate} />
          <PortalSide nav={nav} tab={navTab} navigate={navigate} db={db} notify={notify} open={menu} />
          {menu && (
            <button
              className="nav-overlay"
              onClick={() => setMenu(false)}
              aria-label="关闭导航"
            />
          )}
          <main>
            <header>
              <button
                className="mobile-menu"
                aria-label="打开导航"
                onClick={() => setMenu(!menu)}
              >
                <Menu size={21} />
              </button>
              <PortalCrumb label={nav.find(n => n[0] === navTab)?.[1] || (tab === 'dashboard' ? '工作台' : undefined)} navigate={navigate} />
            </header>
            <div className="page">
              {query ? (
                <SearchResults {...ctx} />
              ) : tab === "dashboard" ? (
                <Dashboard db={db} navigate={navigate} />
              ) : ["insights", "regulations"].includes(tab) ? (
                <InformationCenter key={tab} {...ctx} initialTab={tab === 'regulations' ? '欧盟电池法规' : '数据概览'} />
              ) : tab === "settings" ? (
                <Rules {...ctx} />
              ) : [
                  "products",
                  "batches",
                  "pages",
                  "production",
                  "ledger",
                  "library",
                ].includes(tab) ? (
                <Products
                  key={tab}
                  {...ctx}
                  batchWorkspace={tab === "batches"}
                />
              ) : tab === "pages" ? (
                <PageEditor {...ctx} />
              ) : [
                  "library",
                  "production",
                  "ledger",
                  "tasks",
                  "settings",
                ].includes(tab) ? (
                <Workflow
                  {...ctx}
                  tab={tab}
                  renderLegacy={(name) =>
                    name === "company" ? (
                      <Company {...ctx} />
                    ) : name === "models" ? (
                      <Models {...ctx} />
                    ) : name === "documents" ? (
                      <Documents {...ctx} />
                    ) : name === "codes" ? (
                      <CodeManager {...ctx} />
                    ) : name === "requests" ? (
                      <Requests {...ctx} />
                    ) : name === "instances" ? (
                      <Instances {...ctx} />
                    ) : name === "passports" ? (
                      <Passports {...ctx} />
                    ) : (
                      <Rules {...ctx} />
                    )
                  }
                />
              ) : tab === "company" ? (
                <Company {...ctx} />
              ) : tab === "models" ? (
                <Models {...ctx} />
              ) : tab === "instances" ? (
                <Instances {...ctx} />
              ) : tab === "codes" ? (
                <Products {...ctx} batchWorkspace />
              ) : tab === "passports" ? (
                <Passports {...ctx} />
              ) : tab === "documents" ? (
                <Documents {...ctx} />
              ) : tab === "requests" ? (
                <Requests {...ctx} />
              ) : (
                <Rules {...ctx} />
              )}
            </div>
          </main>
        </div>
      )}
      {modal && <RenderModal {...ctx} modal={modal} />}
      <div className="sr-only" aria-live="polite">
        {toast}
      </div>
      {toast && (
        <div className="toast" role="status">
          <CheckCircle2 size={17} />
          {toast}
        </div>
      )}
    </>
  );
}

function SearchResults(ctx) {
  const q = ctx.query.toLowerCase();
  const instances = ctx.db.instances.filter(
    (i) =>
      JSON.stringify(i).toLowerCase().includes(q) ||
      ctx.db.models
        .find((m) => m.id === i.modelId)
        ?.name.toLowerCase()
        .includes(q),
  );
  return (
    <>
      <PageTitle
        eyebrow="SEARCH"
        title="搜索结果"
        description={`关键词：${ctx.query}`}
      />
      <section className="panel table-panel">
        <InstanceTable {...ctx} rows={instances} />
      </section>
    </>
  );
}
function Company({ db, change, notify }) {
  const [form, setForm] = useState(db.company);
  function input(key, label, required = false) {
    return (
      <Field label={label} required={required}>
        <input
          required={required}
          value={form[key] || ""}
          onChange={(e) => setForm({ ...form, [key]: e.target.value })}
        />
      </Field>
    );
  }
  return (
    <>
      <PageTitle
        eyebrow="ORGANIZATION"
        title="企业资料"
        description="维护制造企业、工厂和责任经济运营者的公开信息。"
      />
      <form
        className="panel editor-panel"
        onSubmit={async (e) => {
          e.preventDefault();
          await change((d) => {
            d.company = form;
            log(d, "更新企业资料", form.name);
          }, "企业资料已保存；已发布护照保持原版本");
        }}
      >
        <h2>制造企业</h2>
        <div className="form-grid">
          {input("name", "企业名称", true)}
          {input("factory", "工厂")}
          {input("address", "地址")}
          {input("contact", "联系邮箱", true)}
        </div>
        <h2>责任经济运营者</h2>
        <div className="form-grid">
          {input("operator", "责任主体")}
          {input("operatorAddress", "责任主体地址")}
        </div>
        <div className="form-end">
          <small>保存后需重新审核发布，才会更新公开护照。</small>
          <button className="primary" type="submit">
            保存企业资料
          </button>
        </div>
      </form>
    </>
  );
}
function Models(ctx) {
  const { db, setModal } = ctx;
  const [q, Q] = useState(""),
    [type, T] = useState("全部");
  const rows = db.models.filter(
    (m) =>
      (type === "全部" || m.type === type) &&
      (m.name + " " + m.id).toLowerCase().includes(q.toLowerCase()),
  );
  return (
    <>
      <PageTitle
        eyebrow="MODEL LIBRARY"
        title="电池型号"
        description="共享型号参数，一次维护，关联多个电池实例。"
      >
        <button className="primary" onClick={() => setModal({ type: "model" })}>
          <Plus size={17} />
          新建型号
        </button>
      </PageTitle>
      <div className="filter-row">
        <SearchBox value={q} set={Q} placeholder="搜索型号名称、编号" />
        <select value={type} onChange={(e) => T(e.target.value)}>
          <option value="全部">全部类别</option>
          {categories.map((t) => (
            <option key={t}>{t}</option>
          ))}
        </select>
        <span className="filter-count">共 {rows.length} 个型号</span>
      </div>
      <section className="panel table-panel">
        <table>
          <thead>
            <tr>
              <th>型号名称 / 编号</th>
              <th>电池类别</th>
              <th>化学体系</th>
              <th>额定能量</th>
              <th>关联实例</th>
              <th>更新时间</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((m) => (
              <tr key={m.id}>
                <td>
                  <div className="model-name">
                    <span className="model-symbol">
                      <BatteryCharging size={19} />
                    </span>
                    <div>
                      <strong>{m.name}</strong>
                      <small>{m.id}</small>
                    </div>
                  </div>
                </td>
                <td>{m.type}</td>
                <td>
                  <span className="chem">{m.chem || "待填写"}</span>
                </td>
                <td>{m.energy || "—"} kWh</td>
                <td>{db.instances.filter((i) => i.modelId === m.id).length}</td>
                <td>{m.updated}</td>
                <td>
                  <div className="row-actions">
                    <button
                      title="编辑型号"
                      onClick={() => setModal({ type: "model", value: m })}
                    >
                      <Pencil size={15} />
                    </button>
                    <button
                      title="复制型号"
                      onClick={() =>
                        setModal({
                          type: "model",
                          value: {
                            ...m,
                            id: undefined,
                            name: m.name + " 副本",
                          },
                        })
                      }
                    >
                      <Copy size={15} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!rows.length && <Empty text="没有匹配的电池型号" />}
      </section>
    </>
  );
}
function SearchBox({ value, set, placeholder }) {
  return (
    <div className="search large">
      <Search size={16} />
      <input
        aria-label={placeholder}
        value={value}
        onChange={(e) => set(e.target.value)}
        placeholder={placeholder}
      />
      {value && (
        <button aria-label="清除搜索" onClick={() => set("")}>
          <X size={13} />
        </button>
      )}
    </div>
  );
}
function InstanceTable(ctx) {
  const { db, rows, setModal, navigate } = ctx;
  return (
    <>
      <table>
        <thead>
          <tr>
            <th>电池实例 / 序列号</th>
            <th>关联型号</th>
            <th>电池类别</th>
            <th>资料完整度</th>
            <th>生命周期</th>
            <th>护照状态</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((i) => {
            const m = db.models.find((m) => m.id === i.modelId),
              issues = check(db, i),
              complete = Math.round(
                ((db.rules.length - issues.length) / db.rules.length) * 100,
              );
            return (
              <tr key={i.id}>
                <td>
                  <div className="model-name">
                    <span
                      className={
                        "battery-thumb " +
                        (m?.type === categories[1]
                          ? "ev"
                          : m?.type === categories[2]
                            ? "lmt"
                            : "ess")
                      }
                    >
                      <BatteryCharging size={20} />
                    </span>
                    <div>
                      <strong>{i.id}</strong>
                      <small>{i.serial}</small>
                    </div>
                  </div>
                </td>
                <td>{m?.name || "未关联"}</td>
                <td>{m?.type}</td>
                <td>
                  <div className="completion">
                    <div className="progress">
                      <span style={{ width: complete + "%" }} />
                    </div>
                    <span>{complete}%</span>
                  </div>
                </td>
                <td>
                  <span className="lifecycle">
                    <i />
                    {i.state}
                  </span>
                </td>
                <td>
                  <Tag value={i.status} />
                </td>
                <td>
                  <div className="row-actions">
                    <button
                      title="编辑实例"
                      onClick={() => setModal({ type: "instance", value: i })}
                    >
                      <Pencil size={15} />
                    </button>
                    <button
                      title="查看护照"
                      disabled={!latest(db, i.id)}
                      onClick={() =>
                        navigate("/passport/" + (i.passportId || i.id))
                      }
                    >
                      <ArrowUpRight size={17} />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      {!rows.length && <Empty />}
    </>
  );
}
function Instances(ctx) {
  const { db, setModal, change } = ctx;
  const [q, Q] = useState(""),
    [type, T] = useState("全部");
  async function generate() {
    await change((d) => {
      const model = d.models[0];
      for (let n = 0; n < 3; n++)
        d.instances.push({
          id: id("BAT"),
          modelId: model.id,
          serial: id("SN-DEMO"),
          date: today(),
          state: "在役",
          status: "草稿",
          soh: 100,
          cycles: 0,
        });
      log(d, "批量生成实例", "3 条虚构电池实例");
    }, "已生成 3 条演示实例");
  }
  const rows = db.instances.filter(
    (i) =>
      (type === "全部" || i.status === type) &&
      (
        i.serial +
        " " +
        i.id +
        " " +
        db.models.find((m) => m.id === i.modelId)?.name
      )
        .toLowerCase()
        .includes(q.toLowerCase()),
  );
  return (
    <>
      <PageTitle
        eyebrow="BATTERY ASSETS"
        title="电池实例"
        description="以单体身份连接制造数据、生命周期和公开护照。"
      >
        <button className="outline" onClick={generate}>
          <Database size={16} />
          生成演示实例
        </button>
        <button
          className="primary"
          onClick={() => navigate("/admin/production")}
        >
          <Plus size={17} />
          新建一批电池
        </button>
      </PageTitle>
      <div className="filter-row">
        <SearchBox value={q} set={Q} placeholder="搜索电池编号或型号" />
        <select value={type} onChange={(e) => T(e.target.value)}>
          <option value="全部">全部发布状态</option>
          {["草稿", "待审核", "已发布"].map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
        <span className="filter-count">共 {rows.length} 个实例</span>
      </div>
      <section className="panel table-panel">
        <InstanceTable {...ctx} rows={rows} />
      </section>
      <div className="inline-note">
        <AlertTriangle size={14} />
        生命周期与护照发布状态分别管理。普通维修保留护照，进行再利用或再制造时可关联前序护照。
      </div>
    </>
  );
}
function Passports(ctx) {
  const { db, setModal, navigate, change, notify } = ctx;
  const [status, S] = useState("全部");
  async function transition(instance, action) {
    const problems = check(effectiveDb(db, instance), instance);
    if (action !== "退回" && problems.length) {
      setModal({ type: "issues", instance, issues: problems });
      return;
    }
    await change(
      (d) => {
        const i = d.instances.find((x) => x.id === instance.id);
        if (action === "提交审核") i.status = "待审核";
        else if (action === "退回") i.status = "草稿";
        else {
          if (i.status !== "待审核") throw Error("请先提交审核");
          const code = d.codeRecords.find(
            (item) => item.instanceId === i.id && item.status !== "作废",
          );
          if (!code || !["已分配", "已激活"].includes(code.status))
            throw Error("请先在码管理中为该实例分配护照编号");
          i.passportId = code.passportId;
          const v = snapshot(
            effectiveDb(d, i),
            i,
            (latest(d, i.id)?.version || 0) + 1,
          );
          d.versions.push(v);
          i.status = "已发布";
          if (code.status === "已分配") {
            code.status = "已激活";
            code.activatedAt = new Date().toISOString();
          }
        }
        log(d, action, instance.id);
      },
      action === "发布" ? "护照已发布，生成独立版本快照" : action + "成功",
    );
  }
  return (
    <>
      <PageTitle
        eyebrow="PASSPORT CENTER"
        title="护照管理"
        description="先检查、再审核，发布快照与草稿数据独立保存。"
      />
      <div className="passport-cards">
        <div className="passport-card green">
          <div>
            <span>已发布</span>
            <strong>
              {db.instances.filter((i) => latest(db, i.id)).length}
            </strong>
            <small>存在公开版本的护照</small>
          </div>
          <FileText size={31} />
        </div>
        <div className="passport-card amber">
          <div>
            <span>待审核</span>
            <strong>
              {db.instances.filter((i) => i.status === "待审核").length}
            </strong>
            <small>检查通过后可发布</small>
          </div>
          <Clock3 size={31} />
        </div>
        <div className="passport-card blue">
          <div>
            <span>历史版本</span>
            <strong>{db.versions.length}</strong>
            <small>发布快照保留完整历史</small>
          </div>
          <Database size={31} />
        </div>
      </div>
      <div className="tabs">
        {["全部", "草稿", "待审核", "已发布"].map((s) => (
          <button
            className={status === s ? "selected" : ""}
            key={s}
            onClick={() => S(s)}
          >
            {s}
          </button>
        ))}
      </div>
      <section className="panel passport-list">
        {db.instances
          .filter((i) => status === "全部" || i.status === status)
          .map((i) => {
            const v = latest(db, i.id),
              missing = check(db, i);
            return (
              <div className="passport-row" key={i.id}>
                <div className="qr-mini">
                  <QrCode size={24} />
                </div>
                <div className="pass-main">
                  <strong>
                    {db.models.find((m) => m.id === i.modelId)?.name}
                  </strong>
                  <span>
                    {i.id} · {v ? "v" + v.version : "未发布"}
                  </span>
                </div>
                <Tag value={i.status} />
                <button
                  className={"check-chip " + (missing.length ? "warn" : "")}
                  onClick={() =>
                    setModal({ type: "issues", instance: i, issues: missing })
                  }
                >
                  {missing.length ? missing.length + " 项缺失" : "资料完整"}
                </button>
                <div className="row-actions">
                  <button
                    title="版本记录"
                    onClick={() => setModal({ type: "versions", instance: i })}
                  >
                    <Clock3 size={16} />
                  </button>
                  <button
                    title="预览已发布护照"
                    disabled={!v}
                    onClick={() =>
                      navigate("/passport/" + (i.passportId || i.id))
                    }
                  >
                    <Eye size={17} />
                  </button>
                  <button
                    title="下载二维码"
                    disabled={!v}
                    onClick={() => setModal({ type: "qr", instance: i })}
                  >
                    <QrCode size={17} />
                  </button>
                </div>
                <button
                  className="outline"
                  onClick={() =>
                    transition(i, i.status === "待审核" ? "退回" : "提交审核")
                  }
                >
                  {i.status === "待审核"
                    ? "退回"
                    : i.status === "已发布"
                      ? "提交更新"
                      : "提交审核"}
                </button>
                {i.status === "待审核" && (
                  <button
                    className="primary"
                    onClick={() => transition(i, "发布")}
                  >
                    审核并发布
                  </button>
                )}
              </div>
            );
          })}
        {!db.instances.filter((i) => status === "全部" || i.status === status)
          .length && <Empty />}
      </section>
      <div className="inline-note">
        <ShieldCheck size={15} />
        登记状态：本地模拟。未连接欧盟 Registry；资料检查不代表获得认证。
      </div>
    </>
  );
}
function CodeManager(ctx) {
  const { db, setModal, change } = ctx;
  const [filter, setFilter] = useState("全部");
  const [modelId, setModelId] = useState("全部");
  const [q, setQ] = useState("");
  const codes = db.codeRecords.filter(
    (c) =>
      (filter === "全部" || c.status === filter) &&
      (modelId === "全部" || c.modelId === modelId) &&
      (c.passportId + " " + (c.enterpriseSerial || ""))
        .toLowerCase()
        .includes(q.toLowerCase()),
  );
  const resolver = (() => {
    try {
      const u = new URL(db.company.resolverBaseUrl);
      return u.protocol === "https:" && !u.hostname.endsWith(".invalid");
    } catch {
      return false;
    }
  })();
  return (
    <>
      <PageTitle
        eyebrow="CODE & LABEL MANAGEMENT"
        title="码管理"
        description="管理批次编号、单体绑定、护照二维码与打印记录。"
      >
        <button
          className="outline"
          onClick={() => setModal({ type: "codeImport" })}
        >
          <Upload size={16} />
          导入序列号
        </button>
        <button
          className="outline"
          onClick={() => setModal({ type: "codeExport", codes })}
        >
          <Download size={16} />
          导出清单
        </button>
        <button
          className="outline"
          onClick={() => setModal({ type: "printFilter", codes })}
        >
          <Printer size={15} />
          打印筛选结果
        </button>
        <button
          className="primary"
          onClick={() => setModal({ type: "batch", modelId })}
        >
          <Plus size={16} />
          生成码批次
        </button>
      </PageTitle>
      <div className="info-banner">
        <AlertTriangle size={18} />
        <div>
          <strong>电池编号用于识别；二维码自动打开护照</strong>
          <p>
            固定演示域名不可投产。当前二维码用于本地预览；部署正式解析域名后，才能生成投产标签。
          </p>
        </div>
        <button
          className="text-btn"
          onClick={() => setModal({ type: "resolver" })}
        >
          解析域名设置
        </button>
      </div>
      <div className="metric-grid code-stats">
        <Stat
          title="码总数"
          value={db.codeRecords.length}
          caption={`${db.codeBatches.length} 个批次`}
          icon={Hash}
          tone="blue"
        />
        <Stat
          title="待用"
          value={db.codeRecords.filter((c) => c.status === "待用").length}
          caption="等待绑定电池实例"
          icon={Clock3}
          tone="amber"
        />
        <Stat
          title="已分配"
          value={db.codeRecords.filter((c) => c.status === "已分配").length}
          caption="已绑定，护照尚未发布"
          icon={PackageCheck}
          tone="purple"
        />
        <Stat
          title="已激活"
          value={db.codeRecords.filter((c) => c.status === "已激活").length}
          caption="护照已发布"
          icon={CheckCircle2}
          tone="green"
        />
      </div>
      <section className="panel code-rule-panel">
        <div className="panel-head">
          <div>
            <h2>型号编号规则</h2>
            <p>规则只影响新建批次，历史批次保留创建时的规则快照。</p>
          </div>
        </div>
        <div className="code-rules">
          {db.models.map((m) => (
            <div className="code-rule-row" key={m.id}>
              <div>
                <strong>{m.name}</strong>
                <small>
                  {m.type} · {m.codeRule.prefix}-
                  {"{" + m.codeRule.batchFormat + "}"}-
                  {"{SEQ" + m.codeRule.sequenceWidth + "}"}
                </small>
              </div>
              <span>
                下一个流水号{" "}
                {String(m.codeRule.nextSequence).padStart(
                  m.codeRule.sequenceWidth,
                  "0",
                )}
              </span>
              <button
                className="outline"
                onClick={() => setModal({ type: "codeRule", model: m })}
              >
                <Settings2 size={15} />
                配置
              </button>
            </div>
          ))}
        </div>
      </section>
      <div className="filter-row code-filters">
        <SearchBox
          value={q}
          set={setQ}
          placeholder="搜索护照编号、企业序列号"
        />
        <select value={modelId} onChange={(e) => setModelId(e.target.value)}>
          <option value="全部">全部型号</option>
          {db.models.map((m) => (
            <option key={m.id} value={m.id}>
              {m.name}
            </option>
          ))}
        </select>
        <select value={filter} onChange={(e) => setFilter(e.target.value)}>
          {["全部", "待用", "已分配", "已激活", "作废"].map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
        <span className="filter-count">{codes.length} 条电池编号</span>
      </div>
      <section className="panel table-panel code-table">
        <table>
          <thead>
            <tr>
              <th>电池编号</th>
              <th>系统链接标识</th>
              <th>型号 / 批次</th>
              <th>状态</th>
              <th>创建 / 激活</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            {codes.map((c) => {
              const m = db.models.find((x) => x.id === c.modelId),
                batch = db.codeBatches.find((x) => x.id === c.batchId);
              return (
                <tr key={c.id}>
                  <td>
                    <strong>{c.enterpriseSerial || c.passportId}</strong>
                    <small>
                      {location.origin}/passport/{c.passportId}
                    </small>
                  </td>
                  <td>
                    {c.enterpriseSerial || (
                      <span className="muted">未绑定</span>
                    )}
                  </td>
                  <td>
                    {m?.name}
                    <small>{batch?.batchCode || c.batchId}</small>
                  </td>
                  <td>
                    <Tag value={c.status} />
                  </td>
                  <td>
                    {fmt(c.createdAt)}
                    {c.activatedAt && <small>激活 {fmt(c.activatedAt)}</small>}
                    {c.voidReason && <small>作废原因：{c.voidReason}</small>}
                  </td>
                  <td>
                    <div className="row-actions">
                      {c.status === "待用" && (
                        <button
                          title="绑定实例"
                          onClick={() =>
                            setModal({ type: "bindCode", code: c })
                          }
                        >
                          <PackageCheck size={16} />
                        </button>
                      )}
                      {c.status === "已激活" && (
                        <button
                          title="查看护照"
                          onClick={() =>
                            ctx.navigate("/passport/" + c.passportId)
                          }
                        >
                          <Eye size={16} />
                        </button>
                      )}
                      {c.status !== "作废" && (
                        <button
                          title="作废"
                          onClick={() =>
                            setModal({ type: "voidCode", code: c })
                          }
                        >
                          <Ban size={16} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {!codes.length && <Empty text="没有符合条件的码记录" />}
      </section>
      <section className="panel table-panel batch-table">
        <div className="panel-head">
          <div>
            <h2>码批次</h2>
            <p>生成时保存编号规则、流水范围和创建记录。</p>
          </div>
          <button
            className="outline"
            onClick={() => setModal({ type: "printJobList" })}
          >
            <Printer size={15} />
            打印记录
          </button>
        </div>
        <table>
          <thead>
            <tr>
              <th>批次号</th>
              <th>型号</th>
              <th>编号范围</th>
              <th>数量</th>
              <th>创建时间</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            {db.codeBatches.map((b) => (
              <tr key={b.id}>
                <td>
                  <strong>{b.batchCode}</strong>
                  <small>{b.id}</small>
                </td>
                <td>{db.models.find((m) => m.id === b.modelId)?.name}</td>
                <td>
                  {makePassportId(b.ruleSnapshot, b.batchCode, b.startSequence)}{" "}
                  — {makePassportId(b.ruleSnapshot, b.batchCode, b.endSequence)}
                </td>
                <td>{b.count}</td>
                <td>{fmt(b.createdAt)}</td>
                <td>
                  <button
                    className="outline"
                    onClick={() =>
                      setModal({
                        type: "print",
                        batchId: b.id,
                        productionReady: resolver,
                      })
                    }
                  >
                    <Printer size={14} />
                    打印标签
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!db.codeBatches.length && <Empty text="还没有码批次" />}
      </section>
      <div className="inline-note">
        <ClipboardList size={15} />
        码作废后不可恢复、不可重分配；补打会记录打印任务，不改变码状态。演示权限没有真实安全边界。
      </div>
    </>
  );
}
function BatchCreator({ db, change, close, initialModel }) {
  const [modelId, M] = useState(
    initialModel && initialModel !== "全部"
      ? initialModel
      : db.models[0]?.id || "",
  );
  const [format, F] = useState("YYYYMM"),
    [date, D] = useState(today()),
    [count, C] = useState(25),
    [start, S] = useState(
      db.models.find((m) => m.id === modelId)?.codeRule.nextSequence || 1,
    );
  const model = db.models.find((m) => m.id === modelId),
    rule = model?.codeRule || {},
    batch = batchCode(format, new Date(date + "T12:00:00")),
    quantity = Math.max(0, Math.min(5000, Number(count) || 0)),
    codes = Array.from({ length: Math.min(quantity, 30) }, (_, n) =>
      makePassportId(rule, batch, Number(start) + n),
    );
  async function submit(e) {
    e.preventDefault();
    if (
      !model ||
      !Number.isInteger(Number(count)) ||
      Number(count) < 1 ||
      Number(count) > 5000 ||
      !Number.isInteger(Number(start)) ||
      Number(start) < 1
    )
      return;
    const ok = await change((d) => {
      const m = d.models.find((x) => x.id === modelId),
        r = m.codeRule;
      const ids = Array.from({ length: Number(count) }, (_, n) =>
        makePassportId(r, batch, Number(start) + n),
      );
      if (
        new Set(ids).size !== ids.length ||
        ids.some((pid) => d.codeRecords.some((c) => c.passportId === pid))
      )
        throw Error("生成结果与既有护照编号冲突");
      const batchId = id("BATCH");
      const now = new Date().toISOString();
      d.codeBatches.push({
        id: batchId,
        modelId,
        batchCode: batch,
        count: Number(count),
        startSequence: Number(start),
        endSequence: Number(start) + Number(count) - 1,
        status: "生成",
        ruleSnapshot: { ...r, batchFormat: format },
        createdAt: now,
      });
      ids.forEach((passportId) =>
        d.codeRecords.push({
          id: id("CODE"),
          batchId,
          passportId,
          modelId,
          instanceId: "",
          enterpriseSerial: "",
          productionDate: "",
          status: "待用",
          resolverUrl: resolverUrl(d.company.resolverBaseUrl, passportId),
          createdAt: now,
          activatedAt: "",
          voidReason: "",
          voidedAt: "",
          ruleSnapshot: { ...r, batchFormat: format },
        }),
      );
      r.nextSequence = Math.max(r.nextSequence, Number(start) + Number(count));
      d.codeBatches.find((b) => b.id === batchId).status = "待用";
      log(d, "生成码批次", `${model.name} · ${batch} · ${count} 条`);
    }, "已生成码批次");
    if (ok) close();
  }
  return (
    <Modal
      title="生成码批次"
      subtitle="批次保存独立规则快照，已用流水号不会回收。"
      onClose={close}
      wide
    >
      <form onSubmit={submit}>
        <div className="form-grid">
          <Field label="电池型号">
            <select
              value={modelId}
              onChange={(e) => {
                M(e.target.value);
                S(
                  db.models.find((m) => m.id === e.target.value)?.codeRule
                    .nextSequence || 1,
                );
              }}
            >
              {db.models.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </select>
          </Field>
          <Field label="批次日期">
            <input
              required
              type="date"
              value={date}
              onChange={(e) => D(e.target.value)}
            />
          </Field>
          <Field label="批次格式">
            <select value={format} onChange={(e) => F(e.target.value)}>
              <option>YYYYMM</option>
              <option>YYYYMMDD</option>
              <option>YYYY</option>
            </select>
          </Field>
          <Field label="数量（最多 5,000）">
            <input
              required
              type="number"
              min="1"
              max="5000"
              step="1"
              value={count}
              onChange={(e) => C(e.target.value)}
            />
          </Field>
          <Field label="起始流水号">
            <input
              required
              type="number"
              min="1"
              step="1"
              value={start}
              onChange={(e) => S(e.target.value)}
            />
          </Field>
        </div>
        <div className="inline-note">
          编号示例：<strong>{codes[0] || "—"}</strong> 至{" "}
          <strong>{codes.at(-1) || "—"}</strong>
          {quantity > 30 && <span>（共 {quantity} 条，仅预览前 30 条）</span>}
        </div>
        <div className="demo-pill">
          <AlertTriangle size={15} />
          解析域名为演示域名；可生成演示码，不可投产。
        </div>
        <div className="modal-foot">
          <button type="button" className="outline" onClick={close}>
            取消
          </button>
          <button className="primary" disabled={!quantity || quantity > 5000}>
            确认生成 {quantity} 条
          </button>
        </div>
      </form>
    </Modal>
  );
}
function CodeRuleEditor({ model, db, change, close }) {
  const [f, F] = useState({ ...model.codeRule });
  const consumed = Math.max(Number(model.codeRule.nextSequence) || 1, ...db.codeBatches.filter(b => b.modelId === model.id).map(b => Number(b.endSequence) + 1).filter(Number.isFinite));
  return (
    <Modal
      title="编号规则"
      subtitle={`${model.name} · 规则只用于后续新批次`}
      onClose={close}
    >
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          if (
            !/^[A-Za-z0-9-]{1,32}$/.test(f.prefix) ||
            !Number.isInteger(Number(f.sequenceWidth)) ||
            f.sequenceWidth < 3 ||
            f.sequenceWidth > 12 ||
            !Number.isSafeInteger(Number(f.nextSequence)) || Number(f.nextSequence) < consumed
          ) {
            return;
          }
          const ok = await change((d) => {
            d.models.find((m) => m.id === model.id).codeRule = {
              ...f,
              sequenceWidth: Number(f.sequenceWidth),
              nextSequence: Number(f.nextSequence),
            };
            log(d, "调整编号规则", model.name + " · " + f.prefix);
          }, "编号规则已更新");
          if (ok) close();
        }}
      >
        <Field label="固定前缀">
          <input
            required
            pattern="[A-Za-z0-9-]{1,32}"
            value={f.prefix}
            onChange={(e) => F({ ...f, prefix: e.target.value.toUpperCase() })}
          />
        </Field>
        <Field label="批次格式">
          <select
            value={f.batchFormat}
            onChange={(e) => F({ ...f, batchFormat: e.target.value })}
          >
            <option>YYYYMM</option>
            <option>YYYYMMDD</option>
            <option>YYYY</option>
          </select>
        </Field>
        <Field label="流水位数（3–12）">
          <input
            required
            type="number"
            min="3"
            max="12"
            step="1"
            value={f.sequenceWidth}
            onChange={(e) => F({ ...f, sequenceWidth: Number(e.target.value) })}
          />
        </Field>
        <Field label="下一个可用流水号">
          <input
            required
            type="number"
            min={consumed}
            step="1"
            value={f.nextSequence}
            onChange={(e) => F({ ...f, nextSequence: Number(e.target.value) })}
          />
        </Field>
        <p className="muted">
          格式：{f.prefix}-{"{" + f.batchFormat + "}"}-
          {"{SEQ" + f.sequenceWidth + "}"}。流水号不能回退到已占用区间。
        </p>
        <div className="modal-foot">
          <button type="button" className="outline" onClick={close}>
            取消
          </button>
          <button className="primary">保存规则</button>
        </div>
      </form>
    </Modal>
  );
}
function BindCode({ code, db, change, close }) {
  const [instanceId, I] = useState("");
  const eligible = db.instances.filter(
    (i) =>
      i.modelId === code.modelId &&
      i.status !== "已发布" &&
      !db.codeRecords.some((c) => c.instanceId === i.id && c.status !== "作废"),
  );
  return (
    <Modal title="绑定电池实例" subtitle={code.passportId} onClose={close}>
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          const ok = await change((d) => {
            const c = d.codeRecords.find((x) => x.id === code.id),
              i = d.instances.find((x) => x.id === instanceId);
            if (
              !i ||
              c.status !== "待用" ||
              d.codeRecords.some(
                (x) => x.instanceId === i.id && x.status !== "作废",
              )
            )
              throw Error("码状态或实例绑定关系已变化");
            c.instanceId = i.id;
            c.enterpriseSerial = i.serial;
            c.productionDate = i.date;
            c.status = "已分配";
            i.passportId = c.passportId;
            c.resolverUrl ||= resolverUrl(
              d.company.resolverBaseUrl,
              c.passportId,
            );
            const b = d.codeBatches.find((x) => x.id === c.batchId);
            if (
              b &&
              d.codeRecords.filter(
                (x) => x.batchId === b.id && x.status === "待用",
              ).length === 0
            )
              b.status = "已分配";
            log(d, "绑定护照编号", `${c.passportId} · ${i.serial}`);
          }, "编号已分配");
          if (ok) close();
        }}
      >
        <Field label="选择未绑定实例" required>
          <select
            required
            value={instanceId}
            onChange={(e) => I(e.target.value)}
          >
            <option value="">请选择实例</option>
            {eligible.map((i) => (
              <option key={i.id} value={i.id}>
                {i.serial} · {i.id}
              </option>
            ))}
          </select>
        </Field>
        {!eligible.length && (
          <div className="inline-note">
            该型号没有未绑定的实例，请先创建实例或导入企业序列号。
          </div>
        )}
        <div className="modal-foot">
          <button type="button" className="outline" onClick={close}>
            取消
          </button>
          <button className="primary" disabled={!eligible.length}>
            分配编号
          </button>
        </div>
      </form>
    </Modal>
  );
}
function VoidCode({ code, change, close }) {
  const [reason, R] = useState("");
  return (
    <Modal
      title="作废护照编号"
      subtitle={`${code.passportId} · 作废后不可恢复或重分配`}
      onClose={close}
    >
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          const ok = await change((d) => {
            const c = d.codeRecords.find((x) => x.id === code.id);
            if (!c || c.status === "作废") throw Error("该编号已作废");
            c.status = "作废";
            c.voidReason = reason.trim();
            c.voidedAt = new Date().toISOString();
            const i = d.instances.find((x) => x.id === c.instanceId);
            if (i && i.status !== "已发布") delete i.passportId;
            log(d, "作废护照编号", c.passportId + " · " + c.voidReason);
          }, "编号已作废");
          if (ok) close();
        }}
      >
        <Field label="作废原因" required>
          <textarea
            required
            rows="3"
            value={reason}
            onChange={(e) => R(e.target.value)}
            placeholder="记录作废原因"
          />
        </Field>
        <div className="modal-foot">
          <button type="button" className="outline" onClick={close}>
            取消
          </button>
          <button className="danger">
            <Ban size={15} />
            确认作废
          </button>
        </div>
      </form>
    </Modal>
  );
}
function ResolverEditor({ db, change, close }) {
  const [url, U] = useState(db.company.resolverBaseUrl || "");
  const valid = (() => {
    try {
      return (
        new URL(url).protocol === "https:" &&
        !new URL(url).hostname.endsWith(".invalid")
      );
    } catch {
      return false;
    }
  })();
  return (
    <Modal
      title="护照解析域名"
      subtitle="正式二维码内容由稳定 HTTPS 域名解析到护照编号。"
      onClose={close}
    >
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          try {
            const parsed = new URL(url);
            if (parsed.protocol !== "https:" || parsed.pathname !== "/")
              throw Error();
          } catch {
            return;
          }
          const ok = await change((d) => {
            d.company.resolverBaseUrl = url.replace(/\/$/, "");
            log(d, "修改解析域名", d.company.resolverBaseUrl);
          }, "解析域名已保存；历史二维码地址保留不变");
          if (ok) close();
        }}
      >
        <Field label="HTTPS 解析域名">
          <input
            required
            type="url"
            placeholder="https://passport.example.com"
            value={url}
            onChange={(e) => U(e.target.value)}
          />
        </Field>
        <div className={valid ? "inline-note" : "info-banner"}>
          {valid ? <CheckCircle2 size={15} /> : <AlertTriangle size={15} />}
          <span>
            {valid
              ? "域名格式可用于投产二维码。正式启用前请部署解析服务并验证跨设备访问。"
              : "当前为演示/无效域名，只可使用本地预览二维码。"}
          </span>
        </div>
        <p className="muted">
          更改只影响之后新建或重新分配的二维码；旧码记录保存原始 URL。
        </p>
        <div className="modal-foot">
          <button type="button" className="outline" onClick={close}>
            取消
          </button>
          <button className="primary">保存域名</button>
        </div>
      </form>
    </Modal>
  );
}
function CodeImport({ db, change, close, notify }) {
  const [modelId, M] = useState(db.models[0]?.id || ""),
    [rows, R] = useState([]),
    [error, E] = useState(""),
    [filename, N] = useState("");
  async function readFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    N(file.name);
    E("");
    try {
      if (file.size > 5 * 1024 * 1024) throw Error("文件最大 5 MB");
      const ExcelJS = (await import("exceljs")).default;
      const wb = new ExcelJS.Workbook();
      if (!/\.csv$/i.test(file.name))
        await wb.xlsx.load(await file.arrayBuffer());
      let sheet = wb.worksheets[0];
      if (/\.csv$/i.test(file.name)) {
        const text = await file.text();
        const parsed = new ExcelJS.Workbook();
        await parsed.csv.load(text);
        sheet = parsed.worksheets[0];
      }
      if (!sheet) throw Error("文件没有工作表");
      const headers = sheet.getRow(1).values.map((x) =>
        String(x || "")
          .trim()
          .toLowerCase(),
      );
      const serialIndex = headers.findIndex((x) =>
        [
          "enterpriseserial",
          "serial",
          "serialnumber",
          "序列号",
          "企业序列号",
        ].includes(x),
      );
      const dateIndex = headers.findIndex((x) =>
        ["productiondate", "date", "生产日期"].includes(x),
      );
      if (serialIndex < 0) throw Error("表头需包含 enterpriseSerial 或 序列号");
      const list = [];
      sheet.eachRow((row, n) => {
        if (n === 1) return;
        const serial = String(row.getCell(serialIndex + 1).value || "").trim();
        if (serial)
          list.push({
            serial,
            date:
              dateIndex >= 0
                ? String(row.getCell(dateIndex + 1).value || "").slice(0, 10)
                : today(),
          });
      });
      if (!list.length) throw Error("没有可导入的序列号");
      if (list.length > 5000) throw Error("单次最多导入 5,000 行");
      R(list);
    } catch (err) {
      E(err.message);
    }
    e.target.value = "";
  }
  const model = db.models.find((m) => m.id === modelId),
    dups = new Set(),
    seen = new Set();
  const preview = rows.map((row, index) => {
    const duplicate =
      seen.has(row.serial) ||
      db.instances.some(
        (i) => i.serial === row.serial && i.modelId !== modelId,
      ) ||
      db.codeRecords.some(
        (c) => c.enterpriseSerial === row.serial && c.status !== "作废",
      );
    seen.add(row.serial);
    if (duplicate) dups.add(row.serial);
    return {
      ...row,
      index,
      duplicate,
      available:
        index <
        db.codeRecords.filter(
          (c) => c.modelId === modelId && c.status === "待用",
        ).length,
    };
  });
  const valid = preview.filter((x) => !x.duplicate && x.available);
  return (
    <Modal
      title="导入企业序列号"
      subtitle="Excel / CSV：enterpriseSerial、productionDate（可选）"
      onClose={close}
      wide
    >
      <div className="form-grid">
        <Field label="电池型号">
          <select value={modelId} onChange={(e) => M(e.target.value)}>
            {db.models.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Excel / CSV 文件">
          <input type="file" accept=".xlsx,.csv" onChange={readFile} />
        </Field>
      </div>
      <button
        className="text-btn"
        onClick={async () => {
          const ExcelJS = (await import("exceljs")).default;
          const wb = new ExcelJS.Workbook(),
            ws = wb.addWorksheet("Serials");
          ws.addRow(["enterpriseSerial", "productionDate"]);
          ws.addRow(["PLANT-SERIAL-000001", today()]);
          ws.addRow(["PLANT-SERIAL-000002", today()]);
          const buf = await wb.xlsx.writeBuffer();
          download(
            "battery-serial-import-template.xlsx",
            new Blob([buf]),
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          );
        }}
      >
        <Download size={14} />
        下载导入模板
      </button>
      {error && (
        <div className="info-banner">
          <AlertTriangle size={16} />
          {error}
        </div>
      )}
      {filename && (
        <>
          <div className="inline-note">
            {filename} · {rows.length} 行 · 可绑定 {valid.length} 行 ·
            冲突/无可用码 {preview.length - valid.length} 行
          </div>
          <div className="import-preview">
            {preview.slice(0, 12).map((row) => (
              <div key={row.index}>
                <span>{row.serial}</span>
                <span>{row.date}</span>
                <Tag
                  value={
                    row.duplicate
                      ? "重复"
                      : row.available
                        ? "可导入"
                        : "缺少待用码"
                  }
                />
              </div>
            ))}
          </div>
        </>
      )}
      <p className="muted">
        导入会把未绑定序列号创建为该型号的电池实例，并按顺序绑定待用码。存在重复或码量不足时整批不提交，不会部分导入。
      </p>
      <div className="modal-foot">
        <button className="outline" onClick={close}>
          取消
        </button>
        <button
          className="primary"
          disabled={!filename || !rows.length || valid.length !== rows.length}
          onClick={async () => {
            if (valid.length !== rows.length) return;
            const ok = await change((d) => {
              const available = d.codeRecords.filter(
                (c) => c.modelId === modelId && c.status === "待用",
              );
              rows.forEach((row, n) => {
                let instance = d.instances.find(
                  (i) => i.modelId === modelId && i.serial === row.serial,
                );
                if (!instance) {
                  instance = {
                    id: id("BAT"),
                    modelId,
                    serial: row.serial,
                    date: row.date || today(),
                    state: "在役",
                    status: "草稿",
                    soh: "",
                    cycles: 0,
                  };
                  d.instances.push(instance);
                }
                const code = available[n];
                if (!code) throw Error("可用码数量已变化，未能完成导入");
                Object.assign(code, {
                  instanceId: instance.id,
                  enterpriseSerial: instance.serial,
                  productionDate: instance.date,
                  status: "已分配",
                  resolverUrl:
                    code.resolverUrl ||
                    resolverUrl(d.company.resolverBaseUrl, code.passportId),
                });
                instance.passportId = code.passportId;
              });
              d.importJobs.push({
                id: id("IMPORT"),
                fileName: filename,
                modelId,
                rowCount: rows.length,
                createdAt: new Date().toISOString(),
                status: "已完成",
              });
              log(d, "导入企业序列号", `${filename} · ${rows.length} 条`);
            }, "序列号已导入并分配护照码");
            if (ok) close();
          }}
        >
          确认导入 {rows.length} 行
        </button>
      </div>
    </Modal>
  );
}
async function exportCodes(codes) {
  const ExcelJS = (await import("exceljs")).default;
  const wb = new ExcelJS.Workbook(),
    ws = wb.addWorksheet("Passport codes");
  ws.columns = [
    { header: "Batch", key: "batch", width: 22 },
    { header: "Battery number", key: "serial", width: 28 },
    { header: "Internal resolver ID", key: "passport", width: 30 },
    { header: "Model", key: "model", width: 28 },
    { header: "Production date", key: "date", width: 16 },
    { header: "Status", key: "status", width: 14 },
    { header: "Demo passport URL", key: "url", width: 54 },
    { header: "Configured resolver URL", key: "resolver", width: 54 },
    { header: "Created at", key: "created", width: 25 },
    { header: "Activated at", key: "activated", width: 25 },
    { header: "Voided at", key: "voided", width: 25 },
    { header: "Void reason", key: "reason", width: 32 },
  ];
  ws.getRow(1).font = { bold: true, color: { argb: "FFFFFFFF" } };
  ws.getRow(1).fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FF1D7954" },
  };
  codes.forEach((c) => {
    const b = c.batchId;
    ws.addRow({
      batch: codes.find((code) => code.id === c.id)?.batchCode || b,
      passport: c.passportId,
      serial: c.enterpriseSerial,
      model: c.modelName || "",
      date: c.productionDate,
      status: c.status,
      url: location.origin + "/passport/" + c.passportId,
      resolver: c.resolverUrl,
      created: c.createdAt,
      activated: c.activatedAt,
      voided: c.voidedAt,
      reason: c.voidReason,
    });
  });
  ws.autoFilter = "A1:L1";
  const bytes = await wb.xlsx.writeBuffer();
  download(
    "battery-codes-" + today() + ".xlsx",
    new Blob([bytes]),
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  );
}
function CodeExport({ codes, db, close }) {
  const [confirm, C] = useState(false);
  const rows = codes.map((c) => ({
    ...c,
    batchCode: db.codeBatches.find((b) => b.id === c.batchId)?.batchCode || "",
    modelName: db.models.find((m) => m.id === c.modelId)?.name || "",
  }));
  return (
    <Modal
      title="导出码清单"
      subtitle={`当前筛选结果：${rows.length} 条 · Excel 工作簿包含状态、解析 URL 和作废记录`}
      onClose={close}
    >
      <div className="info-banner">
        <AlertTriangle size={16} />
        <span>导出全部记录包含受限业务标识。请确认当前筛选范围。</span>
      </div>
      <label className="confirm-check">
        <input
          type="checkbox"
          checked={confirm}
          onChange={(e) => C(e.target.checked)}
        />
        我确认导出当前筛选的全部 {rows.length} 条码记录
      </label>
      <div className="modal-foot">
        <button className="outline" onClick={close}>
          取消
        </button>
        <button
          className="primary"
          disabled={!confirm || !rows.length}
          onClick={async () => {
            await exportCodes(rows);
            close();
          }}
        >
          <Download size={15} />
          导出 Excel
        </button>
      </div>
    </Modal>
  );
}
function PrintLabels({ db, batchId, records, productionReady, change, close }) {
  const batch = db.codeBatches.find((b) => b.id === batchId),
    items = records || db.codeRecords.filter((c) => c.batchId === batchId),
    [statuses, S] = useState(["可访问", "资料待补充"]),
    [fromPage, F] = useState(1),
    [toPage, T] = useState(Math.max(1, Math.ceil(items.length / 24))),
    [margin, G] = useState(7),
    [gap, H] = useState(2);
  const selected = items.filter((c) => statuses.includes(c.status === '作废' ? '已作废' : codeStatus(db, { id: c.instanceId }))),
    pageCount = Math.max(1, Math.ceil(selected.length / 24)),
    start = Math.max(1, Math.min(Number(fromPage) || 1, pageCount)),
    end = Math.max(start, Math.min(Number(toPage) || pageCount, pageCount)),
    rows = selected.slice((start - 1) * 24, end * 24);
  const demoUrl = (c) =>
    location.origin +
    "/passport/" +
    (db.instances.find((i) => i.id === c.instanceId)?.passportId ||
      c.passportId);
  async function output() {
    if (!rows.length) return;
    const [{ jsPDF }, QRCode] = await Promise.all([
      import("jspdf"),
      import("qrcode"),
    ]);
    const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      }),
      pageW = 210,
      pageH = 297,
      cols = 3,
      perPage = 24,
      labelW = (pageW - 2 * margin - (cols - 1) * gap) / cols,
      labelH = (pageH - 2 * margin - 7 * gap) / 8;
    for (let n = 0; n < rows.length; n++) {
      if (n && n % perPage === 0) pdf.addPage();
      const pos = n % perPage,
        col = pos % cols,
        row = Math.floor(pos / cols),
        x = margin + col * (labelW + gap),
        y = margin + row * (labelH + gap);
      pdf.setDrawColor(205, 218, 210);
      pdf.roundedRect(x, y, labelW, labelH, 1, 1);
      const c = rows[n],
        m = db.models.find((i) => i.id === c.modelId);
      const qr = await QRCode.toDataURL(demoUrl(c), { margin: 1, width: 280 });
      pdf.addImage(qr, "PNG", x + 4, y + 5, 24, 24);
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(8);
      pdf.text(c.passportId, x + 31, y + 10, { maxWidth: labelW - 34 });
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(7);
      pdf.text((m?.name || "") + " / " + (m?.chem || ""), x + 31, y + 17, {
        maxWidth: labelW - 34,
      });
      pdf.text(c.productionDate || "", x + 31, y + 23);
      pdf.setFontSize(5);
      pdf.text("DEMO · NOT FOR PRODUCTION", x + 31, y + 29);
    }
    const batchName = batch?.batchCode || "filtered-" + today();
    pdf.save("battery-labels-" + batchName + ".pdf");
    await change((d) => {
      d.printJobs.push({
        id: id("PRINT"),
        batchId: batch?.id || "FILTERED",
        source: batch?.id ? "码批次" : "当前筛选结果",
        codeIds: rows.map((c) => c.id),
        count: rows.length,
        pageRange: `${start}-${end}`,
        createdAt: new Date().toISOString(),
        mode: "本地演示二维码",
      });
      log(d, "生成演示标签 PDF", `${batchName} · ${rows.length} 张`);
    }, "演示标签 PDF 已生成；打印任务已记录");
    close();
  }
  return (
    <Modal
      title="A4 标签打印"
      subtitle={`${batch?.batchCode || "当前筛选结果"} · 每页 3 列 × 8 行`}
      onClose={close}
      wide
    >
      <div className="demo-pill">
        <AlertTriangle size={15} />
        {productionReady
          ? "解析域名格式有效；当前原型仍将显式标记演示标签。"
          : "无有效投产解析域名，仅能生成包含本地预览链接的演示 PDF。"}
      </div>
      <div className="condition-box">
        {["可访问", "资料待补充", "已作废"].map((s) => (
          <label key={s}>
            <input
              type="checkbox"
              checked={statuses.includes(s)}
              onChange={(e) =>
                S(
                  e.target.checked
                    ? [...statuses, s]
                    : statuses.filter((x) => x !== s),
                )
              }
            />
            {s}
          </label>
        ))}
      </div>
      <div className="form-grid">
        <Field label="起始页码">
          <input
            type="number"
            min="1"
            max={pageCount}
            value={fromPage}
            onChange={(e) => F(Number(e.target.value))}
          />
        </Field>
        <Field label="结束页码">
          <input
            type="number"
            min="1"
            max={pageCount}
            value={toPage}
            onChange={(e) => T(Number(e.target.value))}
          />
        </Field>
        <Field label="页边距（mm）">
          <input
            type="number"
            min="3"
            max="20"
            value={margin}
            onChange={(e) => G(Number(e.target.value))}
          />
        </Field>
        <Field label="标签间距（mm）">
          <input
            type="number"
            min="0"
            max="8"
            value={gap}
            onChange={(e) => H(Number(e.target.value))}
          />
        </Field>
      </div>
      <div className="label-preview">
        {rows.slice(0, 6).map((c) => (
          <div key={c.id}>
            <QRCodeSVG value={demoUrl(c)} size={55} />
            <strong>{c.passportId}</strong>
            <small>
              {db.models.find((m) => m.id === c.modelId)?.name} ·{" "}
              {c.productionDate}
            </small>
            <em>DEMO · NOT FOR PRODUCTION</em>
          </div>
        ))}
      </div>
      <p className="muted">
        预览 {rows.length} 张标签。页面使用 A4 3 × 8
        网格；二维码链接到当前应用预览，PDF 全部带有演示警告。
      </p>
      <div className="modal-foot">
        <button className="outline" onClick={close}>
          取消
        </button>
        <button className="primary" disabled={!rows.length} onClick={output}>
          <Printer size={15} />
          下载演示 PDF
        </button>
      </div>
    </Modal>
  );
}
function PrintJobList({ db, close }) {
  return (
    <Modal
      title="打印任务记录"
      subtitle="每次打印或补打均保留任务记录，不改变码状态。"
      onClose={close}
    >
      {db.printJobs
        .slice()
        .reverse()
        .map((job) => (
          <div className="version-row" key={job.id}>
            <div>
              <strong>
                {job.id} · {job.count} 张
              </strong>
              <p>
                {fmt(job.createdAt)} · {job.source || "码批次"} · {job.mode} ·
                页码 {job.pageRange}
              </p>
            </div>
            <Tag value="已完成" />
          </div>
        ))}
      {!db.printJobs.length && <Empty text="暂无打印记录" />}
      <div className="modal-foot">
        <button className="primary" onClick={close}>
          关闭
        </button>
      </div>
    </Modal>
  );
}
function Documents(ctx) {
  const { db, setModal, notify, change } = ctx;
  const [q, Q] = useState("");
  return (
    <>
      <PageTitle
        eyebrow="DOCUMENT LIBRARY"
        title="文件中心"
        description="关联型号或电池实例，并按公开范围管理资料版本。"
      >
        <button
          className="primary"
          onClick={() => setModal({ type: "document" })}
        >
          <Upload size={16} />
          上传文件
        </button>
      </PageTitle>
      <div className="filter-row">
        <SearchBox value={q} set={Q} placeholder="搜索文件名称" />
        <span className="filter-count">
          仅支持小型文本或 PDF 文件，每个不超过 2 MB
        </span>
      </div>
      <section className="panel table-panel">
        <table>
          <thead>
            <tr>
              <th>文件名称</th>
              <th>关联对象</th>
              <th>版本</th>
              <th>访问范围</th>
              <th>更新时间</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            {db.documents
              .filter((d) => d.name.toLowerCase().includes(q.toLowerCase()))
              .map((d) => (
                <tr key={d.id}>
                  <td>
                    <strong>{d.name}</strong>
                    <small>{d.nameEn || "英文名称未填写"}</small>
                  </td>
                  <td>{d.target}</td>
                  <td>v{d.version}</td>
                  <td>
                    <Tag value={d.access} />
                  </td>
                  <td>{d.updated}</td>
                  <td>
                    <div className="row-actions">
                      <button
                        title="下载文件"
                        onClick={() => downloadDocument(d)}
                      >
                        <Download size={15} />
                      </button>
                      <button
                        title="编辑文件"
                        onClick={() => setModal({ type: "document", value: d })}
                      >
                        <Pencil size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
        {!db.documents.length && <Empty />}
      </section>
    </>
  );
}
function downloadDocument(doc) {
  if (doc.dataUrl) {
    const a = document.createElement("a");
    a.href = doc.dataUrl;
    a.download = doc.name;
    a.click();
  } else download(doc.name, doc.content || "", doc.mime);
}
function Requests(ctx) {
  const { db, change, setModal } = ctx;
  async function decide(request, status) {
    if (status === "已批准") {
      setModal({ type: "approval", request });
      return;
    }
    await change((d) => {
      d.requests.find((r) => r.id === request.id).status = status;
      log(d, "拒绝访问申请", request.entity);
    }, "申请已拒绝");
  }
  return (
    <>
      <PageTitle
        eyebrow="ACCESS CONTROL"
        title="访问管理"
        description="按访问用途审批受限资料，所有身份与权限均为本地模拟。"
      >
        <span className="demo-pill">
          <ShieldCheck size={16} />
          演示权限规则
        </span>
      </PageTitle>
      <div className="info-banner">
        <AlertTriangle size={18} />
        <div>
          <strong>本原型不提供真实的资料保密能力</strong>
          <p>
            数据在浏览器本地。正式上线需由服务端验证身份、授权范围与有效期。
          </p>
        </div>
      </div>
      <section className="panel table-panel">
        <table>
          <thead>
            <tr>
              <th>申请方</th>
              <th>用途</th>
              <th>目标护照</th>
              <th>授权到期</th>
              <th>状态</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            {db.requests.map((r) => (
              <tr key={r.id}>
                <td>
                  <strong>{r.entity}</strong>
                  <small>{r.email}</small>
                </td>
                <td>{r.purpose}</td>
                <td><button className="text-btn" onClick={() => ctx.navigate('/passport/' + encodeURIComponent(r.passportId))}>{r.passportId}</button></td>
                <td>{r.expires || "—"}</td>
                <td>
                  <Tag
                    value={
                      r.status === "已批准" && r.expires < today()
                        ? "已过期"
                        : r.status
                    }
                  />
                </td>
                <td>
                  {r.status === "待处理" ? (
                    <div className="row-actions">
                      <button
                        className="small-action approve"
                        onClick={() => decide(r, "已批准")}
                      >
                        批准
                      </button>
                      <button
                        className="small-action"
                        onClick={() => decide(r, "已拒绝")}
                      >
                        拒绝
                      </button>
                    </div>
                  ) : r.status === "已批准" ? (
                    <button
                      className="text-btn"
                      onClick={() => decide(r, "已撤销")}
                    >
                      撤销授权
                    </button>
                  ) : (
                    "—"
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!db.requests.length && <Empty />}
      </section>
    </>
  );
}
function InformationCenter(ctx) {
  const [section, S] = useState(ctx.initialTab || '数据概览');
  return <>
    <PageTitle title="数据与资料" description="汇总业务数据，查阅法规资料和操作记录。">
      <button className="outline" onClick={() => S('数据管理')}><Database size={16}/>数据管理</button>
    </PageTitle>
    <div className="tabs" aria-label="数据与资料栏目">{['数据概览','欧盟电池法规','使用帮助','操作记录',...(section === '数据管理' ? ['数据管理'] : [])].map(label => <button key={label} className={section === label ? 'selected' : ''} onClick={() => S(label)}>{label}</button>)}</div>
    {section === '数据概览' ? <Dashboard db={ctx.db} navigate={ctx.navigate} embedded/> : section === '欧盟电池法规' ? <RegulationGuide navigate={ctx.navigate}/> : section === '使用帮助' ? <UsageHelp db={ctx.db} navigate={ctx.navigate}/> : <Rules key={section} {...ctx} mode={section === '操作记录' ? 'logs' : 'data'}/>}
  </>;
}
function FieldRuleEditor({rule,db,change,close}) {
  const [dataType,T]=useState(rule.dataType||inferFieldDataType(rule.code,rule.unit));
  const [labelDrafts,LD]=useState({...rule.labels});
  const defaultType=inferFieldDataType(rule.code,rule.unit);
  const save=async()=>{
    const ok=await change(d=>{
      const current=d.rules.find(r=>r.code===rule.code);
      if(!current) throw new Error('字段规则不存在');
      current.dataType=dataType;
      current.labels={...labelDrafts};
      log(d,'修改字段定义',`${current.zh} · ${dataType}`);
    },'字段类型已保存');
    if(ok)close();
  };
  const restore=()=>T(defaultType);
  return <Modal title="设置字段类型" subtitle={`${rule.zh} · ${rule.code}`} onClose={close}>
    <div className="field-rule-editor">
      <div className="field-rule-fixed"><span>所属层级</span><strong>{{company:'产品责任信息',model:'产品资料',instance:'单码资料'}[rule.level]||rule.level}</strong><span>字段编码</span><strong>{rule.code}</strong></div>
      <label className="form-field">数据类型<select value={dataType} onChange={e=>T(e.target.value)}>{fieldDataTypes.map(type=><option key={type}>{type}</option>)}</select><small>类型决定产品资料编辑时使用的输入控件；字段值仍由产品资料维护。</small></label>
      <div className="field-label-list"><strong>多语言参数名称</strong><small>扫码页切换语言时按此处对应名称显示；字段值仍使用产品资料中的原始内容。</small>{Object.entries(passportLanguages).map(([code,name])=><label className="form-field" key={code}>{name}<input value={labelDrafts[code] || ''} onChange={e=>LD({...labelDrafts,[code]:e.target.value})}/></label>)}</div>
    </div>
    <div className="modal-foot"><button className="outline" onClick={restore}>恢复默认类型</button><button className="outline" onClick={close}>取消</button><button className="primary" onClick={save}>保存设置</button></div>
  </Modal>;
}

function Rules(ctx) {
  const { db, change, notify, setModal } = ctx;
  const mode = ctx.mode || 'fields';
  const tab = mode === 'logs' ? '操作日志' : mode === 'data' ? '数据管理' : '字段规则';
  const fileRef = useRef();
  async function importFile(e) {
    const f = e.target.files?.[0];
    if (!f) return;
    try {
      if (f.size > 15 * 1024 * 1024) throw Error("导入文件不得超过 15 MB");
      const value = validateImport(JSON.parse(await f.text()));
      setModal({ type: "import", value });
    } catch (error) {
      notify("导入失败：" + error.message);
    }
    e.target.value = "";
  }
  return (
    <>
      {mode !== 'logs' && <PageTitle
        eyebrow="GOVERNANCE"
        title={mode === 'fields' ? '字段设置' : '数据管理'}
        description={mode === 'fields' ? '配置通用字段数据类型，决定产品资料使用的输入控件；不设置电池类别或法规适用性。' : '备份或恢复当前工作区数据。'}
      >
        {mode === 'data' && <><button
          className="outline"
          onClick={() =>
            download(
              "dianchi-backup-" + today() + ".json",
              JSON.stringify(db, null, 2),
              "application/json",
            )
          }
        >
          <Download size={16} />
          备份数据
        </button>
        <button className="outline" onClick={() => fileRef.current.click()}>
          <Upload size={16} />
          恢复备份
        </button>
        <input
          ref={fileRef}
          hidden
          type="file"
          accept=".json"
          onChange={importFile}
        /></>}
      </PageTitle>}
      {tab === "解析域名" ? (
        <section className="panel editor-panel">
          <h2>二维码解析域名</h2>
          <p>{db.company.resolverBaseUrl || '尚未配置'}</p>
          <p>用于新生成二维码的访问地址。修改后历史二维码地址不变；本地演示仍使用当前浏览器预览。</p>
          <button className="outline" onClick={() => setModal({ type: 'resolver' })}>设置解析域名</button>
          <p className="muted">默认编号规则：进入“产品与批次”，选择产品后设置。查码、导出及打印：进入“批次与二维码”。</p>
        </section>
      ) : tab === "字段规则" ? (
        <>
          <div className="inline-note field-rule-note">
            <AlertTriangle size={15} />
            <span><strong>字段设置</strong>：这里只配置文本、数值、日期等通用数据类型，控制录入时的输入方式。字段名称、编码和层级固定；产品资料及图文内容仍在产品中维护。本栏目不选择电池类别，也不判断法规适用性。</span>
          </div>
          <section className="panel table-panel">
            <table>
              <thead>
                <tr>
                  <th>字段 / 编码</th>
                  <th>单位</th>
                  <th>层级</th>
                  <th>数据类型</th>
                  <th>设置</th>
                </tr>
              </thead>
              <tbody>
                {db.rules.map((r) => (
                  <tr key={r.code}>
                    <td>
                      <strong>{r.zh}</strong>
                      <small>{r.code}</small>
                    </td>
                    <td>{r.unit || "—"}</td>
                    <td>{{ company: '产品责任信息', model: '产品资料', instance: '单码资料' }[r.level] || r.level}</td>
                    <td><span className="rule-badge">{r.dataType||inferFieldDataType(r.code,r.unit)}</span><small className="field-label-locales">{Object.entries(r.labels||{}).filter(([,label])=>String(label||'').trim()).length} 种语言</small></td>
                    <td><button className="small-action" onClick={() => setModal({type:'fieldRule',rule:r})}>编辑</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        </>
      ) : tab === "操作日志" ? (
        <section className="panel table-panel">
          <table>
            <thead>
              <tr>
                <th>时间</th>
                <th>操作</th>
                <th>详情</th>
                <th>操作人</th>
              </tr>
            </thead>
            <tbody>
              {db.logs.map((l) => (
                <tr key={l.id}>
                  <td>{fmt(l.time)}</td>
                  <td>{l.action}</td>
                  <td>{l.detail}</td>
                  <td>本地管理员（模拟）</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      ) : (
        <section className="panel editor-panel">
          <h2>演示数据管理</h2>
          <p>
            本机新增数据不会自动同步到其他浏览器或手机。恢复备份前会显示确认提示；重置会清除当前维护的数据并恢复演示样例。
          </p>
          <p>导出的 JSON 包含受限字段和文件内容，请仅使用虚构资料。</p>
          <button
            className="danger"
            onClick={() => setModal({ type: "reset" })}
          >
            <Trash2 size={16} />
            重置演示数据
          </button>
        </section>
      )}
    </>
  );
}

function RenderModal(ctx) {
  const { modal, setModal, db, change, notify, navigate } = ctx,
    close = () => setModal(null);
  if (modal.type === "batchMetadata")
    return <BatchMetadata {...ctx} batchId={modal.batchId} close={close} />;
  if (modal.type === "model")
    return <ModelEditor {...ctx} value={modal.value} close={close} />;
  if (modal.type === "instance")
    return <InstanceEditor {...ctx} value={modal.value} close={close} />;
  if (modal.type === "batch")
    return <BatchCreator {...ctx} initialModel={modal.modelId} close={close} />;
  if (modal.type === "codeRule")
    return <CodeRuleEditor {...ctx} model={modal.model} close={close} />;
  if (modal.type === "fieldRule")
    return <FieldRuleEditor {...ctx} rule={modal.rule} close={close} />;
  if (modal.type === "bindCode")
    return <BindCode {...ctx} code={modal.code} close={close} />;
  if (modal.type === "voidCode")
    return <VoidCode {...ctx} code={modal.code} close={close} />;
  if (modal.type === "resolver")
    return <ResolverEditor {...ctx} close={close} />;
  if (modal.type === "codeImport") return <CodeImport {...ctx} close={close} />;
  if (modal.type === "codeExport")
    return <CodeExport {...ctx} codes={modal.codes} close={close} />;
  if (modal.type === "print")
    return (
      <PrintLabels
        {...ctx}
        batchId={modal.batchId}
        productionReady={modal.productionReady}
        close={close}
      />
    );
  if (modal.type === "printFilter")
    return (
      <PrintLabels
        {...ctx}
        records={modal.codes}
        productionReady={false}
        close={close}
      />
    );
  if (modal.type === "printJobList")
    return <PrintJobList {...ctx} close={close} />;
  if (modal.type === "document")
    return <DocumentEditor {...ctx} value={modal.value} close={close} />;
  if (modal.type === "request")
    return (
      <RequestForm
        {...ctx}
        passportId={modal.passportId}
        close={close}
        en={modal.en}
      />
    );
  if (modal.type === "approval")
    return <Approval {...ctx} request={modal.request} close={close} />;
  if (modal.type === "rule") return null;
  if (modal.type === "qr")
    return <QRCodeDialog instance={modal.instance} close={close} />;
  if (modal.type === "issues")
    return (
      <Modal
        title="资料完整性检查"
        subtitle={modal.instance.id}
        onClose={close}
      >
        {modal.issues.length ? (
          <>
            <div className="info-banner">
              <AlertTriangle size={18} />
              <span>缺少以下适用字段，无法提交或发布。</span>
            </div>
            <ul className="issue-list">
              {modal.issues.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ul>
          </>
        ) : (
          <div className="check-success">
            <CheckCircle2 size={36} />
            <h3>适用必填字段已完整</h3>
            <p>这是原型检查结果，不是欧盟合规认证。</p>
          </div>
        )}
        <div className="modal-foot">
          <button className="primary" onClick={close}>
            知道了
          </button>
        </div>
      </Modal>
    );
  if (modal.type === "versions")
    return (
      <Modal
        title="护照版本历史"
        subtitle="已发布快照不会随草稿修改而变化"
        onClose={close}
      >
        {db.versions
          .filter(
            (v) =>
              v.passportId ===
                (modal.instance.passportId || modal.instance.id) ||
              v.instance?.id === modal.instance.id,
          )
          .sort((a, b) => b.version - a.version)
          .map((v) => (
            <div className="version-row" key={v.id}>
              <div>
                <strong>版本 {v.version}</strong>
                <p>
                  {fmt(v.publishedAt)} · {v.ruleVersion}
                </p>
              </div>
              <button
                className="text-btn"
                onClick={() => {
                  close();
                  navigate(
                    "/passport/" + v.passportId + "?version=" + v.version,
                  );
                }}
              >
                查看快照 <ArrowUpRight size={14} />
              </button>
            </div>
          ))}
        {!latest(db, modal.instance.id) && <Empty text="尚未发布任何版本" />}
      </Modal>
    );
  if (["reset", "import"].includes(modal.type))
    return (
      <Modal
        title={modal.type === "reset" ? "重置演示数据？" : "确认导入数据？"}
        subtitle="此操作将替换当前浏览器中的全部工作区数据，建议先导出备份。"
        onClose={close}
      >
        <div className="modal-foot">
          <button className="outline" onClick={close}>
            取消
          </button>
          <button
            className="primary"
            onClick={async () => {
              const ok = await change((d) => {
                const next =
                  modal.type === "reset" ? createSeed() : modal.value;
                next.rules?.forEach(rule => { rule.dataType ||= inferFieldDataType(rule.code, rule.unit); });
                Object.keys(d).forEach((k) => delete d[k]);
                Object.assign(d, next);
                log(
                  d,
                  modal.type === "reset" ? "重置演示数据" : "导入备份数据",
                  "替换本地工作区",
                );
              }, "数据已保存");
              if (ok) close();
            }}
          >
            确认{modal.type === "reset" ? "重置" : "导入"}
          </button>
        </div>
      </Modal>
    );
  return null;
}

function ModelEditor({ value, db, change, close }) {
  const [f, F] = useState(
    value || {
      name: "",
      type: categories[0],
      codeRule: {
        prefix: "QY-ESS",
        batchFormat: "YYYYMM",
        sequenceWidth: 6,
        nextSequence: 1,
      },
      chem: "LFP",
      energy: "",
      capacity: "",
      voltage: "",
      weight: "",
      carbonApplicable: false,
      disassemblyApplicable: false,
    },
  );
  const set = (k, v) => F({ ...f, [k]: v });
  function input(k, label, type = "text") {
    return (
      <Field label={label}>
        <input
          type={type}
          min={type === "number" ? "0.01" : undefined}
          step="any"
          value={f[k] ?? ""}
          onChange={(e) => set(k, e.target.value)}
        />
      </Field>
    );
  }
  return (
    <Modal
      title={f.id ? "编辑电池型号" : "新建电池型号"}
      subtitle="允许保存未完整的草稿；发布前将检查适用必填字段。"
      onClose={close}
      wide
    >
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          const ok = await change((d) => {
            if (d.models.some((m) => m.name === f.name && m.id !== f.id))
              throw Error("型号名称已存在");
            const prefix =
              f.type === "电动汽车"
                ? "QY-EV"
                : f.type === "轻型交通工具"
                  ? "QY-LMT"
                  : "QY-ESS";
            const model = {
              ...f,
              codeRule: {
                prefix: f.id ? f.codeRule.prefix : prefix,
                batchFormat: f.codeRule.batchFormat || "YYYYMM",
                sequenceWidth: f.codeRule.sequenceWidth || 6,
                nextSequence: f.codeRule.nextSequence || 1,
              },
              id: f.id || id("MOD"),
              updated: today(),
            };
            const n = d.models.findIndex((m) => m.id === model.id);
            if (n >= 0) d.models[n] = model;
            else d.models.push(model);
            d.instances
              .filter((i) => i.modelId === model.id && i.status === "待审核")
              .forEach((i) => (i.status = "草稿"));
            log(d, "保存电池型号", model.name);
          }, "型号已保存；已发布快照保持不变");
          if (ok) close();
        }}
      >
        <div className="form-grid">
          <Field label="型号名称（基础内容，可直接填英文）" required>
            <input
              required
              value={f.name}
              onChange={(e) => set("name", e.target.value)}
            />
          </Field>
          <Field label="电池类别">
            <select
              value={f.type}
              onChange={(e) => set("type", e.target.value)}
            >
              {categories.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </Field>
          <Field label="化学体系">
            <select
              value={f.chem}
              onChange={(e) => set("chem", e.target.value)}
            >
              {["LFP", "NMC", "LTO", "钠离子", "其他"].map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </Field>
          {input("energy", "额定能量（kWh）", "number")}
          {input("capacity", "额定容量（Ah）", "number")}
          {input("voltage", "额定电压（V）", "number")}
          {input("weight", "重量（kg）", "number")}
          {input("life", "设计寿命 / Design life")}
          <Field label="资料模板"><span>{templates[f.template || 'eu']}</span></Field>
          {input("power", "原始功率能力及测试条件")}
          {input("efficiency", "初始往返效率及测试条件")}
          {input("resistance", "初始内阻及测试条件")}
          {input("hazardous", "有害物质与依据")}
          {input("parts", "零件与维修资料（英文，受限）")}
          {input("materials", "公开材料")}
          {input("disassembly", "拆解说明（受限）")}
          {input("composition", "详细材料组成（受限）")}
        </div>
        <div className="condition-box">
          <label>
            <input
              type="checkbox"
              checked={!!f.carbonApplicable}
              onChange={(e) => set("carbonApplicable", e.target.checked)}
            />
            碳足迹声明条件适用（演示配置）
          </label>
          {f.carbonApplicable && input("carbon", "碳足迹声明（草稿资料）")}
          <label>
            <input
              type="checkbox"
              checked={!!f.disassemblyApplicable}
              onChange={(e) => set("disassemblyApplicable", e.target.checked)}
            />
            拆解说明条件适用（演示配置）
          </label>
          {input("recycled", "再生材料资料（选填）")}
          {input("diligence", "尽职调查资料（选填）")}
        </div>
        <div className="inline-note">
          {euScope(f)}
        </div>
        <div className="modal-foot">
          <button type="button" className="outline" onClick={close}>
            取消
          </button>
          <button className="primary">保存型号</button>
        </div>
      </form>
    </Modal>
  );
}
function InstanceEditor({ value, db, change, close }) {
  const [f, F] = useState(
      value || {
        modelId: db.models[0]?.id,
        serial: "",
        date: today(),
        state: "在役",
        status: "草稿",
        soh: "",
        cycles: 0,
        previousId: "",
      },
    ),
    [event, E] = useState({ type: "检查", note: "", noteEn: "" });
  const set = (k, v) => F({ ...f, [k]: v });
  return (
    <Modal
      title={value ? "编辑单码信息" : "新建电池实例"}
      subtitle="仅更新当前电池；保存后同步护照，保留历史，原二维码不变。"
      onClose={close}
      wide
    >
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          const ok = await change((d) => {
            if (d.instances.some((i) => i.serial === f.serial && i.id !== f.id))
              throw Error("序列号已存在");
            if (f.previousId === f.id) throw Error("前序护照不能是自身");
            const instance = {
              ...f,
              id: f.id || id("BAT"),
              status:
                f.productionBatchId || value?.status === "待审核"
                  ? "草稿"
                  : f.status,
            };
            const n = d.instances.findIndex((i) => i.id === instance.id);
            if (n >= 0) d.instances[n] = instance;
            else d.instances.push(instance);
            const boundCode = d.codeRecords.find(
              (c) => c.instanceId === instance.id && c.status !== "作废",
            );
            if (boundCode) {
              boundCode.enterpriseSerial = instance.serial;
              boundCode.productionDate = instance.date;
            }
            if (event.note)
              d.events.push({
                id: id("EVT"),
                instanceId: instance.id,
                date: today(),
                ...event,
              });
            log(d, "保存电池实例", instance.serial);
          }, "单码信息已保存并同步更新护照");
          if (ok) close();
        }}
      >
        <div className="form-grid">
          <Field label="关联型号" required>
            <select
              required
              disabled={!!value?.passportId}
              value={f.modelId}
              onChange={(e) => set("modelId", e.target.value)}
            >
              {db.models.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name} · {m.type}
                </option>
              ))}
            </select>
          </Field>
          <Field label="序列号" required>
            <input
              readOnly={!!value?.passportId}
              required
              value={f.serial}
              onChange={(e) => set("serial", e.target.value)}
            />
          </Field>
          <Field label="生产日期" required>
            <input
              required
              type="date"
              max={today()}
              value={f.date}
              onChange={(e) => set("date", e.target.value)}
            />
          </Field>
          <Field label="生命周期">
            <select
              value={f.state}
              onChange={(e) => set("state", e.target.value)}
            >
              {["在役", "再利用", "再制造", "已回收"].map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </Field>
          <Field label="健康状态 SOH（%，受限）">
            <input
              type="number"
              min="0"
              max="100"
              value={f.soh}
              onChange={(e) => set("soh", e.target.value)}
            />
          </Field>
          <Field label="循环次数（受限）">
            <input
              type="number"
              min="0"
              step="1"
              value={f.cycles}
              onChange={(e) => set("cycles", e.target.value)}
            />
          </Field>
          <Field label="前序护照（再利用 / 再制造）">
            <select
              value={f.previousId || ""}
              onChange={(e) => set("previousId", e.target.value)}
            >
              <option value="">不关联</option>
              {db.instances
                .filter((i) => i.id !== f.id && latest(db, i.id))
                .map((i) => (
                  <option key={i.id}>{i.id}</option>
                ))}
            </select>
          </Field>
        </div>
        <div className="section-divider" />
        <CustomValues definitions={db.models.find(m => m.id === f.modelId)?.customFields} level="instance" values={f.customValues} onChange={v => set('customValues', v)} />
        <h3>追加生命周期记录（可选，受限）</h3>
        <div className="form-grid">
          <Field label="事件类型">
            <select
              value={event.type}
              onChange={(e) => E({ ...event, type: e.target.value })}
            >
              {["检查", "维修", "再利用", "再制造", "已回收"].map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </Field>
          <Field label="事件说明（中文）">
            <input
              value={event.note}
              onChange={(e) => E({ ...event, note: e.target.value })}
            />
          </Field>
          <Field label="事件说明（英文）">
            <input
              value={event.noteEn}
              onChange={(e) => E({ ...event, noteEn: e.target.value })}
            />
          </Field>
        </div>
        <div className="modal-foot">
          <button type="button" className="outline" onClick={close}>
            取消
          </button>
          <button className="primary">保存并更新当前电池</button>
        </div>
      </form>
    </Modal>
  );
}
function DocumentEditor({ value, db, change, notify, close }) {
  const [f, F] = useState(
    value || {
      name: "",
      nameEn: "",
      target: db.models[0]?.id,
      access: "公开",
      version: "1.0",
      content: "",
      mime: "text/plain",
    },
  );
  async function upload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (
      file.size > 2 * 1024 * 1024 ||
      !["application/pdf", "text/plain"].includes(file.type)
    ) {
      notify("只接受 2 MB 以内的 PDF / TXT 文件");
      e.target.value = "";
      return;
    }
    const reader = new FileReader();
    reader.onload = () =>
      F({
        ...f,
        name: file.name,
        dataUrl: reader.result,
        mime: file.type,
        content: "",
      });
    reader.readAsDataURL(file);
  }
  return (
    <Modal title={value ? "编辑文件资料" : "上传文件资料"} onClose={close}>
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          if (!f.content && !f.dataUrl) {
            notify("请选择文件或填写演示文本");
            return;
          }
          const ok = await change((d) => {
            const doc = { ...f, id: f.id || id("DOC"), updated: today() };
            const n = d.documents.findIndex((x) => x.id === doc.id);
            if (n >= 0) d.documents[n] = doc;
            else d.documents.push(doc);
            log(d, "保存文件", doc.name);
          }, "文件已保存；重新发布后公开版本生效");
          if (ok) close();
        }}
      >
        <Field label="文件">
          <input
            type="file"
            accept="application/pdf,text/plain,.pdf,.txt"
            onChange={upload}
          />
        </Field>
        <Field label="文件名称（中文）" required>
          <input
            required
            value={f.name}
            onChange={(e) => F({ ...f, name: e.target.value })}
          />
        </Field>
        <Field label="文件名称（英文）">
          <input
            value={f.nameEn}
            onChange={(e) => F({ ...f, nameEn: e.target.value })}
          />
        </Field>
        <div className="form-grid">
          <Field label="关联对象">
            <select
              value={f.target}
              onChange={(e) => F({ ...f, target: e.target.value })}
            >
              {[...db.models, ...db.instances].map((x) => (
                <option key={x.id} value={x.id}>
                  {x.name || x.serial}
                </option>
              ))}
            </select>
          </Field>
          <Field label="访问范围">
            <select
              value={f.access}
              onChange={(e) => F({ ...f, access: e.target.value })}
            >
              <option>公开</option>
              <option>受限</option>
            </select>
          </Field>
          <Field label="版本" required>
            <input
              required
              value={f.version}
              onChange={(e) => F({ ...f, version: e.target.value })}
            />
          </Field>
        </div>
        {!f.dataUrl && (
          <Field label="或填写演示文本">
            <textarea
              rows="4"
              value={f.content}
              onChange={(e) => F({ ...f, content: e.target.value })}
            />
          </Field>
        )}
        <div className="modal-foot">
          <button type="button" className="outline" onClick={close}>
            取消
          </button>
          <button className="primary">保存文件</button>
        </div>
      </form>
    </Modal>
  );
}
function Approval({ request, change, close }) {
  const [expires, E] = useState(
    new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10),
  );
  return (
    <Modal
      title="批准访问申请"
      subtitle={`${request.entity} · ${request.purpose}`}
      onClose={close}
    >
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          const ok = await change((d) => {
            if (expires < today()) throw Error('授权到期日不能早于今天');
            Object.assign(
              d.requests.find((r) => r.id === request.id),
              { status: "已批准", expires },
            );
            log(d, "批准访问申请", request.entity + " · 至 " + expires);
          }, "已授予受限访问（模拟）");
          if (ok) close();
        }}
      >
        <Field label="授权到期日">
          <input
            required
            type="date"
            min={today()}
            value={expires}
            onChange={(e) => E(e.target.value)}
          />
        </Field>
        <p className="muted">
          授权范围：维修与回收资料、使用期数据。到期后演示视角将不再显示相关资料。
        </p>
        <div className="modal-foot">
          <button type="button" className="outline" onClick={close}>
            取消
          </button>
          <button className="primary">批准授权</button>
        </div>
      </form>
    </Modal>
  );
}
function RuleEditor({ value, change, close }) {
  const [f, F] = useState(value);
  return (
    <Modal
      title={"配置字段 · " + f.zh}
      subtitle="仅改变原型校验适用性；公开与受限分类保持固定。"
      onClose={close}
    >
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          const ok = await change((d) => {
            d.rules[d.rules.findIndex((r) => r.code === f.code)] = f;
            log(d, "修改字段规则", f.code + " · " + f.required);
          }, "规则已更新；已发布快照使用原规则");
          if (ok) close();
        }}
      >
        <Field label="填写规则">
          <select
            value={f.required}
            onChange={(e) => F({ ...f, required: e.target.value })}
          >
            {["必填", "条件适用", "后续适用", "不适用"].map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </Field>
        <div className="condition-box">
          {categories.map((cat) => (
            <label key={cat}>
              <input
                type="checkbox"
                checked={f.categories.includes(cat)}
                onChange={(e) =>
                  F({
                    ...f,
                    categories: e.target.checked
                      ? [...f.categories, cat]
                      : f.categories.filter((c) => c !== cat),
                  })
                }
              />
              {cat}
            </label>
          ))}
        </div>
        <p className="muted">
          单位：{f.unit || "无"} · 条件：{f.condition || "按类别适用"}
          <br />
          来源：{f.source} · {f.ruleVersion}
        </p>
        <div className="modal-foot">
          <button type="button" className="outline" onClick={close}>
            取消
          </button>
          <button className="primary">保存规则</button>
        </div>
      </form>
    </Modal>
  );
}
function QRCodeDialog({ instance, close }) {
  const ref = useRef();
  const passportId = instance.passportId || instance.id;
  const url = location.origin + "/passport/" + passportId;
  return (
    <Modal title="电池护照二维码" subtitle={passportId} onClose={close}>
      <div className="qr-dialog" ref={ref}>
        <QRCodeCanvas value={url} size={220} marginSize={4} />
        <p>{url}</p>
      </div>
      <div className="inline-note">
        同一浏览器可读取本地新增数据。手机端只有固定种子数据；实际跨设备分享需部署服务并连接后端。
      </div>
      <div className="modal-foot">
        <button
          className="primary"
          onClick={() => {
            const a = document.createElement("a");
            a.href = ref.current.querySelector("canvas").toDataURL("image/png");
            a.download = (instance.serial || passportId) + ".png";
            a.click();
          }}
        >
          <Download size={16} />
          下载二维码
        </button>
      </div>
    </Modal>
  );
}

function PublicPassport(ctx) {
  const { db, passportId, navigate, setModal } = ctx;
  const [lang, L] = useState(() => {
      const requested =
        new URLSearchParams(location.search).get("lang") ||
        navigator.language.split("-")[0];
      return ["en", "de", "fr"].includes(requested) ? requested : "en";
    }),
    [role, R] = useState("公开"),
    [requestId, RI] = useState("");
  const en = lang === "en",
    t = (zh, english) => (en ? english : zh);
  const wanted = new URLSearchParams(location.search).get("version");
  const version = wanted
    ? db.versions.find(
        (v) => v.passportId === passportId && String(v.version) === wanted,
      )
    : latest(db, passportId);
  const voided = db.codeRecords.some(
    (code) => code.passportId === passportId && code.status === "作废",
  );
  const approved = db.requests.filter(
    (r) =>
      r.passportId === passportId &&
      r.status === "已批准" &&
      r.expires >= today(),
  );
  const valid = approved.find((r) => r.id === requestId);
  const authorized = role === "监管" || (role === "维修回收" && !!valid);
  const text = (object, key) =>
    en
      ? object[key + "En"] ||
        t("英文内容未填写", "English translation not provided")
      : object[key] || "—";
  if (voided)
    return (
      <div className="public-page">
        <div className="public-nav">
          <div className="brand">
            <div className="logo">
              <BatteryCharging />
            </div>
            <b>ZHONGQI PASSPORT</b>
          </div>
          <button className="outline" onClick={() => navigate("/admin/codes")}>
            <ArrowLeft size={15} />
            返回码管理
          </button>
        </div>
        <div className="public-demo">
          <AlertTriangle size={14} />
          演示数据 · 护照编号已作废
        </div>
        <div className="startup">
          <Ban size={38} />
          <h1>此护照编号已作废</h1>
          <p>该二维码已失效，编号不会重新分配。</p>
        </div>
      </div>
    );
  if (!version)
    return (
      <div className="public-page">
        <div className="public-nav">
          <div className="brand">
            <div className="logo">
              <BatteryCharging />
            </div>
            <b>ZHONGQI PASSPORT</b>
          </div>
          <button
            className="outline"
            onClick={() => navigate("/admin/passports")}
          >
            <ArrowLeft size={15} />
            返回后台
          </button>
        </div>
        <div className="startup">
          <FileText size={38} />
          <h1>护照尚未发布</h1>
          <p>该 ID 在当前浏览器没有可公开的护照版本。</p>
          <p>本地新增或修改的数据不会自动跨设备同步。</p>
          <button
            className="primary"
            onClick={() => navigate("/passport/BAT-ESS-000184")}
          >
            查看固定演示护照
          </button>
        </div>
      </div>
    );
  return (
    <PassportSurface
      version={version}
      db={db}
      navigate={navigate}
      setModal={setModal}
    />
  );
  const { model, instance, company } = version;
  const shownRules = version.rules.filter(
    (r) => applicable(r, model) && r.required !== "不适用",
  );
  const groups = [
    {
      title: t("身份概览", "Battery identity"),
      number: "01",
      keys: ["company.name", "model.name", "instance.serial", "instance.date"],
    },
    {
      title: t("技术参数", "Technical specifications"),
      number: "02",
      keys: [
        "model.chem",
        "model.energy",
        "model.capacity",
        "model.voltage",
        "model.weight",
      ],
    },
  ];
  function renderField(rule) {
    const [owner, key] = rule.code.split(".");
    const obj = { company, model, instance }[owner];
    let v =
      key === "name"
        ? text(obj, key)
        : key === "disassembly" || key === "composition"
          ? text(obj, key)
          : obj[key];
    if (v === undefined || v === "")
      v = t(
        rule.required === "后续适用" ? "后续适用 · 暂未提供" : "暂未提供",
        rule.required === "后续适用"
          ? "Future applicability · not provided"
          : "Not provided",
      );
    if (rule.access === "受限" && !authorized) v = t("受限", "Restricted");
    return (
      <div className="public-kv" key={rule.code}>
        <span>{en ? rule.en : rule.zh}</span>
        <strong>
          {String(v)}
          {obj[key] !== undefined && obj[key] !== "" && rule.unit
            ? " " + rule.unit
            : ""}
        </strong>
      </div>
    );
  }
  return (
    <div className="public-page">
      <div className="public-nav">
        <a
          className="brand"
          href="/admin/dashboard"
          onClick={(e) => {
            e.preventDefault();
            navigate("/admin/dashboard");
          }}
        >
          <div className="logo">
            <BatteryCharging size={24} />
          </div>
          <div>
            <b>
              ZHONGQI <span>PASSPORT</span>
            </b>
            <small>
              {t("中企 · 电池数字护照", "BATTERY DIGITAL PASSPORT")}
            </small>
          </div>
        </a>
        <div className="public-nav-actions">
          <select
            className="outline"
            aria-label="Passport language"
            value={lang}
            onChange={(e) => L(e.target.value)}
          >
            <option value="en">English</option>
            <option value="de">Deutsch</option>
            <option value="fr">Français</option>
          </select>
          <button className="outline" onClick={() => navigate("/admin/pages")}>
            <Languages size={15} />
            {en ? "中文" : "English"}
          </button>
          <button
            className="outline"
            onClick={() => navigate("/admin/passports")}
          >
            <ArrowLeft size={15} />
            {t("管理后台", "Admin")}
          </button>
        </div>
      </div>
      <div className="public-demo">
        <AlertTriangle size={14} />
        {t(
          "演示数据 · 虚构企业 · 访问身份仅为模拟，不代表认证或真实授权",
          "Demo data · Fictional company · Simulated identities, not certification or real authorization",
        )}
      </div>
      <div className="public-shell">
        <div className="public-breadcrumb">
          {t("电池护照", "Battery passport")} <ChevronRight size={12} />{" "}
          {passportId}
        </div>
        <div className="public-hero">
          <div className="public-hero-copy">
            <span className="public-eyebrow">
              <i />
              {t("已发布快照", "PUBLISHED SNAPSHOT")} · v{version.version}
            </span>
            <h1>{text(model, "name")}</h1>
            <p>
              {en ? typeEn[model.type] : model.type} <span> / </span>{" "}
              {model.chem} <span> / </span> {model.energy} kWh
            </p>
            <div className="hero-serial">
              <QrCode size={17} />
              {instance.serial}
            </div>
            <span className="public-company">{text(company, "name")}</span>
          </div>
          <div
            className="battery-illustration"
            role="img"
            aria-label="电池模块示意图"
          >
            <div className="battery-3d">
              <div className="batt-top" />
              <div className="batt-front">
                <div className="batt-stripes" />
                <span>ZHONGQI</span>
                <BatteryCharging size={35} />
                <small>
                  {model.chem} · {model.energy} kWh
                </small>
              </div>
              <div className="batt-side" />
            </div>
            <span className="illustration-caption">
              {t(
                "电池模块示意 · 非实物图片",
                "Illustration · not a product photograph",
              )}
            </span>
          </div>
        </div>
        <div className="public-meta">
          <span>
            <CheckCircle2 size={15} />
            {t("已发布", "Published")} v{version.version}
          </span>
          <span>
            <Clock3 size={15} />
            {t("更新时间", "Updated")} {fmt(version.publishedAt)}
          </span>
          <span>
            <Globe size={15} />
            {t("公开信息", "Public information")}
          </span>
          <strong>
            {en ? "Battery number" : "电池编号"} · {version.instance.serial}
          </strong>
          <button
            className="text-btn"
            onClick={() => setModal({ type: "qr", instance })}
          >
            <QrCode size={16} />
            {t("护照二维码", "Passport QR")}
          </button>
        </div>
        <div className="public-nav-actions" style={{ marginTop: 12 }}>
          <label>
            {en ? "Language" : "页面语言"}{" "}
            <select
              aria-label="Passport language"
              value={lang}
              onChange={(e) => L(e.target.value)}
            >
              <option value="en">English</option>
              <option value="de">Deutsch</option>
              <option value="fr">Français</option>
            </select>
          </label>
        </div>
        <div className="identity-simulator">
          <div>
            <ShieldCheck size={18} />
            <strong>{t("访问身份模拟", "Simulate viewer identity")}</strong>
            <small>
              {t(
                "当前信息按所选模拟角色展示",
                "Content follows the selected demo role",
              )}
            </small>
          </div>
          <select
            aria-label="访问身份模拟"
            value={role}
            onChange={(e) => R(e.target.value)}
          >
            <option value="公开">{t("公开用户", "Public viewer")}</option>
            <option value="维修回收">
              {t(
                "维修 / 回收方（需已批准申请）",
                "Repair / recycler (approved request required)",
              )}
            </option>
            <option value="监管">
              {t("监管视角（直接模拟）", "Regulator (simulation)")}
            </option>
          </select>
          {role === "维修回收" && (
            <select
              aria-label="选择已批准申请"
              value={requestId}
              onChange={(e) => RI(e.target.value)}
            >
              <option value="">
                {t("选择有效授权申请", "Select a valid approved request")}
              </option>
              {approved.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.entity} · {r.expires}
                </option>
              ))}
            </select>
          )}
        </div>
        <div className="public-content-grid">
          <div>
            {groups.map((g) => (
              <section className="public-section" key={g.number}>
                <div className="public-section-title">
                  <span>{g.number}</span>
                  <h2>{g.title}</h2>
                </div>
                <div className="public-field-grid">
                  {shownRules
                    .filter((r) => g.keys.includes(r.code))
                    .map(renderField)}
                  <div className="public-kv">
                    <span>
                      {g.number === "01"
                        ? t("护照标识", "Passport identifier")
                        : t("设计寿命", "Design life")}
                    </span>
                    <strong>
                      {g.number === "01" ? passportId : model.life || "—"}
                    </strong>
                  </div>
                </div>
              </section>
            ))}
            <section className="public-section">
              <div className="public-section-title">
                <span>03</span>
                <h2>{t("材料与可持续信息", "Materials & sustainability")}</h2>
                <Leaf size={19} />
              </div>
              <div className="public-kv">
                <span>{t("公开材料信息", "Public material information")}</span>
                <strong>{text(model, "materials")}</strong>
              </div>
              {shownRules
                .filter((r) =>
                  [
                    "model.carbon",
                    "model.recycled",
                    "model.diligence",
                  ].includes(r.code),
                )
                .map(renderField)}
              <div className="public-footnote">
                {t(
                  "条件与生效时间因类别而异。未提供数据不代表已符合或不符合要求。",
                  "Applicability and effective dates vary. Missing data is not a compliance conclusion.",
                )}
              </div>
            </section>
            <section className="public-section">
              <div className="public-section-title">
                <span>04</span>
                <h2>{t("文件资料", "Documents")}</h2>
              </div>
              {version.documents
                .filter((d) => d.access === "公开" || authorized)
                .map((d) => (
                  <button
                    className="public-document"
                    key={d.id}
                    onClick={() => downloadDocument(d)}
                  >
                    <FileText size={22} />
                    <span>
                      <strong>
                        {en ? d.nameEn || "English title not provided" : d.name}
                      </strong>
                      <small>
                        v{d.version} ·{" "}
                        {d.access === "公开"
                          ? t("公开", "Public")
                          : t(
                              "受限 · 已授权模拟",
                              "Restricted · simulated access",
                            )}
                      </small>
                    </span>
                    <Download size={17} />
                  </button>
                ))}
              {!authorized &&
                version.documents.some((d) => d.access === "受限") && (
                  <div className="public-footnote">
                    {t(
                      "另有受限资料，需授权访问。",
                      "Additional restricted documents require authorized access.",
                    )}
                  </div>
                )}
            </section>
            <section className="public-section">
              <div className="public-section-title">
                <span>05</span>
                <h2>{t("使用与生命周期", "Use & lifecycle")}</h2>
                <ShieldCheck size={18} />
              </div>
              {authorized ? (
                <>
                  <div className="public-field-grid">
                    {shownRules
                      .filter((r) => r.access === "受限")
                      .map(renderField)}
                  </div>
                  <h3>{t("生命周期记录", "Lifecycle events")}</h3>
                  {version.events.map((e) => (
                    <div className="event-row" key={e.id}>
                      <span className="dot" />
                      <div>
                        <strong>
                          {en ? statusEn[e.type] || e.type : e.type} · {e.date}
                        </strong>
                        <p>{text(e, "note")}</p>
                      </div>
                    </div>
                  ))}
                </>
              ) : (
                <div className="locked">
                  <ShieldCheck size={27} />
                  <h3>{t("受限信息，按授权开放", "Restricted information")}</h3>
                  <p>
                    {t(
                      "健康状态、循环次数、详细组成及拆解资料需以授权视角查看。",
                      "Health, cycles, detailed composition and disassembly require an authorized view.",
                    )}
                  </p>
                  <button
                    className="outline"
                    onClick={() =>
                      setModal({ type: "request", passportId, en })
                    }
                  >
                    {t("申请访问", "Request access")} <ArrowUpRight size={14} />
                  </button>
                </div>
              )}
            </section>
          </div>
          <div className="public-side">
            <section className="public-section">
              <div className="public-side-icon">
                <QrCode size={26} />
              </div>
              <h3>{t("一块电池，一个身份", "One battery. One identity.")}</h3>
              <p>
                {t(
                  "这份护照对应具体电池实例，信息以发布版本为准。",
                  "This passport identifies one battery instance and shows a published snapshot.",
                )}
              </p>
              <QRCodeSVG
                value={location.origin + "/passport/" + passportId}
                size={150}
                marginSize={2}
              />
              <button
                className="outline"
                onClick={() => setModal({ type: "qr", instance })}
              >
                <Download size={14} />
                {t("下载二维码", "Download QR")}
              </button>
            </section>
            <section className="public-section side-facts">
              <h3>{t("追溯信息", "Traceability")}</h3>
              <span>{t("生命周期", "Lifecycle")}</span>
              <strong>{en ? statusEn[instance.state] : instance.state}</strong>
              <span>{t("规则版本", "Rule version")}</span>
              <strong>{version.ruleVersion}</strong>
              <span>{t("Registry 登记", "Registry registration")}</span>
              <strong>
                {t("本地模拟 · 未登记", "Local simulation · not registered")}
              </strong>
              {instance.previousId && (
                <>
                  <span>{t("前序护照", "Previous passport")}</span>
                  <button
                    className="text-btn"
                    onClick={() => navigate("/passport/" + instance.previousId)}
                  >
                    {instance.previousId}
                    <ArrowUpRight size={14} />
                  </button>
                </>
              )}
            </section>
            <div className="public-law">
              <ShieldCheck size={20} />
              <p>
                {t(
                  "按欧盟电池法规信息结构构建。演示字段不是完整合规清单。",
                  "Structured around EU battery regulation. Demo fields are not a complete compliance checklist.",
                )}
              </p>
              <a href={links.law} target="_blank" rel="noreferrer">
                EU 2023/1542 <ArrowUpRight size={13} />
              </a>
            </div>
          </div>
        </div>
        <footer className="public-footer">
          <strong>ZHONGQI PASSPORT</strong>
          <span>
            {t(
              "虚构演示数据 · 本地浏览器存储 · 不跨设备同步",
              "Fictional demo data · Local browser storage · No cross-device sync",
            )}
          </span>
          <small>
            {t(
              "公开 / 受限权限均为客户端模拟",
              "All access controls are simulated in the client",
            )}
          </small>
        </footer>
      </div>
    </div>
  );
}
function RequestForm({ passportId, en, change, close }) {
  const [f, F] = useState({ entity: "", email: "", purpose: "维修诊断" });
  const t = (zh, english) => (en ? english : zh);
  return (
    <Modal
      title={t("申请受限资料访问", "Request restricted access")}
      subtitle={passportId}
      onClose={close}
    >
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          const ok = await change(
            (d) => {
              d.requests.unshift({
                ...f,
                id: id("REQ"),
                passportId,
                status: "待处理",
                expires: "",
                created: new Date().toISOString(),
              });
              log(d, "提交访问申请", f.entity + " · " + passportId);
            },
            t(
              "申请已提交，请在后台访问管理中审批",
              "Request submitted. Approve it in admin access management.",
            ),
          );
          if (ok) close();
        }}
      >
        <Field required label={t("申请机构", "Organization")}>
          <input
            required
            value={f.entity}
            onChange={(e) => F({ ...f, entity: e.target.value })}
          />
        </Field>
        <Field required label={t("联系邮箱", "Email")}>
          <input
            required
            type="email"
            value={f.email}
            onChange={(e) => F({ ...f, email: e.target.value })}
          />
        </Field>
        <Field label={t("访问用途", "Purpose")}>
          <select
            value={f.purpose}
            onChange={(e) => F({ ...f, purpose: e.target.value })}
          >
            <option value="维修诊断">
              {t("维修诊断", "Repair & diagnostics")}
            </option>
            <option value="回收评估">
              {t("回收评估", "Recycling assessment")}
            </option>
          </select>
        </Field>
        <p className="muted">
          {t(
            "仅本地模拟申请。此操作不发送邮件，也不验证机构身份。",
            "Local simulation only. No email is sent and identity is not verified.",
          )}
        </p>
        <div className="modal-foot">
          <button type="button" className="outline" onClick={close}>
            {t("取消", "Cancel")}
          </button>
          <button className="primary">{t("提交申请", "Submit request")}</button>
        </div>
      </form>
    </Modal>
  );
}
