import Header from "@/components/header";
import NavSocialLinks from "@/components/nav-social-links";

export default function ZineLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen  max-w-8xl mx-auto md:px-12 flex-col">
      <Header />
      {children}
      <NavSocialLinks />
    </div>
  );
}
