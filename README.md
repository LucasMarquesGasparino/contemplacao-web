# Contemplação (Web / PWA)

Imagens sem pressa, sons que acolhem. PWA de contemplação: fotos em tela cheia
com crossfade, categorias (natureza, cidade, fantasia, obras-primas) e áudio
ambiente. Funciona offline depois do primeiro carregamento.

## Como abrir

```sh
cd ~/projects/contemplacao-web
python3 -m http.server 8080
# acesse http://localhost:8080
```

## Recursos

- Palco fullscreen com transição suave entre imagens + vinheta.
- Barra superior discreta: categoria atual e botão de informações.
- Toque na tela para contemplar (oculta a interface).
- `manifest.webmanifest`: instalável como app (tela cheia, ícone próprio).
- Áudios ambientes em `assets/audio/`.

## Estrutura

```
contemplacao-web/
├── index.html
├── app.js               # slideshow, categorias, áudio
├── styles.css
├── manifest.webmanifest # PWA
└── assets/audio/
```

> O `contemplacao-apk` empacota exatamente esta interface num APK Android.
