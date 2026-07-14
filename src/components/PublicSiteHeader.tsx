import Link from "next/link";
import SerenaHeader, { type SerenaHeaderItem } from "@/components/SerenaHeader";

type PublicActiveItem = "features" | "about" | "counselors" | "articles" | "faq" | "contact" | null;

type PublicSiteHeaderProps = {
  activeItem?: PublicActiveItem;
};

const publicNavItems: Array<SerenaHeaderItem & { key: Exclude<PublicActiveItem, null> }> = [
  { key: "features", label: "Fitur", href: "/#features" },
  { key: "about", label: "Tentang", href: "/tentang-kami" },
  { key: "counselors", label: "Cari Konselor", href: "/counselors" },
  { key: "articles", label: "Artikel", href: "/articles" },
  { key: "faq", label: "FAQ", href: "/#faq" },
  { key: "contact", label: "Kontak", href: "/#contact" },
];

export default function PublicSiteHeader({ activeItem = null }: PublicSiteHeaderProps) {
  return (
    <SerenaHeader
      items={publicNavItems.map(({ key, ...item }) => ({
        ...item,
        active: key === activeItem,
      }))}
      rightSlot={
        <>
          <Link
            href="/login"
            className="hidden text-sm font-semibold text-indigo-950/80 transition hover:text-indigo-950 sm:inline-flex"
          >
            Masuk
          </Link>
          <Link
            href="/register"
            className="inline-flex items-center justify-center rounded-full bg-serena-lavender-600 px-6 py-3 text-sm font-semibold text-white shadow-md shadow-serena-lavender-500/15 transition hover:bg-serena-lavender-700 active:scale-[0.98]"
          >
            Daftar Gratis
          </Link>
        </>
      }
    />
  );
}
