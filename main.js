import {
  Application,
  Assets,
  Sprite,
  Spritesheet,
  AnimatedSprite,
  TilingSprite,
  Text,
  TextStyle,
} from "pixi.js";

import { Howl } from "howler";

(async () => {
  const app = new Application();
  globalThis.__PIXI_APP__ = app;
  await app.init({
    resizeTo: window,
    backgroundColor: 0x87ceeb,
    antialias: true,
  });

  app.canvas.style.position = "absolute";
  document.body.appendChild(app.canvas);

  const atlasData = {
    frames: {
      walk1: { frame: { x: 0, y: 0, w: 32, h: 32 } },
      walk2: { frame: { x: 32, y: 0, w: 32, h: 32 } },
      walk3: { frame: { x: 64, y: 0, w: 32, h: 32 } },
      walk4: { frame: { x: 96, y: 0, w: 32, h: 32 } },
      walk5: { frame: { x: 128, y: 0, w: 32, h: 32 } },
      walk6: { frame: { x: 160, y: 0, w: 32, h: 32 } },
      idle1: { frame: { x: 0, y: 32, w: 32, h: 32 } },
      idle2: { frame: { x: 32, y: 32, w: 32, h: 32 } },
      idle3: { frame: { x: 64, y: 32, w: 32, h: 32 } },
    },
    animations: {
      walk: ["walk1", "walk2", "walk3", "walk4", "walk5", "walk6"],
      idle: ["idle1", "idle2", "idle3"],
    },
    meta: {
      image: "images/spritesheet.png",
      size: { w: 192, h: 65 },
      scale: 1,
    },
  };

  let localStorageMute = Boolean(localStorage.getItem("mute"));
  // if it's never been set, set to true, well lets just set it to false then
  if (localStorageMute === false) {
    localStorage.setItem("mute", "false");
  }
  // SPRITE Animation

  // const chickenTexture = await Assets.load("images/chickenWalk.png");
  // const sprite = Sprite.from(chickenTexture);
  // app.stage.addChild(sprite);
  const chickenTexture = await Assets.load(atlasData.meta.image);
  const chickenSpritesheet = new Spritesheet(chickenTexture, atlasData);
  await chickenSpritesheet.parse();

  const chickenSprite = new AnimatedSprite(chickenSpritesheet.animations.walk);
  // Animation Type	Suggested Speed (animationSpeed)	FPS Equivalent
  // Idle	0.05 – 0.1	3–6 FPS
  // Walk	0.12 – 0.2	7–12 FPS
  // Run / Fast Move	0.18 – 0.25	11–15 FPS
  // Attack / Action	0.25 – 0.4	15–24 FPS
  chickenSprite.animationSpeed = 0.13;
  chickenSprite.play();
  chickenSprite.scale.set(2);
  chickenSprite.position.set(64, app.screen.height - chickenSprite.height - 56);
  app.stage.addChild(chickenSprite);

  // Tiling Sprites
  // Cloud Tiling Sprite
  const cloudTexture = await Assets.load("images/CloudTileset.png");
  const cloudSprite = new TilingSprite({
    texture: cloudTexture,
    width: app.screen.width,
    height: app.screen.height / 3,
  });

  cloudSprite.tileScale.set(3.1, 3.1);
  app.stage.addChild(cloudSprite);
  app.ticker.add(() => (cloudSprite.tilePosition.x -= 1));

  // Ground Tiling Sprite
  const groundTexture = await Assets.load("images/ground.png");
  const groundSprite = new TilingSprite({
    texture: groundTexture,
    width: app.screen.width,
    height: 64,
  });

  groundSprite.y = app.screen.height - 64;
  groundSprite.tileScale.set(3, 3);
  app.stage.addChild(groundSprite);
  app.ticker.add(() => (groundSprite.tilePosition.x -= 4));

  // SoundTrack
  const backgroundMusic = new Howl({
    src: ["/audio/lavaChickenLoop.mp3"],
    autoplay: localStorageMute,
    loop: true,
    volume: 0.05,
  });

  // ScoreBoard

  await Assets.load({
    alias: "PixelFont",
    src: "fonts/TypefaceMarioWorldPixelOutlineRegular-MVzKp.ttf",
  });

  await document.fonts.load("16px PixelFont");

  const style = new TextStyle({
    fill: "#ffffff",
    fontFamily: "PixelFont",
    fontSize: 20,
    fontStyle: "italic",
    fontWeight: "bold",
    stroke: { color: "#444444", width: 3.5 },
  });
  const score = new Text({
    text: "0000",
    style,
    x: app.screen.width - 100,
    y: 10,
  });
  app.stage.addChild(score);
  let highScore;
  if (localStorage.getItem("highscore")) {
    highScore = new Text({
      text: `Hi  ${localStorage.getItem("highscore")}`,
      style,
      x: app.screen.width - 250,
      y: 10,
    });
  } else {
    highScore = new Text({
      text: `Hi  ${score.text}`,
      style,
      x: app.screen.width - 250,
      y: 10,
    });
  }

  app.stage.addChild(highScore);

  let startTime = Date.now();
  startTime = Math.floor(startTime / 1000);
  app.ticker.add(() => {
    let currentTime = Math.floor(Date.now() / 1000);
    score.text = String(currentTime - startTime).padStart(4, "0");
  });

  // TODO
  // add obects that move and have colllions -> done
  //  - fix colllions -> good enough -> done
  // add movements -> done
  // game over + restart -> done
  // mute // other buttons -> done
  //  - we can mute/unmute when game is over but we can't change the sign, fix
  //  - also fix mute bug when i refresh, it doesn't access localstorage.
  // save score to local storage -> done
  // add additional enemies, ex: flying enemies -> done
  // simple menu?

  const fireTexture = await Assets.load("/images/fireStove3.png");
  const fireSprite = Sprite.from(fireTexture);
  app.stage.addChild(fireSprite);
  fireSprite.scale.set(0.5, 0.5);
  fireSprite.position.set(
    app.screen.width,
    app.screen.height - fireSprite.height - 60,
  );

  resetEnemy(fireSprite, 4, 250);

  // Player Movements, although its just jump
  let isJumping = false;
  let jumpSpeed = 0;
  const gravity = 0.5;
  const jumpForce = -15;

  window.addEventListener("keydown", (event) => {
    if (event.code === "Space" && !isJumping) {
      jumpSpeed = jumpForce; // start jump with upward velocity;
      isJumping = true;
    }
  });

  app.ticker.add(() => {
    if (isJumping) {
      chickenSprite.y += jumpSpeed;
      jumpSpeed += gravity;

      if (chickenSprite.y >= app.screen.height - chickenSprite.height - 56) {
        chickenSprite.y = app.screen.height - chickenSprite.height - 56;
        isJumping = false;
        jumpSpeed = 0;
      }
    }
  });

  // flying enemy sprite:
  const flyingEnemySheet = await Assets.load("flying_toaster_spritesheet.json");
  const flyingEnemyAnimation = new AnimatedSprite(
    flyingEnemySheet.animations["toaster_fly"],
  );
  flyingEnemyAnimation.animationSpeed = 0.1;
  flyingEnemyAnimation.anchor.set(0.5);
  flyingEnemyAnimation.scale.set(0.25);
  flyingEnemyAnimation.position.set(
    app.screen.width + 500,
    app.screen.height / 1.15,
  );
  flyingEnemyAnimation.play();
  app.stage.addChild(flyingEnemyAnimation);
  resetEnemy(flyingEnemyAnimation, 4, 500, true, 5000);

  // AABB (axis aligned Bounding boxes) collision
  function isColliding(spriteA, spriteB, padding = 0) {
    if (spriteB == undefined) return;

    const chickenSprite = spriteA.getBounds();
    const enemySprite = spriteB.getBounds();

    return (
      chickenSprite.x + chickenSprite.width - padding > enemySprite.x && // A right edge past B left edge
      chickenSprite.x < enemySprite.x + enemySprite.width && // A left edge before B right edge
      chickenSprite.y + chickenSprite.height - padding > enemySprite.y && // A bottom edge past B top edge
      chickenSprite.y < enemySprite.y + enemySprite.height // A top edge before B bottom edge
    );
  }

  const buttonTexture = await Assets.load("/images/resetButton.png");

  // Create reset button
  const button = Sprite.from(buttonTexture);
  button.interactive = true;
  button.eventMode = "static";
  button.cursor = "pointer";
  button.buttonMode = true;
  button.scale.set(0.5, 0.5);
  button.anchor.set(0.5);
  button.position.set(app.screen.width / 2, app.screen.height / 2);
  button.on("pointerdown", () => {
    resetGame();
  });

  // Create game over text
  const gameOverText = new Text({
    text: "gameOver",
    style: {
      fill: "#ffffff",
      fontFamily: "PixelFont",
      fontSize: 48,
      fontStyle: "italic",
      fontWeight: "bold",
      stroke: { color: "#444444", width: 3.5 },
    },
  });

  gameOverText.anchor.set(0.5);
  gameOverText.position.set(
    app.screen.width / 2,
    app.screen.height / 2 - button.height / 2,
  );

  function gameOver() {
    app.ticker.stop();
    app.stage.addChild(gameOverText);
    app.stage.addChild(button);
  }

  function resetGame() {
    chickenSprite.x = 64;
    chickenSprite.y = app.screen.height - chickenSprite.height - 56;

    // enemy sprites
    fireSprite.x = app.screen.width + Math.floor(Math.random() * 350 + 1);
    fireSprite.y = app.screen.height - fireSprite.height - 60;

    flyingEnemyAnimation.x =
      app.screen.width + Math.floor(Math.random() * 1000 + 1);
    flyingEnemyAnimation.y = app.screen.height - fireSprite.height - 60;

    if (Number(score.text) > Number(highScore.text.slice(4))) {
      highScore.text = `Hi  ${score.text}`;
      localStorage.setItem("highscore", highScore.text.slice(4));

      let blinkTimer = 0;
      let blinkCount = 0;

      const blinkLoop = (delta) => {
        blinkTimer += delta.deltaMS;
        if (blinkTimer > 120) {
          highScore.visible = !highScore.visible;
          blinkTimer = 0;

          if (!highScore.visible) {
            blinkCount++;
          }
          if (blinkCount >= 3) {
            app.ticker.remove(blinkLoop);
            highScore.visible = true;
          }
        }
      };

      app.ticker.add(blinkLoop);
    }

    // remove gameOver and resetButton
    app.stage.removeChild(button);
    app.stage.removeChild(gameOverText);

    app.ticker.start();
    startTime = Math.floor(Date.now() / 1000);
  }

  // Volume Button
  const muteAsset = await Assets.load("images/mute.png");
  const unmuteAsset = await Assets.load("images/unmute.png");
  const muteSprite = Sprite.from(muteAsset);
  const unmuteSprite = Sprite.from(unmuteAsset);
  setUpMuteButton(muteSprite);
  setUpMuteButton(unmuteSprite);

  if (Boolean(localStorage.getItem("volume"))) {
    app.stage.addChild(muteSprite);
  } else {
    app.stage.addChild(unmuteSprite);
  }

  function setUpMuteButton(button) {
    button.interactive = true;
    button.eventMode = "static";
    button.cursor = "pointer";
    button.buttonMode = true;
    button.scale.set(0.25, 0.25);
    button.anchor.set(0.5);
    button.position.set(app.screen.width - 300, 30);
    button.on("pointerdown", () => {
      swapVolumeButton();
    });
  }

  function swapVolumeButton() {
    let mute = app.stage.children.includes(muteSprite);
    if (mute) {
      backgroundMusic.play();
      app.stage.removeChild(muteSprite);
      app.stage.addChild(unmuteSprite);
      localStorage.setItem("mute", "true");
    } else {
      backgroundMusic.pause();
      app.stage.removeChild(unmuteSprite);
      app.stage.addChild(muteSprite);
      localStorage.setItem("mute", "false");
    }
  }

  app.ticker.add(() => {
    if (
      isColliding(chickenSprite, fireSprite, 15) ||
      isColliding(chickenSprite, flyingEnemyAnimation, 35)
    ) {
      gameOver();
    }
  });

  // Spawn enemy function that has control of enemy sprite pacing:
  function resetEnemy(sprite, speed, xDistance, yOptions = false, wait = 1000) {
    app.ticker.add(() => {
      sprite.position.x -= speed;
      if (sprite.position.x < -sprite.width) {
        (async () => {
          await new Promise((resolve) => setTimeout(resolve, wait));
        })();
        sprite.position.x =
          app.screen.width + Math.floor(Math.random() * xDistance);
        if (yOptions) {
          if (Math.random() < 0.3 ? 1 : 0) {
            sprite.position.y = app.screen.height / 1.3;
          } else {
            sprite.position.y = app.screen.height / 1.15;
          }
        }
      }
    });
  }
})();
