import { SecondLayerLayout } from "@/components/SecondLayerLayout";

export default function TimelineLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <SecondLayerLayout>{children}</SecondLayerLayout>;
}
