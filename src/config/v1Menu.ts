export type V1MenuItem = {
  href: string;
  labelEn: string;
  labelZh: string;
  /**
   * Optional path prefixes to consider as "active" for this menu item.
   * Example: "/cases" should be active for "/cases/[slug]".
   */
  activePrefixes?: string[];
};

export const publicMenu: V1MenuItem[] = [
  { href: "/", labelEn: "Home", labelZh: "首頁", activePrefixes: ["/"] },
  {
    href: "/cases",
    labelEn: "Case Stories",
    labelZh: "真實案例",
    activePrefixes: ["/cases"],
  },
  {
    href: "/clinical/map",
    labelEn: "Medical Knowledge",
    labelZh: "醫學新知",
    activePrefixes: ["/clinical"],
  },
  { href: "/about", labelEn: "About", labelZh: "關於 Tooyoung", activePrefixes: ["/about"] },
];

export const secondLayerMenu: V1MenuItem[] = [
  { href: "/dashboard", labelEn: "Dashboard", labelZh: "儀表板", activePrefixes: ["/dashboard"] },
  { href: "/cases", labelEn: "Cases", labelZh: "事件列表", activePrefixes: ["/cases"] },
  { href: "/timeline", labelEn: "Timeline", labelZh: "時間軸", activePrefixes: ["/timeline"] },
  { href: "/scales", labelEn: "Scales", labelZh: "臨床量表", activePrefixes: ["/scales"] },
  { href: "/summary", labelEn: "Summary", labelZh: "事件統計", activePrefixes: ["/summary"] },
  { href: "/profile", labelEn: "Profile", labelZh: "編輯個案", activePrefixes: ["/profile"] },
];

