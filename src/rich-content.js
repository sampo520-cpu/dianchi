const allowedTags = new Set(['P', 'BR', 'STRONG', 'B', 'EM', 'I', 'U', 'UL', 'OL', 'LI', 'H3', 'BLOCKQUOTE', 'A', 'IMG']);

export function sanitizeRichHtml(html = '') {
  if (typeof document === 'undefined') return '';
  const template = document.createElement('template');
  template.innerHTML = String(html);
  const clean = node => {
    for (const child of [...node.childNodes]) {
      if (child.nodeType === Node.COMMENT_NODE) { child.remove(); continue; }
      if (child.nodeType !== Node.ELEMENT_NODE) continue;
      if (!allowedTags.has(child.tagName)) {
        if (['SCRIPT','STYLE','IFRAME','OBJECT','EMBED','SVG','MATH','TEMPLATE'].includes(child.tagName)) child.remove();
        else { clean(child); child.replaceWith(...child.childNodes); }
        continue;
      }
      for (const attr of [...child.attributes]) {
        const safeLink = child.tagName === 'A' && attr.name === 'href' && /^https:\/\//i.test(attr.value);
        const safeImage = child.tagName === 'IMG' && attr.name === 'src' && (/^https:\/\//i.test(attr.value) || /^data:image\/(png|jpeg|webp|gif);base64,/i.test(attr.value));
        if (!safeLink && !safeImage && !(child.tagName === 'IMG' && ['alt', 'width'].includes(attr.name))) child.removeAttribute(attr.name);
      }
      if (child.tagName === 'A') child.setAttribute('rel', 'noopener noreferrer');
      if (child.tagName === 'IMG') child.style.cssText = 'display:block;max-width:100%;height:auto;margin:10px 0';
      clean(child);
    }
  };
  clean(template.content);
  return template.innerHTML;
}
