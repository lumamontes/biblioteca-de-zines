# Diagnóstico de catalogação e descoberta de zines

Rodada de **21/11/2026 (Macapá)**. Código consultado na [main em 9fd49259009e](https://github.com/lumamontes/biblioteca-de-zines/commit/9fd49259009e2d68576bc1683396b94edf607686). A investigação atende à [#202](https://github.com/lumamontes/biblioteca-de-zines/issues/202) e ao acompanhamento da [#203](https://github.com/lumamontes/biblioteca-de-zines/issues/203). O SHA da versão implantada ficou sem confirmação.

As 16 buscas históricas reproduziram na interface as contagens da linha de base da #202. Quatro pistas adicionais presentes nas descrições também ficaram sem resultados. A expansão literal histórica recuperou pistas específicas, mas elevou de 1 para 23 os resultados de «colagem» sem trazer uma ficha explicitamente categorizada entre as cinco primeiras.

## Amostra pública

Seleção intencional das cinco obras de calibração e de outras 12, incluindo duas da segunda página. Abrange créditos individuais, coletivos, múltiplos e genéricos, anos publicados entre 2021 e 2026 e diferentes descrições. As pistas foram formuladas na revisão. As categorias vêm da ficha exibida. A primeira pessoa é indício textual, com origem editorial ainda desconhecida. O travessão indica ano sem registro nesta rodada. A seleção favorece o início da listagem por cadastro. Tipo de PDF e texto integral não foram verificados.

| Zine | Crédito público | Ano | Pista e campo |
| --- | --- | --- | --- |
| [Visagens no meio do mundo](https://www.biblioteca-de-zines.com.br/zines/coletivo-ventos-do-norte-visagens-no-meio-do-mundo) | Coletivo Ventos do Norte | 2026 | Causos ancestrais, descrição |
| [Entre os Cacos](https://www.biblioteca-de-zines.com.br/zines/aimee-morais-entre-os-cacos) | Aimeê Morais | 2026 | Calisto, descrição. Saúde Mental, categoria |
| [Frequência Fantasma](https://www.biblioteca-de-zines.com.br/zines/caio-maximino-frequencia-fantasma) | Caio Maximino | 2026 | RPG solo, descrição |
| [Lancei Minha Âncora no Vazio](https://www.biblioteca-de-zines.com.br/zines/mario-henrique-troncoso-trujillo-lancei-minha-ancora-no-vazio) | Mário Henrique Troncoso Trujillo | 2026 | Versos livres, descrição em primeira pessoa |
| [Qualquer coincidência, é mera semelhança](https://www.biblioteca-de-zines.com.br/zines/robin-m-f-qualquer-coincidencia-e-mera-semelhanca) | Robin M. F. | 2026 | Colagem, categoria. Descrição curta sem técnica |
| [Aotordoado/confuso](https://www.biblioteca-de-zines.com.br/zines/joao-paulo-aotordoadoconfuso) | João Paulo | 2026 | Discos brasileiros, descrição em primeira pessoa |
| [Sinal Fantasma](https://www.biblioteca-de-zines.com.br/zines/helder-medeiros-sinal-fantasma) | Helder Medeiros | 2026 | Antena, descrição. Arte digital, categoria |
| [Ruido_en_Papel_Costa_Rica](https://www.biblioteca-de-zines.com.br/zines/jorge-mau-munoz-ruidoenpapelcostarica) | Jorge Mau Muñoz, Linger On Reggay Crew, Anbessa Sound Fam | 2026 | Rocksteady, descrição em espanhol. Costa Rica, título, com papel territorial indeterminado |
| [EU MESMA ME VEJO](https://www.biblioteca-de-zines.com.br/zines/maria-junqueiro-eu-mesma-me-vejo) | Maria Junqueiro | 2026 | Autorretrato, descrição com grafia “Auto retrato” |
| [Olhos Marejados](https://www.biblioteca-de-zines.com.br/zines/iara-magalhaes-b-bartalini-olhos-marejados) | Iara Magalhães B. Bartalini | 2026 | Giz de cera de abelha, descrição |
| [Letra Ilustrada: Dos mistérios Makalister](https://www.biblioteca-de-zines.com.br/zines/iara-magalhaes-b-bartalini-letra-ilustrada-dos-misterios-makalister) | Iara Magalhães B. Bartalini | 2026 | Aquarela, descrição em primeira pessoa. Ilustração, categoria |
| [ZINETONES](https://www.biblioteca-de-zines.com.br/zines/varios-autores-zinetones) | Vários autores | 2026 | Quadrinhos de artistas de quatro países, descrição. Crédito genérico |
| [Árvores Notáveis](https://www.biblioteca-de-zines.com.br/zines/inaye-freitas-arvores-notaveis) | Inayê Freitas | 2025 | Fotografia, categoria. TCC, descrição em primeira pessoa |
| [pra cada nó amarrado te pedi em segreso](https://www.biblioteca-de-zines.com.br/zines/inaye-freitas-pra-cada-no-amarrado-te-pedi-em-segreso) | Inayê Freitas | 2026 | Salvador, local das fotografias na descrição em primeira pessoa |
| [Paradise Kiss:gênero,juventude e identidade](https://www.biblioteca-de-zines.com.br/zines/mavi-elisio-barbosa-paradise-kissgenerojuventude-e-identidade) | Mavi Elisio Barbosa | 2021 | Vivências queer, descrição. LGBTQIA+, categoria |
| [Belém do Grão Pará - Adaptação em quadrinhos da obra de Dalcídio Jurandir](https://www.biblioteca-de-zines.com.br/zines/coletivo-brt-belem-do-grao-para-adaptacao-em-quadrinhos-da-obra-de-dalcidio-jurandir) | COLETIVO BRT | — | Dalcídio Jurandir, título, como autoria da obra adaptada |
| [Matinta Zine #05](https://www.biblioteca-de-zines.com.br/zines/coletivo-matinta-matinta-zine-05) | Coletivo Matinta | — | Matinta e #05, título. A numeração é pista de série |

## Reprodução e resultados

Em [Explorar Zines](https://www.biblioteca-de-zines.com.br/zines), usar «Mais recentes», sem filtros de ano ou categoria, e substituir o texto no campo «Buscar zine ou autor». Aguardar o fim do carregamento e contar os cartões em ordem. As 20 buscas incluíram 9 vazias. Para termos amplos, a obra-alvo é um exemplo relevante. As quatro últimas foram definidas antes de digitar os termos com base nas descrições acima. Para as anteriores, a evidência de origem e as observações iniciais estão nos comentários da #202.

A última coluna registra o experimento anterior da #202 via API pública (correspondência literal na descrição por ILIKE, acrescentada após título e autoria, com deduplicação por obra). A reprodução atual foi pela interface. Não houve simulação nem nova execução da variante. Fontes da rodada anterior: [calibração](https://github.com/lumamontes/biblioteca-de-zines/issues/202#issuecomment-7070333534), [controle e variante](https://github.com/lumamontes/biblioteca-de-zines/issues/202#issuecomment-7070455513) e [ampliação](https://github.com/lumamontes/biblioteca-de-zines/issues/202#issuecomment-7070576910).

| Consulta literal | Obra-alvo e evidência | Contagem na interface | Posição da obra-alvo e outros resultados observados | Variante histórica com descrição |
| --- | --- | ---: | --- | --- |
| causos ancestrais | Visagens no meio do mundo, descrição | 0 | — | 1, 1º |
| Aimee Morais | Entre os Cacos, crédito sem acento | 1 | 1º | 1, 1º |
| Frequencia Fantasma | Frequência Fantasma, título sem acento | 0 | — | 0 |
| âncora | Lancei Minha Âncora no Vazio, título | 1 | 1º | 1, 1º |
| mera semelhança | Qualquer coincidência, é mera semelhança, título | 1 | 1º | 1, 1º |
| Frequência Fantasma | Frequência Fantasma, controle com acento | 1 | 1º | 1, 1º |
| poesia | Lancei Minha Âncora no Vazio, categoria e descrição | 3 | Ausente. Poesias Amarelas, Poesias pra quem tem o quadril bichado, A Poesia de Mulheres Indígenas LGBTQIA+ | 9, 4º |
| colagem | Qualquer coincidência, é mera semelhança, categoria | 1 | Ausente. Zine de experimentos em colagem é 1º | 23, fora dos cinco primeiros |
| fotografia | Práticas e Ética na Fotografia, título | 3 | 1º, seguida de fotografia e memória e notas sobre fotografias | 13, 1º |
| saúde mental | Entre os Cacos, categoria | 1 | Ausente. Cinema e saúde mental é 1º | 3, 2º |
| RPG solo | Frequência Fantasma, descrição | 0 | — | 2, 1º |
| Calisto | Entre os Cacos, descrição | 0 | — | 1, 1º |
| versos livres | Lancei Minha Âncora no Vazio, descrição | 0 | — | 1, 1º |
| ilustração | Colagens do Lixo, alvo registrado no teste anterior | 1 | Ausente. Letra Ilustrada: Dos mistérios Makalister é 1º | 2, 2º |
| Macapá | Macapá entre rios e luar, título | 1 | 1º | 1, 1º |
| Coletivo Ventos do Norte | Visagens no meio do mundo, crédito | 1 | 1º | 1, 1º |
| rocksteady | Ruido_en_Papel_Costa_Rica, descrição | 0 | — | — |
| giz de cera | Olhos Marejados, descrição | 0 | — | — |
| Salvador | pra cada nó amarrado te pedi em segreso, descrição | 0 | — | — |
| queer | Paradise Kiss:gênero,juventude e identidade, descrição | 0 | — | — |

## Implementação e comparação pendente

O [serviço](https://github.com/lumamontes/biblioteca-de-zines/blob/9fd49259009e2d68576bc1683396b94edf607686/apps/web/src/services/zine-service.ts) usa textSearch em library_zines.title_fts e authors.name_fts com configuração portuguese e tipo websearch. Faz união por ID, preservando a primeira ocorrência e colocando o lote de título antes do de autoria. Em «Mais recentes», ordena cada lote por created_at sem reordenar globalmente após combinar. Ano entra no lote de título. O lote de autoria não reaplica esse filtro no serviço, um caso para verificar na interface antes da #186. Categoria filtra depois pela presença de alguma categoria selecionada nas tags. Descrição e categoria estão ausentes da busca textual. O tipo aceita authorId, mas searchZines não lê o argumento. A [#186](https://github.com/lumamontes/biblioteca-de-zines/issues/186) trata de autoria selecionada por identidade, combinável com filtros e paginação.

A diferença entre a busca por autoria sem acento e por título sem acento foi reproduzida. O código comprova a configuração enviada na consulta, enquanto composição, atualização e índices dos vetores dependem de comprovação em SQL e acesso de leitura ao esquema implantado. Latência, planos e resultados da variante FTS ponderada ficaram pendentes.

Congelar um recorte autorizado com título, autoria, ano, categoria, descrição, vetores e data de cadastro. Aplicar as mesmas consultas, filtros e recorte a (A) título e autoria atuais, (B) A com ILIKE de descrição, (C) FTS com pesos por campo e desempate estável. Variar a normalização de acentos em um controle próprio. Medir contagem, vazios, posição e presença no top 5 por obra-alvo, com relevância definida antes dos testes. Em ambiente de teste, repetir rodadas após aquecimento e registrar p50, p95 e planos com EXPLAIN (ANALYZE, BUFFERS). Validar a combinação com ano e categoria e comparar deslocamentos de título e autoria.

## DC Punk Archive

A [Zine Library](https://digdc.dclibrary.org/do/5a4fb481-be26-44bb-8bc4-077f3b28dfb3) abriu por data ascendente, com busca dentro da coleção. O título da listagem abriu a [ficha de Hi, this is me, Becky](https://digdc.dclibrary.org/do/a4e04944-6d59-4474-ad31-af94b166d76c). Na descrição, o crédito «Klein, Melissa» oferece [busca facetada por autoria](https://digdc.dclibrary.org/search?search_api_fulltext=&sort_by=changed&sort_order=DESC&items_per_page=25&f%5B0%5D=creator_lod_name_label%3AKlein%2C%20Melissa), que incluiu [Flamer free fan fold out](https://digdc.dclibrary.org/do/97991c63-0f34-43df-ab84-ae532e0cd2bb) na mesma coleção e itens de outras coleções. A ficha também permite explorar os assuntos «Emotions» e «Personal narratives», e distingue cidade de região. A relação observada foi por autoria. A busca no conteúdo do leitor ficou sem teste. O percurso foi verificado em Dig DC.

## Próximos passos

| Evidência | Ação | Dependência | Critério de conclusão |
| --- | --- | --- | --- |
| Calisto, causos ancestrais, rocksteady e giz de cera estão na descrição e ficaram vazios | #202: comparar A/B/C | Recorte autorizado e ambiente equivalente | Recuperar as pistas sem perder correspondências fortes de título ou autoria |
| Uma ficha com categoria Colagem ficou fora do top 5 histórico | #202: testar categoria como filtro e sinal ponderado | Definir obras relevantes antes do teste | Fichas categorizadas recuperáveis e posição justificada |
| Frequencia Fantasma falha sem acento | #202: comparar lexemas e normalização de títulos e autorias | Definições SQL e índices instalados | Causa demonstrada e grafia publicada preservada |
| Queer é termo da descrição; LGBTQIA+ é categoria. Giz de cera é material; Salvador é local das fotos | #116: registrar termos, papéis, fonte e exemplos. Testar a hipótese editorial «zines do Amapá» distinguindo assunto, produção e circulação | Revisão da equipe; termos espontâneos dependem das respostas da comunidade | Decisões de vocabulário documentadas e conferidas na #202, sem presumir equivalência |
| Nenhuma pista tem origem verificada somente dentro da obra | #202: selecionar trecho e página autorizados, ausentes dos campos públicos; comparar arquivo com texto e página que exija OCR | Amostra autorizada | Consulta reproduzível por página e decisão sobre indexação |
| Crédito navegável relacionou publicações no Dig DC | #186: testar seleção de autoria com outros filtros, teclado e paginação | Identidades publicadas | Seleção retorna as obras vinculadas e persiste entre páginas |
| Perfil e estrutura distinguem papéis, proveniência e acesso | [#108](https://github.com/lumamontes/biblioteca-de-zines/issues/108) e [#131](https://github.com/lumamontes/biblioteca-de-zines/issues/131): revisar lacunas dos campos. Greenstone passa a merecer avaliação perante necessidade de indexação integral autorizada e navegação facetada. DSpace passa a merecer avaliação perante necessidade de fluxos de depósito, acesso e exportação interoperável | Requisito demonstrado e custo operacional comparável | Decisão de avaliar ferramentas ligada a evidência local e critérios verificáveis |
| O protocolo distingue catálogo, vocabulário, campo de busca e ordenação | #203 acompanha os testes. [Viveiro #5](https://github.com/viveiro-digital/recursos/issues/5) avalia reaproveitamento | Validação local | Guia ou exemplo separa procedimento, dependências de PostgreSQL/Supabase e vocabulário local |

O formulário «O Futuro da Biblioteca de Zines - Pesquisa» apoia as decisões de representação e acesso conforme a [decisão comunitária](./decisions/8-community-consultation-for-catalogue-policies.md). A revisão editorial é uma entrega interna. A publicação e o contato com participantes cabem à equipe.
