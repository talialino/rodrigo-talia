# Convite de Casamento — Rodrigo & Talia

Convite digital em formato de **livreto premium**: o convite se abre sozinho na
entrada (lacre, laço e papel, em camadas) e as telas viram como folhas de uma
revista de luxo. HTML + CSS + JavaScript puro (sem frameworks), pronto para
GitHub Pages.

## Estrutura

```
/assets
  envelope-top.png    papel do convite — folha de cima (abre para cima)
  envelope-bottom.png papel do convite — folha de baixo (abre para baixo)
  seal.png            lacre de cera (parte em duas metades na animação)
  bow.png             laço de cetim
  ribbon.png          fita horizontal
  flowers.png         tulipas
  tag.png             etiqueta "Clique para abrir"
  foto.jpeg           fotografia do casal (revelada ao abrir)
  Rodrigo&Talia.png   arte de referência do convite fechado (não usada em tela)
  photo.png           recorte lateral da foto (não usado — ver "Assets" abaixo)
config.js             ← ÚNICO arquivo a editar no dia a dia
index.html            estrutura das 6 folhas + cena de abertura
style.css             identidade (paleta do convite, papel, virada de folha)
script.js             lógica (linha do tempo da abertura, virada física, textos)
```

## A abertura

O convite aparece montado em camadas independentes. Depois de ~600ms de
respiração (zoom de 100% para 101%), a cena roda sozinha:

1. o lacre trinca, parte em duas metades, elas levantam e caem;
2. a fita perde a tensão, o laço se desfaz e as pontas caem;
3. as tulipas apenas acomodam alguns pixels — não caem nem giram;
4. a folha de cima dobra a partir da linha de baixo;
5. a folha de baixo se desdobra para baixo;
6. sob elas, uma camada branca translúcida (chiffon) se dissolve em ~400ms
   e a fotografia ganha cor, com um Ken Burns bem lento;
7. ~700ms depois surgem as duas frases, em fade com leve deslocamento;
8. por fim aparece o indicador de navegação na base.

Os tempos ficam na tabela `timeline` dentro de `script.js`; o movimento em si
é CSS (seção 5 do `style.css`). As posições de cada peça sobre o convite estão
nas regras `.piece--*` e `.seal` (seção 4).

## Assets

Os PNGs entregues vinham com o quadriculado de transparência **gravado nos
pixels** (canal alfa 100% opaco). Foram reprocessados para recuperar a
transparência real antes de entrar no projeto. `photo.png` não foi usado: por
ser uma fotografia, o mesmo tratamento a perfurava — e ela contém só a faixa
lateral direita da imagem. A foto completa (`foto.jpeg`) é a usada na revelação.

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
