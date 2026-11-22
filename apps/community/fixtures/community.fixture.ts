import type { CommunityState } from '@/application/community.types';
import type { Contribution, Proposal, Vote } from '@/domain/proposal.types';
import { SEED_CONTRIBUTION_IDS } from './github.fixture';

const REPOSITORY_URL = 'https://github.com/lumamontes/biblioteca-de-zines';

function teamProposal(number: number, issueNumber: number, title: string, createdAt: string): Proposal {
  return {
    number,
    origin: 'team',
    publicTitle: title,
    publicQuestion: '',
    openDecision: null,
    originalReport: null,
    createdAt,
    lastActivityAt: createdAt,
    featured: false,
    triageState: 'linked',
    archive: null,
    principalIssue: { number: issueNumber, url: `${REPOSITORY_URL}/issues/${issueNumber}`, technicalTitle: '', linkedAt: createdAt, linkCommentUrl: null },
    relatedTasks: [],
    questionRevisions: [],
    presentedByTeam: true,
    cache: null,
  };
}

function votes(proposalNumber: number, support: number, oppose: number): Vote[] {
  const at = '2026-11-19T12:00:00.000Z';
  return [
    ...Array.from({ length: support }, (_, index): Vote => ({ proposalNumber, voterHash: `seed-support-${proposalNumber}-${index}`, value: 1, updatedAt: at })),
    ...Array.from({ length: oppose }, (_, index): Vote => ({ proposalNumber, voterHash: `seed-oppose-${proposalNumber}-${index}`, value: -1, updatedAt: at })),
  ];
}

function contribution(input: {
  id: string;
  proposalNumber: number;
  displayName: string;
  text: string;
  createdAt: string;
  sent?: { commentId: number; issueNumber: number };
}): Contribution {
  return {
    id: input.id,
    proposalNumber: input.proposalNumber,
    displayName: input.displayName,
    text: input.text,
    createdAt: input.createdAt,
    delivery: input.sent
      ? {
          state: 'sent',
          attempts: 1,
          lastAttemptAt: input.createdAt,
          lastError: null,
          githubCommentId: input.sent.commentId,
          githubUrl: `${REPOSITORY_URL}/issues/${input.sent.issueNumber}#issuecomment-${input.sent.commentId}`,
          issueNumber: input.sent.issueNumber,
        }
      : { state: 'local', attempts: 0, lastAttemptAt: null, lastError: null, githubCommentId: null, githubUrl: null, issueNumber: null },
    moderation: { state: 'visible', reason: null, moderatedAt: null, moderatedBy: null },
  };
}

/**
 * Portal data as it would exist before the first sync. Team questions are linked to
 * their issues and get their public text from the issue's `portal` block on sync.
 */
