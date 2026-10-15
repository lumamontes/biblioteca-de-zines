"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export async function login(formData: FormData) {
  const supabase = await createClient();

  const data = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  };

  const parsedData = loginSchema.safeParse(data);

  if (!parsedData.success) {
    redirect("/login?error=invalid");
  }

  const { error } = await supabase.auth.signInWithPassword(parsedData.data);

  if (error) {
    redirect("/login?error=invalid");
  }

  revalidatePath("/", "layout");
  redirect("/dashboard");
}

export async function logout() {
  const supabase = await createClient();
  const { error } = await supabase.auth.signOut();

  if (error) {
    redirect("/login?error=logout");
  }
  
  revalidatePath("/", "layout");
  redirect("/login");
}

export async function signup(formData: FormData) {
  const supabase = await createClient();

  const data = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  };

  const { error } = await supabase.auth.signUp(data);

  if (error) {
    redirect("/login?error=auth");
  }

  revalidatePath("/", "layout");
  redirect("/login");
}
