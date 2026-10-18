import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export default async function PrivatePage({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) {
    redirect('/login')
  }
  
  return (
    <div className="flex min-h-screen min-w-0 max-w-full mx-auto overflow-x-hidden md:px-12 flex-col">
      {children}
    </div>
  );
}
