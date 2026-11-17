// Thumbnails only: full-resolution croquis retain their original URL.
export function thumbnail(src, width = 720) {
  if (!src) return src
  try {
    const url = new URL(src)
    if (url.hostname !== 'res.cloudinary.com' || !/\/image\/upload\/v\d+\//.test(url.pathname)) return src
    url.pathname = url.pathname.replace('/image/upload/', `/image/upload/f_auto,q_auto,c_limit,w_${width}/`)
    return url.href
  } catch { return src }
}
