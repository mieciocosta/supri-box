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
        ├── seed.js       # acervo curado (versículos + frases + vibes)
        └── routes/
            ├── caixinha.js    # GET /caixinha?perfil=jovem
            ├── conteudos.js   # CRUD do acervo
            ├── usuarios.js    # cadastro + assinatura
            ├── webhook.js     # WhatsApp via Z-API
            └── pagamento.js   # Pix via Mercado Pago
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
npm run seed                # popula o acervo
npm run dev                 # sobe em http://localhost:3000
```

Frontend: abra `frontend/index.html` no navegador (roda offline). Pra conectar no banco, edite `API_BASE` no topo do `<script>` com a URL do backend.

## Deploy (Railway)

1. New Project → Deploy from GitHub → `mieciocosta/supri-box`, root `/backend`.
2. Add PostgreSQL → `DATABASE_URL` é injetada sozinha.
3. Start command: `npx prisma db push && npm run seed && npm start`.
4. Frontend: publique `frontend/` como site estático (Vercel/Netlify) e aponte `API_BASE` pro backend.

## Integrações (já com pontos de plugue prontos)

- **WhatsApp (Z-API):** webhook em `POST /webhook/zapi`. Sem credenciais, roda em modo stub (loga no console). Preencha `ZAPI_INSTANCE / ZAPI_TOKEN / ZAPI_CLIENT_TOKEN` pra enviar de verdade. Dá pra reaproveitar a infra do VittaHub.
- **Pix (Mercado Pago):** `POST /pagamento/pix` cria a cobranca; `POST /pagamento/webhook` ativa a assinatura quando o pagamento é aprovado. Use Mercado Pago (Pix 0,99%, sem piso fixo) — evita gateways com tarifa fixa que destroem ticket baixo.

## Próximos passos

- [ ] Card "vibe" com GIF real (integrar Giphy API em `mediaUrl`)
- [ ] Pix Automático pra cobrança recorrente da assinatura
- [ ] Painel admin do acervo
- [ ] Geração de imagem por IA só no tier premium (preço cobre o custo)
