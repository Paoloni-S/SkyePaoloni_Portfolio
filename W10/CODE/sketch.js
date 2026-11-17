
/* DM3008 Generative Art, Skye Paoloni 2026
 * Title: Moonlight Herbarium
 * Description: I created Luna Flora, with the common name "Moon Bloom", using a L-system rule that produces alternating branches with leaves and flower placements. The branching angle was increased to 28 degrees to create a more open, spreading structure, while four generations keep the plant relatively delicate. I adjusted the trunk width and thickness reduction to create stems that progressively get thinner, with colours transitioning from dark navy to lighter cyan tones. The leaves use a dark navy blue (with transparency), while the flowers feature pale blue petals and deep navy centers. Finally, I replaced the placeholder botanical information with the invented species name, common name, creator credit, and a short description of its growth pattern.
 * Invented species: Moon Bloom
 */

//The Rules 
const AXIOM = "X";

const RULES = {
  // Creates a central stem with alternating branches and a continuing tip.
  // Leaves and flowers are placed along the smaller branches.
  X: "F[+XL][-XL]F[+XB][-XB]X",

  // Each stem grows into two smaller segments.
  F: "FF",
};

//This creates the number of clusters and angle that they grow, I wanted a wider tree so it was increased. 
const ANGLE = 38;
const GENERATIONS = 5;

//The trunk and branch size (made thinner)
const TRUNK_WIDTH = 5;
const THICKNESS = 0.8;

// Dark blue stems gradually transition into lighter, muted green-blue tips.
const STEM_COLOUR = [0, 55, 80];
const TIP_COLOUR = [204, 234, 214];

//Below code controls leaves and flowers

// Semi-transparent navy blue leaves with an elongated shape.
const LEAF_COLOUR = [0, 55, 80];
const LEAF_SIZE = 18;

// pale-ghostly blue flowers with dark navy centres.
const FLOWER_COLOUR = [204, 234, 239];
const FLOWER_CENTRE = [0, 55, 80];
const FLOWER_SIZE = 6;

// The naming for the plate is below. Name is based on overall colour scheme and shape of plant mimicing the moon, its craters & space 
const SPECIES = "Luna Flora";
const COMMON_NAME = "Moon Bloom";
const YOUR_NAME = "Skye Paoloni";
const NOTES = "An upright flowering plant with a central stem, paired lateral branches, elongated leaves and pale blue blooms.";
const PLATE_NUMBER = 1;

// ╔═══════════════════════════════════════════════════════════════╗
// ║  PART 2 · THE ENGINE                                         ║
// ║  Original drawing engine, unchanged                          ║
// ╚═══════════════════════════════════════════════════════════════╝

const PAPER = [244, 238, 224];
const INK = [60, 52, 40];
const MAX_LENGTH = 300000;
let sentence, plantLen, plantDepth, plantFit;
let warning = "";

function setup() {
  createCanvas(720, 960);
  noLoop();
  grow();
}

function grow() {
  for (const k in RULES) {
    const opens = RULES[k].split("[").length - 1;
    const closes = RULES[k].split("]").length - 1;
    if (opens !== closes)
      warning = `Check your rule for ${k}: it has ${opens} [ but ${closes} ]. They must match.`;
  }

  sentence = AXIOM;
  for (let g = 0; g < GENERATIONS; g++) {
    const next = rewrite(sentence);
    if (next.length > MAX_LENGTH) {
      warning =
        "Your plant got too big, so it stopped growing early. Try fewer GENERATIONS.";
      break;
    }
    sentence = next;
  }

  plantDepth = maxDepth(sentence);
  const box = { x: 60, y: 70, w: width - 120, h: height - 330 };
  const m = measure(sentence, ANGLE);
  plantLen = min(box.h / m.h, box.w / m.w);
  plantFit = {
    x: box.x + box.w / 2 - ((m.minX + m.maxX) / 2) * plantLen,
    y: box.y + box.h,
  };
}

function rewrite(s) {
  let next = "";
  for (const c of s) next += RULES[c] !== undefined ? RULES[c] : c;
  return next;
}

function draw() {
  background(...PAPER);
  drawSheet();
  drawPlant();
  drawLabel();
}

