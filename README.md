# Convite de Casamento — Rodrigo & Talia

Convite digital em HTML + CSS + JavaScript puro (sem frameworks), pronto para
GitHub Pages.

## Estrutura

```
/assets            imagens exportadas do Canva (welcome, details, navigation)
config.js          ← ÚNICO arquivo a editar no dia a dia
index.html         estrutura das 5 telas
style.css          visual (telas, hotspots, modal, animações, responsivo)
script.js          lógica (navegação, URL, modal, presentes)
```

## O que editar (tudo em `config.js`)

| Quero mudar... | Onde |
|---|---|
| Convidados (nome, saudação, texto) | `GUESTS` |
| Link de confirmar presença | `CONFIG.links.rsvp` |
| Link da lista de presentes online | `CONFIG.links.onlineGiftList` |
| Link do Uber / Como chegar | `CONFIG.links.uber` |
| Número do WhatsApp | `CONFIG.whatsapp.phone` (só dígitos, ex.: `5571999999999`) |
| Lista de presentes físicos | `CONFIG.physicalGifts` |
| Nome do casal (tela final) | `CONFIG.couple` |

## Links personalizados por convidado

Envie o link com o `id` do convidado cadastrado em `GUESTS`:

```
https://SEU-USUARIO.github.io/convite/?id=adriana
https://SEU-USUARIO.github.io/convite/?id=joao-e-luna
```

Se não passar `?id=`, usa o convidado `default`. Também aceita, como
alternativa rápida, `?greeting=Querida&name=Fulano`.

## Presentes físicos

As imagens atuais são ilustrativas (Unsplash). Para usar as suas, coloque os
arquivos em `/assets` e troque o campo `image` de cada item para, por exemplo,
`"assets/air-fryer.jpg"`. O botão **Reservar** abre o WhatsApp com a mensagem
pronta (usa `reservationMessage` ou monta uma padrão com o nome do presente).

## Publicar no GitHub Pages

1. Crie um repositório e envie estes arquivos (raiz do repo).
2. Settings → Pages → Source: branch `main`, pasta `/root`.
3. Acesse o link gerado.

## Adicionar uma nova página no futuro

1. Crie uma `<section class="screen" id="screen-XXXX">` em `index.html`.
2. Registre no objeto `SCREENS` em `script.js`.
3. Aponte um botão para ela com `data-action="goto" data-target="XXXX"`.
