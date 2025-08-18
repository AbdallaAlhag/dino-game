

# Dino Game
![game screenshot](./public/images/dino-game-screenshot.jpg "Dino Game Screenshot")

Google chrome dino game made with pixijs and howler js, bundled with vite, using assets from itch.io. I made this to play around with pixijs after reading this tutorial page

Google chrome dino game made with pixijs and howler js, bundled with vite, using assets from itch.io. I made this to play around with pixijs after reading this tutorial page
- https://waelyasmina.net/articles/pixi-js-tutorial-for-complete-beginners/

PixiJs guide page was also a nice reference alongside their api reference
- https://pixijs.com/8.x/guides/getting-started/intro
- https://pixijs.download/release/docs/modules.html
## Deployment

Uploaded to github pages with gh-page branch using gh-pages library.

Using npm run preview was very nice as I just had to build my program and view the production live immediately instead of deploying it each time. lol
```bash
  npm install gh-pages --save-dev
  "scripts": {
  "dev": "vite",
  "build": "vite build",
    "deploy": "vite build && gh-pages -d dist"
    }
  Run Command: npx vite
```

