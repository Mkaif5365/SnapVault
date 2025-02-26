export function applyFilter(imageData: string, filter: string): string {
  const canvas = document.createElement('canvas');
  const img = new Image();
  
  return new Promise((resolve) => {
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) return resolve(imageData);

      ctx.drawImage(img, 0, 0);

      switch (filter) {
        case 'sepia':
          ctx.filter = 'sepia(100%)';
          break;
        case 'grainy':
          ctx.filter = 'contrast(150%) brightness(90%)';
          break;
        case 'blackAndWhite':
          ctx.filter = 'grayscale(100%)';
          break;
        case 'vintage':
          ctx.filter = 'sepia(50%) contrast(85%) brightness(90%) saturate(85%)';
          break;
        case 'blur':
          ctx.filter = 'blur(2px)';
          break;
        case 'cool':
          ctx.filter = 'hue-rotate(180deg)';
          break;
        case 'warm':
          ctx.filter = 'sepia(30%) saturate(140%)';
          break;
        default:
          ctx.filter = 'none';
      }

      ctx.drawImage(img, 0, 0);
      resolve(canvas.toDataURL('image/jpeg'));
    };
    img.src = imageData;
  });
}
