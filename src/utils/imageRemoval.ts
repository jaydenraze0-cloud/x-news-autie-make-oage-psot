/**
 * Removes solid black background from an image on an HTML5 canvas:
 * For every pixel, alpha = max(r, g, b) and color = white (#FFFFFF),
 * so black (#000) becomes fully transparent and white shapes remain pure white.
 */
export async function removeBlackBackground(imageSrc: string): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = img.width || 200;
        canvas.height = img.height || 200;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(imageSrc);
          return;
        }
        ctx.drawImage(img, 0, 0);
        const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imgData.data;
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          // Compute lightness / max channel
          const maxVal = Math.max(r, g, b);
          let alpha = maxVal;
          if (maxVal < 18) {
            alpha = 0;
          }
          // Make the remaining visible shape crisp white
          data[i] = 255;
          data[i + 1] = 255;
          data[i + 2] = 255;
          data[i + 3] = alpha;
        }
        ctx.putImageData(imgData, 0, 0);
        const dataUrl = canvas.toDataURL('image/png');
        resolve(dataUrl);
      } catch (err) {
        console.warn('Failed to process image transparency, falling back:', err);
        resolve(imageSrc);
      }
    };
    img.onerror = (err) => {
      console.warn('Image failed to load for black removal, falling back to original:', err);
      resolve(imageSrc);
    };
    img.src = imageSrc;
  });
}
