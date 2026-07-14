"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Heart } from "lucide-react";
import { clsx } from "clsx";

type BrandLogoProps = {
  href?: string;
  imageSrc?: string;
  label?: string;
  showText?: boolean;
  hideTextWhenImageLoads?: boolean;
  className?: string;
  textClassName?: string;
  imageWrapperClassName?: string;
  imageClassName?: string;
  fallbackIconClassName?: string;
};

export default function BrandLogo({
  href,
  imageSrc = "/brand-logo.png",
  label = "Serena",
  showText = true,
  hideTextWhenImageLoads = false,
  className,
  textClassName,
  imageWrapperClassName,
  imageClassName,
  fallbackIconClassName,
}: BrandLogoProps) {
  const [imageFailed, setImageFailed] = useState(false);

  const content = (
    <>
      {imageFailed ? (
        <Heart
          className={clsx(
            "h-7 w-7 fill-serena-lavender-400 text-serena-lavender-400",
            fallbackIconClassName
          )}
        />
      ) : (
        <span className={clsx("block h-20 w-[250px]", imageWrapperClassName)}>
          <Image
            src={imageSrc}
            alt={label}
            width={1024}
            height={1024}
            className={clsx("h-full w-full object-contain", imageClassName)}
            onError={() => setImageFailed(true)}
          />
        </span>
      )}
      {showText && !(hideTextWhenImageLoads && !imageFailed) && (
        <span
          className={clsx(
            "font-rounded text-[1.9rem] font-bold tracking-tight text-indigo-950",
            textClassName
          )}
        >
          {label}
        </span>
      )}
    </>
  );

  if (href) {
    return (
      <Link className={clsx("inline-flex items-center gap-3", className)} href={href}>
        {content}
      </Link>
    );
  }

  return <div className={clsx("inline-flex items-center gap-3", className)}>{content}</div>;
}
