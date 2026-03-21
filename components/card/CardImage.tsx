"use client";

import { useState } from "react";

type Props = {
  src: string;
  alt: string;
  style?: React.CSSProperties;
  placeholder?: React.ReactNode;
};

export default function CardImage({ src, alt, style, placeholder }: Props) {
  const [errored, setErrored] = useState(false);

  if (errored) {
    return <>{placeholder ?? null}</>;
  }

  return (
    <img
      src={src}
      alt={alt}
      style={style}
      onError={() => setErrored(true)}
      onLoad={(e) => {
        const img = e.target as HTMLImageElement;
        if (img.naturalWidth === 0) setErrored(true);
      }}
    />
  );
}