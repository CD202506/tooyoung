import { SecondLayerLayout } from "@/components/SecondLayerLayout";

export default function ScalesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <SecondLayerLayout>{children}</SecondLayerLayout>;
}
