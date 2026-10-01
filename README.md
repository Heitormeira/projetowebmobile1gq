# Sangue Solidário

Site que ajuda quem precisa de sangue a encontrar doadores compatíveis e disponíveis
perto de si. Trabalho da disciplina de Programação Web Mobile, com o tema "Banco de
Doação de Sangue Colaborativo".

O site só aproxima as pessoas. A doação deve ser feita em hemocentros e bancos de
sangue credenciados.

## Integrantes

| Nome | RA |
|------|----|
| Heitor Meira | 852542 |
| Marcelo Caldas | 852309 |
| João da Fonte | 852060 |

## Tecnologias

- Front end: React 19 e Next.js 15 (App Router)
- Estilo: CSS puro, em `app/globals.css`
- Back end: rotas de API em Node dentro do Next (`app/api/**`)
- Banco de dados: Back4App (Parse Server), classe `Doador`
- APIs externas: ViaCEP, Nominatim e Overpass (ambos do OpenStreetMap)
- Publicação: Vercel (site e rotas de API) e GitHub (código)

## Como rodar no computador

1. Crie um app no [Back4App](https://www.back4app.com/) e copie o Application ID e a
   JavaScript Key (App Settings, Security & Encryption).
2. Crie o arquivo `.env.local` a partir do `.env.example` e preencha:

   ```
   NEXT_PUBLIC_BACK4APP_APP_ID=...
   NEXT_PUBLIC_BACK4APP_JAVASCRIPT_KEY=...
   ADMIN_SENHA=uma-senha-so-de-voces
   ```

3. Instale e rode:

   ```
   npm install
   npm run dev
   ```

4. Abra http://localhost:3000.

Para criar alguns doadores de exemplo no Back4App: `npm run seed`.

No Vercel, cadastre as mesmas três variáveis em Settings, Environment Variables.

## Páginas

| Rota | O que faz |
|------|-----------|
| `/` | Explica como o site funciona e mostra a tabela de compatibilidade |
| `/buscar` | Quem precisa de sangue escolhe o tipo e vê os doadores compatíveis, mais os hemocentros próximos |
| `/cadastro` | Cadastro de doador |
| `/doadores` | Lista de doadores, com filtros |
| `/meu-cadastro` | O doador acha o próprio cadastro pelo e-mail e pode editá-lo |
| `/doadores/[id]/editar` | Edição de um cadastro |
| `/admin` | Entrada do administrador |

## CRUD

| Operação | Rota | Quem pode |
|----------|------|-----------|
| Criar | `POST /api/doadores` | Qualquer pessoa |
| Ler | `GET /api/doadores` | Qualquer pessoa (a lista pública não mostra contato) |
| Atualizar | `PUT /api/doadores/[id]` | O dono, com o e-mail do cadastro, ou o administrador |
| Excluir | `DELETE /api/doadores/[id]` | Só o administrador |

Outras rotas:

- `GET /api/doadores?tipoReceptor=A%2B&cidade=Recife&lat=..&lng=..`: busca para quem precisa de sangue
- `GET /api/meu-cadastro?email=...`: acha o cadastro pelo e-mail
- `GET /api/cep?cep=50030230`: consulta o ViaCEP
- `GET /api/hemocentros?lat=..&lng=..` ou `?cep=...`: hemocentros próximos
- `GET`, `POST` e `DELETE /api/admin`: ver, abrir e encerrar a sessão de administrador

## Regras do sistema

**Compatibilidade.** A busca usa uma tabela fixa, em `lib/regras.js`:

| Receptor | Pode receber de |
|----------|-----------------|
| O- | O- |
| O+ | O-, O+ |
| A- | O-, A- |
| A+ | O-, O+, A-, A+ |
| B- | O-, B- |
| B+ | O-, O+, B-, B+ |
| AB- | O-, A-, B-, AB- |
| AB+ | todos |

**Carência.** Depois de doar, o doador some da busca por 60 dias (homens) ou 90 dias
(mulheres e sexo não informado). A conta é feita no servidor, mesmo que ele continue
marcado como disponível.

## Privacidade

- O site mostra só o bairro e a cidade. Rua, CEP e coordenadas nunca saem do servidor.
- O CEP serve para achar o bairro e calcular a distância.
- O único contato é o e-mail, e ele só aparece na busca de quem precisa de sangue.
- A distância é mostrada em km inteiros, para não revelar onde a pessoa mora.
- Não há mapa com a posição dos doadores.

## Hemocentros e localização

Na busca, o botão "Usar minha localização" pega a posição do aparelho. Sem ele, o
usuário pode digitar o CEP. Com a origem, o site lista até 5 hemocentros num raio de
30 km, consultando o Overpass (OpenStreetMap). Se ele falhar, tenta o Nominatim. Se
nenhum responder, a tela avisa em vez de mostrar dados inventados. Os dados vêm da
comunidade do OpenStreetMap, então a cobertura varia por cidade e é bom confirmar o
horário por telefone.

## Administrador

Só o administrador exclui cadastros. A senha fica na variável `ADMIN_SENHA` (nunca no
código). Em `/admin` ele digita a senha e a sessão vale 8 horas, guardada em um cookie
que o JavaScript do navegador não consegue ler. Sem `ADMIN_SENHA` definida, ninguém
entra.

## Acessibilidade

O site foi pensado para pessoas idosas: fonte Atkinson Hyperlegible, três tamanhos de
letra, modo de alto contraste, botões grandes e textos escritos em vez de ícones.

## Limitações

- Não há login de verdade: quem souber o e-mail de um doador consegue editar o cadastro dele.
- A busca é pública e não tem limite de consultas.
- O site não envia mensagens: o botão abre o aplicativo de e-mail de quem busca.
- A distância é em linha reta, não por ruas.

## Estrutura

```
app/          páginas e rotas de API
components/   componentes React
lib/          regras de negócio, Back4App, ViaCEP, geolocalização, hemocentros, admin
scripts/      seed e verificação das regras
docs/         roteiro do vídeo e rascunho dos slides
```
