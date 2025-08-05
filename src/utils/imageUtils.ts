export const getProxiedImageUrl = (imageUrl: string | undefined | null): string | undefined => {
  if (!imageUrl) return undefined;
  
  // If it's already a relative URL or data URL, return as is
  if (imageUrl.startsWith('/') || imageUrl.startsWith('data:')) {
    return imageUrl;
  }
  
  // For external URLs, use our proxy
  return `/api/image-proxy?url=${encodeURIComponent(imageUrl)}`;
};