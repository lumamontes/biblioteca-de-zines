import { login } from "./actions";

export default function LoginPage() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen px-4">
      <section className="w-full max-w-md p-6 bg-white shadow-md rounded-md">
        <h1 className="text-2xl font-bold text-center">Biblioteca de Zines</h1>
        <p className="text-sm text-center text-gray-500 mt-2">
          Faça login para acessar o painel de administração.
        </p>

        {/* Formulário */}
        <form className="flex flex-col gap-4 mt-6">
          <div className="flex flex-col">
            <label htmlFor="email" className="font-medium">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              required
              placeholder="Digite seu email"
              className="border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          
          <div className="flex flex-col">
            <label htmlFor="password" className="font-medium">Senha</label>
            <input
              id="password"
              name="password"
              type="password"
              required
              placeholder="Digite sua senha"
              className="border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <button
            type="submit"
            formAction={login}
            className="bg-indigo-600 text-white py-2 rounded-md hover:bg-indigo-700 transition"
          >
            Entrar
          </button>
        </form>

        {/* Ajuda */}
        <p className="text-sm text-center text-gray-500 mt-4">
          Caso não tenha uma conta, entre em contato com a equipe de desenvolvimento.
        </p>

        <p className="text-sm text-center mt-2">
          <a href="/" className="text-indigo-600 hover:underline">
            Voltar para a página inicial
          </a>
        </p>
      </section>
    </main>
  );
}
