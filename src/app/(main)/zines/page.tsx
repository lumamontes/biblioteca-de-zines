import FilteredZines from "@/components/zines/filtered-zines";
import { getCategories } from "@/services/categories-service";
import { getPublishedZines } from "@/services/zine-service";

export default async function Zines() {
  const zines = await getPublishedZines();
  const categories = await getCategories();

  if (!zines?.length) {
    return <p role="status">Não há zines publicados no momento.</p>;
  }

  return <FilteredZines initialZines={zines} categories={categories}/>;
}
