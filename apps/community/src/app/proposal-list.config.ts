export type ListTab = 'open' | 'suggestions' | 'decided';

export const LIST_TABS: readonly { id: ListTab; label: string; empty: string }[] = [
  { id: 'open', label: 'Em conversa', empty: 'Nenhuma conversa aberta no momento.' },
  { id: 'suggestions', label: 'Sugestões', empty: 'Nenhuma sugestão nova. Que tal enviar a primeira?' },
  { id: 'decided', label: 'Decididas', empty: 'Nenhuma decisão publicada ainda.' },
];
