import React, { useState, useEffect } from 'react';
import { resolveAndCacheImageUrl, getMemoryCachedUrl } from '../utils/indexedDBImageCache';

interface CachedGearImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  fallbackSrc?: string;
  alt: string;
  className?: string;
  showCacheBadge?: boolean;
}

export const CachedGearImage: React.FC<CachedGearImageProps> = ({
  src,
  fallbackSrc = '/images/products/travel-backpack.jpg',
  alt,
  className = '',
  showCacheBadge = false,
  ...props
}) => {
  const initialCached = getMemoryCachedUrl(src);
  const [currentSrc, setCurrentSrc] = useState<string>(() => initialCached || src);
  const [isCached, setIsCached] = useState<boolean>(() => !!initialCached || src?.startsWith('blob:'));
  const [hasError, setHasError] = useState<boolean>(false);

  useEffect(() => {
    let isMounted = true;
    if (!src) {
      setCurrentSrc(fallbackSrc);
      return;
    }

    setHasError(false);

    // Asynchronously resolve from IndexedDB or fetch and cache
    resolveAndCacheImageUrl(src)
      .then((resolvedUrl) => {
        if (!isMounted) return;
        setCurrentSrc(resolvedUrl);
        if (resolvedUrl.startsWith('blob:')) {
          setIsCached(true);
        }
      })
      .catch(() => {
        if (isMounted) {
          setCurrentSrc(src);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [src, fallbackSrc]);

  const handleError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    if (!hasError) {
      setHasError(true);
      setCurrentSrc(fallbackSrc);
    }
    if (props.onError) {
      props.onError(e);
    }
  };

  return (
    <div className="relative w-full h-full flex items-center justify-center">
      <img
        {...props}
        src={currentSrc}
        alt={alt}
        className={className}
        loading={props.loading || 'lazy'}
        referrerPolicy="no-referrer"
        onError={handleError}
      />
      {showCacheBadge && isCached && (
        <div
          title="Cached locally in IndexedDB for instant 0ms access"
          className="absolute bottom-1 right-1 flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-emerald-600/90 text-[9px] font-bold text-white shadow-xs pointer-events-none backdrop-blur-xs"
        >
          <span className="material-symbols-outlined text-[10px] leading-none">bolt</span>
          <span>IndexedDB</span>
        </div>
      )}
    </div>
  );
};
