// Media paths in content files are relative to src/assets,
// e.g. "/images/galleries/faces/1.jpg" → src/assets/images/galleries/faces/1.jpg

const images = import.meta.glob<{ default: ImageMetadata }>(
  '/src/assets/images/**/*.{jpg,jpeg,png,webp}',
);

const videos = import.meta.glob<{ default: string }>(
  '/src/assets/images/**/*.mp4',
);

export const resolveImage = async (path?: string) =>
  path ? (await images[`/src/assets${path}`]?.())?.default : undefined;

export const resolveVideo = async (path?: string) =>
  path ? (await videos[`/src/assets${path}`]?.())?.default : undefined;
