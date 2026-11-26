import React, {useState} from 'react';
import {QRCodeSVG} from 'qrcode.react';
import {codeStatus} from './code-status.js';
import {id, log, download} from './data.js';

const columns=[['serial','电池编号','Battery identifier'],['model','产品','Product'],['batch','批次','Batch'],['date','生产日期','Manufacturing date'],['status','访问状态','Status'],['url','扫码链接','QR URL'],['created','创建时间','Created at'],['voided','作废时间','Voided at'],['reason','作废原因','Void reason']];
const defaults={fields:columns.map(c=>c[0]),language:'zh',pixels:1024,withSerial:true,cols:3,rows:8,margin:7,gap:2};
export default function ExportSettings({db,change,notify,close,modelId,rows,filtered,selected=[],kind='xlsx',batchId}) {
  const model=db.models.find(m=>m.id===modelId);
  const [settings,S]=useState({...defaults,...model?.exportSettings});
  const [type,T]=useState(kind),[scope,R]=useState(selected.length?'selected':'filtered'),[busy,B]=useState(false),[error,E]=useState('');
  const source=scope==='selected'?filtered.filter(i=>selected.includes(i.id)):scope==='all'?rows:filtered;
  const records=source.map(i=>{const c=db.codeRecords.find(c=>c.instanceId===i.id)||{};return {instance:i,serial:i.serial,model:model?.name||'',batch:db.productionBatches.find(b=>b.id===i.productionBatchId)?.name||'',date:i.date,status:codeStatus(db,i),url:c.resolverUrl||location.origin+'/passport/'+encodeURIComponent(i.passportId||i.id),created:c.createdAt||'',voided:c.voidedAt||'',reason:c.voidReason||''};});
  const set=(key,value)=>S({...settings,[key]:value});
  const perPage=settings.cols*settings.rows;
  async function output(){
    E('');B(true);
    try {
      if(!records.length)throw Error('当前范围没有可导出的码');
      if(type==='xlsx'){
        if(!settings.fields.length)throw Error('请至少选择一个导出字段');
        const Excel=(await import('exceljs')).default,wb=new Excel.Workbook(),sheet=wb.addWorksheet('Battery codes');
        const fields=settings.fields.map(key=>columns.find(c=>c[0]===key)).filter(Boolean);
        sheet.columns=fields.map(c=>({header:c[settings.language==='zh'?1:2],key:c[0],width:c[0]==='url'?65:25}));
        records.forEach(r=>sheet.addRow(r));sheet.getRow(1).font={bold:true};sheet.views=[{state:'frozen',ySplit:1}];
        download('battery-codes.xlsx',new Blob([await wb.xlsx.writeBuffer()]),'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      }else{
        const QR=(await import('qrcode')).default;
        const canvasFor=async(r)=>{const canvas=document.createElement('canvas');await QR.toCanvas(canvas,r.url,{width:settings.pixels,margin:2});if(!settings.withSerial)return canvas;const out=document.createElement('canvas');out.width=canvas.width;out.height=canvas.height+80;const ctx=out.getContext('2d');ctx.fillStyle='white';ctx.fillRect(0,0,out.width,out.height);ctx.drawImage(canvas,0,0);ctx.fillStyle='#172c40';ctx.font='28px Arial';ctx.textAlign='center';ctx.fillText(r.serial,out.width/2,out.height-28,out.width-30);return out;};
        if(type==='zip'){
          const Zip=(await import('jszip')).default,zip=new Zip();
          for(const r of records){const canvas=await canvasFor(r);zip.file(r.serial.replace(/[<>:"/\\|?*]/g,'_')+'.png',canvas.toDataURL('image/png').split(',')[1],{base64:true});}
          download('battery-qr.zip',await zip.generateAsync({type:'blob'}),'application/zip');
        }else{
          const {jsPDF}=await import('jspdf'),pdf=new jsPDF({unit:'mm',format:'a4'});
          const w=(210-settings.margin*2-(settings.cols-1)*settings.gap)/settings.cols,h=(297-settings.margin*2-(settings.rows-1)*settings.gap)/settings.rows;
          if(w<30||h<25)throw Error('标签尺寸过小，请减少行列数、边距或间距');
          for(let n=0;n<records.length;n++){if(n&&n%perPage===0)pdf.addPage();const p=n%perPage,x=settings.margin+p%settings.cols*(w+settings.gap),y=settings.margin+Math.floor(p/settings.cols)*(h+settings.gap),r=records[n];
            const canvas=document.createElement('canvas');canvas.width=600;canvas.height=Math.round(600*h/w);const ctx=canvas.getContext('2d');ctx.fillStyle='white';ctx.fillRect(0,0,canvas.width,canvas.height);const qr=await canvasFor(r);const size=Math.min(canvas.height-65,canvas.width*.55);ctx.drawImage(qr,12,12,size,size);ctx.fillStyle='#172c40';ctx.font='18px Arial';ctx.fillText(r.serial,12,canvas.height-12,canvas.width-24);ctx.font='16px Arial';ctx.fillText(model?.chem||'',size+18,36,canvas.width-size-25);ctx.fillText(r.date||'',size+18,62,canvas.width-size-25);pdf.addImage(canvas.toDataURL('image/png'),'PNG',x,y,w,h);
          }pdf.save('battery-labels.pdf');
        }
      }
      await change(d=>{d.exportJobs||=[];d.exportJobs.push({id:id('EXPORT'),modelId,batchId,type,count:records.length,instanceIds:source.map(i=>i.id),settings:{...settings},createdAt:new Date().toISOString()});log(d,'导出码资料',type+' · '+records.length+' 条');},'已生成下载文件');
    }catch(err){E(err.message);}finally{B(false);}
  }
  return <div className="modal-backdrop"><section className="modal wide" role="dialog" aria-label="导出设置"><div className="modal-head"><h2>导出设置</h2><button onClick={close} aria-label="关闭">×</button></div>
    <div className="form-grid"><label className="form-field">导出类型<select value={type} onChange={e=>T(e.target.value)}><option value="xlsx">Excel 清单</option><option value="pdf">A4 标签 PDF</option><option value="zip">二维码 ZIP</option></select></label><label className="form-field">导出范围<select value={scope} onChange={e=>R(e.target.value)}><option value="selected" disabled={!selected.length}>已勾选记录（{selected.length}）</option><option value="filtered">当前筛选结果（{filtered.length}）</option><option value="all">{batchId?'当前批次全部':'当前产品全部'}（{rows.length}）</option></select></label></div>
    {type==='xlsx'?<><label className="form-field">列标题语言<select value={settings.language} onChange={e=>set('language',e.target.value)}><option value="zh">中文</option><option value="en">English</option></select></label><div className="export-field-list">{columns.map(c=><label key={c[0]}><input type="checkbox" checked={settings.fields.includes(c[0])} onChange={e=>set('fields',e.target.checked?[...settings.fields,c[0]]:settings.fields.filter(k=>k!==c[0]))}/>{c[1]}</label>)}</div></>:<><label className="form-field">二维码图片尺寸<select value={settings.pixels} onChange={e=>set('pixels',Number(e.target.value))}>{[512,1024,2048].map(n=><option key={n} value={n}>{n} px</option>)}</select></label><label><input type="checkbox" checked={settings.withSerial} onChange={e=>set('withSerial',e.target.checked)}/>二维码附带电池编号</label>{type==='pdf'&&<div className="form-grid">{[['cols','每页列数',1,5],['rows','每页行数',1,10],['margin','页边距 mm',2,20],['gap','标签间距 mm',0,10]].map(([key,title,min,max])=><label className="form-field" key={key}>{title}<input type="number" min={min} max={max} value={settings[key]} onChange={e=>set(key,Math.max(min,Math.min(max,Number(e.target.value)||min)))}/></label>)}</div>}</>}
    <h3>导出预览 · {records.length} 条{type==='pdf'?' · '+Math.ceil(records.length/perPage)+' 页':''}</h3><div className="export-preview">{type==='xlsx'?<table><thead><tr>{settings.fields.map(k=><th key={k}>{columns.find(c=>c[0]===k)?.[settings.language==='zh'?1:2]}</th>)}</tr></thead><tbody>{records.slice(0,3).map(r=><tr key={r.instance.id}>{settings.fields.map(k=><td key={k}>{r[k]}</td>)}</tr>)}</tbody></table>:records.slice(0,3).map(r=><div className="export-qr-preview" key={r.instance.id}><QRCodeSVG value={r.url} size={88}/>{settings.withSerial&&<span>{r.serial}</span>}{type==='pdf'&&<small>{model?.chem} · {r.date}</small>}</div>)}</div>
    {error&&<p role="alert">{error}</p>}<div className="modal-foot"><button className="outline" disabled={busy} onClick={async()=>{await change(d=>{d.models.find(m=>m.id===modelId).exportSettings=settings;},'已保存为产品常用导出设置');}}>保存为常用设置</button><button className="outline" disabled={busy} onClick={close}>关闭</button><button className="primary" disabled={busy||!records.length} onClick={output}>{busy?'正在生成…':'下载文件（'+records.length+'）'}</button></div>
  </section></div>;
}
