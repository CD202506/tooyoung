import { SecondLayerLayout } from "@/components/SecondLayerLayout";

export default function VisitBriefLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <SecondLayerLayout>{children}</SecondLayerLayout>;
}
