# Fluxo de Upload & Publicação

Este documento explica como os zines **passam da submissão à publicação**.

---

## **1: Submissão do Usuário**
- Usuários enviam seus zines via **Forms**.
- Dados são armazenados em **`form_uploads`**.

## **2:  Revisão e Publicação do Admin**
- Admin acessa o Painel Admin em /dashboard.
- Eles revisam as submissões de `form_uploads`.
- Se aprovado, clicam em “Publicar”.

📌 **Ação de Publicação:**
- Move o zine de `form_uploads` para `library_zines`.
- Garante que os autores existam na tabela `authors`.
- Vincula autores e zines (`library_zines_authors`).
- Atualiza `is_published` para true.

## **3: Despublicar um Zine**
- Admin pode despublicar um zine.
- Apenas atualiza `is_published` para false em `library_zines`.

## **Ações no Banco de Dados**
| Ação                | Afeta a Tabela          |
|---------------------|-------------------------|
| Usuário envia zine  | `form_uploads`          |
| Admin publica       | Move para `library_zines` |
| Autores adicionados | `authors`               |
| Zine vinculado      | `library_zines_authors` |
| Despublicar         | Atualiza `library_zines.is_published` |

## **Resumo do Fluxo**
📌 Usuário envia zine → Vai para `form_uploads`  
📌 Admin revisa → Clica em "Publicar"  
📌 Zine vai para `library_zines` (publicado)  
📌 Detalhes do autor vinculados (`library_zines_authors`)  
📌 Se despublicado → `is_published = false`

## Processamento de páginas e capas

O fluxo detalhado de gerações, páginas privadas de submissão, páginas públicas de
publicações, reprocessamento quando o PDF muda, fallback de capa e retenção está em
[`docs/specs/page-processing-and-asset-lifecycle.md`](./specs/page-processing-and-asset-lifecycle.md).

Os procedimentos operacionais, migrações e comandos estão em
[`docs/runbooks/page-processing.md`](./runbooks/page-processing.md).
