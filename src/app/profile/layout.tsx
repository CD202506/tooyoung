import { SecondLayerLayout } from "@/components/SecondLayerLayout";

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <SecondLayerLayout>{children}</SecondLayerLayout>;
}
