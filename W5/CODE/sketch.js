/* DM3008 Generative Art, Skye Paoloni 2026
 * Title: Sonic Wave
 * Description: This work was based on Week 5's Randomness and noise. It builds on the original gaussian distribution and random point-generation techniques taught, but changes the overall composition through a larger canvas, a pale pink background, and a finer stroke weight. The artwork was created using noise and pays reference through visual style and title to vintage radio waves. It is comprised of a blue-toned circle formation and two layered wave patterns in maroon and pink. The circle uses randomized distances and angles to distribute points, while the waves use cosine functions combined with random vertical offsets to create movement and texture. The number of iterations has also been increased significantly in certain sections, creating denser point formations.
 */


function setup() {
  createCanvas(520, 520);
  frameRate(20);
  noFill();
  strokeWeight(0.5); // Creates fine points throughout the composition.
}

function draw() {
  background(242, 233, 233);

  // Background: Gaussian distribution creates a scattered field of black points.
  stroke(0);
  var standardDeviation = 400;

  for (var i = 0; i < 5000; i++) {
    var backDist = randomGaussian(0, standardDeviation);
    var b = createVector(backDist, random(-height, height));
    point(b.x, b.y);
  }

  // Cyan circle: Random distances and angles distribute points around a circular shape.
  stroke(0, 90, 224);
  translate(width / 5, height / 6);

  for (var i = 0; i < 90000; i++) {
    var cirDist = (max(random(0, 1), random(0, 2)) * width) / 7;
    var angle = random(0, PI * 4);
    var c = createVector(cos(angle), sin(angle));
    c.mult(cirDist);

    // Offsets the points to position the circle centered within the canvas.
    point(c.x + (width / 4), c.y + (height / 3));
  }

  // Middle maroon wave: Cosine creates a repeating wave, while random values introduce vertical variation and make the wave textured.
  push();
  stroke(107, 4, 23);
  translate(-120, height / 3);
  var amp = 29;

  for (var i = 0; i < 90000; i++) {
    var waveX = random(1, width);
    var waveY = cos((waveX / width) * PI * 20) * amp;
    waveY += random(-10, 20);
    point(waveX, waveY);
  }

  pop();

  // Pink wave: A larger amplitude and more repetitions create a wider, more pronounced wave with additional random vertical variation.
  push();
  stroke(255, 122, 122);
  translate(-120, height / 3.5);
  var amp = 200;

  for (var i = 0; i < 30000; i++) {
    var waveX = random(0, width);
    var waveY = cos((waveX / width) * PI * 30) * amp;
    waveY += random(-10, 50);
    point(waveX, waveY);
  }

  pop();
}