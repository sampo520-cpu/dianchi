import React, { useState, useRef, useEffect } from "react";
import { LockKeyhole, Fingerprint, Gauge, Leaf, Files, History, Factory, Battery, Recycle, SlidersHorizontal } from 'lucide-react';
import { SafetyContent, AdditionalPassportSections } from './passport-sections';
import { BatteryMarkings } from './battery-symbols.jsx';
import {PassportLocale,PassportText} from './passport-i18n';
import {passportLanguages,passportResources} from './passport-locales.js';
import { passportFieldValue, fieldMaintenanceLevel } from "./passport-values";
import { templateOf } from './templates.js';
import { validGrant } from './access.js';
import { sanitizeRichHtml } from './rich-content.js';
import { safePassportTheme } from './passport-themes.js';
import { Eye, Save, ArrowUp, ArrowDown, Download } from "lucide-react";
import { snapshot, latest, applicable, log } from "./data";
import { effectiveDb } from "./workflow";
import "./page-editor.css";
import './passport-notices.css';
import { downloadPassportPdf } from "./downloads";

const languages = passportLanguages;
const sectionIcons = [Fingerprint, Gauge, Leaf, Files, History];
const labels = {
  en: [
    "Battery identity",
    "Technical specifications",
    "Materials & sustainability",
    "Documents",
    "Lifecycle",
  ],
  de: [
    "Batterieidentität",
    "Technische Daten",
    "Materialien & Nachhaltigkeit",
    "Dokumente",
    "Lebenszyklus",
  ],
  fr: [
    "Identité de la batterie",
    "Caractéristiques techniques",
    "Matériaux et durabilité",
    "Documents",
    "Cycle de vie",
  ],
};
const titles = {};
for(const code of Object.keys(languages)) {
  labels[code] ||= labels.en.map(text=>passportResources[code].translation[text]||text);
  titles[code] = passportResources[code].translation['Battery information'] || 'Battery information';
}
const defaults = () => ({
  source: "en",
  enabled: ["en"],
  order: [0, 1, 2, 3, 4],
  hidden: [],
  translations: { en: { status: "待审核", values: {} } },
  revision: 1,
});
const group = (code) =>
  code.startsWith("company.") ||
  ["model.name", "instance.serial", "instance.date"].includes(code)
    ? 0
    : ["chem", "energy", "capacity", "voltage", "weight"].includes(
          code.split(".")[1],
        )
      ? 1
      : code.startsWith("instance.")
        ? 4
        : 2;