function drawPlant() {
  const stem = color(...STEM_COLOUR);
  const tip = color(...TIP_COLOUR);
  let depth = 0;

  push();
  translate(plantFit.x, plantFit.y);
  strokeCap(ROUND);

  for (const c of sentence) {
    if (c === "F") {
      strokeWeight(max(0.5, TRUNK_WIDTH * pow(THICKNESS, depth)));
      stroke(lerpColor(stem, tip, depth / plantDepth));
      line(0, 0, 0, -plantLen);
      translate(0, -plantLen);
    } else if (c === "+") {
      rotate(radians(ANGLE));
    } else if (c === "-") {
      rotate(radians(-ANGLE));
    } else if (c === "[") {
      push();
      depth++;
    } else if (c === "]" && depth > 0) {
      pop();
      depth--;
    } else if (c === "L") {
      drawLeaf();
    } else if (c === "B") {
      drawFlower();
    }
  }

  while (depth > 0) {
    pop();
    depth--;
  }
  pop();
}

function drawLeaf() {
  push();
  noStroke();
  fill(...LEAF_COLOUR, 170);
  rotate(radians(35));
  ellipse(0, -LEAF_SIZE / 2, LEAF_SIZE * 0.43, LEAF_SIZE);
  pop();
}

function drawFlower() {
  push();
  noStroke();
  fill(...FLOWER_COLOUR, 200);
  for (let i = 0; i < 5; i++) {
    rotate(TWO_PI / 5);
    ellipse(0, -FLOWER_SIZE * 0.58, FLOWER_SIZE * 0.58, FLOWER_SIZE);
  }
  fill(...FLOWER_CENTRE);
  circle(0, 0, FLOWER_SIZE * 0.42);
  pop();
}

function drawSheet() {
  randomSeed(1);
  noStroke();

  for (let i = 0; i < 2500; i++) {
    fill(INK[0], INK[1], INK[2], random(4, 10));
    circle(random(width), random(height), random(0.5, 1.6));
  }

  noFill();
  stroke(...INK, 160);
  strokeWeight(1);
  rect(24, 24, width - 48, height - 48);
  strokeWeight(0.5);
  rect(30, 30, width - 60, height - 60);

  noStroke();
  fill(...INK, 160);
  textFont("Georgia");
  textAlign(RIGHT);
  textSize(12);
  text(`Plate ${PLATE_NUMBER}`, width - 46, 54);

  if (warning) {
    fill(180, 40, 40);
    textAlign(CENTER);
    textSize(14);
    text(warning, width / 2, 54);
  }
}

function drawLabel() {
  const x = 46,
    y = height - 236,
    w = width - 92,
    h = 190;

  fill(250, 246, 236);
  stroke(...INK, 140);
  strokeWeight(0.75);
  rect(x, y, w, h);

  noStroke();
  textAlign(LEFT);
  fill(...INK);
  textFont("Georgia");
  textStyle(ITALIC);
  textSize(22);
  text(SPECIES, x + 18, y + 34);

  textStyle(NORMAL);
  textSize(12);
  fill(...INK, 180);
  text(
    `${COMMON_NAME}   ·   collected by ${YOUR_NAME}   ·   ${new Date().toLocaleDateString(
      "en-GB"
    )}`,
    x + 18,
    y + 54
  );

  textFont("monospace");
  textSize(11);
  fill(...INK, 220);
  let ly = y + 82;

  text(
    `axiom  ${AXIOM}     angle  ${ANGLE}°     generations  ${GENERATIONS}`,
    x + 18,
    ly
  );

  for (const k in RULES) {
    ly += 16;
    text(`${k} → ${RULES[k]}`, x + 18, ly);
  }

  ly += 16;
  text(
    `each branch ${THICKNESS} × as thick as the one it grows from, colour stem → tip`,
    x + 18,
    ly
  );

  textFont("Georgia");
  textStyle(ITALIC);
  textSize(12);
  fill(...INK, 190);
  text(NOTES, x + 18, y + h - 18);
  textStyle(NORMAL);
}

function maxDepth(s) {
  let d = 0,
    deepest = 0;

  for (const c of s) {
    if (c === "[") deepest = max(deepest, ++d);
    if (c === "]") d--;
  }

  return max(deepest, 1);
}

function measure(s, angle) {
  let x = 0,
    y = 0,
    h = -90;

  let minX = 0,
    maxX = 0,
    minY = 0;

  const stack = [];

  for (const c of s) {
    if (c === "F") {
      x += cos(radians(h));
      y += sin(radians(h));
      minX = min(minX, x);
      maxX = max(maxX, x);
      minY = min(minY, y);
    } else if (c === "+") h += angle;
    else if (c === "-") h -= angle;
    else if (c === "[") stack.push({ x, y, h });
    else if (c === "]" && stack.length) ({ x, y, h } = stack.pop());
  }

  return {
    minX,
    maxX,
    w: max(maxX - minX, 1),
    h: max(-minY, 1),
  };
}