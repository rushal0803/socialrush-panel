"use client";

import Image, { type ImageProps } from "next/image";
import { useEffect, useState } from "react";

const blurPlaceholder =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='32' height='24' viewBox='0 0 32 24'%3E%3Cdefs%3E%3ClinearGradient id='g' x1='0' y1='0' x2='1' y2='1'%3E%3Cstop stop-color='%230B0B0F'/%3E%3Cstop offset='.5' stop-color='%2321160B'/%3E%3Cstop offset='1' stop-color='%23FF7A00'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='32' height='24' fill='url(%23g)'/%3E%3C/svg%3E";

type SafeImageProps = Omit<ImageProps, "src"> & {
  src: string;
  fallbackSrc?: string;
};

export default function SafeImage({
  src,
  fallbackSrc,
  alt,
  className = "",
  width,
  height,
  fill,
  style,
  onError,
  ...props
}: SafeImageProps) {
  const [currentSrc, setCurrentSrc] = useState(src);
  const [usingFallback, setUsingFallback] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setCurrentSrc(src);
    setUsingFallback(false);
    setFailed(false);
  }, [src]);

  if (failed) {
    return (
      <span
        role="img"
        aria-label={alt}
        className={`${fill ? "absolute inset-0" : "flex w-full"} items-center justify-center bg-gradient-to-br from-orange-50 via-amber-50 to-amber-50 text-[#111827] ${className}`}
        style={{
          ...style,
          ...(!fill && typeof width === "number" && typeof height === "number"
            ? { aspectRatio: `${width} / ${height}` }
            : {}),
        }}
      >
        <span className="grid h-14 w-14 place-items-center rounded-2xl bg-white/80 shadow-sm">
          <svg viewBox="0 0 36 36" className="h-9 w-9" fill="none" aria-hidden="true">
            <path d="M8 24.5 14.2 18l4.1 3.7L27.8 11" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M21.5 11h6.3v6.3" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
      </span>
    );
  }

  return (
    <Image
      {...props}
      src={currentSrc}
      alt={alt}
      width={width}
      height={height}
      fill={fill}
      style={style}
      className={className}
      placeholder={props.placeholder ?? "blur"}
      blurDataURL={props.blurDataURL ?? blurPlaceholder}
      unoptimized={usingFallback || props.unoptimized}
      onError={(event) => {
        if (fallbackSrc && !usingFallback) {
          setCurrentSrc(fallbackSrc);
          setUsingFallback(true);
          return;
        }
        setFailed(true);
        onError?.(event);
      }}
    />
  );
}
