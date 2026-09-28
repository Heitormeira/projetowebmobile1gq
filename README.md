# 🩸 Sangue Solidário

Plataforma web colaborativa que conecta **receptores de sangue** a **doadores
cadastrados** que sejam sanguineamente compatíveis e estejam disponíveis,
com informações de localização para facilitar o contato direto.

## 👥 Integrantes

| Nome | RA | Parte implementada |
|------|----|--------------------|
| *NOME DO INTEGRANTE 1* | *RA 1* | Back-end (API Node/rotas + regras de negócio) |
| *NOME DO INTEGRANTE 2* | *RA 2* | CRUD completo integrado ao Back4App (Create/Read/Update/Delete) |
| *NOME DO INTEGRANTE 3* | *RA 3* | Front-end — telas de busca e listagem (React) |
| *NOME DO INTEGRANTE 4* | *RA 4* | Front-end — cadastro/edição + componentes React |
| *NOME DO INTEGRANTE 5* | *RA 5* | CSS e design (CSS puro) + integração ViaCEP |

> **Edite esta tabela** com os dados reais do grupo — o README deve conter
> nome e RA de todos os integrantes.

## 🛠 Stack técnica

- **Front-end:** React 19 + Next.js 15 (App Router) — requisito obrigatório
- **Estilização:** CSS puro (sem frameworks), arquivo `app/globals.css`
- **Back-end / persistência:** Back4App (Parse Server), acessado por rotas
  de API Node do Next (`app/api/**`)
- **APIs externas:** [ViaCEP](https://viacep.com.br/) — preenche cidade/bairro/UF
  a partir do CEP · [Nominatim/OpenStreetMap](https://nominatim.org/) — coordenadas,
  distância (Haversine) e mapa
- **Deploy:** Vercel (front + rotas API) e Back4App (banco)
- **Versionamento:** GitHub

## 🚀 Como rodar localmente

1. **Criar o app no Back4App** (gratuito): [https://www.back4app.com/](https://www.back4app.com/)
2. Copiar as chaves em *Dashboard → App Settings → Security & Encryption*:
   - Application ID
   - JavaScript Key
3. Criar o arquivo `.env.local` na raiz (copie de `.env.example`):

   ```bash
   cp .env.example .env.local
   # cole suas chaves dentro do arquivo
   ```

4. Instalar dependências e rodar o seed (popula a classe `Doador`):

   ```bash
   npm install
   npm run seed
   ```

5. Iniciar o servidor de desenvolvimento:

   ```bash
   npm run dev
   ```

6. Abrir [http://localhost:3000](http://localhost:3000).

## 🧪 Verificar as regras de negócio

```bash
npm run verificar-ambiente
```

Valida a tabela de compatibilidade (8 tipos) e a carência entre doações
(60 dias homens / 90 dias mulheres), sem precisar de rede.

## 📄 Páginas

| Rota | Descrição |
|------|-----------|
| `/` | Landing page com explicação e tabela de compatibilidade |
| `/buscar` | Busca por doadores compatíveis e disponíveis, com distância e mapa |
| `/cadastro` | Cadastro de novo doador (**CREATE**) |
| `/doadores` | Listagem geral de doadores (**READ**) com filtros |
| `/doadores/[id]/editar` | Edição (**UPDATE**) e exclusão (**DELETE**) |
| `/meu-cadastro` | Doador encontra o próprio cadastro pelo telefone |

## 🔌 API (rotas Node)

| Método | Rota | Operação |
|--------|------|----------|
| `POST` | `/api/doadores` | CREATE — valida dados, consulta ViaCEP e salva no Back4App |
| `GET` | `/api/doadores?tipoReceptor=A%2B&cidade=Recife&bairro=Boa%20Viagem&apenasDisponiveis=true` | READ — lista com filtros de compatibilidade/carência/localização |
| `GET` | `/api/doadores` | READ — lista completa |
| `PUT` | `/api/doadores/[id]` | UPDATE — edição dos dados do doador |
| `DELETE` | `/api/doadores/[id]` | DELETE — remove o cadastro |
| `GET` | `/api/cep?cep=50000000` | Proxy para a API externa ViaCEP |
| `GET` | `/api/meu-cadastro?telefone=81999990001` | Localiza o cadastro pelo telefone |

## 🧬 Regras de negócio

### Compatibilidade sanguínea (estrutura fixa no código)

Do ponto de vista do **receptor** — quem precisa receber:

| Receptor | Pode receber de |
|----------|-----------------|
| O− | O− |
| O+ | O−, O+ |
| A− | O−, A− |
| A+ | O−, O+, A−, A+ |
| B− | O−, B− |
| B+ | O−, O+, B−, B+ |
| AB− | O−, A−, B−, AB− |
| AB+ | Todos (receptor universal) |

Implementada em `lib/regras.js` como objeto fixo (`COMPATIBILIDADE_RECEPTOR`) —
não depende de API externa nem de cálculo dinâmico.

### Período de carência entre doações

- **Homens:** intervalo mínimo de **60 dias** entre doações
- **Mulheres:** intervalo mínimo de **90 dias** entre doações
- Sem sexo informado: aplica-se o padrão de **90 dias**

A verificação é feita **no servidor**: o doador que doou dentro do período de
carência não aparece nas buscas, mesmo que tenha marcado "disponível" manualmente.

## 🗃 Entidade Doador (classe no Back4App)

| Campo | Tipo | Observação |
|-------|------|------------|
| `nome` | String | obrigatório |
| `tipoSanguineo` | String | um de O−, O+, A−, A+, B−, B+, AB−, AB+ |
| `sexo` | String | `masculino` / `feminino` (usado na carência) |
| `cep` | String | consultado na API ViaCEP |
| `cidade` | String | preenchida pelo ViaCEP |
| `bairro` | String | opcional (sugerido pelo ViaCEP) |
| `uf` | String | preenchido pelo ViaCEP |
| `telefoneContato` | String | usado para contato/WhatsApp |
| `ultimaDoacao` | Date | opcional — base do cálculo de carência |
| `disponivel` | Boolean | padrão `true` no cadastro |
| `dataCadastro` | Date | automático (`createdAt` do Parse) |

## ☁️ Deploy

- **Back4App:** o banco já roda no Parse Server do Back4App — basta criar o app
  e configurar as chaves.
- **Vercel:** importe o repositório no GitHub e configure as variáveis de
  ambiente `NEXT_PUBLIC_BACK4APP_APP_ID` e `NEXT_PUBLIC_BACK4APP_JAVASCRIPT_KEY`
  nas configurações do projeto.

## 🗺️ Geolocalização (Nominatim + Haversine)

Ao cadastrar, o CEP é geocodificado (lat/lng) via **Nominatim/OpenStreetMap** e
salvo no Back4App. Na busca, o receptor pode informar o **CEP de origem**: o
back-end calcula a **distância real (fórmula de Haversine)** até cada doador,
ordena do mais próximo e exibe um **mapa OpenStreetMap** do primeiro resultado.
Geocodificações são cacheadas em memória com rate limit de 1 req/s (política
do Nominatim); falhas não bloqueiam cadastro nem busca.

## 🎥 Entregáveis do trabalho

- **Vídeo (até 4 min):** visão geral da plataforma + demonstração do CRUD
  completo (criar, listar/buscar, editar e excluir doador) integrado ao Back4App.
  Roteiro pronto em [`docs/roteiro-video.md`](docs/roteiro-video.md).
- **Slides:** o que foi implementado, o que **não** foi implementado e quem
  implementou cada parte — estrutura pronta em [`docs/slides.md`](docs/slides.md).
