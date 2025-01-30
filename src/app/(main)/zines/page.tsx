import ZineCard from "@/components/zine-card";
import { getPublishedZines } from "@/services/zine-service";

export default async function Zines() {

  const zines = await getPublishedZines();
  if (!zines?.length) {
    return <p role="status">Não há zines publicados no momento.</p>;
  }

  return (
    <div 
      role="grid"
      className="grid grid-cols-1 gap-6 px-4 py-8 sm:px-6 md:grid-cols-2 lg:grid-cols-3"
    >
      {zines.map((zine) => (
        <ZineCard zine={zine} key={zine.uuid}/>
      ))}
    </div>
  );
}