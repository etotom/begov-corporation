// Фото в /public/hero меняются под тем же именем файла — без версии браузер и
// CDN могут годами отдавать старую закэшированную картинку. Бампните это число
// при каждой замене файлов в public/hero, чтобы кэш точно сбросился у всех.
export const HERO_ASSET_VERSION = "2";

export function heroAsset(path: string): string {
  return `${path}?v=${HERO_ASSET_VERSION}`;
}