export function PassportSurface({
  version,
  db,
  navigate,
  setModal,
  edit = false,
  onSelect,
  language,
  view = "公开",
  previewDevice = false,
  selectedCode,
  maintenanceLevel = "product",
}) {
  const adminHints = previewDevice || edit;
  const levelNames = { product: "产品资料", batch: "批次资料", instance: "单码资料" };
  const scopeHint = (code) => {
    const target = fieldMaintenanceLevel(code);
    if (!adminHints || target === maintenanceLevel) return null;
    const upstream = ["product", "batch", "instance"].indexOf(target) < ["product", "batch", "instance"].indexOf(maintenanceLevel);
    return <em className="ps-scope-hint">{upstream ? "沿用" : "下钻维护"} · {levelNames[target]}</em>;
  };
  const page = version.page || defaults();
  const activePage = (edit ? version.pageDraft : page) || page;
  const available = (version.model.enabledLanguages || ['en']).filter(code => languages[code]);
  if (!available.includes('en')) available.unshift('en');
  const initial = () => {
    const requested = new URLSearchParams(location.search).get("lang") || version.model.defaultLanguage || 'en';
    const normalized=requested.split('-')[0];
    return available.includes(normalized) ? normalized : available.includes('en') ? 'en' : available[0];
  };
  const [chosen, C] = useState(initial),
    [role, R] = useState(view),
    [request, Q] = useState(""),
    [loginOpen, LO] = useState(false);
  const requested = language || chosen,
    lang = edit ? requested : available.includes(requested) ? requested : "en";
  const authorized =
    role === "监管" ||
    (role === "维修回收" &&
      db.requests.some(
        (r) =>
          r.id === request && validGrant(r, version.passportId),
      ));
  const value = (r) => {
    let value = passportFieldValue(version, {}, 'zh', r.code);
    return value == null ? "" : value;
  };
  const fieldName = (rule) => {
    const configured = db.rules?.find(current => current.code === rule.code) || rule;
    return configured.labels?.[lang] || rule.labels?.[lang] || (lang === 'zh' ? rule.zh : rule.en);
  };
  const allRules = version.rules;
  const rules = allRules.filter(r => r.access !== '受限' && String(value(r)).trim() !== '');
  const restrictedRules = allRules.filter(r => r.access === '受限' && String(value(r)).trim() !== '');
  const restrictedDocuments = version.documents.filter(d => d.access === '受限' && (d.nameEn || d.name));
  const enabledSections = version.model.displaySections || [0,1,2,3,4];
  return (
    <PassportLocale.Provider value={lang}><PassportText><div className="passport-surface" lang={lang} data-theme={safePassportTheme(version.model.passportTheme)}>
      {!previewDevice && (
        <div className="ps-toolbar">
          <b>BATTERY INFORMATIONS</b>
          {available.length > 1 && <select
            aria-label="Passport language"
            value={lang}
            onChange={(e) => {
              C(e.target.value);
              const url=new URL(location.href);url.searchParams.set('lang',e.target.value);history.replaceState(history.state,'',url);
            }}
          >
            {available.map((l) => (
              <option key={l} value={l}>
                {languages[l]}
              </option>
            ))}
          </select>}
          {navigate && (
            <button onClick={() => navigate("/admin/pages")}>Admin</button>
          )}
        </div>
      )}
      <header className="ps-identity">
        <small>{titles[lang]}</small>
        <h1>{value({ code: 'model.name' })}</h1>
        <strong>{version.instance.serial}</strong>
        <p>{version.model.chem} · {version.model.energy} kWh</p>
      </header>
      {version.productionBatch && enabledSections.includes(0) && [version.productionBatch.name,version.productionBatch.factory].some(x=>String(x||'').trim()) && (
        <section className="ps-section">
          <h2>
            <Factory aria-hidden="true"/>
            Production batch
          </h2>
          <div className="public-kv">
            <span>Batch{adminHints && <small className="ps-zh-label">生产批次号</small>}{scopeHint("batch.name")}</span>
            <strong>{version.productionBatch.name}</strong>
          </div>
          <div className="public-kv">
            <span>Factory{adminHints && <small className="ps-zh-label">生产工厂</small>}{scopeHint("batch.factory")}</span>
            <strong translate="no">{version.productionBatch.factory || "—"}</strong>
          </div>
        </section>
      )}
      {activePage.order.map((n) => {
        if (activePage.hidden.includes(n) || !enabledSections.includes(n)) return null;
        const sectionRules = rules.filter(r => group(r.code) === n && String(value(r)).trim() !== '');
        const publicDocuments = version.documents.filter(d => d.access !== '受限' && (d.nameEn || d.name));
        const sectionEvents = n === 4 ? version.events.filter(e=>String(e.noteEn||e.note||e.description||'').trim()) : [];
        if (n === 3 && !publicDocuments.length) return null;
        if (n !== 3 && !sectionRules.length && !sectionEvents.length) return null;
        const SectionIcon = sectionIcons[n];
        return (
          <section className="ps-section" key={n}>
            <h2 onClick={() => edit && onSelect({ kind: "title", group: n })}>
              <SectionIcon aria-hidden="true"/>
              {version.model.sectionLabels?.[lang]?.[n] || activePage?.translations?.[lang]?.values["title." + n] ||
                labels[lang][n]}
              {adminHints && <small className="ps-zh-label">{["身份信息", "技术参数", "材料与可持续信息", "文件资料", "使用与生命周期"][n]}</small>}
            </h2>
            {n === 3
              ? publicDocuments
                  .map((d) => (
                    <div className="public-kv" key={d.id}>
                      <span>{d.nameEn || d.name}</span>
                      {d.dataUrl ? (
                        <a download={d.name} href={d.dataUrl}>
                          Download
                        </a>
                      ) : (
                        <span>File not supplied</span>
                      )}
                    </div>
                  ))
              : rules
                  .filter((r) => group(r.code) === n && String(value(r)).trim() !== '')
                  .map((r) => (
                    <div
                      key={r.code}
                      data-field={r.code}
                      tabIndex={edit ? 0 : undefined}
                      role={edit ? "button" : undefined}
                      onKeyDown={(e) => {
                        if (edit && (e.key === "Enter" || e.key === " ")) {
                          e.preventDefault();
                          onSelect({ kind: "field", rule: r });
                        }
                      }}
                      className={
                        "public-kv " +
                        (edit ? "ps-editable " : "") +
                        (edit && selectedCode === r.code ? "ps-selected" : "")
                      }
                      onClick={() =>
                        edit && onSelect({ kind: "field", rule: r })
                      }
                    >
                      <span>
                        <span translate="no">{fieldName(r)}</span>
                        {adminHints && <small className="ps-zh-label">{r.zh}</small>}
                        {scopeHint(r.code)}
                      </span>
                      <strong translate={r.code==='instance.state'?undefined:'no'}>
                        {value(r) === undefined || value(r) === ""
                          ? "—"
                          : String(value(r))}
                        {r.unit ? " " + r.unit : ""}
                      </strong>
                    </div>
                  ))}
            {sectionEvents.map(e=><p translate="no" key={e.id}>{e.date} · {e.noteEn || e.note || e.description}</p>)}
          </section>
        );
      })}
      {enabledSections.includes(2) && (version.model.productOverviewEn?.trim() || version.model.characteristics?.some(r=>[r.name,r.value,r.condition,r.note].some(x=>String(x||'').trim())) || version.model.safetyEn?.trim() || version.model.cautionEn?.trim() || version.model.wasteEn?.trim() || version.model.extinguishingEn?.trim() || version.model.markings?.length) && <section className="ps-product-details">
        {version.model.productOverviewEn && <div className="ps-rich-block"><h2><Battery aria-hidden="true"/>Product overview{adminHints && <small className="ps-zh-label">产品概览</small>}</h2><div dangerouslySetInnerHTML={{ __html: sanitizeRichHtml(version.model.productOverviewEn) }} /></div>}
        {version.model.characteristics?.length > 0 && <div className="ps-rich-block"><h2>Battery characteristics{adminHints && <small className="ps-zh-label">性能测试数据及测试条件</small>}</h2><div className="ps-spec-table-wrap" style={{width:'100%',overflowX:'auto'}}><table className="ps-spec-table" style={{width:'100%',minWidth:560,tableLayout:'fixed',borderCollapse:'collapse'}}><colgroup><col style={{width:'22%'}}/><col style={{width:'22%'}}/><col style={{width:'56%'}}/></colgroup><thead><tr><th style={{padding:12,textAlign:'left',background:'#f5f8fc',borderBottom:'1px solid #e3eaf0'}}>Test item</th><th style={{padding:12,textAlign:'left',background:'#f5f8fc',borderBottom:'1px solid #e3eaf0'}}>Result</th><th style={{padding:12,textAlign:'left',background:'#f5f8fc',borderBottom:'1px solid #e3eaf0'}}>Test conditions</th></tr></thead><tbody>{version.model.characteristics.map(r=><tr key={r.id}><th style={{padding:12,textAlign:'left',verticalAlign:'top',borderBottom:'1px solid #e3eaf0',overflowWrap:'anywhere'}}>{r.name}</th><td style={{padding:12,verticalAlign:'top',borderBottom:'1px solid #e3eaf0',overflowWrap:'anywhere'}}>{r.value} {r.unit}</td><td style={{padding:12,verticalAlign:'top',borderBottom:'1px solid #e3eaf0',overflowWrap:'anywhere'}}>{r.condition}{r.note && <small style={{display:'block',marginTop:5,color:'#75849a'}}>{r.note}</small>}</td></tr>)}</tbody></table></div></div>}
        {(version.model.safetyEn || version.model.cautionEn || version.model.extinguishingEn) && <SafetyContent model={version.model} adminHints={adminHints}/>}
        <BatteryMarkings model={version.model} adminHints={adminHints} documents={version.documents}/>
        {version.model.wasteEn && <div className="ps-rich-block"><h2><Recycle aria-hidden="true"/>End-of-life information{adminHints && <small className="ps-zh-label">废电池处置与回收</small>}</h2><div dangerouslySetInnerHTML={{__html:sanitizeRichHtml(version.model.wasteEn)}}/></div>}
      </section>}
      {enabledSections.includes(2) && <AdditionalPassportSections model={version.model} adminHints={adminHints}/>}
      {enabledSections.includes(2) && !!version.model.customFields?.length && version.model.customFields.some(f=>String((f.level === 'product' ? version.model.customValues : f.level === 'batch' ? version.productionBatch?.customValues : version.instance.customValues)?.[f.id] ?? '').trim() !== '') && <section className="ps-section">
        <h2><SlidersHorizontal aria-hidden="true"/>Customer information{adminHints && <small className="ps-zh-label">客户扩展资料</small>}</h2>
        {version.model.customFields.filter(f=>String((f.level === 'product' ? version.model.customValues : f.level === 'batch' ? version.productionBatch?.customValues : version.instance.customValues)?.[f.id] ?? '').trim() !== '').map(f => {
          const values = f.level === 'product' ? version.model.customValues : f.level === 'batch' ? version.productionBatch?.customValues : version.instance.customValues;
          return <div className="public-kv" key={f.id}><span>{f.labels?.[lang] || f.label}{scopeHint(f.level === 'product' ? 'model.custom' : f.level === 'batch' ? 'batch.custom' : 'instance.custom')}</span><strong>{values?.[f.id]}</strong></div>;
        })}
      </section>}
      {(restrictedRules.length > 0 || restrictedDocuments.length > 0 || version.events.some(e=>String(e.noteEn||e.note||e.description||'').trim())) && <section className="ps-restricted" aria-label="受限资料区">
        <h2><LockKeyhole size={19} />Restricted information{adminHints && <small className="ps-zh-label">受限资料区</small>}</h2>
        <p>{authorized ? 'Viewing access' : 'Select a role and an active grant'}</p>
        <div className="ps-access">
          <button className="outline" onClick={() => LO(!loginOpen)}>{authorized ? 'Switch viewing role' : 'Choose viewing role'}</button>
          {(loginOpen || previewDevice || edit) && <>
            <label>Viewing role<select aria-label="Viewing role" value={role} onChange={e => { R(e.target.value); Q(''); }}><option value="公开">Public</option><option value="维修回收">Repair and recycling</option><option value="监管">Regulator</option></select></label>
            {role === '维修回收' && <select aria-label="Approved request" value={request} onChange={e => Q(e.target.value)}><option value="">Select approved request</option>{db.requests.filter(r => validGrant(r, version.passportId)).map(r => <option translate="no" key={r.id} value={r.id}>{r.entity} · {r.expires}</option>)}</select>}
            {role !== '公开' && <button className="outline" onClick={() => { R('公开'); Q(''); LO(false); }}>Sign out</button>}
          </>}
          {setModal && <button className="outline" onClick={() => setModal({ type: 'request', passportId: version.passportId, en: lang !== 'zh' })}>Request access</button>}
          {!previewDevice && navigate && <button className="outline" onClick={() => navigate('/admin/requests')}>Access management</button>}
        </div>
        <small>Local role preview; authentication is not connected</small>
        {role === '维修回收' && !authorized && <p>Select an active grant for this passport.</p>}
        {authorized && <>
          {restrictedRules.map(r => <div key={r.code} data-field={r.code} className={'public-kv ' + (edit ? 'ps-editable ' : '') + (edit && selectedCode === r.code ? 'ps-selected' : '')} role={edit ? 'button' : undefined} tabIndex={edit ? 0 : undefined} onClick={() => edit && onSelect({ kind: 'field', rule: r })} onKeyDown={e => { if (edit && ['Enter', ' '].includes(e.key)) { e.preventDefault(); onSelect({ kind: 'field', rule: r }); } }}><span>{fieldName(r)}{adminHints && <small className="ps-zh-label">{r.zh}</small>}{scopeHint(r.code)}</span><strong>{String(value(r))}{r.unit ? ' ' + r.unit : ''}</strong></div>)}
          {restrictedDocuments.length > 0 && <h3>Restricted documents{adminHints && <small className="ps-zh-label">受限附件</small>}</h3>}
          {restrictedDocuments.map(d => <div className="public-kv" key={d.id}><span>{d.nameEn || d.name}</span>{d.dataUrl ? <a download={d.name} href={d.dataUrl}>Download</a> : <span>File not supplied</span>}</div>)}
          {version.events.some(e=>String(e.noteEn||e.note||e.description||'').trim()) && <h3>Lifecycle records{adminHints && <small className="ps-zh-label">使用与维修记录</small>}</h3>}
          {version.events.filter(e=>String(e.noteEn||e.note||e.description||'').trim()).map(e => <p translate="no" key={e.id}>{e.date} · {e.noteEn || e.note || e.description}</p>)}
        </>}
      </section>}
      <footer>{version.publishedAt && new Intl.DateTimeFormat(lang==='zh'?'zh-CN':lang,{dateStyle:'medium',timeStyle:'short'}).format(new Date(version.publishedAt))}</footer>
    </div></PassportText></PassportLocale.Provider>
  );
}
export function PageEditor({
  db,
  change,
  notify,
  navigate,
  initialModelId,
  simple = false,
  setModal,
}) {
  const [modelId, M] = useState(initialModelId || db.models.find(m=>!m.demoArchived)?.id),
    [instanceId, I] = useState(""),
    [language, L] = useState("en"),
    [mode, V] = useState("编辑草稿"),
    [width, W] = useState("390"),
    [selected, S] = useState(null),
    [draft, D] = useState(null),
    [entry, E] = useState("");
  const inspector = useRef(null),
    previewRef = useRef(null);
  const [confirmSave, CS] = useState(false),
    [issues, ISS] = useState([]);
  const model = db.models.find((m) => m.id === modelId),
    page = draft || structuredClone(db.pageDrafts?.[modelId] || defaults()),
    instances = db.instances.filter((i) => i.modelId === modelId),
    instance = simple
      ? { id: "PREVIEW", modelId, serial: "EXAMPLE-000001", date: "2026-01-01" }
      : instances.find((i) => i.id === instanceId) ||
        instances[0] ||
        (simple
          ? {
              id: "PREVIEW",
              modelId,
              serial: "PREVIEW-000001",
              date: new Date().toISOString().slice(0, 10),
            }
          : null),
    publishedInstances = instances.filter((i) => latest(db, i.id));
  const update = (patch) => D({ ...page, ...patch });
  const v = instance
    ? snapshot(
        {
          ...(simple ? db : effectiveDb(db, instance)),
          pageDrafts: { ...db.pageDrafts, [modelId]: page },
        },
        instance,
        (latest(db, instance.id)?.version || 0) + 1,
      )
    : null;
  const published = instance && latest(db, instance.id);
  const shown = mode === "已发布页面" ? published : v;
  const material = db.materialVersions.find(
    (x) => x.id === instance?.materialId,
  );
  const selectField = (s) => {
    S(s);
    E(
      s.rule
        ? passportFieldValue(v, page, language, s.rule.code)
        : page.translations[language]?.values["title." + s.group] || labels[language][s.group],
    );
    requestAnimationFrame(() =>
      inspector.current?.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      }),
    );
  };
  useEffect(() => {
    if (selected?.rule) E(passportFieldValue(v, page, language, selected.rule.code));
    else if (selected?.kind === "title") E(page.translations[language]?.values["title." + selected.group] || labels[language][selected.group]);
  }, [language]);
  const focusIssue = (r) => {
    V("编辑草稿");
    selectField({ kind: "field", rule: r });
    requestAnimationFrame(() =>
      Array.from(previewRef.current?.querySelectorAll("[data-field]") || [])
        .find((el) => el.dataset.field === r.code)
        ?.scrollIntoView({ behavior: "smooth", block: "center" }),
    );
  };
  const save = () =>
    change(
      (d) => {
        d.pageDrafts[modelId] = page;
        if (simple) {
          d.pageDrafts[modelId].translations.en ||= { values: {} };
          d.pageDrafts[modelId].translations.en.status = "已审核";
        }
        if (instance && instance.id !== "PREVIEW")
          d.instances.find((i) => i.id === instance.id).status = "草稿";
        log(d, "保存护照页面草稿", model.name);
      },
      simple
        ? "页面已保存，资料完整的护照已同步更新"
        : "页面草稿已保存；发布电池时才对外生效",
    ).then((ok) => {
      if (ok) CS(false);
    });
  return (
    <>
      <div className="page-title">
        <div>
          <h1>{simple ? "扫码页面与资料" : "护照页面"}</h1>
          <p>{model.name}</p>
        </div>
        <div className="title-actions">
          <button
            className="outline"
            disabled={mode !== "已发布页面" || !shown}
            onClick={async () => {
              try {
                await downloadPassportPdf(
                  document.querySelector(".pe-preview .passport-surface"),
                  instance.serial,
                );
              } catch (e) {
                notify(e.message);
              }
            }}
          >
            <Download size={16} />
            下载护照 PDF
          </button>
          <button
            className="primary"
            disabled={mode === "已发布页面"}
            onClick={() => CS(true)}
          >
            <Save size={16} />
            {simple ? "保存并更新" : "保存草稿"}
          </button>
        </div>
      </div>
      <div className="pe-scope">
        <strong>
          {simple
            ? "产品扫码资料 · 编号、日期为示例占位"
            : mode === "已发布页面"
              ? "已发布快照 · 只读"
              : "型号页面草稿"}
        </strong>
        <span>
          适用型号 {model.name} · {instances.length} 块电池 ·{" "}
          {publishedInstances.length} 份已有发布版本
        </span>
        <span>
          {simple
            ? "保存后自动更新本产品护照，无需审核"
            : `共享资料 ${material ? "v" + material.version : "未固定版本"} · 修改经重新发布后对外生效`}
        </span>
      </div>
      {confirmSave && (
        <div className="pe-save-review" role="dialog" aria-label="确认保存范围">
          <h3>{simple ? "确认更新范围" : "确认保存页面草稿"}</h3>
          {simple && (
            <p>
              关联生产批次：
              {
                db.productionBatches.filter((b) => b.modelId === modelId).length
              }{" "}
              个。只更新产品共享资料，批次日期、工厂、已生成编号及二维码链接不变。
            </p>
          )}
          <p>
            本型号共 {instances.length}{" "}
            {simple
              ? "块电池将同步采用此配置；二维码链接不变，系统自动保留修改历史。"
              : "块电池将可在下次发布时采用此配置；已有公开快照保持原样。"}
          </p>
          <p>
            栏目顺序：{page.order.map((n) => labels.en[n]).join(" → ")}
            ；启用语言：{page.enabled.join(" / ")}。
          </p>
          <button className="outline" onClick={() => CS(false)}>
            继续编辑
          </button>
          <button className="primary" onClick={save}>
            {simple ? "确认保存并更新" : "确认保存草稿"}
          </button>
        </div>
      )}
      <div className="pe-controls">
        {!simple && (
          <select
            aria-label="编辑型号"
            value={modelId}
            onChange={(e) => {
              M(e.target.value);
              D(null);
              I("");
              S(null);
            }}
          >
            {db.models.filter(m=>!m.demoArchived).map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </select>
        )}
        {!simple && (
          <select
            aria-label="预览电池"
            value={instance?.id || ""}
            onChange={(e) => I(e.target.value)}
          >
            {(mode === "已发布页面" ? publishedInstances : instances).map(
              (i) => (
                <option key={i.id} value={i.id}>
                  {i.serial}
                </option>
              ),
            )}
          </select>
        )}
        <select
          aria-label="编辑语言"
          value={language}
          onChange={(e) => L(e.target.value)}
        >
          {(model.enabledLanguages || ['en']).map(k => (
            <option key={k} value={k}>
              {languages[k]}
            </option>
          ))}
        </select>
        <select
          aria-label="查看模式"
          value={mode}
          onChange={(e) => {
            V(e.target.value);
            if (e.target.value === "已发布页面" && publishedInstances.length)
              I(publishedInstances[0].id);
          }}
        >
          {(simple
            ? ["编辑草稿", "扫码效果"]
            : ["编辑草稿", "扫码效果", "已发布页面"]
          ).map((t) => (
            <option key={t} value={t}>
              {simple && t === "编辑草稿" ? "编辑资料" : t}
            </option>
          ))}
        </select>
        <select
          aria-label="预览尺寸"
          value={width}
          onChange={(e) => W(e.target.value)}
        >
          <option value="390">手机 390px</option>
          <option value="760">平板 760px</option>
          <option value="1100">电脑 1100px</option>
        </select>
      </div>
      <div className="pe-layout">
        <div className="pe-left">
          <h3>{mode === "已发布页面" ? "已发布页面栏目" : "页面栏目"}</h3>
          <fieldset disabled={mode === "已发布页面"} className="pe-settings">
            {page.order.map((n, pos) => (
              <div className="pe-section" key={n}>
                <span>{labels.en[n]} · {(model.displaySections || [0,1,2,3,4]).includes(n) ? '产品开启' : '产品关闭'}</span>
                <button
                  title="上移"
                  disabled={!pos}
                  onClick={() => {
                    const a = [...page.order];
                    [a[pos - 1], a[pos]] = [a[pos], a[pos - 1]];
                    update({ order: a });
                  }}
                >
                  <ArrowUp size={14} />
                </button>
                <button
                  title="下移"
                  disabled={pos === page.order.length - 1}
                  onClick={() => {
                    const a = [...page.order];
                    [a[pos], a[pos + 1]] = [a[pos + 1], a[pos]];
                    update({ order: a });
                  }}
                >
                  <ArrowDown size={14} />
                </button>
              </div>
            ))}
            <h3>产品展示配置</h3>
            <p>开放语言和分区显隐在产品资料中设置，字段值与图文内容保留原文。</p>
          </fieldset>
        </div>
        <div className="pe-preview" ref={previewRef}>
          <div style={{ width: Number(width), maxWidth: "100%" }}>
            {shown ? (
              <PassportSurface
                key={modelId + language + mode}
                version={
                  mode === "编辑草稿" ? { ...shown, pageDraft: page } : shown
                }
                db={db}
                language={language}
                edit={mode === "编辑草稿"}
                previewDevice
                selectedCode={selected?.rule?.code}
                navigate={navigate}
                onSelect={selectField}
              />
            ) : (
              <p>此型号暂无电池或发布版本，请先生产建档。</p>
            )}
          </div>
        </div>
        <div className="pe-right" ref={inspector}>
          <h3>内容与来源</h3>
          <fieldset disabled={mode === "已发布页面"} className="pe-settings">
            {selected?.kind === "field" ? (
              <>
                <b>{selected.rule.zh}</b>
                <p>
                  来源：
                  {
                    {
                      company: "企业共享",
                      model: "型号共享",
                      instance: "电池单体",
                    }[selected.rule.level]
                  }{" "}
                  · {selected.rule.access} · {selected.rule.required}
                </p>
                <p>
                  {simple
                    ? "资料来源：当前产品资料。"
                    : `源资料版本：${material ? "v" + material.version : "实时草稿"}。`}
                  {selected.rule.level === "instance"
                    ? "源数据属于当前电池。"
                    : "源数据由同型号电池共享。"}
                  文字校订仅作用于本型号页面，不修改原始检测结果。
                </p>
                <p className="pe-evidence">
                  法规出处：{selected.rule.source}
                  。法规限值、企业声明和检测结果分别维护；页面文字不构成自动合规结论。
                </p>
                {simple ? (
                  <>
                  <label className="form-field">
                    当前源资料
                    <textarea value={entry} readOnly />
                  </label>
                  <button
                    className="outline"
                    onClick={() =>
                      setModal({
                        type:
                          selected.rule.level === "instance"
                            ? "instance"
                            : "model",
                        value:
                          selected.rule.level === "instance" ? instance : model,
                      })
                    }
                  >
                    编辑源资料
                  </button>
                  </>
                ) : (
                  <a
                    href={
                      selected.rule.level === "instance"
                        ? "/admin/ledger"
                        : "/admin/library"
                    }
                  >
                    维护源资料 →
                  </a>
                )}
              </>
            ) : selected?.kind === "title" ? (
              <>
                <label className="form-field">
                  栏目名称 · {languages[language]}
                  <input value={entry} onChange={(e) => E(e.target.value)} />
                </label>
                <button
                  className="outline"
                  onClick={() =>
                    update({
                      translations: {
                        ...page.translations,
                        [language]: {
                          status: "待审核",
                          values: {
                            ...page.translations[language]?.values,
                            ["title." + selected.group]: entry,
                          },
                        },
                      },
                    })
                  }
                >
                  保存标题
                </button>
              </>
            ) : (
              <p>选择预览中的字段查看来源。</p>
            )}
            <hr />
            <p>语言切换仅更换字段名称及分区名称，资料内容统一在源资料中维护，无需译文审核。</p>
            {issues.length > 0 && (
              <div className="pe-issues">
                <strong>{issues.length} 项缺少译文</strong>
                {issues.map((r) => (
                  <button
                    key={r.code}
                    className="text-btn"
                    onClick={() => focusIssue(r)}
                  >
                    {r.zh} →
                  </button>
                ))}
              </div>
            )}
            <p>
              {simple
                ? "保存后同步更新本产品下资料完整的护照。"
                : "发布范围：仅在下次发布时纳入所选电池快照。"}
            </p>
          </fieldset>
        </div>
      </div>
    </>
  );
}
