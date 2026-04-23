import React from 'react';

type ImageProps = React.ImgHTMLAttributes<HTMLImageElement> & {
  src: string;
  alt: string;
  fill?: boolean;
  priority?: boolean;
  quality?: number;
  sizes?: string;
};

export default function NextImage({ fill, style, loading, ...props }: ImageProps) {
  if (fill) {
    return (
      <img
        {...props}
        loading={loading ?? 'lazy'}
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          ...style,
        }}
      />
    );
  }

  return <img {...props} loading={loading ?? 'lazy'} style={style} />;
}
