import Title from "@/components/ui/title";
import Link from "@/components/ui/link";
import InfoBox from "@/components/ui/info-box";

export default function FormHeader() {
  return (
    <div className="text-center mb-8">
      <Title variant="h1" className="mb-4">
        Envie sua zine!
      </Title>
      <p className="text-lg text-neutral-600 mb-4">
        Queremos conhecer e divulgar sua zine! Preencha o formulário abaixo para enviar sua criação para nossa biblioteca digital.
        Nossa equipe irá dar uma olhada e se tiver tudo certo, sua zine será adicionada à biblioteca.
      </p>
      
      <InfoBox>
        <p className="text-sm">
          <strong>💬 Contato:</strong> Dúvidas? Leia o{' '}
          <Link href="/zines/submission-guide">
            guia de submissão
          </Link>{' '}
          ou entre em contato:{" "}
          <Link href="mailto:bibliotecadezines@gmail.com">
            bibliotecadezines@gmail.com
          </Link>
        </p>
      </InfoBox>
    </div>
  );
}
