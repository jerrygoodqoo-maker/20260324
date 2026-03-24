let grasses = [];
let bubbles = [];
let popSound;

function preload() {
  popSound = loadSound('POP.MP3');
}

function setup() {
  let cnv = createCanvas(windowWidth, windowHeight);
  cnv.style('pointer-events', 'none'); // 讓滑鼠事件穿透畫布，以操作後方 iframe
  let colors = ['#9b5de5', '#f15bb5', '#fee440', '#00bbf9', '#00f5d4'];
  for (let i = 0; i < 80; i++) {
    let c = color(random(colors));
    c.setAlpha(random(20, 60));
    grasses.push({
      xRatio: random(1),
      c: c,
      speed: random(0.001, 0.005),
      thick: random(40, 50),
      hRatio: random(0.2, 0.45),
      offset: random(1000)
    });
  }

  let iframe = createElement('iframe');
  iframe.attribute('src', 'https://www.et.tku.edu.tw');
  iframe.style('position', 'absolute');
  iframe.style('top', '0');
  iframe.style('left', '0');
  iframe.style('width', '100%');
  iframe.style('height', '100%');
  iframe.style('border', 'none');
  iframe.style('z-index', '-1');
}

function draw() {
  clear();
  blendMode(BLEND);
  noFill();
  strokeCap(ROUND);

  for (let g of grasses) {
    stroke(g.c);
    strokeWeight(g.thick);

    let startX = g.xRatio * width;
    let startY = height;
    let grassHeight = height * g.hRatio;
    let numSegments = 30;
    let segmentLength = grassHeight / numSegments;

    beginShape();
    for (let i = 0; i <= numSegments; i++) {
      let y = startY - i * segmentLength;
      let n = noise(i * 0.03, frameCount * g.speed + g.offset); // 產生雜訊值
      let xOffset = map(n, 0, 1, -150, 150) * (i / numSegments); // 映射雜訊到偏移量，並隨高度增加擺動幅度
      curveVertex(startX + xOffset, y);
      if (i === 0 || i === numSegments) {
        curveVertex(startX + xOffset, y);
      }
    }
    endShape();
  }

  // 產生水泡
  if (random() < 0.03) {
    bubbles.push(new Bubble());
  }

  for (let i = bubbles.length - 1; i >= 0; i--) {
    bubbles[i].update();
    bubbles[i].display();
    if (bubbles[i].isFinished()) {
      bubbles.splice(i, 1);
    }
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

class Bubble {
  constructor() {
    this.x = random(width);
    this.y = height + 20;
    this.size = random(10, 25);
    this.speed = random(1, 3);
    this.maxHeight = random(height * 0.2, height * 0.8);
    this.popped = false;
    this.popTimer = 15;
  }

  update() {
    if (!this.popped) {
      this.y -= this.speed;
      this.x += random(-1, 1);
      if (this.y < this.maxHeight) {
        this.popped = true;
        if (popSound && popSound.isLoaded()) {
          popSound.play();
        }
      }
    } else {
      this.popTimer--;
    }
  }

  display() {
    push();
    if (this.popped) {
      // 破掉的效果
      noFill();
      stroke(255, map(this.popTimer, 15, 0, 255, 0));
      strokeWeight(2);
      let s = map(this.popTimer, 15, 0, this.size, this.size * 2);
      ellipse(this.x, this.y, s);
    } else {
      // 水泡本體
      noStroke();
      fill(255, 127); // 白色透明度 0.5 (255 * 0.5 ~= 127)
      ellipse(this.x, this.y, this.size);
      
      // 左上角白色圓圈
      fill(255, 204); // 白色透明度 0.8 (255 * 0.8 ~= 204)
      ellipse(this.x - this.size * 0.2, this.y - this.size * 0.2, this.size * 0.3);
    }
    pop();
  }

  isFinished() {
    return this.popped && this.popTimer <= 0;
  }
}
