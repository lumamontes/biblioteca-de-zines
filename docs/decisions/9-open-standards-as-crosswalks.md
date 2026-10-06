# Usar padrões como lentes e crosswalks seletivos

## Contexto

A Biblioteca precisa descrever zines de forma interoperável, mas nenhum padrão
sozinho representa bem autoria contextual, pseudonímia, incerteza, privacidade,
direitos, acesso e custódia. ZineCore2, AgentCore2, ZineCat, xZINECOREx,
Dublin Core, RDA, MARC, BIBFRAME, Schema.org, PREMIS e IIIF servem a propósitos
relacionados, mas diferentes.

## Decisão

A semântica local da Biblioteca será a referência principal. Padrões externos
serão usados como lentes de comparação, vocabulários de exportação, práticas
descritivas ou possíveis integrações futuras. Cada crosswalk deverá registrar a
versão ou revisão da fonte, a cardinalidade, o significado local e qualquer
perda de proveniência, visibilidade, direitos ou acesso.

ZineCore2 e seus perfis relacionados serão referências provisórias para
interoperabilidade zine-específica, sempre com revisão da versão escolhida.
Dublin Core será uma base de interoperabilidade, não um substituto para os
papéis e estados qualificados da Biblioteca. RDA e MARC orientarão descrição e
intercâmbio quando úteis, não um modelo obrigatório de livro. BIBFRAME,
Schema.org, PREMIS e IIIF permanecerão opções condicionadas a consumidores ou
fluxos reais.

## Alternativas consideradas

### Adotar um padrão único

Seria simples de comunicar, mas apagaria distinções importantes e faria a
Biblioteca herdar pressupostos de coleções, bibliotecas ou plataformas diferentes.

### Não usar padrões externos

Preservaria autonomia semântica, mas dificultaria exportação, descoberta e
aprendizado com outras bibliotecas de zines.

### Manter semântica local com crosswalks seletivos

Esta é a opção escolhida. Ela permite interoperabilidade sem transformar cada
padrão em requisito ou autoridade sobre a comunidade.

## Consequências

- O perfil local precisa documentar mapeamentos e divergências de forma explícita.
- Exportações podem perder cardinalidade, incerteza, privacidade ou significado de
  acesso; essa perda deve ser registrada, não escondida.
- A consulta com zineiros continua necessária para termos de identidade,
  autoria, sensibilidade, acesso e reutilização.
- A saída Schema.org atual deve ser revisada como projeção web, não usada como
  prova de que o modelo local já está resolvido.

## Links

- [Open standards strategy](../catalogue-information-architecture.md#open-standards-strategy)
- [Zine research references](../zine-research-references.md)
- [Catalogue information architecture](../catalogue-information-architecture.md)
