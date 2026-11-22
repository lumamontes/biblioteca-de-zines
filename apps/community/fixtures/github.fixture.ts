import type { FixtureGitHubState } from '@/infrastructure/github/fixture-github.types';
import type { GitHubComment, GitHubIssueSnapshot } from '@/application/community.types';

const REPOSITORY = 'lumamontes/biblioteca-de-zines';
const issueUrl = (number: number) => `https://github.com/${REPOSITORY}/issues/${number}`;

export const SEED_CONTRIBUTION_IDS = {
  coverPreview: '3f0b8a52-6d1e-4c3a-9a41-1c2b7f0e9d11',
  collectiveCredits: '8c51e2f7-2a49-4d8b-b5c6-4e7d9a0f3b22',
  authorFilterLocal: 'b2d4f6a8-1c3e-4a5b-8d7f-9e0a1b2c3d44',
} as const;

function portalBlock(fields: { title: string; question: string; openDecision?: string }): string {
  return [
    '<!-- portal',
    `title: ${fields.title}`,
    `question: ${fields.question}`,
    ...(fields.openDecision ? [`open-decision: ${fields.openDecision}`] : []),
    '-->',
  ].join('\n');
}

function issue(fields: Omit<GitHubIssueSnapshot, 'url' | 'comments' | 'pullRequests' | 'release' | 'stateReason'> & Partial<GitHubIssueSnapshot>): GitHubIssueSnapshot {
  return { url: issueUrl(fields.number), comments: [], pullRequests: [], release: null, stateReason: null, ...fields };
}

function comment(issueNumber: number, id: number, fields: Pick<GitHubComment, 'body' | 'authorLogin' | 'authorAssociation' | 'createdAt'>): GitHubComment {
  return { id, url: `${issueUrl(issueNumber)}#issuecomment-${id}`, isPortalBot: fields.authorLogin === 'biblioteca-portal[bot]', updatedAt: fields.createdAt, ...fields };
}

/**
 * GitHub as the team would leave it. The issues, titles and technical points are the real
 * ones from the repository; comments and stage labels are examples for local development.
 */
