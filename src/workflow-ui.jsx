import React, { useState } from "react";
import {
  Plus,
  ArrowLeft,
  Download,
  Upload,
  CheckCircle2,
  AlertTriangle,
  Eye,
  Activity,
  Pencil,
  FileCheck,
  Printer,
} from "lucide-react";
import { id, log, latest, download, makePassportId, batchCode } from "./data";
import {
  saveMaterialVersion,
  createProduction,
  validateRows,
  productionIssues,
  publishBatch,
  addMeasurements,
} from "./workflow";
import "./workflow.css";
import { downloadQrZip } from "./downloads";

const day = () =>
  new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Shanghai" });
const date = (s) => new Date(s).toLocaleString("zh-CN");
function Dialog({ title, close, children }) {
  return (
    <div className="modal-backdrop">
      <section
        className="modal wide"
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        <div className="modal-head">
          <h2>{title}</h2>
          <button onClick={close} aria-label="关闭">
            ×
          </button>
        </div>
        {children}
      </section>
    </div>
  );
}
function Title({ title, description, children }) {
  return (
    <div className="page-title">
      <div>
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
      <div className="title-actions">{children}</div>
    </div>
  );
}
function Tabs({ items, value, set }) {
  return (
    <div className="tabs">
      {items.map((x) => (
        <button
          key={x}
          className={x === value ? "selected" : ""}
          onClick={() => set(x)}
        >
          {x}
        </button>
      ))}
    </div>
  );
}
export default function Workflow(ctx) {
  const { tab, renderLegacy } = ctx;
  const [section, S] = useState(""),
    [dialog, D] = useState(null);
  const options =
    tab === "library"
      ? ["共享资料版本", "企业资料", "型号资料", "关联文件"]
      : tab === "settings"
        ? ["系统设置"]
        : tab === "tasks"
          ? ["待办汇总", "访问审批"]
          : tab === "ledger"
            ? ["电池台账", "运行数据历史"]
            : ["生产批次"];
  const current = options.includes(section) ? section : options[0];
  const legacy = {
    企业资料: "company",
    型号资料: "models",
    关联文件: "documents",
    系统设置: "rules",
    访问审批: "requests",
    高级码管理: "codes",
  };
  return (
    <>
      <Tabs items={options} value={current} set={S} />
      {legacy[current] ? (
        renderLegacy(legacy[current])
      ) : current === "共享资料版本" ? (
        <Library {...ctx} open={D} />
      ) : current === "生产批次" ? (
        <Production {...ctx} open={D} />
      ) : current === "待办汇总" ? (
        <Tasks {...ctx} />
      ) : (
        <Ledger {...ctx} history={current === "运行数据历史"} open={D} />
      )}{" "}
      {dialog && <Dialogs {...ctx} dialog={dialog} close={() => D(null)} />}
    </>
  );
}
function Library({ db, change, notify }) {
  const [scope, S] = useState("全部");
  return (
    <>
      <Title
        title="共享资料库"
        description="企业及型号资料集中维护，审核形成版本，生产批次选择适用版本。"
      />
      <section className="panel table-panel">
        <table>
          <thead>
            <tr>
              <th>型号</th>
              <th>当前资料版本</th>
              <th>已关联生产批次</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            {db.models.map((m) => {
              const versions = db.materialVersions.filter(
                  (v) => v.modelId === m.id,
                ),
                v = versions.at(-1);
              return (
                <tr key={m.id}>
                  <td>
                    <strong>{m.name}</strong>
                    <small>
                      {m.type} · {m.chem}
                    </small>
                  </td>
                  <td>
                    <strong>v{v?.version || 1} · 已审核</strong>
                    <small>{v && date(v.createdAt)}</small>
                  </td>
                  <td>
                    {
                      db.productionBatches.filter((b) =>
                        versions.some((v) => v.id === b.materialId),
                      ).length
                    }
                  </td>
                  <td>
                    <button
                      className="outline"
                      onClick={() =>
                        change(
                          (d) => saveMaterialVersion(d, m.id),
                          "当前企业、型号及文件已审核为新版本；历史批次未改变",
                        )
                      }
                    >
                      <FileCheck size={15} />
                      审核当前资料为新版本
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </section>
      <div className="inline-note">
        <AlertTriangle size={15} />
        先在“企业资料、型号资料、关联文件”编辑草稿，再审核保存新版本。新建批次默认选择最新版本，已有批次需明确选择更新。
      </div>
      <section className="panel table-panel wf-history">
        <div className="panel-head">
          <h2>共享资料版本历史</h2>
        </div>
        <table>
          <thead>
            <tr>
              <th>型号 / 版本</th>
              <th>企业资料</th>
              <th>关键参数</th>
              <th>文件数</th>
              <th>审核时间</th>
            </tr>
          </thead>
          <tbody>
            {db.materialVersions
              .slice()
              .reverse()
              .map((v) => (
                <tr key={v.id}>
                  <td>
                    <strong>
                      {v.model.name} · v{v.version}
                    </strong>
                  </td>
                  <td>{v.company.name}</td>
                  <td>
                    {v.model.chem} / {v.model.energy} kWh /{" "}
                    {v.model.voltage || "缺失"} V
                  </td>
                  <td>{v.documents.length}</td>
                  <td>{date(v.createdAt)}</td>
                </tr>
              ))}
          </tbody>
        </table>
      </section>
    </>
  );
}
function Production(ctx) {
  const { db, open, change, setModal } = ctx;
  const [selected, S] = useState(""),
    [onlyBad, B] = useState(false);
  const batch = db.productionBatches.find((b) => b.id === selected);
  if (batch) {
    const all = db.instances.filter((i) => i.productionBatchId === batch.id),
      rows = all.filter((i) => !onlyBad || productionIssues(db, i).length),
      ready = all.filter(
        (i) => !productionIssues(db, i).length && i.status !== "已发布",
      ),
      bad = all.filter((i) => productionIssues(db, i).length),
      material = db.materialVersions.find((v) => v.id === batch.materialId);
    return (
      <>
        <button className="text-btn" onClick={() => S("")}>
          <ArrowLeft size={15} />
          所有生产批次
        </button>
        <Title
          title={batch.name}
          description={`${material?.model.name} · ${batch.factory || "工厂未填写"} · ${batch.date}`}
        >
          <button
            className="outline"
            onClick={() => open({ type: "material", batch })}
          >
            更换适用资料版本
          </button>
          <button
            className="outline"
            onClick={() =>
              setModal({
                type: "codeExport",
                codes: db.codeRecords.filter(
                  (c) => c.batchId === batch.codeBatchId,
                ),
              })
            }
          >
            <Download size={15} />
            导出对照表
          </button>
          <button
            className="outline"
            onClick={() =>
              setModal({
                type: "print",
                batchId: batch.codeBatchId,
                productionReady: false,
              })
            }
          >
            <Printer size={15} />
            标签 PDF
          </button>
          <button
            className="outline"
            onClick={async () => {
              try {
                await downloadQrZip(db, batch.id);
              } catch (e) {
                ctx.notify(e.message);
              }
            }}
          >
            <Download size={15} />
            二维码 ZIP（{all.length} 个）
          </button>
          <button
            className="primary"
            disabled={!ready.length}
            onClick={() => open({ type: "publish", batch })}
          >
            审核发布 {ready.length} 份
          </button>
        </Title>
        <div className="wf-progress">
          {[
            "型号资料 v" + material?.version,
            "已建档 " + all.length + " 块电池",
            "已生成 " + all.length + " 个二维码",
            "已发布 " + all.filter((i) => latest(db, i.id)).length + " 份",
          ].map((x, n) => (
            <div key={x}>
              <span>{n + 1}</span>
              <strong>{x}</strong>
            </div>
          ))}
        </div>
        <div className="wf-summary">
          <strong>{all.length} 块电池</strong>
          <span>{ready.length} 块待发布</span>
          <button
            className={onlyBad ? "selected" : ""}
            onClick={() => B(!onlyBad)}
          >
            {bad.length} 块缺资料{onlyBad ? " · 点击显示全部" : ""}
          </button>
          <span>
            资料来源：企业 + 型号快照 v{material?.version} / 生产批次 / 单体数据
          </span>
        </div>
        <section className="panel table-panel">
          <table>
            <thead>
              <tr>
                <th>电池编号</th>
                <th>生产日期</th>
                <th>缺项</th>
                <th>发布状态</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((i) => (
                <tr key={i.id}>
                  <td>
                    <strong>{i.serial}</strong>
                  </td>
                  <td>{i.date}</td>
                  <td>{productionIssues(db, i).join("、") || "完整"}</td>
                  <td>{i.status}</td>
                  <td>
                    <div className="row-actions">
                      <button
                        title="编辑单体数据"
                        onClick={() =>
                          ctx.setModal({ type: "instance", value: i })
                        }
                      >
                        <Pencil size={15} />
                      </button>
                      <button
                        title="资料来源"
                        onClick={() => open({ type: "source", instance: i })}
                      >
                        <Eye size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </>
    );
  }
  return (
    <>
      <Title
        title="生产建档"
        description="选择型号，建立批次，生成或导入电池编号，检查发布后下载清单与标签。"
      >
        <button className="primary" onClick={() => open({ type: "create" })}>
          <Plus size={16} />
          新建一批电池
        </button>
      </Title>
      <div className="wf-progress">
        {[
          "选择型号与版本",
          "填写生产批次",
          "生成或导入电池编号",
          "检查、发布和导出",
        ].map((x, n) => (
          <div key={x}>
            <span>{n + 1}</span>
            <strong>{x}</strong>
          </div>
        ))}
      </div>
      <section className="panel table-panel">
        <table>
          <thead>
            <tr>
              <th>生产批次 / 型号</th>
              <th>日期 / 工厂</th>
              <th>电池数量</th>
              <th>缺项 / 待发布</th>
              <th>资料版本</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {db.productionBatches.map((b) => {
              const rows = db.instances.filter(
                  (i) => i.productionBatchId === b.id,
                ),
                v = db.materialVersions.find((v) => v.id === b.materialId);
              return (
                <tr key={b.id}>
                  <td>
                    <strong>{b.name}</strong>
                    <small>{v?.model.name}</small>
                  </td>
                  <td>
                    {b.date}
                    <small>{b.factory}</small>
                  </td>
                  <td>{rows.length}</td>
                  <td>
                    {rows.filter((i) => productionIssues(db, i).length).length}{" "}
                    /{" "}
                    {
                      rows.filter(
                        (i) =>
                          !productionIssues(db, i).length &&
                          i.status !== "已发布",
                      ).length
                    }
                  </td>
                  <td>v{v?.version}</td>
                  <td>
                    <button className="text-btn" onClick={() => S(b.id)}>
                      进入批次 →
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {!db.productionBatches.length && (
          <div className="empty">
            <p>暂无生产批次</p>
            <button
              className="primary"
              onClick={() => open({ type: "create" })}
            >
              创建第一批电池
            </button>
          </div>
        )}
      </section>
      <div className="inline-note">
        已有电池统一在电池台账查询；编号规则和异常码处理位于系统设置。
      </div>
    </>
  );
}
function Ledger(ctx) {
  const { db, history, open, setModal, navigate } = ctx;
  const [q, Q] = useState("");
  const rows = db.instances.filter((i) =>
    i.serial.toLowerCase().includes(q.toLowerCase()),
  );
  return (
    <>
      <Title
        title={history ? "运行数据历史" : "电池台账"}
        description="共享资料通过版本继承；SOH、循环次数和维修记录按单体追加，发布后对外更新。"
      >
        <button
          className="outline"
          onClick={() => open({ type: "measureImport" })}
        >
          <Upload size={15} />
          导入运行数据
        </button>
      </Title>
      <div className="search large">
        <input
          placeholder="搜索电池编号"
          value={q}
          onChange={(e) => Q(e.target.value)}
        />
      </div>
      <section className="panel table-panel wf-history">
        <table>
          <thead>
            <tr>
              <th>电池序列号</th>
              <th>资料来源</th>
              <th>健康 / 循环</th>
              <th>测量时间</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((i) => {
              const v = db.materialVersions.find((v) => v.id === i.materialId),
                measurements = db.measurements.filter(
                  (m) => m.instanceId === i.id,
                );
              return (
                <React.Fragment key={i.id}>
                  <tr>
                    <td>
                      <strong>{i.serial}</strong>
                      <small>{i.passportId || "尚未分码"}</small>
                    </td>
                    <td>
                      {v ? "共享资料 v" + v.version : "旧版实时草稿"}
                      <small>
                        {db.productionBatches.find(
                          (b) => b.id === i.productionBatchId,
                        )?.name || "未关联生产批次"}
                      </small>
                    </td>
                    <td>
                      {i.soh === "" ? "—" : i.soh + "%"} / {i.cycles} 次
                    </td>
                    <td>
                      {i.measuredAt ? date(i.measuredAt) : "无追加测量记录"}
                    </td>
                    <td>
                      <div className="row-actions">
                        <button
                          title="资料来源"
                          onClick={() => open({ type: "source", instance: i })}
                        >
                          <Eye size={15} />
                        </button>
                        <button
                          title="追加运行数据"
                          onClick={() => open({ type: "measure", instance: i })}
                        >
                          <Activity size={15} />
                        </button>
                        <button
                          title="登记维修事件"
                          onClick={() =>
                            setModal({ type: "instance", value: i })
                          }
                        >
                          <Pencil size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                  {history &&
                    measurements
                      .slice()
                      .sort(
                        (a, b) =>
                          Date.parse(b.measuredAt) - Date.parse(a.measuredAt),
                      )
                      .map((m) => (
                        <tr key={m.id}>
                          <td>↳ {m.source}</td>
                          <td>单体实测</td>
                          <td>
                            {m.soh}% / {m.cycles} 次
                          </td>
                          <td>{date(m.measuredAt)}</td>
                          <td>追加记录</td>
                        </tr>
                      ))}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </section>
    </>
  );
}
function Tasks({ db, navigate }) {
  const missing = db.instances.filter((i) => productionIssues(db, i).length),
    ready = db.instances.filter(
      (i) =>
        i.productionBatchId &&
        i.status !== "已发布" &&
        !productionIssues(db, i).length,
    ),
    requests = db.requests.filter((r) => r.status === "待处理");
  return (
    <>
      <Title
        title="待办中心"
        description="集中处理缺项、待发布护照和受限数据申请。"
      />
      <div className="wf-task-grid">
        {[
          ["补充缺失资料", missing.length, "production"],
          ["待审核发布", ready.length, "production"],
          ["访问申请", requests.length, "requests"],
        ].map(([label, count, target]) => (
          <button
            className="panel"
            key={label}
            onClick={() => navigate("/admin/" + target)}
          >
            <span>{label}</span>
            <strong>{count}</strong>
            <small>查看并处理 →</small>
          </button>
        ))}
      </div>
      <section className="panel table-panel">
        <table>
          <thead>
            <tr>
              <th>电池 / 序列号</th>
              <th>需处理事项</th>
              <th>所属批次</th>
            </tr>
          </thead>
          <tbody>
            {missing.map((i) => (
              <tr key={i.id}>
                <td>{i.serial}</td>
                <td>{productionIssues(db, i).join("、")}</td>
                <td>
                  {db.productionBatches.find(
                    (b) => b.id === i.productionBatchId,
                  )?.name || "旧版独立实例"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </>
  );
}
async function readWorkbook(file) {
  if (file?.name.toLowerCase().endsWith(".csv")) {
    if (file.size > 5 * 1024 * 1024) throw Error("文件不能超过 5 MB");
    const Papa = (await import("papaparse")).default;
    const result = Papa.parse(await file.text(), {
      header: true,
      skipEmptyLines: true,
    });
    if (result.errors.length)
      throw Error("CSV 格式错误：" + result.errors[0].message);
    return result.data;
  }
  const ExcelJS = (await import("exceljs")).default;
  const wb = new ExcelJS.Workbook();
  if (!file.name.toLowerCase().endsWith(".xlsx"))
    throw Error("请使用 XLSX 文件；也可直接粘贴表格");
  if (file.size > 5 * 1024 * 1024) throw Error("文件不能超过 5 MB");
  await wb.xlsx.load(await file.arrayBuffer());
  const ws = wb.worksheets[0];
  if (!ws) throw Error("工作簿为空");
  const headers = ws
    .getRow(1)
    .values.slice(1)
    .map((v) => String(v || "").trim());
  const result = [];
  ws.eachRow((row, n) => {
    if (n === 1) return;
    const obj = {};
    headers.forEach((h, k) => {
      let value = row.getCell(k + 1).value;
      if (value instanceof Date) value = value.toISOString().slice(0, 10);
      if (value !== null && typeof value === "object")
        throw Error("不支持公式或复杂单元格");
      obj[h] = String(value ?? "");
    });
    result.push(obj);
  });
  return result;
}
function Dialogs(ctx) {
  const { dialog, close, db, change, notify } = ctx;
  if (dialog.type === "create") return <CreateBatch {...ctx} />;
  if (dialog.type === "measure" || dialog.type === "measureImport")
    return <Measurement {...ctx} />;
  if (dialog.type === "source") {
    const i = db.instances.find((x) => x.id === dialog.instance.id),
      v = db.materialVersions.find((v) => v.id === i.materialId),
      b = db.productionBatches.find((b) => b.id === i.productionBatchId);
    return (
      <Dialog title={"资料来源 · " + i.serial} close={close}>
        <div className="wf-source">
          <div>
            <span>企业与型号资料</span>
            <strong>
              {v ? `已审核共享资料 v${v.version}` : "旧版草稿数据"}
            </strong>
            <small>
              {v?.company.name} · {v?.model.name}
            </small>
          </div>
          <div>
            <span>生产批次</span>
            <strong>{b?.name || "未关联"}</strong>
            <small>
              工厂：{b?.factory || "—"} · 日期：{b?.date || "—"}
            </small>
          </div>
          <div>
            <span>单体资料</span>
            <strong>
              {i.serial} ·{" "}
              {i.productionBatchId ? "二维码已生成" : "二维码待生成"}
            </strong>
            <small>
              生产日期 {i.date} · SOH {i.soh || "—"} · 循环 {i.cycles}
            </small>
          </div>
        </div>
        <button
          className="text-btn"
          onClick={() => {
            close();
            ctx.navigate("/admin/library");
          }}
        >
          到资料库编辑共享来源 →
        </button>
      </Dialog>
    );
  }
  if (dialog.type === "publish") {
    const rows = db.instances.filter(
        (i) => i.productionBatchId === dialog.batch.id,
      ),
      count = rows.filter(
        (i) => !productionIssues(db, i).length && i.status !== "已发布",
      ).length;
    return (
      <Dialog title="批量审核发布" close={close}>
        <p>
          {dialog.batch.name}：{count}{" "}
          份资料完整的护照将生成新发布版本；其他电池保持当前状态。
        </p>
        <div className="info-banner">
          <AlertTriangle size={16} />
          本地模拟审核，不代表获得合规认证。
        </div>
        <div className="modal-foot">
          <button className="outline" onClick={close}>
            取消
          </button>
          <button
            className="primary"
            onClick={async () => {
              if (
                await change(
                  (d) => publishBatch(d, dialog.batch.id),
                  "已完成批量发布",
                )
              )
                close();
            }}
          >
            确认审核并发布
          </button>
        </div>
      </Dialog>
    );
  }
  if (dialog.type === "material") return <MaterialChange {...ctx} />;
  return null;
}
function CreateBatch(ctx) {
  const { db, change, notify, close } = ctx;
  const [f, F] = useState({
      modelId: db.models[0]?.id,
      mode: "generate",
      count: 10,
      name: "",
      factory: db.company.factory,
      date: day(),
      materialId: db.materialVersions
        .filter((v) => v.modelId === db.models[0]?.id)
        .at(-1)?.id,
    }),
    [text, T] = useState(""),
    [rows, R] = useState([]);
  const versions = db.materialVersions.filter((v) => v.modelId === f.modelId),
    model = db.models.find((m) => m.id === f.modelId),
    generated =
      f.mode === "generate"
        ? Array.from(
            { length: Math.min(5000, Math.max(0, Number(f.count) || 0)) },
            (_, n) => ({
              serial: makePassportId(
                model.codeRule,
                batchCode(
                  model.codeRule.batchFormat,
                  new Date(f.date + "T00:00:00"),
                ),
                (Number(model.codeRule.nextSequence) || 1) + n,
              ),
              generatedPassportId: makePassportId(
                model.codeRule,
                batchCode(
                  model.codeRule.batchFormat,
                  new Date(f.date + "T00:00:00"),
                ),
                (Number(model.codeRule.nextSequence) || 1) + n,
              ),
              date: f.date,
            }),
          )
        : rows.map((r) => ({
            ...r,
          })),
    preview = validateRows(db, generated, f.modelId),
    bad = preview.filter((r) => r.error);
  function parse(value) {
    T(value);
    R(
      value
        .split(/\r?\n/)
        .filter((x) => x.trim())
        .map((line) => {
          const [serial, date] = line.split(/[\t,]/);
          return { serial: serial.trim(), date: date?.trim() || f.date };
        }),
    );
  }
  return (
    <Dialog title="新建一批电池" close={close}>
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          const ok = await change(
            (d) => createProduction(d, { ...f, rows: generated }),
            "电池已建档，二维码已生成",
          );
          if (ok) close();
        }}
      >
        <div className="tabs">
          <button
            type="button"
            className={f.mode === "generate" ? "selected" : ""}
            onClick={() => F({ ...f, mode: "generate" })}
          >
            平台生成编号
          </button>
          <button
            type="button"
            className={f.mode === "import" ? "selected" : ""}
            onClick={() => F({ ...f, mode: "import" })}
          >
            导入已有编号
          </button>
        </div>
        <div className="form-grid">
          {f.mode === "generate" && (
            <label className="form-field">
              生成数量
              <input
                type="number"
                min="1"
                max="5000"
                value={f.count}
                onChange={(e) => F({ ...f, count: e.target.value })}
              />
            </label>
          )}
          <label className="form-field">
            电池型号
            <select
              value={f.modelId}
              onChange={(e) =>
                F({
                  ...f,
                  modelId: e.target.value,
                  materialId: db.materialVersions
                    .filter((v) => v.modelId === e.target.value)
                    .at(-1)?.id,
                })
              }
            >
              {db.models.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </select>
          </label>
          <label className="form-field">
            适用资料版本
            <select
              value={f.materialId}
              onChange={(e) => F({ ...f, materialId: e.target.value })}
            >
              {versions.map((v) => (
                <option key={v.id} value={v.id}>
                  v{v.version} · {date(v.createdAt)}
                </option>
              ))}
            </select>
          </label>
          <label className="form-field">
            生产批次号
            <input
              required
              pattern="[A-Za-z0-9-]{1,32}"
              placeholder="202611-A"
              value={f.name}
              onChange={(e) => F({ ...f, name: e.target.value })}
            />
          </label>
          <label className="form-field">
            生产日期
            <input
              required
              type="date"
              value={f.date}
              onChange={(e) => {
                F({ ...f, date: e.target.value });
                R(rows.map((r) => ({ ...r, date: e.target.value })));
              }}
            />
          </label>
          <label className="form-field">
            工厂
            <input
              value={f.factory}
              onChange={(e) => F({ ...f, factory: e.target.value })}
            />
          </label>
          <label className="form-field">
            {f.mode === "import"
              ? "导入 XLSX / CSV（选择后自动预览）"
              : "导入序列号文件（切换导入模式）"}
            <input
              disabled={f.mode !== "import"}
              type="file"
              accept=".xlsx,.csv"
              onChange={async (e) => {
                try {
                  const list = await readWorkbook(e.target.files[0]);
                  R(
                    list.map((r) => ({
                      serial:
                        r.enterpriseSerial ||
                        r.serial ||
                        r["序列号"] ||
                        r["电池编号"],
                      date:
                        r.productionDate || r.date || r["生产日期"] || f.date,
                    })),
                  );
                  T("");
                } catch (err) {
                  notify(err.message);
                }
                e.target.value = "";
              }}
            />
          </label>
        </div>
        {f.mode === "import" && (
          <button
            type="button"
            className="text-btn"
            onClick={() =>
              download(
                "production-template.csv",
                "enterpriseSerial,productionDate\nPLANT-000001," +
                  f.date +
                  "\nPLANT-000002," +
                  f.date,
                "text/csv",
              )
            }
          >
            下载列名示例 CSV
          </button>
        )}
        {f.mode === "import" && (
          <label className="form-field">
            导入已有电池编号（每行一个；可选第二列生产日期）
            <textarea
              rows={5}
              value={text}
              onChange={(e) => parse(e.target.value)}
              placeholder="粘贴已有电池编号，每行一条"
            />
          </label>
        )}
        <div className="wf-summary">
          <strong>{generated.length} 条电池</strong>
          <span>{bad.length} 条错误</span>
          <span>
            {f.mode === "generate"
              ? "每块电池一个编号，二维码自动生成"
              : "导入后自动检查重复编号并生成二维码"}
          </span>
        </div>
        <div className="import-preview">
          {preview.slice(0, 10).map((r, n) => (
            <div key={n}>
              <span>{r.serial}</span>
              <span>{r.date}</span>
              <span>{r.error || "可创建"}</span>
            </div>
          ))}
        </div>
        <div className="modal-foot">
          <button type="button" className="outline" onClick={close}>
            取消
          </button>
          <button
            className="primary"
            type="submit"
            disabled={!generated.length || bad.length > 0}
          >
            确认建档 {generated.length} 块
          </button>
        </div>
      </form>
    </Dialog>
  );
}
function MaterialChange({ db, dialog, change, close }) {
  const batch = db.productionBatches.find((b) => b.id === dialog.batch.id),
    [value, V] = useState(batch.materialId),
    versions = db.materialVersions.filter((v) => v.modelId === batch.modelId);
  return (
    <Dialog title="更换批次适用资料版本" close={close}>
      <label className="form-field">
        资料版本
        <select value={value} onChange={(e) => V(e.target.value)}>
          {versions.map((v) => (
            <option key={v.id} value={v.id}>
              v{v.version} · {date(v.createdAt)}
            </option>
          ))}
        </select>
      </label>
      <div className="info-banner">
        <AlertTriangle size={16} />
        仅影响此批次的内部待发布数据。已发布护照继续显示原快照，重新审核发布后才会更新。
      </div>
      <div className="modal-foot">
        <button className="outline" onClick={close}>
          取消
        </button>
        <button
          className="primary"
          onClick={async () => {
            if (
              await change((d) => {
                const b = d.productionBatches.find((x) => x.id === batch.id);
                b.materialId = value;
                d.instances
                  .filter((i) => i.productionBatchId === batch.id)
                  .forEach((i) => {
                    i.materialId = value;
                    i.status = "草稿";
                  });
                log(d, "变更批次适用版本", batch.name);
              }, "批次资料版本已变更，等待重新发布")
            )
              close();
          }}
        >
          确认应用到本批次
        </button>
      </div>
    </Dialog>
  );
}
function Measurement({ db, dialog, change, notify, close }) {
  const instance = dialog.instance,
    [source, S] = useState("人工录入"),
    [rows, R] = useState(
      instance
        ? [
            {
              serial: instance.serial,
              soh: "",
              cycles: "",
              measuredAt: new Date(
                Date.now() - new Date().getTimezoneOffset() * 60000,
              )
                .toISOString()
                .slice(0, 16),
            },
          ]
        : [],
    );
  const set = (k, v) => R([{ ...rows[0], [k]: v }]);
  return (
    <Dialog
      title={instance ? "追加单体运行数据" : "导入运行数据"}
      close={close}
    >
      <label className="form-field">
        数据来源
        <input
          required
          value={source}
          onChange={(e) => S(e.target.value)}
          placeholder="BMS / 检测记录 / 人工录入"
        />
      </label>
      {instance ? (
        <div className="form-grid">
          <label className="form-field">
            SOH（%）
            <input
              type="number"
              min="0"
              max="100"
              value={rows[0].soh}
              onChange={(e) => set("soh", e.target.value)}
            />
          </label>
          <label className="form-field">
            循环次数
            <input
              type="number"
              min="0"
              step="1"
              value={rows[0].cycles}
              onChange={(e) => set("cycles", e.target.value)}
            />
          </label>
          <label className="form-field">
            测量时间
            <input
              type="datetime-local"
              value={rows[0].measuredAt}
              onChange={(e) => set("measuredAt", e.target.value)}
            />
          </label>
        </div>
      ) : (
        <>
          <p className="muted">
            XLSX 列名：serial、soh、cycles、measuredAt。测量时间使用 ISO
            格式，整批检查通过后写入。
          </p>
          <input
            type="file"
            accept=".xlsx"
            onChange={async (e) => {
              try {
                R(await readWorkbook(e.target.files[0]));
              } catch (err) {
                notify(err.message);
              }
              e.target.value = "";
            }}
          />
          <div className="import-preview">
            {rows.slice(0, 10).map((r, n) => (
              <div key={n}>
                <span>{r.serial}</span>
                <span>
                  {r.soh}% / {r.cycles}
                </span>
                <span>{r.measuredAt}</span>
              </div>
            ))}
          </div>
        </>
      )}
      <div className="inline-note">
        仅追加测量历史，最新测量时间决定当前值。外部护照在重新发布前保持原版本。
      </div>
      <div className="modal-foot">
        <button className="outline" onClick={close}>
          取消
        </button>
        <button
          className="primary"
          disabled={!rows.length}
          onClick={async () => {
            if (
              await change(
                (d) => addMeasurements(d, rows, source),
                "运行数据已追加，原发布版本保持不变",
              )
            )
              close();
          }}
        >
          确认追加 {rows.length} 条
        </button>
      </div>
    </Dialog>
  );
}
