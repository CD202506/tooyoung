import ClinicalMapPage from "../clinical/map/page";

export const dynamic = "force-dynamic";

export default async function KnowledgePage(
  props: Parameters<typeof ClinicalMapPage>[0],
) {
  return ClinicalMapPage(props);
}
