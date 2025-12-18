'use client';

import { usePathname } from "next/navigation";
import { AppHeader } from "@/components/AppHeader";
import { MobileTabBar } from "@/components/MobileTabBar";
import { secondLayerMenu } from "@/config/v1Menu";

const EXTRA_SECOND_LAYER_PREFIXES = ["/visit-brief", "/analytics"];

function isSecondLayerPath(pathname: string | null) {
  const prefixes = [
    ...secondLayerMenu.flatMap((item) => item.activePrefixes ?? [item.href]),
    ...EXTRA_SECOND_LAYER_PREFIXES,
  ];

  return prefixes.some((prefix) =>
    prefix === "/" ? pathname === "/" : pathname?.startsWith(prefix),
  );
}

export function GlobalNav() {
  const pathname = usePathname();

  if (isSecondLayerPath(pathname)) return null;

  return (
    <>
      <AppHeader />
      <MobileTabBar />
    </>
  );
}

