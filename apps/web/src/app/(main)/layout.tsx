import NavSocialLinks from "@/components/nav-social-links";
import SiteHeader from "@/components/site-header";

export default function ZineLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen max-w-8xl mx-auto flex-col">
      <SiteHeader />
      <main className="pt-20">{children}</main>
      <NavSocialLinks />
    </div>
  );
}
