import type { ReactNode } from "react";
import Link from "next/link";
import { clsx } from "clsx";
import BrandLogo from "@/components/BrandLogo";

export type SerenaHeaderItem = {
  label: string;
  href: string;
  active?: boolean;
};

type SerenaHeaderProps = {
  items: SerenaHeaderItem[];
  rightSlot: ReactNode;
  logoHref?: string;
};

export default function SerenaHeader({ items, rightSlot, logoHref = "/" }: SerenaHeaderProps) {
  return (
    <header className="sticky top-0 z-50 border-b border-indigo-100/30 bg-white/30 backdrop-blur-md">
      <div className="mx-auto flex h-24 w-full max-w-[1440px] items-center gap-3 px-4 lg:px-16">
        <div className="shrink-0 md:min-w-[220px] lg:min-w-[258px]">
          <BrandLogo
            href={logoHref}
            className="-ml-4"
            imageWrapperClassName="h-20 w-[268px] overflow-visible"
            imageClassName="-translate-x-4 scale-[1.04]"
            fallbackIconClassName="h-7 w-7"
            hideTextWhenImageLoads
          />
        </div>

        <nav className="hidden min-w-0 flex-1 items-center justify-center gap-4 md:flex lg:gap-6 xl:gap-8">
          {items.map((item) => (
            <Link
              key={`${item.label}-${item.href}`}
              href={item.href}
              className={clsx(
                "text-[13px] font-medium transition lg:text-sm",
                item.active ? "text-indigo-950" : "text-indigo-950/58 hover:text-indigo-950"
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex shrink-0 items-center gap-2 lg:min-w-[220px] lg:justify-end">
          {rightSlot}
        </div>
      </div>
    </header>
  );
}
