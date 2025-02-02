import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export default async function PrivatePage({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) {
    redirect('/login')
  }
  
  return (
    <div className="flex min-h-screen  max-w-8xl mx-auto md:px-12 flex-col">
      {children}
    </div>
  );
}
