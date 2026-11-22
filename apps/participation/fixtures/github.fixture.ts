import type { FixtureGitHubState } from '@/infrastructure/github/fixture-github.types';

const REPOSITORY = 'lumamontes/biblioteca-de-zines';
const issueUrl = (number: number) => `https://github.com/${REPOSITORY}/issues/${number}`;

export const SEED_CONTRIBUTION_IDS = {
  coverPreview: '3f0b8a52-6d1e-4c3a-9a41-1c2b7f0e9d11',
  collectiveCredits: '8c51e2f7-2a49-4d8b-b5c6-4e7d9a0f3b22',
  authorFilterLocal: 'b2d4f6a8-1c3e-4a5b-8d7f-9e0a1b2c3d44',
} as const;

/** GitHub as the team would leave it: questions presented with a `portal` block, labels and comments. */
export function githubFixture(): FixtureGitHubState {
  return {
    repository: REPOSITORY,
    nextIssueNumber: 300,
    nextCommentId: 9100,
    failedMarkers: [],
    issues: [
      {
        number: 184,
        url: issueUrl(184),
        title: 'Adicionar preview da zine no formulário de submissão',
        body: [
          '<!-- portal',
          'title: O que você gostaria de conferir antes de enviar sua zine?',
          'question: Antes de enviar o formulário, o que você precisa ver: a capa, os créditos, a ordem das páginas ou outra coisa?',
          'open-decision: Quais informações a prévia da submissão deve mostrar primeiro.',
          '-->',
          '## Contexto',
          'A pessoa que submete uma zine precisa conseguir conferir como o conteúdo ficará na Biblioteca antes de enviar o formulário.',
        ].join('\n'),
        state: 'open',
        stateReason: null,
        labels: ['enhancement', 'portal:featured', 'portal:discussion'],
        comments: [
          {
            id: 9001,
            url: `${issueUrl(184)}#issuecomment-9001`,
            body: `<!-- portal:contribution:${SEED_CONTRIBUTION_IDS.coverPreview} -->\n**Bia Xerox** comentou pelo portal de participação:\n\n> Quero ver a capa do jeito que ela vai aparecer no catálogo, com o corte certo.`,
            authorLogin: 'biblioteca-portal[bot]',
            authorAssociation: 'NONE',
            isPortalBot: true,
            createdAt: '2026-11-18T14:02:00.000Z',
            updatedAt: '2026-11-18T14:02:00.000Z',
          },
          {
            id: 9002,
            url: `${issueUrl(184)}#issuecomment-9002`,
            body: `<!-- portal:contribution:${SEED_CONTRIBUTION_IDS.collectiveCredits} -->\n**Coletivo Maré** comentou pelo portal de participação:\n\n> Quero conferir se o nome do coletivo aparece nos créditos.`,
            authorLogin: 'biblioteca-portal[bot]',
            authorAssociation: 'NONE',
            isPortalBot: true,
            createdAt: '2026-11-19T10:30:00.000Z',
            updatedAt: '2026-11-19T10:30:00.000Z',
          },
          {
            id: 9003,
            url: `${issueUrl(184)}#issuecomment-9003`,
            body: '### Resposta da Biblioteca\nObrigada pelos relatos! Vamos começar a prévia pela capa e pelos créditos, porque foram os pontos mais citados. A ordem das páginas entra logo depois. Ainda queremos ouvir quem publica em coletivo: como vocês preferem que os nomes apareçam?',
            authorLogin: 'lumamontes',
            authorAssociation: 'OWNER',
            isPortalBot: false,
            createdAt: '2026-11-20T12:00:00.000Z',
            updatedAt: '2026-11-20T12:00:00.000Z',
          },
        ],
        pullRequests: [],
        release: null,
      },
      {
        number: 89,
        url: issueUrl(89),
        title: 'Melhorar acessibilidade: navegação por teclado',
        body: [
          '<!-- portal',
          'title: Como tornar a navegação por teclado mais clara?',
          'question: Se você navega pelo site com teclado ou leitor de tela, onde você se perde? O que precisa ficar visível quando um botão ou link recebe foco?',
          'open-decision: Que indicador de foco e que ordem de navegação adotar em todo o catálogo.',
          '-->',
          'Atualmente a navegação por teclado pelo site é possível, mas requer umas melhorias.',
        ].join('\n'),
        state: 'open',
        stateReason: null,
        labels: ['portal:featured'],
        comments: [],
        pullRequests: [],
        release: null,
      },
      {
        number: 191,
        url: issueUrl(191),
        title: 'Novo layout em detalhamento de zines',
        body: [
          '<!-- portal',
          'title: Como você prefere ler uma zine no site?',
          'question: Na página da zine, o que ajuda mais: ver o PDF grande, ler página por página ou ter as informações sempre ao lado?',
          '-->',
          'Reorganizar a página de detalhes com painel de leitura e coluna lateral.',
        ].join('\n'),
        state: 'closed',
        stateReason: 'completed',
        labels: ['enhancement', 'portal:in-progress'],
        comments: [
          {
            id: 9010,
            url: `${issueUrl(191)}#issuecomment-9010`,
            body: '### Decisão da Biblioteca\nVamos manter o PDF ou o leitor digital num painel principal e levar as informações para uma coluna lateral que pode ser recolhida. Quem lê no celular continua com tudo empilhado, sem controles escondidos.\n\n#### Próximos passos\nAcompanhar se a coluna lateral atrapalha a leitura em telas médias e ajustar o ponto de quebra.',
            authorLogin: 'lumamontes',
            authorAssociation: 'OWNER',
            isPortalBot: false,
            createdAt: '2026-10-19T18:00:00.000Z',
            updatedAt: '2026-10-19T18:00:00.000Z',
          },
        ],
        pullRequests: [{ number: 192, url: `https://github.com/${REPOSITORY}/pull/192`, title: 'feat: refine zine reading experience', state: 'merged' }],
        release: { confirmedAt: '2026-10-21T09:00:00.000Z', environment: 'Production', url: 'https://biblioteca-de-zines.com.br' },
      },
      {
        number: 186,
        url: issueUrl(186),
        title: 'Filtrar a listagem de zines por autoria existente',
        body: 'Na listagem pública de zines, a busca por autoria pode ser mais fácil se oferecer as autorias já presentes na Biblioteca como opções selecionáveis.',
        state: 'open',
        stateReason: null,
        labels: ['enhancement'],
        comments: [],
        pullRequests: [],
        release: null,
      },
    ],
  };
}
