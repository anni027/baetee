"""Optimise existing product assets for the collage; preserve the originals."""
from pathlib import Path
from PIL import Image
root=Path(__file__).resolve().parents[1]
destination=root/'public/collage';destination.mkdir(exist_ok=True)
for folder in ['art','tee','collectible','objects','jackets','sneakers']:
 for path in (root/'public'/folder).glob('*'):
  if path.suffix.lower() not in ['.png','.webp','.jpg','.jpeg']:continue
  relative=path.relative_to(root/'public')
  name='-'.join(relative.parts).rsplit('.',1)[0]+'.webp'
  with Image.open(path) as image:
   image.thumbnail((240,300));image.convert('RGB').save(destination/name,'WEBP',quality=86)
print('Collage thumbnails prepared')
