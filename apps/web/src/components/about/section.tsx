export const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <section className="text-center max-w-xl">
    <h2 className="text-lg font-bold pb-2">{title}</h2>
    <p className="text-sm leading-relaxed">{children}</p>
  </section>
);