// Essa função tá no cloud do supabase, deixei comentado aqui pra ter registrado o código dela 
import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const handler = async (request: Request): Promise<Response> => {
  try {
    const { author_email, zine_title } = await request.json();

    const recipientEmail = author_email.includes("@") ? author_email : "bibliotecadezines@gmail.com";

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "Biblioteca de Zines <email@biblioteca-de-zines.com.br>",
        reply_to: "bibliotecadezines@gmail.com",
        to: recipientEmail,
        subject: "📚 Sua Zine Foi Publicada!",
        html: `
          <p>Olá, tudo bem?</p>
          <p>Sua zine <strong>${zine_title}</strong> foi publicada com sucesso na <strong>Biblioteca de Zines</strong>! 🎉</p>
          <p>📖 <a href="https://biblioteca-de-zines.com.br/zines">Clique aqui</a> para acessar a biblioteca.</p>
          <p>Se tiver dúvidas, basta responder este e-mail.</p>
          <p>Para enviar mais zines, acesse nosso formulário de envio: <a href="https://forms.gle/ydedperb4c2WbiRW9">Enviar Zine</a></p>
          <br>
          <p>Atenciosamente,</p>
          <p><strong>Equipe Biblioteca de Zines</strong></p>
        `,
      }),
    });

    const data = await res.json();

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("Erro ao enviar email:", error);
    return new Response(
      JSON.stringify({ error: "Falha ao enviar o e-mail" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};

Deno.serve(handler);
