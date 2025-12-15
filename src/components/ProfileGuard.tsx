"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function ProfileGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  useEffect(() => {
    const raw = localStorage.getItem("tooyoung_profile");
    if (!raw) {
      router.replace("/profile/setup");
      return;
    }

    const profile = JSON.parse(raw);
    if (!profile.profileCompleted) {
      router.replace("/profile/setup");
    }
  }, [router]);

  return <>{children}</>;
}
