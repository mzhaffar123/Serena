"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { User } from "lucide-react";
import SerenaHeader, { type SerenaHeaderItem } from "@/components/SerenaHeader";
import SignOutButton from "@/components/SignOutButton";

type AppActiveItem = "dashboard" | "assessment" | "counselors" | "articles" | "profile";
type AppRole = "PATIENT" | "COUNSELOR" | "ADMIN";

type AppSiteHeaderProps = {
  role: AppRole;
  activeItem: AppActiveItem;
  userName?: string | null;
  photoUrl?: string | null;
};

export default function AppSiteHeader({ role, activeItem, userName, photoUrl }: AppSiteHeaderProps) {
  const { data: session } = useSession();
  const isCounselor = role === "COUNSELOR";
  const dashboardHref = isCounselor ? "/counselor" : "/patient";
  const [previewPhotoUrl, setPreviewPhotoUrl] = useState<string | null>(
    session?.user?.photoUrl ?? photoUrl ?? null
  );
  const [previewUserName, setPreviewUserName] = useState<string | null | undefined>(
    session?.user?.name ?? userName
  );
  const navItems: SerenaHeaderItem[] = isCounselor
    ? [
        { label: "Dashboard", href: dashboardHref, active: activeItem === "dashboard" },
        { label: "Cari Konselor", href: "/counselors", active: activeItem === "counselors" },
        { label: "Artikel", href: "/articles", active: activeItem === "articles" },
        { label: "Profil", href: "/profile", active: activeItem === "profile" },
      ]
    : [
        { label: "Dashboard", href: dashboardHref, active: activeItem === "dashboard" },
        { label: "Assessment", href: "/assessment", active: activeItem === "assessment" },
        { label: "Cari Konselor", href: "/counselors", active: activeItem === "counselors" },
        { label: "Artikel", href: "/articles", active: activeItem === "articles" },
        { label: "Profil", href: "/profile", active: activeItem === "profile" },
      ];

  useEffect(() => {
    setPreviewPhotoUrl(session?.user?.photoUrl ?? photoUrl ?? null);
    setPreviewUserName(session?.user?.name ?? userName);
  }, [photoUrl, session?.user?.name, session?.user?.photoUrl, userName]);

  useEffect(() => {
    const handlePreviewPhotoUpdate = (event: Event) => {
      const customEvent = event as CustomEvent<{ photoUrl: string | null }>;
      setPreviewPhotoUrl(customEvent.detail?.photoUrl ?? null);
    };

    window.addEventListener("serena:profile-photo-preview", handlePreviewPhotoUpdate as EventListener);

    return () => {
      window.removeEventListener("serena:profile-photo-preview", handlePreviewPhotoUpdate as EventListener);
    };
  }, []);

  return (
    <SerenaHeader
      items={navItems}
      rightSlot={
        <div className="flex items-center gap-2 lg:gap-4">
          <Link href="/profile" className="hidden items-center gap-2 md:flex lg:gap-3">
            {previewPhotoUrl ? (
              <Image
                src={previewPhotoUrl}
                alt={previewUserName || "User Serena"}
                width={40}
                height={40}
                className="h-10 w-10 rounded-full border border-serena-lavender-200 object-cover"
              />
            ) : (
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-serena-lavender-100 text-serena-lavender-600">
                <User className="h-5 w-5" />
              </span>
            )}
            <span className="hidden text-sm font-semibold text-indigo-950/80 xl:inline">
              {previewUserName || "Pengguna Serena"}
            </span>
          </Link>
          <SignOutButton />
        </div>
      }
    />
  );
}
