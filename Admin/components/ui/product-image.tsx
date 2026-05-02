"use client";

import { useState } from "react";
import Image from "next/image";
import { X } from "lucide-react";

interface ProductImageProps {
  src: string | null | undefined;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  onRemove?: () => void;
}

export function ProductImage({
  src,
  alt,
  className = "",
  width = 80,
  height = 80,
  onRemove,
}: ProductImageProps) {
  const [error, setError] = useState(false);
  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  const getFinalSrc = () => {
    // Handle no source or error cases
    if (!src || error) {
      return "/placeholder.svg";
    }

    // Handle full URLs
    if (src.startsWith("http")) {
      return src;
    }

    // Clean up the source path
    const cleanPath = src.replace(/^\/+/, "");

    // Get base URL, try IMAGE_BASE_URL first, then fallback to API_URL
    let baseUrl = (process.env.NEXT_PUBLIC_IMAGE_BASE_URL || API_URL || "").replace(/\/+$/, "");
    
    // Strip trailing /api if present because images are served from root (e.g. /catalog)
    if (baseUrl.endsWith("/api")) {
      baseUrl = baseUrl.slice(0, -4);
    }

    // Handle other images directly from the backend
    return baseUrl ? `${baseUrl}/${cleanPath}` : `/${cleanPath}`;
  };

  return (
    <div
      className={`relative ${className}`}
      style={{ width: `${width}px`, height: `${height}px` }}
    >
      <Image
        src={getFinalSrc()}
        alt={alt}
        width={width}
        height={height}
        className="object-cover rounded-md"
        style={{ userSelect: "none" }}
        draggable={false}
        onError={() => setError(true)}
      />
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          className="absolute top-1 right-1 bg-red-500 text-white w-6 h-6 flex items-center justify-center rounded-full hover:bg-red-600"
        >
          <X className="w-3 h-3" />
        </button>
      )}
    </div>
  );
}
