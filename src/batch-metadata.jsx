import React, { useState } from "react";
import { log } from "./data";
import { evidenceIssues } from "./field-map";
import { CustomValues } from './custom-fields';
export default function BatchMetadata({ db, change, batchId, close }) {
  const batch = db.productionBatches.find((b) => b.id === batchId),
    [date, D] = useState(batch.date),
    [factory, F] = useState(batch.factory || ""),
    [reason, R] = useState("");
  const model = db.models.find(m => m.id === batch.modelId);
  const [customValues, CV] = useState(batch.customValues || {});
  const count = db.instances.filter(
    (i) => i.productionBatchId === batchId,
  ).length;
  return (
    <div className="modal-backdrop">
      <section className="modal" role="dialog" aria-label="修改批次信息">
        <h2>{batch.name}</h2>
        <p>影响本批次 {count} 块电池。序列号和二维码不变。</p>
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            if (
              await change((d) => {
                const b = d.productionBatches.find((b) => b.id === batchId);
                if (
                  (b.date !== date || b.factory !== factory) &&
                  !reason.trim()
                )
                  throw Error("请填写生产信息纠错原因");
                if (
                  (b.evidenceSnapshots || []).some(
                    (r) =>
                      r.factory !== factory || r.from > date || r.to < date,
                  )
                )
                  throw Error(
                    "变更后的工厂或日期超出原依据范围，请新建对应批次或先处理适用依据",
                  );
                b.date = date;
                b.factory = factory;
                b.customValues = customValues;
                d.instances
                  .filter((i) => i.productionBatchId === batchId)
                  .forEach((i) => {
                    i.date = date;
                    i.status = "草稿";
                    const c = d.codeRecords.find((c) => c.instanceId === i.id);
                    if (c) c.productionDate = date;
                  });
                log(d, "修改批次信息", b.name + " · " + reason);
              }, "批次信息已同步更新")
            )
              close();
          }}
        >
          <label className="form-field">
            生产日期
            <input
              type="date"
              required
              value={date}
              onChange={(e) => D(e.target.value)}
            />
          </label>
          <label className="form-field">
            工厂
            <input value={factory} onChange={(e) => F(e.target.value)} />
          </label>
          <div className="modal-foot">
            <CustomValues definitions={model?.customFields} level="batch" values={customValues} onChange={CV} />
            <label className="form-field">
              生产信息纠错原因
              <input value={reason} onChange={(e) => R(e.target.value)} />
            </label>
            <button type="button" className="outline" onClick={close}>
              取消
            </button>
            <button className="primary">保存并更新本批次</button>
          </div>
        </form>
      </section>
    </div>
  );
}
