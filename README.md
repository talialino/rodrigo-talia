# Convite de Casamento — Rodrigo & Talia

Convite digital em formato de **livreto premium**: o site abre como um envelope
artesanal (animação cinematográfica de ~3,5s) e as telas viram como folhas de
uma revista de luxo. HTML + CSS + JavaScript puro (sem frameworks), pronto para
GitHub Pages.

## Estrutura

```
/assets
  Rodrigo&Talia.png   envelope oficial (base de toda a identidade visual)
  foto.jpeg           fotografia do casal (Folha 1)
config.js             ← ÚNICO arquivo a editar no dia a dia
index.html            estrutura das 6 folhas + cena do envelope
style.css             identidade (paleta do envelope, papel, virada de folha)
script.js             lógica (animação de abertura, virada física, textos)
```

## As 6 folhas

1. **Fotografia + frase** — a animação do envelope termina aqui
2. **Welcome** — nome do convidado em rosé metálico + data/horário/local/endereço
3. **Manual do Convidado** — instruções ilustradas + Confirmar presença · Como chegar · Presentear
4. **Escolha do presente** — Online (iCasei) ou físico
5. **Lista de presentes físicos** — cartões com foto e "Reservar" (WhatsApp)
6. **Mensagem final** — Instagram (opcional)

Navegação: toque na seta lateral, deslize horizontalmente ou use as setas do
teclado. Links externos abrem em nova aba e o convidado volta para a mesma folha.

## O que editar (tudo em `config.js`)

| Quero mudar... | Onde |
|---|---|
| Convidados (nome, saudação, singular/plural) | `GUESTS` |
| Data, horário, local e endereço | `CONFIG.event` |
| Link de confirmar presença | `CONFIG.links.rsvp` |
| Link da lista de presentes online | `CONFIG.links.onlineGiftList` |
| Link do Como Chegar (Google Maps) | `CONFIG.links.maps` |
| WhatsApp da reserva de presentes / Instagram | `CONFIG.social` |
| Lista de presentes físicos (nome, foto, mensagem) | `CONFIG.physicalGifts` |
| Nome do casal | `CONFIG.couple` |

## Links personalizados por convidado

Envie o link com o `id` do convidado cadastrado em `GUESTS`:

```
https://talialino.github.io/rodrigo-talia/?id=adriana
https://talialino.github.io/rodrigo-talia/?id=joao-e-luna
```

Se não passar `?id=`, usa o convidado `default`. Também aceita, como
alternativa rápida, `?greeting=Querida&name=Fulana`.

## Publicar no GitHub Pages

1. Envie estes arquivos para a raiz do repositório.
2. Settings → Pages → Source: branch `main`, pasta `/root`.
3. Acesse o link gerado.
