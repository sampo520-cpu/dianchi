"""Extract original guide illustrations and a source PDF for the Chinese manual."""
import json
import shutil
from pathlib import Path
import pymupdf

source = Path(r'E:/产品运营经理/行业版-行业解决方案/转标品/电池溯源码/欧盟电池护照法规文件/DPP注册用户指南.pdf')
target = Path(__file__).resolve().parents[1] / 'public' / 'registry-manual'
target.mkdir(parents=True, exist_ok=True)
shutil.copyfile(source, target / 'original-v1.03.pdf')
doc = pymupdf.open(source)
illustrations = {}
for index, page in enumerate(doc):
    if index < 2:
        continue
    figures = []
    for number, block in enumerate(page.get_text('dict')['blocks']):
        if block['type'] != 1:
            continue
        rect = pymupdf.Rect(block['bbox'])
        if rect.width < 80 or rect.height < 24:
            continue
        name = f'page-{index:02d}-figure-{number}.webp'
        pix = page.get_pixmap(matrix=pymupdf.Matrix(1.8, 1.8), clip=rect, alpha=False)
        pix.pil_save(str(target / name), format='WEBP', quality=90)
        figures.append({'src': '/registry-manual/' + name, 'width': pix.width, 'height': pix.height})
    if figures:
        illustrations[str(index)] = figures
output = target.parents[1] / 'src' / 'registry-manual-images.json'
output.write_text(json.dumps(illustrations, indent=2), encoding='utf-8')
print(f'Extracted {sum(map(len, illustrations.values()))} illustrations from {len(illustrations)} pages')
