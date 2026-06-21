# 📲 SupriBox no Google Play (TWA)

O site já é um **PWA instalável**. Para colocar na **Play Store**, empacotamos esse PWA num app Android leve (TWA — Trusted Web Activity), que abre o site em tela cheia, sem barra de URL.

> O que **o código já entrega**: manifest, service worker, ícones (gerados no build), rota de verificação `/.well-known/assetlinks.json` e o `twa-manifest.json` pronto.
>
> O que **só você faz** (precisa das suas contas/credenciais): conta Google Play (US$ 25, uma vez), gerar a **chave de assinatura** e fazer o **upload**. Eu não tenho como assinar nem publicar na sua conta.

## Antes de tudo: instalar como PWA (já funciona hoje)
No Android (Chrome) abra a URL do app → menu **⋮ → Instalar aplicativo**. No iPhone (Safari) → **Compartilhar → Adicionar à Tela de Início**. Vira um ícone em tela cheia, sem loja.

## Empacotar pro Play (no seu computador)

Pré-requisitos: **Node 18+** e **JDK 17**.

```bash
# 1) instalar o Bubblewrap
npm i -g @bubblewrap/cli

# 2) na pasta do projeto, inicializar a partir do manifest publicado
bubblewrap init --manifest https://supri-box-production.up.railway.app/manifest.webmanifest
#   -> aceite os padrões; quando perguntar, confirme o packageId app.supribox.twa
#   (ou use o twa-manifest.json deste repo como referência)

# 3) gerar o app assinado (.aab para a loja). O Bubblewrap cria a keystore
#    na primeira vez — GUARDE o arquivo e as senhas, sem elas você perde o app.
bubblewrap build
```

Isso produz **`app-release-bundle.aab`** (para subir na loja) e um **`app-release-signed.apk`** (para testar no celular).

## Verificar o domínio (Digital Asset Links)

Para o app abrir sem a barra de URL, o site precisa confirmar que é seu:

```bash
# pegue o fingerprint SHA-256 da sua chave
keytool -list -v -keystore android.keystore -alias supribox
#   copie a linha "SHA256:" inteira (formato AA:BB:...:FF)
```

No **Railway → seu serviço → Variables**, adicione:

- `DAL_FINGERPRINT` = o SHA-256 que você copiou (se usar o **Play App Signing**, pegue o fingerprint que o Google mostra em *Configuração → Integridade do app*).
- `TWA_PACKAGE` = `app.supribox.twa`

Redeploy. Confira em `https://supri-box-production.up.railway.app/.well-known/assetlinks.json` — deve mostrar o JSON preenchido.

> Dica: com o **Play App Signing** (recomendado) o Google reassina o app, então o fingerprint que vale é o **do Google** — pegue-o no painel do Play depois de subir o primeiro `.aab` e atualize `DAL_FINGERPRINT`.

## Publicar

1. [play.google.com/console](https://play.google.com/console) → pague a taxa única (US$ 25) → **Criar app**.
2. **Produção → Criar versão** → envie o `.aab`.
3. Preencha ficha da loja: ícone (512×512 — use `/icons/icon-512.png`), screenshots, descrição, política de privacidade (precisa de uma URL) e classificação etária.
4. Envie para revisão. Costuma levar de algumas horas a alguns dias.

## Checklist rápido
- [ ] PWA abrindo e instalável (Lighthouse → PWA installable)
- [ ] `bubblewrap build` gerou o `.aab`
- [ ] `DAL_FINGERPRINT` setado no Railway e `assetlinks.json` preenchido
- [ ] Conta Play criada e `.aab` enviado
- [ ] Ficha da loja + política de privacidade preenchidas
