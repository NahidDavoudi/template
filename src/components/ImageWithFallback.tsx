import { useState } from 'react';
import { Image as ImageIcon } from 'lucide-react';

interface ImageWithFallbackProps {
  src?: string;
  alt?: string;
  className?: string;
  iconClassName?: string;
}

export function ImageWithFallback({ src, alt = '', className = 'w-full h-full object-cover', iconClassName = 'w-10 h-10' }: ImageWithFallbackProps) {
  const [failed, setFailed] = useState(false);
  if (!src || failed) {
    return (
      <div className={`image-fallback w-full h-full flex items-center justify-center text-muted/50 bg-surface ${className}`}>
        <ImageIcon className={iconClassName} aria-hidden="true" />
      </div>
    );
  }
  return (
    <img
      src={src}
      alt={alt}
      className={className}
      onError={() => setFailed(true)}
    />
  );
}

export default ImageWithFallback;
