import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync, existsSync} from 'node:fs';
import {chapters, manualSource} from './registry-manual-data.js';

test('translated guide covers all ten chapters and printed source pages without gaps', () => {
  assert.equal(chapters.length,10);
  assert.deepEqual(chapters.flatMap(chapter=>chapter.pages.map(page=>page.p)),Array.from({length:61},(_,index)=>index+2));
  assert.equal(new Set(chapters.map(chapter=>chapter.id)).size,10);
  assert.equal(manualSource.version,'v1.03');
});

test('all original illustrations and source PDF are available locally', () => {
  const images=JSON.parse(readFileSync(new URL('./registry-manual-images.json',import.meta.url),'utf8'));
  for (const list of Object.values(images)) for (const image of list) {
    assert.ok(existsSync(new URL('../public'+image.src,import.meta.url)),image.src);
    assert.ok(image.width>0 && image.height>0);
  }
  assert.ok(existsSync(new URL('../public'+manualSource.pdf,import.meta.url)));
});

test('version-sensitive constraints and qualified signing requirements remain explicit', () => {
  const text=JSON.stringify(chapters);
  for (const item of ['2026-09-16','100','1 GB','2000','PAdES','QESig','QESeal','.p12/.pfx','2.5.4.97','PROCESSING','correlation ID']) assert.ok(text.includes(item),item);
  const errors=chapters.flatMap(chapter=>chapter.pages.flatMap(page=>page.errors||[]));
  assert.ok(errors.length>=30);
  assert.ok(errors.every(row=>row.length===3 && row.every(Boolean)));
});
