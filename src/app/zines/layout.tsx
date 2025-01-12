// layout.tsx
import Header from "@/components/header";
import NavSocialLinks from "@/components/nav-social-links";
import { ScriptProps } from "next/script";

export default function ZineLayout({ children }: ScriptProps) {
  return (
    <div className="flex min-h-screen  max-w-6xl mx-auto md:px-12 flex-col">
      <Header />
      {children}
      <NavSocialLinks />
    </div>
  );
}
