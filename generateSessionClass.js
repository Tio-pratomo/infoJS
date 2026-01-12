/**
 * @module
 * Module ini berisi function untuk :
 * generate berapa banyak sesi pembelajaran yang ada pada konten
 */

/**
 * @param {number} [countSession] - banyaknya sesi
 * @param {string} link - link untuk sesi tersebut
 * @returns {Array<string>} - contoh /js-dom/sesi1 dimana 1 merupakan value
 */

export function generateSessionClass(countSession = 1, link) {
  const countOfSession = [...Array(countSession)].map((_, index) => index + 1);
  return countOfSession.map((value) => link + value);
}
