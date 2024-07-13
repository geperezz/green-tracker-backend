import sizeOf from 'image-size';

export function imageResize(img: string): [number, number] | [null, null] {
  const maxWidth = 420;
  const maxHeight = 420;
  const dimensions = sizeOf(img);
  if (!dimensions.height || !dimensions.width) return [null, null];

  let width = dimensions.width;
  let height = dimensions.height;
  const ratio = width / height;

  if (width > maxWidth) {
    width = maxWidth;
    height = Math.trunc(width / ratio);
  }
  if (height > maxHeight) {
    height = maxHeight;
    width = Math.trunc(height * ratio);
  }

  return [width, height];
}
