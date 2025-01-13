import ZineCard from "@/components/zine-card";
import { getPublishedZines } from "@/services/zine-service";

export default async function Zines() {

  const zines = await getPublishedZines();

  return (
    <div className="grid grid-cols-1 gap-6 px-4 py-8 sm:px-6 md:grid-cols-2 lg:grid-cols-3">
      {zines.map((zine) => (
        <ZineCard zine={zine} key={zine.uuid}/>
      ))}
    </div>
  );
}
