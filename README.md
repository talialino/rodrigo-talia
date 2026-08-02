# Convite de Casamento — Rodrigo & Talia

Convite digital em formato de **livreto premium**: o convite se abre sozinho na
entrada (lacre, laço e papel, em camadas) e as telas viram como folhas de uma
revista de luxo. HTML + CSS + JavaScript puro (sem frameworks), pronto para
GitHub Pages.

## Estrutura

```
/assets
  envelope-top.png    papel do convite — peça de cima (presa no topo)
  envelope-bottom.png papel do convite — peça de baixo (presa na base)
  seal.png            lacre de cera (parte em quatro na animação)
  bow.png             laço de cetim
  ribbon.png          fita horizontal
  flowers.png         tulipas
  foto-chiffon.jpg    a foto com o chiffon embutido (gerada — ver "Assets")
  foto.jpeg           fotografia do casal em cor plena (revelação)
  Rodrigo&Talia.png   arte de referência do convite fechado (não usada em tela)
  photo.png           recorte lateral da foto (não usado — ver "Assets" abaixo)
config.js             ← ÚNICO arquivo a editar no dia a dia
index.html            estrutura das 6 folhas + cena de abertura
style.css             identidade (paleta do convite, papel, virada de folha)
script.js             lógica (linha do tempo da abertura, virada física, textos)
```

## A abertura

O convite aparece montado em camadas independentes, com a fotografia já
visível ao fundo sob o chiffon. Depois de ~600ms de respiração (zoom de 100%
para 101%), a cena roda sozinha:

1. o lacre trinca em quatro partes iguais, elas se soltam na diagonal,
   levantam poucos pixels e caem;
2. a fita perde a tensão e desce, com o laço se desfazendo logo atrás;
3. as tulipas tombam para a esquerda, como se tivessem sido soltas junto
   com as fitas. As três caem quase juntas — a defasagem é de menos de
   0,2s, o bastante para não parecerem sincronizadas;
4. o papel abre **a partir do meio**: cada peça está presa na sua borda
   externa, então quem se move é a borda do meio. A de cima sobe primeiro;
5. a de baixo desce logo depois. A borda do meio é **puxada na direção de
   quem olha**, como quem levanta a aba de um envelope de verdade — nunca
   empurrada para dentro do papel;
6. a fotografia em cor plena entra em fade sobre a versão com chiffon. A
   folha da capa usa o mesmo enquadramento e não tem véu próprio, então a
   passagem é imperceptível: a imagem não desliza nem desbota, só continua,
   e o zoom lento começa aí;
7. ~700ms depois surgem as duas frases, em fade com leve deslocamento;
8. por fim aparece o indicador de navegação na base.

Os tempos ficam na tabela `timeline` dentro de `script.js`; o movimento em si
é CSS (seção 5 do `style.css`). Os atrasos finos da cascata (fita → laço →
flores) estão no próprio CSS, como `animation-delay`. A cena inteira dura
cerca de 4,8s até a folha da fotografia assumir.

As quedas usam tempo **linear** de propósito: a aceleração está escrita nos
valores dos keyframes, com cada trecho andando mais que o anterior, como na
gravidade. É o que evita aquele instante parado no começo que fazia as peças
parecerem enganchadas antes de cair.

Todas as peças moram dentro de `.env-stage`, um palco com a proporção exata do
convite (768x1382, a mesma do `Rodrigo&Talia.png`) que cresce até cobrir a
tela. Como cada peça é posicionada em % **do palco**, laço, fita, lacre e
flores continuam encaixados em qualquer aparelho — em telas mais estreitas o
conjunto inteiro sangra junto, sem se desalinhar. O palco é ancorado à
esquerda de propósito: a sobra vai para a direita, onde o papel é transparente
e só aparece a fotografia, preservando o laço e as flores. As posições em
`.piece--*` e `.seal` foram medidas sobre o convite impresso.

## Assets

`foto-chiffon.jpg` é a fotografia com o véu já embutido no arquivo: desfoque
leve mais branco quente a 45%, densidade medida por amostragem da água
turquesa no convite original (`Rodrigo&Talia.png`). Como o véu é estático,
ele aparece desde o primeiro quadro por baixo das peças e não custa nenhum
filtro em tempo real no celular. Para regerar com outra densidade, basta
mudar o valor no `fillStyle` e refazer o arquivo.

`photo.png` não é usado: ele traz só a faixa lateral direita da imagem, com a
metade esquerda vazia, então não cobre a tela inteira nem serve para a
revelação em cor plena. A foto completa é a `foto.jpeg`.

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
