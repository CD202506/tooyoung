import CasesPage from "../cases/page";

export const dynamic = "force-dynamic";

export default async function StoriesPage(
  props: Parameters<typeof CasesPage>[0],
) {
  return CasesPage(props);
}