export function githubFixture(): FixtureGitHubState {
  return {
    repository: REPOSITORY,
    nextIssueNumber: 300,
    nextCommentId: 9100,
    failedMarkers: [],
    issues: [
      issue({
        number: 184,
        title: 'Adicionar preview da zine no formulário de submissão',
        body: [
          portalBlock({
            title: 'O que você gostaria de conferir antes de enviar sua zine?',
            question: 'Antes de enviar o formulário, o que você precisa ver: a capa, os créditos, a ordem das páginas ou outra coisa?',
            openDecision: 'Quais informações a prévia do formulário mostra primeiro, sem criar uma submissão nem publicar nada.',
          }),
          '## Contexto',
          'A pessoa que submete uma zine precisa conseguir conferir como o conteúdo ficará na Biblioteca de Zines antes de enviar o formulário.',
        ].join('\n'),
        state: 'open',
        labels: ['enhancement', 'portal:featured', 'portal:discussion'],
        comments: [
          comment(184, 9001, {
            body: `<!-- portal:contribution:${SEED_CONTRIBUTION_IDS.coverPreview} -->\n**Bia Xerox** comentou pela comunidade da Biblioteca de Zines:\n\n> Quero ver a capa do jeito que ela vai aparecer no catálogo.`,
            authorLogin: 'biblioteca-portal[bot]',
            authorAssociation: 'NONE',
            createdAt: '2026-11-18T14:02:00.000Z',
          }),
          comment(184, 9002, {
            body: `<!-- portal:contribution:${SEED_CONTRIBUTION_IDS.collectiveCredits} -->\n**Coletivo Maré** comentou pela comunidade da Biblioteca de Zines:\n\n> Quero conferir se o nome do coletivo aparece nos créditos.`,
            authorLogin: 'biblioteca-portal[bot]',
            authorAssociation: 'NONE',
            createdAt: '2026-11-19T10:30:00.000Z',
          }),
          comment(184, 9003, {
            body: '### Resposta da Biblioteca de Zines\nObrigada pelos relatos. A prévia vai começar pela capa e pelos créditos, os pontos mais citados até agora. Quem publica em coletivo: como vocês preferem que os nomes apareçam?',
            authorLogin: 'lumamontes',
            authorAssociation: 'OWNER',
            createdAt: '2026-11-20T12:00:00.000Z',
          }),
        ],
      }),
      issue({
        number: 197,
        title: 'Baixar zines para imprimir e configurar a impressão de várias obras de uma vez',
        body: [
          portalBlock({
            title: 'Baixar zines para imprimir',
            question: 'Você imprimiria zines do acervo? A ideia é oferecer, na página de cada zine autorizado, um PDF pronto para imprimir, com a quantidade de folhas e as instruções de corte e dobra. Quem criou o zine decide se quer oferecer essa opção.',
            openDecision: 'Quais formatos oferecer primeiro: livreto A5 em folhas A4, minizine de oito páginas em uma folha ou o PDF diagramado pela própria autoria.',
          }),
          '## Proposta',
          'Oferecer **Baixar para imprimir** na página de cada zine autorizado.',
        ].join('\n'),
        state: 'open',
        labels: ['portal:featured'],
      }),
      issue({
        number: 89,
        title: 'Melhorar acessibilidade: navegação por teclado',
        body: [
          portalBlock({
            title: 'Navegar pelo site usando o teclado',
            question: 'Se você navega com teclado ou leitor de tela, onde se perde? Hoje muitos botões e links não mostram quando estão em foco, e os filtros por ano e categoria em /zines não funcionam pelo teclado.',
            openDecision: 'Qual indicador de foco usar em todo o site e quais controles corrigir primeiro.',
          }),
          'Atualmente a navegação por teclado pelo site é possível, mas requer umas melhorias.',
        ].join('\n'),
        state: 'open',
        labels: ['portal:featured'],
      }),
      issue({
        number: 46,
        title: 'Adicionar notificação de zines publicadas para autores',
        body: [
          portalBlock({
            title: 'Avisar quem enviou quando a zine for publicada',
            question: 'Se você envia zines para a Biblioteca de Zines, como prefere saber que sua zine foi aprovada e já está disponível no site?',
            openDecision: 'Se o aviso será por e-mail ou por outro meio.',
          }),
          'Para autores que cadastrarem a zine no site, enviar um email ou algum tipo de notificação quando a sua zine for aprovada e ficar disponível no site.',
        ].join('\n'),
        state: 'open',
        labels: ['enhancement'],
      }),
      issue({
        number: 191,
        title: 'Novo layout em detalhamento de zines',
        body: [
          portalBlock({
            title: 'Como você prefere ler uma zine no site?',
            question: 'Na página da zine, o que ajuda mais: uma área de leitura grande, ler página por página ou ter as informações sempre ao lado?',
          }),
          'Reorganizar a página de detalhes com painel de leitura e coluna lateral.',
        ].join('\n'),
        state: 'closed',
        stateReason: 'completed',
        labels: ['enhancement'],
        comments: [
          comment(191, 9010, {
            body: '### Decisão da Biblioteca de Zines\nA página de cada zine ganha uma leitura mais ampla, com os detalhes organizados em uma lateral recolhível. No celular, o conteúdo continua empilhado.\n\n#### Próximos passos\nAcompanhar se a lateral atrapalha a leitura em telas médias.',
            authorLogin: 'lumamontes',
            authorAssociation: 'OWNER',
            createdAt: '2026-10-19T18:00:00.000Z',
          }),
        ],
        pullRequests: [{ number: 192, url: `https://github.com/${REPOSITORY}/pull/192`, title: 'feat: refine zine reading experience', state: 'merged' }],
        release: { confirmedAt: '2026-10-21T09:00:00.000Z', environment: 'Production', url: 'https://biblioteca-de-zines.com.br' },
      }),
      issue({
        number: 186,
        title: 'Filtrar a listagem de zines por autoria existente',
        body: 'Na listagem pública de zines, a busca por autoria pode ser mais fácil se oferecer as autorias já presentes na Biblioteca de Zines como opções selecionáveis.',
        state: 'open',
        labels: ['enhancement'],
      }),
    ],
  };
}
