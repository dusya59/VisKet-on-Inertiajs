export const postPreviewsCache = {}

export function addToCache(postId, data) {
  postPreviewsCache[postId] = data
}

export function getFromCache(postId) {
  return postPreviewsCache[postId]
}

export function isInCache(postId) {
  return !!postPreviewsCache[postId] && postPreviewsCache[postId] !== 'loading'
}

export function isLoading(postId) {
  return postPreviewsCache[postId] === 'loading'
}
