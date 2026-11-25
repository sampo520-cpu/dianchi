import React, { useState } from "react";
import { id, log } from "./data";
const names = { carbon: "碳足迹", recycled: "再生材料", diligence: "尽职调查" };
export default function ApplicableMaterials({ db, change, modelId, notify }) {
  const [f, F] = useState({
    kind: "carbon",
    name: "",
    factory: "",
    from: "",
    to: "",
    value: "",
    documentId: "",
  });
  const model = db.models.find((m) => m.id === modelId),
    rows = (db.applicableMaterials || []).filter((r) => r.modelId === modelId);
  return (
    <section>
      <h2>适用资料</h2>
      <p>按工厂和覆盖期间匹配生产批次；数值与结论由企业提供，关联依据文件。</p>
      <div className="form-grid">
        {Object.entries(names).map(([k, label]) => (
          <label key={k}>
            <input
              type="checkbox"
              checked={!!model[k + "Applicable"]}
              onChange={(e) =>
                change((d) => {
                  d.models.find((m) => m.id === modelId)[k + "Applicable"] =
                    e.target.checked;
                }, "适用条件已保存")
              }
            />
            {label}资料适用（演示配置）
          </label>
        ))}
      </div>
      <table>
        <thead>
          <tr>
            <th>资料</th>
            <th>工厂 / 期间</th>
            <th>依据</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id}>
              <td>
                {names[r.kind]} · {r.name}
              </td>
              <td>
                {r.factory}
                <small>
                  {r.from} 至 {r.to}
                </small>
              </td>
              <td>
                {db.documents.find((d) => d.id === r.documentId)?.name ||
                  "文件缺失"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          if (f.from > f.to) return notify("覆盖期间无效");
          if (
            await change((d) => {
              d.applicableMaterials.push({
                ...f,
                id: id("EVIDENCE"),
                modelId,
                access: "公开",
                createdAt: new Date().toISOString(),
              });
              log(d, "新增适用资料", f.name);
            }, "资料已保存；既有批次保留原依据")
          )
            F({ ...f, name: "", value: "" });
        }}
      >
        <div className="form-grid">
          <label className="form-field">
            类型
            <select
              value={f.kind}
              onChange={(e) => F({ ...f, kind: e.target.value })}
            >
              {Object.entries(names).map(([k, v]) => (
                <option key={k} value={k}>
                  {v}
                </option>
              ))}
            </select>
          </label>
          {[
            ["name", "资料名称"],
            ["factory", "适用工厂"],
            ["from", "覆盖开始"],
            ["to", "覆盖结束"],
            ["value", "公开声明内容（目标语言）"],
          ].map(([k, v]) => (
            <label className="form-field" key={k}>
              {v}
              <input
                required
                type={k === "from" || k === "to" ? "date" : "text"}
                value={f[k]}
                onChange={(e) => F({ ...f, [k]: e.target.value })}
              />
            </label>
          ))}
          <label className="form-field">
            依据文件
            <select
              required
              value={f.documentId}
              onChange={(e) => F({ ...f, documentId: e.target.value })}
            >
              <option value="">选择产品文件</option>
              {db.documents
                .filter((d) => d.target === modelId && d.access === "公开")
                .map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
            </select>
          </label>
        </div>
        <button className="primary">保存适用资料</button>
      </form>
    </section>
  );
}
