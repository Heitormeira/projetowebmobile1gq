# 📊 Estrutura dos slides — Sangue Solidário

> Sugestão: 12 slides. Substitua os campos entre `[colchetes]` pelos dados
> reais do grupo. O que **não** foi implementado está no slide 10 — exigência
> da especificação.

---

## Slide 1 — Capa
- **Sangue Solidário** — plataforma colaborativa de doação de sangue
- Disciplina, professor, data
- Integrantes: `[nome + RA de cada um]`

## Slide 2 — O problema
- Localizar doadores compatíveis rapidamente depende de grupos de WhatsApp
- Dois obstáculos: **compatibilidade sanguínea** (não é tipo igual a tipo) e **carência** entre doações
- Necessidade: informação organizada + contato direto

## Slide 3 — A solução
- Plataforma web: receptor informa o tipo que precisa receber + localização
- Sistema devolve doadores **compatíveis, disponíveis e próximos**, com WhatsApp/telefone
- Doador gerencia o próprio cadastro (disponibilidade, última doação, exclusão)

## Slide 4 — Stack técnica
- React 19 + Next.js 15 (App Router) — front-end e rotas de API Node
- CSS puro (sem frameworks)
- Back4App (Parse Server) — persistência
- APIs externas: **ViaCEP** (endereço por CEP) e **Nominatim/OpenStreetMap** (coordenadas + mapa)
- Deploy: Vercel + Back4App · Código no GitHub

## Slide 5 — Entidade Doador
- Campos: nome, tipoSanguineo, sexo, cep, cidade, bairro, uf, telefoneContato, ultimaDoacao, disponivel, dataCadastro (automática), latitude/longitude (geocodificação)
- Diagrama simples da classe no Back4App

## Slide 6 — Regra 1: compatibilidade sanguínea
- Tabela fixa do receptor (`lib/regras.js`): O− recebe só de O− … AB+ recebe de todos
- Estrutura imutável em código — sem API, sem cálculo dinâmico
- Screenshot da tabela da landing page

## Slide 7 — Regra 2: carência entre doações
- Homens: 60 dias · Mulheres: 90 dias (padrão 90 sem sexo informado)
- Verificação **no servidor**: doador em carência não aparece na busca
- Mesmo com `disponivel = true` manual

## Slide 8 — CRUD integrado ao Back4App
- **C**reate: `/cadastro` → POST `/api/doadores` (validação + ViaCEP)
- **R**ead: `/doadores` e `/buscar` → GET (filtros no servidor)
- **U**pdate: `/doadores/[id]/editar` → PUT
- **D**elete: botão com confirmação → DELETE
- Screenshots de cada tela

## Slide 9 — APIs externas + geolocalização
- ViaCEP: cidade/bairro/UF automáticos pelo CEP (menos digitação, dados padronizados)
- Nominatim: CEP → coordenadas (com cache + rate limit)
- Haversine: distância real, resultados ordenados do mais próximo
- Mapa OpenStreetMap do doador mais próximo

## Slide 10 — O que NÃO foi implementado
- Login/autenticação de contas (gestão é por telefone, sem senha)
- Notificações/e-mail quando um receptor compatível busca
- Histórico de doações (apenas a última data)
- Cálculo de distância com API de rotas (ruas/trafego — usamos linha reta)
- Testes automatizados de interface
- *(arquem cada item com o motivo: escopo/tempo)*

## Slide 11 — Quem implementou o quê
| Integrante | RA | Parte |
|---|---|---|
| `[nome]` | `[RA]` | `[back-end: rotas API + regras de negócio]` |
| `[nome]` | `[RA]` | `[CRUD + integração Back4App]` |
| `[nome]` | `[RA]` | `[telas de busca e listagem]` |
| `[nome]` | `[RA]` | `[cadastro/edição + componentes]` |
| `[nome]` | `[RA]` | `[CSS + integração ViaCEP/mapa]` |

## Slide 12 — Conclusão + demo
- Resultado: fluxo completo receptor ↔ doador funcionando
- Vídeo demonstrativo (link) e repositório (link)
- Perguntas?