export function communityFixture(): CommunityState {
  const authorFilter: Proposal = {
    number: 4,
    origin: 'community',
    publicTitle: 'Encontrar todas as zines de um coletivo',
    publicQuestion: 'Quando gosto de uma zine, quero ver as outras do mesmo coletivo. Hoje preciso digitar o nome e torcer para estar escrito igual.',
    openDecision: null,
    originalReport: {
      text: 'Quando gosto de uma zine, quero ver as outras do mesmo coletivo. Hoje preciso digitar o nome e torcer para estar escrito igual.',
      displayName: 'Rafa do Fanzinoteca',
      submittedAt: '2026-11-20T21:15:00.000Z',
    },
    createdAt: '2026-11-20T21:15:00.000Z',
    lastActivityAt: '2026-11-21T09:40:00.000Z',
    featured: false,
    triageState: 'triage',
    archive: null,
    principalIssue: null,
    relatedTasks: [],
    questionRevisions: [],
    presentedByTeam: false,
    cache: null,
  };

  return {
    version: 1,
    nextProposalNumber: 5,
    proposals: [
      teamProposal(1, 184, 'O que você gostaria de conferir antes de enviar sua zine?', '2026-11-17T12:00:00.000Z'),
      teamProposal(2, 89, 'Como tornar a navegação por teclado mais clara?', '2026-11-17T12:05:00.000Z'),
      teamProposal(3, 191, 'Como você prefere ler uma zine no site?', '2026-10-12T12:00:00.000Z'),
      authorFilter,
    ],
    contributions: [
      contribution({ id: SEED_CONTRIBUTION_IDS.coverPreview, proposalNumber: 1, displayName: 'Bia Xerox', text: 'Quero ver a capa do jeito que ela vai aparecer no catálogo, com o corte certo.', createdAt: '2026-11-18T14:02:00.000Z', sent: { commentId: 9001, issueNumber: 184 } }),
      contribution({ id: SEED_CONTRIBUTION_IDS.collectiveCredits, proposalNumber: 1, displayName: 'Coletivo Maré', text: 'Quero conferir se o nome do coletivo aparece nos créditos.', createdAt: '2026-11-19T10:30:00.000Z', sent: { commentId: 9002, issueNumber: 184 } }),
      contribution({ id: SEED_CONTRIBUTION_IDS.authorFilterLocal, proposalNumber: 4, displayName: 'Jo Grampo', text: 'Isso ajudaria muito. Muitos coletivos mudam de nome com o tempo.', createdAt: '2026-11-21T09:40:00.000Z' }),
    ],
    votes: [...votes(1, 12, 1), ...votes(3, 9, 0), ...votes(4, 3, 0)],
    influences: [
      {
        contributionId: SEED_CONTRIBUTION_IDS.collectiveCredits,
        proposalNumber: 1,
        kind: 'clarified_need',
        note: 'Os créditos de coletivos entraram na primeira versão da prévia.',
        decisionUrl: null,
        recordedAt: '2026-11-20T12:05:00.000Z',
        recordedBy: 'lumamontes',
      },
    ],
    pendingLinks: [],
  };
}

/** Adds content at the extremes to check layout: long words, long names, many replies, multi-line errors. */
export function withExtremeContent(state: CommunityState): CommunityState {
  const number = state.nextProposalNumber;
  const createdAt = '2026-11-21T08:00:00.000Z';
  state.proposals.push({
    number,
    origin: 'community',
    publicTitle: 'Permitir que coletivos com nomes muito compridos como Associação Cultural Independente de Publicações Artesanais e Fotocopiadas apareçam inteiros',
    publicQuestion: 'Veja https://biblioteca-de-zines.com.br/zines/uma-zine-com-um-endereco-muito-comprido-sem-espacos-para-quebrar-a-linha-em-nenhum-lugar-mesmo',
    openDecision: null,
    originalReport: {
      text: 'Veja https://biblioteca-de-zines.com.br/zines/uma-zine-com-um-endereco-muito-comprido-sem-espacos-para-quebrar-a-linha-em-nenhum-lugar-mesmo',
      displayName: 'Maria-Aparecida-dos-Santos-Fotocopiadora-Oficial-do-Coletivo',
      submittedAt: createdAt,
    },
    createdAt,
    lastActivityAt: createdAt,
    featured: false,
    triageState: 'triage',
    archive: null,
    principalIssue: null,
    relatedTasks: [],
    questionRevisions: [],
    presentedByTeam: false,
    cache: null,
  });
  state.nextProposalNumber += 1;
  for (let index = 0; index < 40; index += 1) {
    state.contributions.push(
      contribution({
        id: `00000000-0000-4000-8000-${String(index).padStart(12, '0')}`,
        proposalNumber: number,
        displayName: index === 0 ? 'Maria-Aparecida-dos-Santos-Fotocopiadora-Oficial-do-Coletivo' : `Pessoa ${index + 1}`,
        text: index % 7 === 0 ? 'Uma contribuição longa. '.repeat(30) : `Contribuição número ${index + 1}.`,
        createdAt: new Date(Date.parse(createdAt) + index * 60_000).toISOString(),
      }),
    );
  }
  return state;
}
