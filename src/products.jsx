import React, { useState } from "react";
import { Plus, Download, Eye, Pencil, QrCode, ArrowLeft, Ban } from "lucide-react";
import { codeStatus } from './code-status.js';
import { PageEditor, PassportSurface } from "./page-editor";
import ProductForm from "./product-form";
import ApplicableMaterials from "./applicable-materials";
import { matchingEvidence, evidenceIssues } from "./field-map";
import { check, id, log, latest, makePassportId, snapshot } from "./data";
import { createProduction, saveMaterialVersion } from "./workflow";
import { downloadQrZip } from "./downloads";
import "./workflow.css";
import { templates, euScope } from './templates.js';
import { CustomValues } from './custom-fields';
import { categories } from './data';
import { demoWorkspaceDb } from './demo-showcase.js';

export default function Products(ctx) {
  ctx={...ctx,db:demoWorkspaceDb(ctx.db)};
  const { db, change, setModal, navigate, notify } = ctx;
  const batchWorkspace = ctx.batchWorkspace;
  const [dashboardFilter] = useState(() => {
    try { return JSON.parse(sessionStorage.getItem('battery-dashboard-filter') || '{}'); } catch { return {}; }
  });
  const [formOpen, FO] = useState(() => {
    const open = sessionStorage.getItem('open-create-product') === '1';
    sessionStorage.removeItem('open-create-product');
    return open;
  }),
    [editingModel, EM] = useState(null),
    [single, SI] = useState("");
  const [requestedProduct] = useState(() => {
    if (!batchWorkspace) return "";
    const p = sessionStorage.getItem("new-batch-product") || "";
    sessionStorage.removeItem("new-batch-product");
    return p;
  });
  const [product, P] = useState(requestedProduct),
    [tab, T] = useState(batchWorkspace ? "二维码" : dashboardFilter.status ? "二维码" : "产品资料"),
    [create, C] = useState(!!requestedProduct),
    [mode, M] = useState("generate"),
    [count, N] = useState(10),
    [text, X] = useState(""),
    [date, D] = useState(
      new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Shanghai" }),
    );
  const [batchName, BN] = useState(id("LOT")),
    [factory, F] = useState(db.company.factory || ""),
    [rule, R] = useState(null),
    [batchId, B] = useState("");
  const model = db.models.find((m) => m.id === product),
    rows = db.instances.filter(
      (i) =>
        i.modelId === product && (!batchId || i.productionBatchId === batchId),
    );
  const selectedBatch = db.productionBatches.find((b) => b.id === batchId);
  const activeRule = rule || model?.codeRule;
  const [search, Q] = useState("");
  const [evidenceIds, EI] = useState({});
  const [customValues, CV] = useState({});
  const [productSearch, PS] = useState(db.models.find(m => m.id === dashboardFilter.modelId)?.name || '');
  const [productCategory, PC] = useState(dashboardFilter.category || '全部');
  const [productTemplate, PT] = useState(dashboardFilter.template || '全部');
  const [productStatus, PST] = useState(dashboardFilter.status || '全部');
  const [batchModel, BM] = useState(dashboardFilter.modelId || '全部');
  const [dashboardBatchId, DBI] = useState(dashboardFilter.batchId || '');
  const [batchCategory, BC] = useState(dashboardFilter.category && dashboardFilter.category !== '全部' ? dashboardFilter.category : '全部类别');
  const [batchTemplate, BTM] = useState(dashboardFilter.template || '全部');
  const [batchFrom, BF] = useState(dashboardFilter.from || '');
  const [batchTo, BT] = useState(dashboardFilter.to || '');
  const [batchStatus, BS] = useState(dashboardFilter.status || dashboardFilter.batchStatus || '全部');
  const [codeStatusFilter, CSF] = useState(dashboardFilter.status || '全部');
  const [codeFrom, CF] = useState(dashboardFilter.from || '');
  const [codeTo, CT] = useState(dashboardFilter.to || '');
  const [codeSearch, CQS] = useState('');
  const filteredCodes = rows.filter(i => {
    const b = db.productionBatches.find(x => x.id === i.productionBatchId);
    const c = db.codeRecords.find(x => x.instanceId === i.id);
    return (codeStatusFilter === '全部' || codeStatus(db, i) === codeStatusFilter) && (!codeFrom || i.date >= codeFrom) && (!codeTo || i.date <= codeTo) && (i.serial + ' ' + (b?.name || '') + ' ' + (c?.enterpriseSerial || '')).toLowerCase().includes(codeSearch.toLowerCase());
  });
  const modelBatches = db.productionBatches.filter(b => b.modelId === model?.id);
  const productRows = db.models.filter(m => {
    const instances = db.instances.filter(i => i.modelId === m.id);
    const missing = instances.some(i => check(db, i).length > 0);
    const status = missing ? '资料待补充' : '资料完整';
    return (productCategory === '全部' || m.type === productCategory) &&
      (productTemplate === '全部' || (m.template || 'eu') === productTemplate) &&
      (productStatus === '全部' || status === productStatus) &&
      (m.name + ' ' + m.id).toLowerCase().includes(productSearch.toLowerCase());
  });
  if (formOpen)
    return (
      <ProductForm
        {...ctx}
        value={editingModel}
        close={() => FO(false)}
        done={(pid, generate) => {
          FO(false);
          P(pid);
          if (!batchId && !single) T("产品资料");
          if (generate) {
            BN(id("LOT"));
            C(true);
          }
        }}
      />
    );
  if (!model && batchWorkspace)
    return (
      <>
        <div className="page-title">
          <div>
            <h1>批次与二维码</h1>
            <p>选择产品，填写本次生产信息，生成后直接下载。</p>
          </div>
          <div className="title-actions"><button className="outline" onClick={() => ctx.setModal({type:'resolver'})}><QrCode size={16}/>码设置</button><button
            className="primary"
            disabled={!db.models.length}
            onClick={() => {
              P(db.models[0].id);
              C(true);
              T("二维码");
              B("");
              R(null);
              BN(id("LOT"));
            }}
          >
            <Plus size={16} />
            新建生码批次
          </button></div>
        </div>
        <div className="filter-row">
          <input placeholder="搜索批次号、工厂或产品" value={search} onChange={e => Q(e.target.value)} />
          <select aria-label="批次产品筛选" value={batchModel} onChange={e => BM(e.target.value)}><option value="全部">全部产品</option>{db.models.map(m=><option value={m.id} key={m.id}>{m.name}</option>)}</select>
          <select aria-label="批次类别筛选" value={batchCategory} onChange={e=>BC(e.target.value)}><option>全部类别</option>{categories.map(x=><option key={x}>{x}</option>)}</select>
          <select aria-label="批次模板筛选" value={batchTemplate} onChange={e=>BTM(e.target.value)}><option value="全部">全部模板</option>{Object.entries(templates).map(([k,v])=><option key={k} value={k}>{v}</option>)}</select>
          <label>从<input aria-label="批次开始日期" type="date" value={batchFrom} onChange={e=>BF(e.target.value)} /></label>
          <label>至<input aria-label="批次结束日期" type="date" value={batchTo} onChange={e=>BT(e.target.value)} /></label>
          <select aria-label="批次护照状态" value={batchStatus} onChange={e=>BS(e.target.value)}><option>全部</option><option>可访问</option><option>资料待补充</option><option>已作废</option></select>
          <span className="filter-count">{db.productionBatches.filter(b => (batchModel==='全部'||b.modelId===batchModel) && (batchCategory==='全部类别'||db.models.find(m=>m.id===b.modelId)?.type===batchCategory) && (batchTemplate==='全部'||(db.models.find(m=>m.id===b.modelId)?.template||'eu')===batchTemplate) && (!batchFrom||b.date>=batchFrom) && (!batchTo||b.date<=batchTo) && (batchStatus==='全部'||db.instances.filter(i=>i.productionBatchId===b.id).some(i=>codeStatus(db,i)===batchStatus)) && (b.name+' '+b.factory+' '+(db.models.find(m=>m.id===b.modelId)?.name||'')).toLowerCase().includes(search.toLowerCase()) && (!dashboardBatchId||dashboardBatchId===b.id)).length} 个批次</span>
          {(search || batchModel!=='全部' || batchCategory!=='全部类别' || batchTemplate!=='全部' || batchFrom || batchTo || batchStatus!=='全部' || dashboardBatchId) && <button className="text-btn" onClick={()=>{Q('');BM('全部');BC('全部类别');BTM('全部');BF('');BT('');BS('全部');DBI('');sessionStorage.removeItem('battery-dashboard-filter')}}>清除筛选</button>}
        </div>
        <section className="panel table-panel">
          <table>
            <thead>
              <tr>
                <th>生产批次</th>
                <th>产品</th>
                <th>日期 / 工厂</th>
                <th>数量</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {db.productionBatches
                .filter((b) =>
                  (batchModel === '全部' || b.modelId === batchModel) &&
                  (batchCategory === '全部类别' || db.models.find(m => m.id === b.modelId)?.type === batchCategory) &&
                  (batchTemplate === '全部' || (db.models.find(m => m.id === b.modelId)?.template || 'eu') === batchTemplate) &&
                  (!batchFrom || b.date >= batchFrom) && (!batchTo || b.date <= batchTo) &&
                  (batchStatus === '全部' || db.instances.filter(i => i.productionBatchId === b.id).some(i => codeStatus(db, i) === batchStatus)) &&
                  (b.name + ' ' + b.factory + ' ' + (db.models.find(m => m.id === b.modelId)?.name || '')).toLowerCase().includes(search.toLowerCase()) &&
                  (
                    b.name +
                    " " +
                    b.factory + " " +
                    db.models.find((m) => m.id === b.modelId)?.name
                  )
                    .toLowerCase()
                    .includes(search.toLowerCase()) &&
                  (!dashboardBatchId || b.id === dashboardBatchId),
                )
                .slice()
                .reverse()
                .map((b) => (
                  <tr key={b.id}>
                    <td>
                      <button
                        className="text-btn"
                        onClick={() => {
                          P(b.modelId);
                          B(b.id);
                          SI("");
                          T("护照预览");
                        }}
                      >
                        {b.name}
                      </button>
                    </td>
                    <td>{db.models.find((m) => m.id === b.modelId)?.name}</td>
                    <td>
                      {b.date}
                      <small>{b.factory}</small>
                    </td>
                    <td>
                      {
                        db.instances.filter((i) => i.productionBatchId === b.id)
                          .length
                      }
                    </td>
                    <td>
                      <div className="row-actions">
                        <button
                          title="查看批次信息"
                          onClick={() => {
                            P(b.modelId);
                            B(b.id);
                            SI("");
                            T("护照预览");
                          }}
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          title="编辑批次信息"
                          onClick={() =>
                            setModal({ type: "batchMetadata", batchId: b.id })
                          }
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          className="text-btn"
                          onClick={() => {
                            P(b.modelId);
                            B(b.id);
                            T("二维码");
                            Q("");
                          }}
                        >
                          查看码 →
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
          {db.productionBatches.filter(b => (batchModel==='全部'||b.modelId===batchModel) && (batchCategory==='全部类别'||db.models.find(m=>m.id===b.modelId)?.type===batchCategory) && (batchTemplate==='全部'||(db.models.find(m=>m.id===b.modelId)?.template||'eu')===batchTemplate) && (!batchFrom||b.date>=batchFrom) && (!batchTo||b.date<=batchTo) && (batchStatus==='全部'||db.instances.filter(i=>i.productionBatchId===b.id).some(i=>codeStatus(db,i)===batchStatus)) && (b.name+' '+b.factory+' '+(db.models.find(m=>m.id===b.modelId)?.name||'')).toLowerCase().includes(search.toLowerCase()) && (!dashboardBatchId||dashboardBatchId===b.id)).length === 0 && <Empty text="没有符合筛选条件的批次" />}
        </section>
      </>
    );
  if (!model)
    return (
      <>
        <div className="page-title">
          <h1>产品与批次</h1>
          <button
            className="primary"
            onClick={() => {
              EM(null);
              FO(true);
            }}
          >
            <Plus size={16} />
            新建产品
          </button>
        </div>
        <div className="filter-row">
          <input placeholder="搜索产品名称或型号" value={productSearch} onChange={e=>PS(e.target.value)} />
          <select aria-label="产品类别筛选" value={productCategory} onChange={e=>PC(e.target.value)}><option>全部</option>{categories.map(x=><option key={x}>{x}</option>)}</select>
          <select aria-label="产品模板筛选" value={productTemplate} onChange={e=>PT(e.target.value)}><option value="全部">全部模板</option>{Object.entries(templates).map(([k,v])=><option key={k} value={k}>{v}</option>)}</select>
          <select aria-label="产品资料状态筛选" value={productStatus} onChange={e=>PST(e.target.value)}><option>全部</option><option>资料完整</option><option>资料待补充</option></select>
          <span className="filter-count">{productRows.length} 款产品</span>
        </div>
        <section className="panel table-panel">
          <table>
            <thead>
              <tr>
                <th>产品</th>
                <th>类别 / 化学体系</th>
                  <th>批次数量</th>
                <th>电池数量</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {productRows.map((m) => (
                <tr key={m.id}>
                  <td>
                    <button
                      className="text-btn"
                      onClick={() => {
                        P(m.id);
                        T("生产批次");
                      }}
                    >
                      {m.name}
                    </button>
                    {m.demoFeature && <small>{m.demoFeature}</small>}
                  </td>
                  <td>
                    {m.type} / {m.chem}
                    <small>{templates[m.template || 'eu']}</small>
                  </td>
                  <td>{db.productionBatches.filter(b => b.modelId === m.id).length}</td>
                  <td>
                    {db.instances.filter((i) => i.modelId === m.id).length}
                  </td>
                  <td>
                    <div className="row-actions">
                      <button
                        title="查看产品信息"
                        onClick={() => {
                          P(m.id);
                          B("");
                          SI("");
                          T("产品预览");
                        }}
                      >
                        <Eye size={16} />
                      </button>
                      <button
                        title="编辑产品信息"
                        onClick={() => {
                          EM(m);
                          FO(true);
                        }}
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        className="text-btn"
                        onClick={() => {
                          P(m.id);
                          T("生产批次");
                        }}
                      >
                        查看批次 →
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {productRows.length === 0 && <Empty text="没有符合筛选条件的产品" />}
        </section>
      </>
    );
  const filtered = rows.filter((i) =>
    i.serial.toLowerCase().includes(search.toLowerCase()),
  );
  const preview =
    mode === "import"
      ? text
          .split(/\r?\n/)
          .filter((s) => s.trim())
          .map((s) => ({ serial: s.trim(), date }))
      : [];
  const duplicate = preview.some(
    (r, n) =>
      db.instances.some((i) => i.serial === r.serial) ||
      preview.slice(0, n).some((x) => x.serial === r.serial),
  );
  return (
    <>
      <button
        className="text-btn"
        onClick={() => {
          if (single) {
            SI("");
            return;
          }
          if (batchId && !batchWorkspace) {
            B("");
            T("生产批次");
            return;
          }
          P("");
          B("");
          Q("");
        }}
      >
        <ArrowLeft size={15} />
        {single
          ? "返回码列表"
          : batchId
            ? "返回批次列表"
            : batchWorkspace
              ? "全部批次"
              : "全部产品"}
      </button>
      <div className="page-title">
        <div>
          <h1>
            {single
              ? db.instances.find((i) => i.id === single)?.serial
              : batchId
                ? selectedBatch?.name || "新建生码批次"
                : model.name}
          </h1>
          <p>
            {batchWorkspace
              ? `${model.name} · ${selectedBatch?.date || date} · ${selectedBatch?.factory || factory}`
              : `${rows.length} 块电池 · 固定资料供生产批次沿用`}
          </p>
        </div>
        <div className="title-actions">
          <button className="outline" onClick={() => setModal({ type: 'codeRule', model })}>默认编号规则</button>
          <button
            className="outline"
            onClick={() => {
              EM(model);
              FO(true);
            }}
          >
            <Pencil size={15} />
            编辑产品信息
          </button>
          <button
            className="primary"
            onClick={() => {
              BN(id("LOT"));
              R(null);
              C(true);
            }}
          >
            <QrCode size={16} />
            新建生码批次
          </button>
        </div>
      </div>
      <div className="tabs">
        {(batchId
          ? ["护照预览", "二维码", "更新记录"]
          : [
              "产品预览",
              "产品资料",
              "适用资料",
              "字段层级",
              "生产批次",
              "更新记录",
            ]
        ).map((t) => (
          <button
            key={t}
            className={tab === t ? "selected" : ""}
            onClick={() => {
              SI("");
              T(t);
            }}
          >
            {t}
          </button>
        ))}
      </div>
      {batchWorkspace && selectedBatch && (
        <div className="wf-summary">
          <strong>{rows.length} 块电池</strong>
          <span>固定资料：{model.name}</span>
          <span>
            编号批次段：{selectedBatch.numberingBatch || selectedBatch.name}
          </span>
          <span>
            生成规则：
            {selectedBatch.ruleSnapshot?.prefix ||
              db.codeBatches.find((b) => b.id === selectedBatch.codeBatchId)
                ?.ruleSnapshot?.prefix ||
              "历史规则"}{" "}
            ·{" "}
            {selectedBatch.ruleSnapshot?.sequenceWidth ||
              db.codeBatches.find((b) => b.id === selectedBatch.codeBatchId)
                ?.ruleSnapshot?.sequenceWidth ||
              6}{" "}
            位流水
          </span>
        </div>
      )}
      <div className="pe-scope">
        <button
          className="text-btn"
          onClick={() => {
            SI("");
            B("");
            T("生产批次");
          }}
        >
          {model.name}
        </button>
        {selectedBatch && (
          <button
            className="text-btn"
            onClick={() => {
              SI("");
              T("二维码");
            }}
          >
            {" "}
            / {selectedBatch.name}
          </button>
        )}
        {single && (
          <span> / {db.instances.find((i) => i.id === single)?.serial}</span>
        )}
      </div>
      {single || tab === "护照预览" || tab === "产品预览" ? (
        <>
          <div className="pe-scope">
            {tab === "产品预览"
              ? "产品层级 · 固定资料来自当前产品，日期与编号为示例占位"
              : single
                ? "单码层级 · 当前电池真实数据"
                : "批次层级 · 固定信息来自产品，生产信息来自本批次；编号展示该批次首块电池"}
            <button
              className="outline"
              onClick={() =>
                tab === "产品预览"
                  ? (EM(model), FO(true))
                  : single
                    ? setModal({
                        type: "instance",
                        value: db.instances.find((i) => i.id === single),
                      })
                    : setModal({
                        type: "batchMetadata",
                        batchId: selectedBatch.id,
                      })
              }
            >
              {tab === "产品预览"
                ? "编辑产品信息"
                : single
                  ? "编辑单码信息"
                  : "编辑批次信息"}
            </button>
          </div>
          <div className="pe-preview">
            <PassportSurface
              version={snapshot(
                {
                  ...db,
                  resolvedProductionBatch:
                    tab === "产品预览" ? null : selectedBatch,
                },
                (tab === "产品预览"
                  ? {
                      id: "PREVIEW",
                      modelId: model.id,
                      serial: "EXAMPLE-000001",
                      date: "2026-01-01",
                    }
                  : null) ||
                  db.instances.find((i) => i.id === single) ||
                  rows[0] || {
                    id: "PREVIEW",
                    modelId: model.id,
                    serial: "EXAMPLE-000001",
                    date: selectedBatch?.date || date,
                  },
                1,
              )}
              db={{...db,publishedPageOverride:{...db.publishedPageOverride,enabled:true},pageDrafts:{...db.pageDrafts,[model.id]:{...db.pageDrafts?.[model.id],enabled:true,enabledLanguages:model.enabledLanguages,displaySections:model.displaySections,sectionLabels:model.sectionLabels}}}}
              previewDevice
              maintenanceLevel={tab === "产品预览" ? "product" : single ? "instance" : "batch"}
            />
          </div>
        </>
      ) : tab === "适用资料" ? (
        <ApplicableMaterials {...ctx} modelId={model.id} />
      ) : tab === "字段层级" ? (
        <section className="panel table-panel">
          <table>
            <thead>
              <tr>
                <th>字段</th>
                <th>维护位置</th>
                <th>规则 / 权限</th>
                <th>来源</th>
              </tr>
            </thead>
            <tbody>
              {db.rules.map((r) => (
                <tr key={r.code}>
                  <td>{r.zh}</td>
                  <td>
                    {r.code === "instance.date"
                      ? "批次默认，单码差异"
                      : r.level === "instance"
                        ? "单码 / 使用后记录"
                        : ["carbon", "recycled", "diligence"].includes(
                              r.code.split(".")[1],
                            )
                          ? "适用资料 → 批次选择"
                          : "产品固定资料"}
                  </td>
                  <td>
                    {r.required} / {r.access}
                  </td>
                  <td>{r.source}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p>
            编号前缀、批次流水和打印记录是企业内部字段。该映射为演示配置，非完整法规适用性结论。
          </p>
        </section>
      ) : tab === "生产批次" ? (
        <section className="panel table-panel">
          <table>
            <thead>
              <tr>
                <th>批次号</th>
                <th>生产日期 / 工厂</th>
                <th>码数量</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {db.productionBatches
                .filter((b) => b.modelId === model.id)
                .map((b) => (
                  <tr key={b.id}>
                    <td>
                      <button
                        className="text-btn"
                        onClick={() => {
                          B(b.id);
                          T("护照预览");
                        }}
                      >
                        {b.name}
                      </button>
                    </td>
                    <td>
                      {b.date}
                      <small>{b.factory}</small>
                    </td>
                    <td>
                      {
                        db.instances.filter((i) => i.productionBatchId === b.id)
                          .length
                      }
                    </td>
                    <td>
                      <div className="row-actions">
                        <button
                          title="查看批次信息"
                          onClick={() => {
                            B(b.id);
                            SI("");
                            T("护照预览");
                          }}
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          title="编辑批次信息"
                          onClick={() =>
                            setModal({ type: "batchMetadata", batchId: b.id })
                          }
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          className="text-btn"
                          onClick={() => {
                            B(b.id);
                            T("二维码");
                          }}
                        >
                          查看码 →
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </section>
      ) : tab === "产品资料" ? (
        <>
          <button
            className="outline"
            onClick={() =>
              setModal({
                type: "document",
                value: {
                  target: model.id,
                  access: "公开",
                  version: 1,
                  name: "",
                  nameEn: "",
                },
              })
            }
          >
            添加产品文件
          </button>
          <PageEditor
            key={model.id}
            {...ctx}
            initialModelId={model.id}
            simple
          />
        </>
      ) : tab === "更新记录" ? (
        <section className="panel table-panel">
          <table>
            <thead>
              <tr>
                <th>电池编号</th>
                <th>更新时间</th>
                <th>历史快照</th>
              </tr>
            </thead>
            <tbody>
              {db.versions
                .filter(
                  (v) =>
                    v.instance.modelId === model.id &&
                    (!batchId || v.instance.productionBatchId === batchId),
                )
                .slice()
                .reverse()
                .map((v) => (
                  <tr key={v.id}>
                    <td>{v.instance.serial}</td>
                    <td>{new Date(v.publishedAt).toLocaleString("zh-CN")}</td>
                    <td>
                      <button
                        className="text-btn"
                        onClick={() =>
                          navigate(
                            "/passport/" +
                              v.passportId +
                              "?version=" +
                              v.version,
                          )
                        }
                      >
                        查看 v{v.version}
                      </button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </section>
      ) : (
        <>
          <div className="filter-row">
            <input placeholder="搜索电池编号、批次或企业序列号" value={codeSearch} onChange={e=>CQS(e.target.value)} />
            <select aria-label="码状态筛选" value={codeStatusFilter} onChange={e=>CSF(e.target.value)}><option>全部</option><option>可访问</option><option>资料待补充</option><option>已作废</option></select>
            <label>从<input aria-label="码开始日期" type="date" value={codeFrom} onChange={e=>CF(e.target.value)} /></label>
            <label>至<input aria-label="码结束日期" type="date" value={codeTo} onChange={e=>CT(e.target.value)} /></label>
            <span className="filter-count">{filteredCodes.length} 条码</span>
            {(codeSearch || codeStatusFilter !== '全部' || codeFrom || codeTo) && <button className="text-btn" onClick={()=>{CQS('');CSF('全部');CF('');CT('')}}>清除筛选</button>}
            <button
              className="outline"
              onClick={() =>
                setModal({
                  type: "codeExport",
                  codes: db.codeRecords.filter((c) =>
                    filteredCodes.some((i) => i.id === c.instanceId),
                  ),
                })
              }
            >
              <Download size={15} />
              导出清单（{filteredCodes.length}）
            </button>
            <button
              className="outline"
              onClick={() =>
                setModal({
                  type: "printFilter",
                  codes: db.codeRecords.filter((c) =>
                    filteredCodes.some((i) => i.id === c.instanceId),
                  ),
                })
              }
            >
              标签 PDF
            </button>
            <button
              className="outline"
              onClick={async () => {
                try {
                  await downloadQrZip(
                    db,
                    model.id,
                    filteredCodes.filter((i) => i.passportId),
                  );
                } catch (e) {
                  notify(e.message);
                }
              }}
            >
              <Download size={15} />
              二维码 ZIP（{filteredCodes.length}）
            </button>
          </div>
          <section className="panel table-panel">
            <table>
              <thead>
                <tr>
                  <th>电池编号</th>
                  <th>生产日期</th>
                  <th>访问状态</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                {filteredCodes.map((i) => (
                  <tr key={i.id}>
                    <td>
                      <button className="text-btn" onClick={() => navigate('/passport/' + encodeURIComponent(i.passportId || i.id))}>
                        {i.serial}
                      </button>
                    </td>
                    <td>{i.date}</td>
                    <td>
                      {codeStatus(db, i)}
                      {codeStatus(db, i) === '可访问' && check(db, i).length > 0 && <small>当前修改待补充，扫码仍显示上一份已保存内容</small>}
                    </td>
                    <td>
                      <div className="row-actions">
                        <button title="查看真实扫码页面" onClick={() => navigate('/passport/' + encodeURIComponent(i.passportId || i.id))}>
                          <Eye size={15} />
                        </button>
                        <button
                          title="下载二维码"
                          onClick={() => setModal({ type: "qr", instance: i })}
                        >
                          <QrCode size={15} />
                        </button>
                        <button
                          title="维护单块电池"
                          onClick={() =>
                            setModal({ type: "instance", value: i })
                          }
                        >
                          <Pencil size={15} />
                        </button>
                        {db.codeRecords.some(c => c.instanceId === i.id && c.status !== '作废') && <button title="作废二维码" onClick={() => setModal({ type: 'voidCode', code: db.codeRecords.find(c => c.instanceId === i.id && c.status !== '作废') })}><Ban size={15} /></button>}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          {filteredCodes.length === 0 && <Empty text="没有符合筛选条件的电池码" />}
          </section>
        </>
      )}
      {create && (
        <div className="modal-backdrop">
          <section className="modal wide" role="dialog" aria-label="生成二维码">
            <div className="modal-head">
              <h2>新建生码批次</h2>
              <button
                aria-label="关闭"
                onClick={() => {
                  C(false);
                  if (!batchId) P("");
                }}
              >
                ×
              </button>
            </div>
            <div className="form-grid">
              <label className="form-field">
                选择产品
                <select
                  value={product}
                  onChange={(e) => {
                    P(e.target.value);
                    R(null);
                  }}
                >
                  {db.models.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="form-field">
                批次号
                <input value={batchName} onChange={(e) => BN(e.target.value)} />
              </label>
              <label className="form-field">
                工厂
                <input value={factory} onChange={(e) => F(e.target.value)} />
              </label>
            </div>
            <p>
              固定资料沿用：{model.name} · {model.chem} · {model.energy} kWh ·{" "}
              {(model.company || db.company).name}
            </p>
            <p>{templates[model.template || 'eu']} · {euScope(model)}</p>
            <CustomValues definitions={model.customFields} level="batch" values={customValues} onChange={CV} />
            <CustomValues definitions={model.customFields} level="instance" values={customValues} onChange={CV} />
            {(model.customFields || []).some(f => f.level === 'instance') && <p>本次单码字段作为共同初始值，生成后可逐码修改。</p>}
            <div className="tabs">
              <button
                className={mode === "generate" ? "selected" : ""}
                onClick={() => M("generate")}
              >
                平台生成编号
              </button>
              <button
                className={mode === "import" ? "selected" : ""}
                onClick={() => M("import")}
              >
                导入已有编号
              </button>
            </div>
            <label className="form-field">
              生产日期
              <input
                type="date"
                value={date}
                onChange={(e) => D(e.target.value)}
              />
            </label>
            {mode === "generate" ? (
              <>
                <div className="form-grid">
                  <label className="form-field">
                    编号前缀
                    <input
                      value={activeRule.prefix}
                      onChange={(e) =>
                        R({ ...activeRule, prefix: e.target.value })
                      }
                    />
                  </label>
                  <label className="form-field">
                    流水位数
                    <input
                      type="number"
                      min="3"
                      max="12"
                      value={activeRule.sequenceWidth}
                      onChange={(e) =>
                        R({
                          ...activeRule,
                          sequenceWidth: Number(e.target.value),
                        })
                      }
                    />
                  </label>
                  <label className="form-field">
                    起始流水
                    <input
                      type="number"
                      min={model.codeRule.nextSequence}
                      value={activeRule.nextSequence}
                      onChange={(e) =>
                        R({
                          ...activeRule,
                          nextSequence: Number(e.target.value),
                        })
                      }
                    />
                  </label>
                </div>
                <label className="form-field">
                  数量
                  <input
                    type="number"
                    min="1"
                    max="5000"
                    value={count}
                    onChange={(e) => N(e.target.value)}
                  />
                </label>
                <p>
                  编号预览：
                  {makePassportId(
                    activeRule,
                    batchName,
                    Number(activeRule.nextSequence),
                  )}{" "}
                  →{" "}
                  {makePassportId(
                    activeRule,
                    batchName,
                    Number(activeRule.nextSequence) +
                      Math.max(1, Number(count) || 1) -
                      1,
                  )}
                </p>
              </>
            ) : (
              <>
                <label className="form-field">
                  Excel / CSV
                  <input
                    type="file"
                    accept=".xlsx,.csv"
                    onChange={async (e) => {
                      try {
                        const file = e.target.files[0];
                        if (!file) return;
                        if (file.size > 5 * 1024 * 1024)
                          throw Error("文件不能超过 5 MB");
                        let list;
                        if (file.name.endsWith(".csv")) {
                          const p = (await import("papaparse")).default;
                          const result = p.parse(await file.text(), {
                            header: true,
                            skipEmptyLines: true,
                          });
                          if (result.errors.length) throw Error("CSV 格式错误");
                          list = result.data;
                        } else {
                          const Excel = (await import("exceljs")).default,
                            wb = new Excel.Workbook();
                          await wb.xlsx.load(await file.arrayBuffer());
                          const ws = wb.worksheets[0];
                          if (!ws) throw Error("文件为空");
                          const headers = ws
                            .getRow(1)
                            .values.slice(1)
                            .map(String);
                          list = [];
                          ws.eachRow((r, n) => {
                            if (n > 1)
                              list.push(
                                Object.fromEntries(
                                  headers.map((h, k) => [
                                    h,
                                    r.getCell(k + 1).text,
                                  ]),
                                ),
                              );
                          });
                        }
                        X(
                          list
                            .map(
                              (r) =>
                                r.serial ||
                                r.enterpriseSerial ||
                                r["电池编号"] ||
                                r["序列号"] ||
                                "",
                            )
                            .join("\n"),
                        );
                      } catch (err) {
                        notify(err.message);
                      }
                      e.target.value = "";
                    }}
                  />
                </label>
                <label className="form-field">
                  电池编号，每行一个
                  <textarea
                    value={text}
                    onChange={(e) => X(e.target.value)}
                    rows={5}
                  />
                </label>
                <p>
                  {preview.length} 条 ·{" "}
                  {duplicate ? "存在重复编号，请修改" : "未发现重复编号"}
                </p>
              </>
            )}
            <section>
              <h3>继承与生码检查</h3>
              <p>
                产品参数自动继承；运行数据和维修记录在使用后补充，不阻止出厂生码。
              </p>
              {["carbon", "recycled", "diligence"].map((kind) => {
                const candidates = matchingEvidence(
                  db,
                  model.id,
                  factory,
                  date,
                ).filter((r) => r.kind === kind);
                return (
                  <label className="form-field" key={kind}>
                    {
                      {
                        carbon: "碳足迹",
                        recycled: "再生材料",
                        diligence: "尽职调查",
                      }[kind]
                    }
                    <select
                      value={evidenceIds[kind] || ""}
                      onChange={(e) =>
                        EI({ ...evidenceIds, [kind]: e.target.value })
                      }
                    >
                      <option value="">
                        {candidates.length === 1
                          ? "自动匹配：" + candidates[0].name
                          : candidates.length
                            ? "存在多份，请选择"
                            : model[kind + "Applicable"]
                              ? "缺少适用依据"
                              : "条件未启用，无需本次填写"}
                      </option>
                      {candidates.map((r) => (
                        <option value={r.id} key={r.id}>
                          {r.name} · {r.from} / {r.to}
                        </option>
                      ))}
                    </select>
                  </label>
                );
              })}
              {evidenceIssues(db, model.id, factory, date, evidenceIds).map(
                (s) => (
                  <p key={s} role="alert">
                    {s}
                  </p>
                ),
              )}
            </section>
            <div className="modal-foot">
              <button
                className="outline"
                onClick={() => {
                  C(false);
                  if (!batchId) P("");
                }}
              >
                取消
              </button>
              <button
                className="primary"
                disabled={mode === "import" && (!preview.length || duplicate)}
                onClick={async () => {
                  let createdBatch;
                  const ok = await change((d) => {
                    const material = saveMaterialVersion(d, model.id);
                    const generationModel = {
                      ...d.models.find((m) => m.id === model.id),
                    };
                    for (const field of generationModel.customFields || []) {
                      if (field.required && field.level !== 'product' && !String(customValues[field.id] || '').trim()) throw Error('请填写客户字段：' + field.label);
                    }
                    for (const kind of ["carbon", "recycled", "diligence"]) {
                      const candidates = matchingEvidence(
                        d,
                        model.id,
                        factory,
                        date,
                      ).filter((r) => r.kind === kind);
                      const evidence =
                        candidates.find((r) => r.id === evidenceIds[kind]) ||
                        candidates[0];
                      if (evidence) generationModel[kind] = evidence.value;
                    }
                    const issues = check(
                      {
                        ...d,
                        productionBatches: [...d.productionBatches, { id: 'GENERATION-CHECK', customValues }],
                        models: d.models.map((m) =>
                          m.id === model.id ? generationModel : m,
                        ),
                      },
                      {
                        modelId: model.id,
                        serial: "CHECK",
                        productionBatchId: 'GENERATION-CHECK',
                        customValues,
                        date,
                      },
                    );
                    if (issues.length)
                      throw Error("请先补充产品资料：" + issues.join("、"));
                    createdBatch = createProduction(d, {
                      customValues,
                      evidenceIds,
                      name: batchName,
                      numberingBatch: batchName,
                      rule: activeRule,
                      modelId: model.id,
                      materialId: material.id,
                      factory,
                      date,
                      mode,
                      count,
                      rows: preview,
                    });
                    log(d, "生成产品二维码", model.name);
                  }, "二维码已生成，可直接下载");
                  if (ok) {
                    B(createdBatch.id);
                    C(false);
                    T("二维码");
                    X("");
                  }
                }}
              >
                确认生成 {mode === "generate" ? count : preview.length} 个
              </button>
            </div>
          </section>
        </div>
      )}
    </>
  );
}
