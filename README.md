# 📦 SupriBox

Sua dose diária de surpresa. A pessoa abre uma "caixinha" e recebe algo que levanta o dia — **segmentado por perfil**: idoso recebe mais versículos e carinho, jovem recebe frases punchy e cards "vibe", adulto recebe um mix equilibrado.

O 1 centavo é **isca**, não o produto. O lucro vem da **assinatura recorrente** (caixinha todo dia no WhatsApp) e de **caixas premium** avulsas.

## Arquitetura

```
supri-box/
├── frontend/
│   └── index.html        # interface premium (abre caixinha, anima, revela)
│                         # roda offline OU conecta no backend (API_BASE)
└── backend/              # Node + Express + Prisma + PostgreSQL
    ├── prisma/schema.prisma
    └── src/
        ├── server.js
        ├── db.js
        ├── sorteio.js    # motor de sorteio ponderado por perfil
        ├── seed.js       # acervo curado + planos de assinatura
        └── routes/
            ├── caixinha.js    # GET /caixinha?perfil=jovem
            ├── conteudos.js   # CRUD do acervo
            ├── usuarios.js    # cadastro + assinatura
            ├── assinatura.js  # planos + criar Pix + status
            ├── webhook.js     # WhatsApp via Z-API
            └── pagamento.js   # Pix avulso + webhook Mercado Pago
```

## Motor de segmentação

Cada conteúdo tem `pesos = { idoso, adulto, jovem }`. O sorteio é ponderado: peso maior = mais chance, e cada tipo "puxa" por perfil. Peso `0` exclui o conteúdo daquele público. Fácil de calibrar — é só ajustar os números no banco.

| Vibe (UI)   | Perfil (motor) | Conteúdo dominante         |
|-------------|----------------|----------------------------|
| Serenidade  | idoso          | versículos, carinho        |
| Dia a dia   | adulto         | mix equilibrado            |
| Energia     | jovem          | frases punchy, cards vibe  |

## Rodar local

```bash
cd backend
cp .env.example .env        # preencha DATABASE_URL
npm install
npx prisma db push          # cria as tabelas
npm run seed                # popula o acervo + planos
npm run dev                 # sobe em http://localhost:3000
```

Frontend: abra `frontend/index.html` no navegador (roda offline). Pra conectar no banco, edite `API_BASE` no topo do `<script>` com a URL do backend.

## Deploy (Railway) — um serviço só

O backend serve o frontend na mesma URL, então é **um único serviço** e **uma URL** pra testar. Já vem com `railway.json` e o `package.json` raiz prontos.

1. [railway.app](https://railway.app) → **New Project** → **Deploy from GitHub repo** → escolha `mieciocosta/supri-box` (branch `claude/optimistic-mccarthy-xnxg24`). Deixe o **root** no padrão (raiz do repo).
2. No projeto → **New** → **Database** → **Add PostgreSQL**. O Railway injeta `DATABASE_URL` sozinho no serviço.
3. No serviço web → aba **Settings** → **Networking** → **Generate Domain**. Pronto: acesse a URL gerada e a caixinha + assinatura já funcionam.
4. (Opcional, pra cobrar de verdade) Variables → `MP_ACCESS_TOKEN` (Mercado Pago) e `ZAPI_INSTANCE/ZAPI_TOKEN/ZAPI_CLIENT_TOKEN` (WhatsApp). Sem eles, roda em modo stub (Pix de teste + WhatsApp no log).

> Build/seed automáticos: o boot roda `prisma db push` + um **seed idempotente** (`seedSafe.js`, que não apaga nada) e sobe o servidor. Healthcheck em `/health`.

## Assinatura via Pix (o que fatura)

O motor de receita já está montado. Planos vivem no banco (`Plano`) e são populados pelo seed: **isca** (R$ 0,01), **mensal** (R$ 9,90) e **trimestral** (R$ 24,90). Ajuste preço/período à vontade.

Fluxo ponta a ponta:

1. `GET /assinatura/planos` — lista os planos ativos (o frontend monta os cards a partir daqui).
2. `POST /assinatura/criar` — body `{ whatsapp, nome?, email?, perfil?, planoSlug }`. Faz upsert do usuário, cria a assinatura `pendente`, gera a cobrança Pix e devolve `{ assinaturaId, qrCode, qrCodeBase64, valor, stub }`.
3. `GET /assinatura/:id/status` — o frontend faz polling até virar `ativa`.
4. `POST /pagamento/webhook` — o Mercado Pago avisa o pagamento; quando `approved`, a assinatura é ativada (status `ativa` + `expiraEm`), o usuário marcado e a boas-vindas enviada no WhatsApp.

**Modo dev (sem `MP_ACCESS_TOKEN`):** o Pix sai em stub e você simula a aprovação com `POST /assinatura/:id/confirmar-stub` — dá pra testar o fluxo inteiro sem credencial. No frontend, o botão "Já paguei (teste)" faz isso sozinho.

O frontend (`index.html`) abre o modal de assinatura quando `API_BASE` está preenchido; sem backend, cai no link do WhatsApp.

## Integrações (já com pontos de plugue prontos)

- **WhatsApp (Z-API):** webhook em `POST /webhook/zapi`. Sem credenciais, roda em modo stub (loga no console). Preencha `ZAPI_INSTANCE / ZAPI_TOKEN / ZAPI_CLIENT_TOKEN` pra enviar de verdade. Dá pra reaproveitar a infra do VittaHub.
- **Pix (Mercado Pago):** assinatura em `POST /assinatura/criar` + webhook central em `POST /pagamento/webhook`; cobrança avulsa (caixa premium) em `POST /pagamento/pix`. Use Mercado Pago (Pix 0,99%, sem piso fixo) — evita gateways com tarifa fixa que destroem ticket baixo. Aponte a URL de notificação do MP pra `…/pagamento/webhook`.

## Próximos passos

- [x] Fluxo de assinatura via Pix (planos + cobrança + webhook + ativação)
- [ ] Entrega diária automática (cron disparando a caixinha pros assinantes ativos)
- [ ] Renovação automática quando a assinatura expira (gerar novo Pix / Pix Automático)
- [ ] Card "vibe" com GIF real (integrar Giphy API em `mediaUrl`)
- [ ] Painel admin do acervo
- [ ] Geração de imagem por IA só no tier premium (preço cobre o custo)
