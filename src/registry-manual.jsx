import React, {useEffect, useRef, useState} from 'react';
import {ArrowLeft, ArrowUpRight, BookOpen, Download, ExternalLink, Menu, Printer, X, ZoomIn} from 'lucide-react';
import {chapters, manualSource} from './registry-manual-data.js';
import images from './registry-manual-images.json';
import './registry-manual.css';

function External({href, children}) {
  return <a href={href} target="_blank" rel="noopener noreferrer">{children}<ExternalLink size={15}/></a>;
}

export default function RegistryManual({navigate}) {
  const [active, setActive] = useState(chapters[0].id);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [figure, setFigure] = useState(null);
  const closeRef = useRef(null);
  const lastFocus = useRef(null);
  const [printing, setPrinting] = useState(false);

  async function printManual() {
    setPrinting(true);
    try {
      await document.fonts.ready;
      await Promise.all(Array.from(document.querySelectorAll('.manual-figure-button img')).map(image => image.decode()));
      window.print();
    } catch {
      window.alert('部分截图尚未载入，请刷新页面后再打印。');
    } finally {
      setPrinting(false);
    }
  }

  useEffect(() => {
    const observer = new IntersectionObserver(entries => {
      const visible = entries.filter(entry => entry.isIntersecting).sort((a,b) => a.boundingClientRect.top-b.boundingClientRect.top);
      if (visible[0]) setActive(visible[0].target.id.replace('manual-', ''));
    }, {rootMargin: '-80px 0px -60% 0px', threshold: 0});
    document.querySelectorAll('.registry-manual-chapter').forEach(node => observer.observe(node));
    if (location.hash.startsWith('#manual-')) requestAnimationFrame(() => document.getElementById(location.hash.slice(1))?.scrollIntoView());
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!figure) return;
    lastFocus.current = document.activeElement;
    closeRef.current?.focus();
    const onKey = event => {
      if (event.key === 'Escape') setFigure(null);
      if (event.key === 'Tab') {event.preventDefault(); closeRef.current?.focus();}
    };
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', onKey);
      lastFocus.current?.focus();
    };
  }, [figure]);

  return <div className="registry-manual">
    <div className="manual-toolbar">
      <button className="outline" onClick={() => navigate('/admin/insights?category=regulations')}><ArrowLeft size={17}/>返回法规与登记</button>
      <div><a className="outline" href={manualSource.pdf} download="DPP-Registry-User-Guide-v1.03.pdf"><Download size={17}/>英文原件</a><button className="primary" disabled={printing} onClick={printManual}><Printer size={17}/>{printing?'正在准备打印…':'打印 / 另存 PDF'}</button></div>
    </div>
    <div className="manual-heading"><span><BookOpen size={19}/>中文图文手册</span><h1>DPP Registry 经济运营者用户指南</h1><p>从 EU Login、组织验证到数字产品护照登记</p><div>{manualSource.version}<i/>原版发布 {manualSource.published}<i/>非官方中文译本</div></div>
    <aside className="manual-version-note" aria-label="版本提示"><strong>阅读前请确认版本</strong><p>本译本对应 DG Grow Digital Solutions 发布的 2026-09-16 版指南。包括“电池登记暂不能成功”、100 条批量限制等描述，均属于该版内容，不能据此直接判断当前 Registry 的运行状态。实际办理请核对官方最新手册和界面。</p><External href={manualSource.official}>查看官方最新文件</External></aside>
    <div className="manual-environments"><div><strong>原文所列正式入口</strong><External href={manualSource.production}>打开正式站点</External><small>核对页脚 Production 环境标识</small></div><div><strong>测试环境入口</strong><External href={manualSource.test}>打开测试站点</External><small>独立账户与数据，不迁移至正式环境</small></div></div>
    <div className="manual-layout">
      <nav className={'manual-toc '+(mobileMenu?'expanded':'')} aria-label="手册章节目录"><button className="manual-toc-toggle" onClick={() => setMobileMenu(!mobileMenu)} aria-expanded={mobileMenu}><Menu size={18}/>章节目录</button><div><strong>章节目录</strong>{chapters.map((chapter,index) => <a key={chapter.id} href={'#manual-'+chapter.id} className={active===chapter.id?'selected':''} aria-current={active===chapter.id?'location':undefined} onClick={() => {setActive(chapter.id); setMobileMenu(false);}}><span>{String(index+1).padStart(2,'0')}</span>{chapter.title}</a>)}<p>页码为原文印刷页码。PDF 文件页序比印刷页码多 1 页。</p></div></nav>
      <div className="manual-body">
        <div className="manual-editor-note"><strong>编者说明</strong><p>中文正文按原文内容翻译并重新排版；英文按钮名、错误消息、证书属性和数值保留供核对。截图来自原始手册，保持英文界面，图注为中文。此处的编者提示与原文译文分别呈现。普通手写签名图片不等于 QES/QSeal。</p></div>
        {chapters.map((chapter,index) => <section id={'manual-'+chapter.id} key={chapter.id} className="registry-manual-chapter"><div className="manual-chapter-heading"><span>第 {index+1} 章</span><h2>{chapter.title}</h2><small>原文第 {chapter.pages[0].p}{chapter.pages.length>1?'–'+chapter.pages.at(-1).p:''} 页</small></div>
          {chapter.pages.map(page => <article className={'manual-source-page '+(page.kind||'')} id={'manual-page-'+page.p} key={page.p}>
            <div className="manual-page-heading"><h3>{page.title}</h3><a href={`${manualSource.pdf}#page=${page.p+1}`} target="_blank" rel="noopener noreferrer" title="新窗口核对原文">原文 p.{page.p}<ArrowUpRight size={14}/></a></div>
            {page.text?.map(text => <p key={text}>{text}</p>)}
            {page.list && <ol>{page.list.map(item => <li key={item}>{item}</li>)}</ol>}
            {page.fields && <div className="manual-table-wrap"><table><thead><tr><th>中文名称</th><th>英文原名</th><th>要求 / 定义</th><th>注意事项 / 说明</th></tr></thead><tbody>{page.fields.map(([zh,en,requirement,note]) => <tr key={en}><th scope="row">{zh}</th><td lang="en">{en}</td><td>{requirement}</td><td>{note}</td></tr>)}</tbody></table></div>}
            {page.errors && <div className="manual-errors">{page.errors.map(([en,zh,action]) => <div key={en}><blockquote lang="en">{en}</blockquote><p><strong>中文含义：</strong>{zh}</p><p><strong>处理办法：</strong>{action}</p></div>)}</div>}
            {page.links?.map(([label,href]) => <External key={href} href={href}>{label}</External>)}
            {images[String(page.p)]?.map((image,imageIndex) => <figure key={image.src}><button type="button" className="manual-figure-button" onClick={() => setFigure({...image, caption:`${page.caption||page.title}${images[String(page.p)].length>1?' · 图 '+(imageIndex+1):''}（原文第 ${page.p} 页）`})} aria-label={'放大图片：'+(page.caption||page.title)}><img src={image.src} width={image.width} height={image.height} alt={`${page.caption||page.title}，官方手册原图 ${imageIndex+1}`}/><span><ZoomIn size={16}/>放大查看</span></button><figcaption>{page.caption||page.title}{images[String(page.p)].length>1?' · 图 '+(imageIndex+1):''} · 原文第 {page.p} 页</figcaption></figure>)}
          </article>)}
        </section>)}
        <footer className="manual-source-footer"><strong>原文与译本说明</strong><p>原文：{manualSource.title}，{manualSource.author}，{manualSource.version}，{manualSource.published}。本中文版为非官方译本，非欧委会发布的中文文件，也不构成登记成功或合规证明。原始文件中的链接及所引用法规以官方有效版本为准。</p><External href={manualSource.official}>官方用户指南</External></footer>
      </div>
    </div>
    {figure && <div className="manual-lightbox" role="dialog" aria-modal="true" aria-label="官方截图放大查看" onClick={() => setFigure(null)}><button ref={closeRef} className="manual-lightbox-close" onClick={() => setFigure(null)} aria-label="关闭图片"><X size={23}/></button><figure onClick={event=>event.stopPropagation()}><img src={figure.src} alt={figure.caption}/><figcaption>{figure.caption}</figcaption></figure></div>}
  </div>;
}
