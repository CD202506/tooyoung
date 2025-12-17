import { SecondLayerLayout } from "@/components/SecondLayerLayout";

export default function CasesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <SecondLayerLayout>{children}</SecondLayerLayout>;
}
