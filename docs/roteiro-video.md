# 🎥 Roteiro do vídeo demonstrativo — Sangue Solidário (até 4 minutos)

> Duração alvo: **3min30s** (margem de 30s). Grave a tela em 1080p, feche
> abas desnecessárias e use dados do seed (`npm run seed`) para a demo.

## Roteiro detalhado

### 0:00–0:25 — Abertura e problema
- Mostre a **landing page** (`/`).
- Fala sugerida: *"Encontrar um doador de sangue compatível hoje depende de
  correntes de WhatsApp desorganizadas. O Sangue Solidário resolve isso
  conectando receptores a doadores compatíveis e disponíveis na sua cidade."*
- Aponte os 4 cartões de destaque (compatibilidade real, carência, CEP, contato direto).

### 0:25–0:50 — Stack e arquitetura
- Diga rapidamente: *"Front-end em React com Next.js, CSS puro, back-end em
  rotas Node do próprio Next e persistência no Parse Server do Back4App.
  Integração com duas APIs externas: ViaCEP e OpenStreetMap/Nominatim."*
- Mostre a estrutura de pastas no editor por ~10 segundos.

### 0:50–1:40 — CREATE (cadastro de doador)
- Abra `/cadastro`, preencha o formulário e **mostre o ViaCEP preenchendo
  cidade/bairro automaticamente** ao digitar o CEP.
- Salve e comente: *"O back-end valida os dados, consulta o ViaCEP,
  geocodifica o CEP e grava no Back4App — disponível por padrão."*
- Dica: abra o painel do Back4App em paralelo para exibir o registro criado.

### 1:40–2:20 — READ (busca do receptor + listagem)
- Em `/buscar`, selecione o tipo do receptor e mostre a faixa com os tipos
  compatíveis; busque e destaque: *"A compatibilidade, a carência de 60/90
  dias e os filtros de localização são aplicados no servidor."*
- Volte para `/doadores` e mostre a listagem completa, filtros e a visão em cards.
- (Se tiver CEPs geocodificados) refaça a busca com o seu CEP para mostrar a
  **ordenação por distância e o mapa** do doador mais próximo.

### 2:20–3:00 — UPDATE e fluxo "Meu cadastro"
- Em `/meu-cadastro`, encontre o doador pelo telefone e abra **Editar**.
- Atualize a data da última doação para hoje, salve, e mostre que ele
  **desaparece da busca** (carência aplicada no servidor).
- Desmarque "disponível" para mostrar o bloqueio manual.

### 3:00–3:30 — DELETE + encerramento
- Em `/doadores`, exclua um cadastro com a confirmação em duas etapas.
- Fala final: *"CRUD completo no Back4App, regras de negócio do sangue e
  duas APIs externas. Obrigado!"*

## Checklist antes de gravar
- [ ] `npm run seed` executado (dados de exemplo)
- [ ] `.env.local` configurado e servidor respondendo
- [ ] Painel do Back4App aberto numa aba (para mostrar o banco)
- [ ] Teste a busca com carência antes (doador "Ana Souza" do seed está indisponível)
