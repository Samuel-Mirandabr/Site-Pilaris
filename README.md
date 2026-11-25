# Pilaris — Seja o Pilar

Vitrine digital de moda executiva e cristã. **Não é e-commerce**: não há carrinho, checkout, pagamentos, pedidos nem cadastro de clientes. Toda compra ou encomenda é combinada pelo WhatsApp.

Stack: Next.js 15 (App Router) · React 19 · TypeScript · Tailwind CSS 3 · Supabase (PostgreSQL, Auth e Storage) · deploy previsto na Vercel.

## Executar localmente

```bash
npm install
cp .env.example .env.local     # opcional: sem Supabase o site roda em modo demonstração
npm run dev                    # http://localhost:3000
```

### Modo demonstração (sem Supabase)
Se `NEXT_PUBLIC_SUPABASE_URL`/`NEXT_PUBLIC_SUPABASE_ANON_KEY` estiverem vazias, o site público mostra **produtos de exemplo** (`src/lib/demo/data.ts`), identificados com a etiqueta “Exemplo” e um aviso no topo. O painel `/admin` **não funciona** nesse modo (login e persistência dependem do Supabase) e a página de login explica isso. Para testar o botão do WhatsApp localmente você pode definir `DEMO_WHATSAPP_NUMBER` (apenas modo demonstração).

## Configurar o Supabase (uma vez)

1. Crie um projeto em supabase.com.
2. No **SQL Editor**, execute, nesta ordem, os arquivos de `supabase/migrations/`: `0001_schema.sql`, `0002_rls.sql`, `0003_storage.sql`. São idempotentes.
3. **Authentication → Providers → Email:** desative **“Allow new users to sign up”** (cadastro público desligado).
4. **Authentication → Users → Add user:** crie a conta do proprietário (e-mail + senha, marque “Auto Confirm User”).
5. Marque essa conta como administradora (SQL Editor), trocando o e-mail:
   ```sql
   update auth.users
      set raw_app_meta_data = coalesce(raw_app_meta_data,'{}'::jsonb) || '{"role":"admin"}'
    where email = 'EMAIL_DO_PROPRIETARIO';
   ```
   Depois de marcar, saia e entre de novo no painel para o token ser renovado.
6. *(Opcional)* `supabase/seed_demo.sql` cadastra produtos de exemplo (`is_demo = true`). Remova-os pelo botão em **Resumo** no painel ou com `delete from public.products where is_demo;`.
7. Copie **Project URL** e a chave **anon/publishable** (Project Settings → API) para `.env.local`:
   ```
   NEXT_PUBLIC_SITE_URL=http://localhost:3000
   NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=...
   ```
   **Nunca** use a chave `service_role` neste projeto: ela não é necessária e não deve estar em nenhuma variável.
8. Entre em `/admin/login`, configure o WhatsApp e demais dados em **Configurações da loja** e cadastre produtos.

### Deploy na Vercel
Importe o repositório, defina as 3 variáveis acima (`NEXT_PUBLIC_SITE_URL` = domínio final) e publique. Nada é publicado ou conectado automaticamente.

## Como a segurança funciona
- **Quem é o administrador:** a conta com `app_metadata.role = "admin"` (só editável pelo painel/SQL do Supabase; `user_metadata` é ignorado). Não existe tabela paralela de usuários.
- **RLS em todas as tabelas** (`0002_rls.sql`): visitantes leem apenas produtos publicados de categorias ativas, imagens/variações ativas desses produtos, categorias ativas e as configurações; **só o administrador escreve**. O bucket de imagens é público para leitura e restrito ao administrador para escrita.
- **Defesa em camadas:** middleware → layout do painel → cada Server Action revalida a sessão com `auth.getUser()` e o papel de administrador no servidor → RLS no banco.
- Validação com Zod no servidor, sanitização de texto, caminhos de imagem validados e URL pública montada no servidor, cabeçalhos de segurança, `/admin` com `noindex` e fora do cache.
- Somente a chave pública do Supabase é usada. O painel grava com a sessão do próprio administrador (sem chave secreta).

## Regras de estoque
- **Pronta entrega:** controle por *quantidade* (0 = esgotado), *simples* (disponível/indisponível) ou *por variação* (cada opção tem seu estoque; o estoque do produto principal é ignorado).
- **Sob encomenda:** sem estoque; nunca aparece como pronta entrega.
- Estoque é alterado **somente** manualmente. Clique no WhatsApp não desconta nada.
- Produtos esgotados continuam visíveis e identificados; rascunhos nunca aparecem no site.
- Com estoque por variação, use um único tipo de variação (ex.: só Tamanho).
- Desativar uma categoria oculta também os produtos dela no catálogo público. Categoria com produtos não pode ser excluída.

## Estrutura
```
src/app/(site)/        páginas públicas (/, /catalogo, /produto/[slug], /sobre, /contato)
src/app/admin/         login e painel (produtos, categorias, estoque, configurações)
src/components/        ui · layout · catalog · product · home · admin
src/lib/domain/        regras puras: disponibilidade, catálogo, WhatsApp, formatação
src/lib/validation/    esquemas Zod (produto, categoria, configurações, login)
src/lib/services/      leitura de dados (público e painel) e mapeamento do banco
src/lib/supabase/      clientes (público, servidor, navegador, middleware)
src/lib/demo/          dados de exemplo
supabase/migrations/   SQL: tabelas, RLS, storage, função save_product (transação única)
tests/                 testes unitários (node:test + tsx)
```

## Scripts
`npm run dev` · `npm run build` · `npm run start` · `npm run lint` · `npm run typecheck` · `npm test`

## Conteúdo que depende do cliente
Número de WhatsApp, redes sociais, e-mail/horário/endereço, fotos e produtos reais (preços, descrições, variações, estoque) e revisão do texto da biografia. Nada disso foi inventado: tudo é editável no painel.

## Limitações conhecidas (v1)
- O catálogo carrega os produtos publicados (até 1000) e filtra/ordena/pagina no servidor da aplicação — adequado para uma loja de pequeno/médio porte.
- Fotos enviadas e não salvas no formulário podem deixar arquivos órfãos no Storage (removidos ao excluir a foto antes de salvar, mas não se a aba for fechada).
- Sem Content-Security-Policy estrita (exigiria nonces com o Next.js).
- Uma única conta administrativa; sem recuperação de senha própria (use o fluxo do Supabase).
- Fontes (Bodoni Moda e Jost) são substitutas das fontes da marca, que não vieram no material.
