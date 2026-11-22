export function DemoNotice({ durable }: { durable: boolean }) {
  return (
    <p className="demo-notice">
      <strong>Demonstração.</strong> O GitHub é simulado e as propostas são exemplos.
      {durable ? null : ' Os dados são temporários e podem sumir a qualquer momento.'}
    </p>
  );
}
