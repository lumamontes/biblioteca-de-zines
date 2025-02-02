import ZineCard from "@/components/zine-card";
import FilteredZines from "@/components/zines/filtered-zines";
import { getPublishedZines, searchZines } from "@/services/zine-service";

export default async function Zines() {
  const zines = await getPublishedZines();

  if (!zines?.length) {
    return <p role="status">Não há zines publicados no momento.</p>;
  }

  return <FilteredZines initialZines={zines} />;
}
