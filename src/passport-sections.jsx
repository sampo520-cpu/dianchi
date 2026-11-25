import React from 'react';
import { FlaskConical, Gem, Scale, BookOpen, Info, ExternalLink, FileText, AlertTriangle, CircleAlert, Flame } from 'lucide-react';
import { sanitizeRichHtml } from './rich-content.js';
import {PassportText} from './passport-i18n';

export function SafetyContent({model, adminHints}) {
  return <PassportText><div className="ps-rich-block ps-safety-section"><h2><AlertTriangle aria-hidden="true"/>Safety and use{adminHints && <small className="ps-zh-label">警告、注意与应急</small>}</h2>
    {model.safetyEn && <div role="note" className="ps-notice ps-notice-danger"><h3><AlertTriangle aria-hidden="true"/>Warning{adminHints && <small>警告</small>}</h3><div dangerouslySetInnerHTML={{__html:sanitizeRichHtml(model.safetyEn)}}/></div>}
    {model.cautionEn && <div role="note" className="ps-notice ps-notice-caution"><h3><CircleAlert aria-hidden="true"/>Caution{adminHints && <small>注意</small>}</h3><div dangerouslySetInnerHTML={{__html:sanitizeRichHtml(model.cautionEn)}}/></div>}
    {model.extinguishingEn && <div role="note" className="ps-notice ps-notice-info"><h3><Flame aria-hidden="true"/>Emergency information{adminHints && <small>应急说明</small>}</h3><div dangerouslySetInnerHTML={{__html:sanitizeRichHtml(model.extinguishingEn)}}/></div>}
  </div></PassportText>;
}

const safeLink = url => /^https:\/\//i.test(url || '') ? url : undefined;
export function AdditionalPassportSections({model, adminHints}) {
  const blocks = [
    ['substanceStatementEn','Substance statement','有害物质及 SVHC 说明',FlaskConical],
    ['criticalMaterialsEn','Material disclosure','关键原材料说明',Gem],
    ['conformityEn','Legislation and responsibility','法规与责任说明',Scale],
    ['referenceInfoEn','Reference provenance','第三方参考来源',BookOpen],
  ];
  return <PassportText>
    {blocks.map(([key,title,zh,Icon])=>model[key] && <section className="ps-rich-block" key={key}><h2><Icon aria-hidden="true"/>{title}{adminHints && <small className="ps-zh-label">{zh}</small>}</h2><div dangerouslySetInnerHTML={{__html:sanitizeRichHtml(model[key])}}/></section>)}
    {!!model.regulatoryNotes?.length && <section className="ps-rich-block ps-regulatory-notes"><h2><Scale aria-hidden="true"/>Regulatory notes{adminHints && <small className="ps-zh-label">法规依据与适用注释</small>}</h2>{model.regulatoryNotes.map(note=><article className="ps-regulatory-note" key={note.id}>
      <h3><Info aria-hidden="true"/>{note.title}</h3><p className="ps-law-reference">{note.reference}</p><p>{note.text}</p>
      <div className="ps-note-meta">{safeLink(note.url) && <a href={safeLink(note.url)} target="_blank" rel="noopener noreferrer">Official source <ExternalLink size={16} aria-hidden="true"/></a>}{note.reviewedAt && <span>Reference date: {note.reviewedAt}</span>}</div>
    </article>)}</section>}
    {!!model.referenceLinks?.length && <section className="ps-rich-block"><h2><FileText aria-hidden="true"/>Related documents{adminHints && <small className="ps-zh-label">相关文件</small>}</h2><p>These documents belong to the reference supplier and are not evidence issued for Zhongqi.</p>{model.referenceLinks.map(doc=><div className="ps-reference-link" key={doc.id}>{safeLink(doc.url) ? <a href={safeLink(doc.url)} target="_blank" rel="noopener noreferrer">{doc.label}<ExternalLink size={18} aria-hidden="true"/></a> : <span>{doc.label}</span>}</div>)}</section>}
    {model.disclaimerEn && <div role="note" className="ps-source-disclaimer"><h3><Info aria-hidden="true"/>Information notice</h3><div dangerouslySetInnerHTML={{__html:sanitizeRichHtml(model.disclaimerEn)}}/></div>}
  </PassportText>;
}
