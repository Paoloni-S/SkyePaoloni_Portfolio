
/* DM3008 Generative Art, Skye Paoloni 2026
 * Title: Sunset Boids
 * Description: The original code template provided in class established a basic flocking system using separation, alignment, cohesion, and mouse attraction. This revised version builds on the foundation by increasing the flock to 200 agents, adjusting the canvas dimensions and colour palette, and expanding the visual output through pink movement trails and orange separation indicators. Small circular markers have also been added to make individual boids easier to identify. I also corrected the separation loop so that it checks every boid (the first re-iteration of the assignment that was put up on NTU Learn had done this incorrectly), relying on the distance condition to exclude the agent itself. Overall, the updated version makes the flock more visually expressive while retaining the core autonomous-agent principles introduced in class. The colour scheme and artworks made from this pay homage to sunset colours and visuals. 
 */

let flock;

function setup() {
  createCanvas(1000, 650);
  background(255, 245, 232);

  // Create the flock and add 200 boids at random positions.
  flock = new Flock();

  for (let i = 0; i < 200; i++) {
    let b = new Boid(random(width), random(height));
    flock.addBoid(b);
  }
}

function draw() {
  // Update and display every boid in the flock.
  flock.run();

  // Display the controls over the artwork.
  // The background is not cleared here, allowing movement trails to build up.
  push();
  noStroke();
  fill(255, 245, 232, 230);
  rect(15, 15, 255, 88);

  fill(65, 50, 60);
  textSize(13);
  text("Press 's' for separation.", 28, 38);
  text("Press 'a' for alignment.", 28, 58);
  text("Press 'c' for cohesion.", 28, 78);
  text("Hold the mouse to attract the flock.", 28, 98);
  pop();
}

// ------------------------------------------------------------
// FLOCK OBJECT
// Manages the collection of boids.
// ------------------------------------------------------------

function Flock() {
  // Store all boids in an array.
  this.boids = [];
}

// Run each boid, passing the full flock so it can respond
// to the positions and movements of its neighbours.
Flock.prototype.run = function () {
  for (let i = 0; i < this.boids.length; i++) {
    this.boids[i].run(this.boids);
  }
};

// Add a new boid to the flock.
Flock.prototype.addBoid = function (b) {
  this.boids.push(b);
};

// ------------------------------------------------------------
// BOID CLASS
// Defines the properties and behaviours of each agent.
// ------------------------------------------------------------

function Boid(x, y) {
  this.acceleration = createVector(0, 0);
  this.velocity = createVector(random(-1, 1), random(-1, 1));
  this.position = createVector(x, y);

  // Radius controls the size of the marker and border detection (it is marked at .5 to make them thin and smaller).
  this.r = .5;;

  // Limits how quickly a boid can move or change direction.
  this.maxSpeed = 4;
  this.maxForce = 0.4;
}

// Run the boid's behaviours in sequence.
Boid.prototype.run = function (boids) {
  this.flock(boids);
  this.update();
  this.borders();
  this.render();
};

// Add a steering force to the boid's acceleration.
Boid.prototype.applyForce = function (force) {
  this.acceleration.add(force);
};

// Calculate the flocking forces and decide which ones to apply.
Boid.prototype.flock = function (boids) {
  let sep = this.separate(boids);
  let ali = this.align(boids);
  let coh = this.cohesion(boids);
  let fol = this.mouse();

  // Weight the forces to control their influence.
  sep.mult(1.0);
  ali.mult(1.0);
  coh.mult(1.0);

  // Keep mouse attraction subtle so boids move towards it with a flow rather than all at once very quicl.
  fol.mult(0.3);

  // Pressing a key activates its corresponding flocking behaviour.
  if (key === "s") {
    this.applyForce(sep);
  } else if (key === "a") {
    this.applyForce(ali);
  } else if (key === "c") {
    this.applyForce(coh);
  }

  // Mouse attraction can be applied alongside any flocking behaviour.
  this.applyForce(fol);
};

// Update the boid's movement using its current acceleration.
Boid.prototype.update = function () {
  // Acceleration changes velocity, and velocity changes position.
  this.velocity.add(this.acceleration);
  this.velocity.limit(this.maxSpeed);
  this.position.add(this.velocity);

  // Draw a line showing the direction and strength of acceleration.
  // Repeated lines create a trail that records the boid's movement.
  push();
  stroke(255, 80, 145);
  strokeWeight(0.3);

  line(
    this.acceleration.x * 70 + this.position.x,
    this.acceleration.y * 70 + this.position.y,
    this.position.x,
    this.position.y
  );
  pop();

  // Reset acceleration so forces are recalculated each frame.
  this.acceleration.mult(0);
};

// Calculate a steering force that moves the boid towards a target.
Boid.prototype.seek = function (target) {
  // Find the direction from the boid to the target.
  let desired = p5.Vector.sub(target, this.position);

  // Set the desired direction to the boid's maximum speed.
  desired.normalize();
  desired.mult(this.maxSpeed);

  // Steering is the difference between desired and current velocity.
  let steer = p5.Vector.sub(desired, this.velocity);

  // Limit how sharply the boid can change direction.
  steer.limit(this.maxForce);

  return steer;
};

// Draw a small marker to make each boid's position visible.
Boid.prototype.render = function () {
  push();
  translate(this.position.x, this.position.y);

  noStroke();
  fill(250, 10, 200); //make the lines (boids) pink. 
  ellipse(0, 0, this.r * 2, this.r * 2);

  pop();
};

// Move boids to the opposite edge when they leave the canvas.
// This creates a continuous, wraparound environment.
Boid.prototype.borders = function () {
  if (this.position.x < -this.r) {
    this.position.x = width + this.r;
  }

  if (this.position.y < -this.r) {
    this.position.y = height + this.r;
  }

  if (this.position.x > width + this.r) {
    this.position.x = -this.r;
  }

  if (this.position.y > height + this.r) {
    this.position.y = -this.r;
  }
};

// ------------------------------------------------------------
// RULES OF FLOCKING
// Three behaviours that influence how the boids move together.
// ------------------------------------------------------------

// SEPARATION
// Steers boids away from nearby neighbours to prevent crowding.

Boid.prototype.separate = function (boids) {
  let desiredSeparation = 250;
  let steer = createVector(0, 0);
  let count = 0;

  // Compare this boid's position with every other boid.
  for (let i = 0; i < boids.length; i++) {
    let d = p5.Vector.dist(this.position, boids[i].position);

    // Only respond to neighbours within the separation distance.
    // The d > 0 condition excludes the boid itself.
    if (d > 0 && d < desiredSeparation) {
      // Create a vector pointing away from the nearby boid.
      let diff = p5.Vector.sub(this.position, boids[i].position);
      diff.normalize();
      steer.add(diff);
      count++;
    }
  }

  if (count > 0) {
    // Draw an orange line to visualise the separation force.
    push();
    stroke(255, 170, 32);
    strokeWeight(0.1);

    line(
      steer.x + this.position.x,
      steer.y + this.position.y,
      this.position.x,
      this.position.y
    );
    pop();

    // Average the force across all nearby neighbours.
    steer.div(count);
  }

  if (steer.mag() > 0) {
    // Convert the average direction into a steering force.
    steer.normalize();
    steer.mult(this.maxSpeed);
    steer.sub(this.velocity);
    steer.limit(this.maxForce);
  }

  return steer;
};

// ALIGNMENT
// Encourages boids to travel in a similar direction to their neighbours.

Boid.prototype.align = function (boids) {
  // A large distance allows alignment across much of the flock.
  let neighborDistance = 1000;
  let sum = createVector(0, 0);
  let count = 0;

  for (let i = 0; i < boids.length; i++) {
    let d = p5.Vector.dist(this.position, boids[i].position);

    if (d > 0 && d < neighborDistance) {
      // Add the neighbour's velocity to the running total.
      sum.add(boids[i].velocity);
      count++;
    }
  }

  if (count > 0) {
    // Calculate the average velocity of the neighbours.
    sum.div(count);
    sum.normalize();
    sum.mult(this.maxSpeed);

    // Steer towards the average direction of movement.
    let steer = p5.Vector.sub(sum, this.velocity);
    steer.limit(this.maxForce);

    return steer;
  } else {
    // Return no force if there are no neighbours to follow.
    return createVector(0, 0);
  }
};

// COHESION
// Encourages boids to move towards the centre of nearby neighbours.

Boid.prototype.cohesion = function (boids) {
  let neighborDistance = 50;
  let sum = createVector(0, 0);
  let count = 0;

  for (let i = 0; i < boids.length; i++) {
    let d = p5.Vector.dist(this.position, boids[i].position);

    if (d > 0 && d < neighborDistance) {
      // Add the positions of nearby boids together.
      sum.add(boids[i].position);
      count++;
    }
  }

  if (count > 0) {
    // Find the average position, which represents the group centre.
    sum.div(count);

    // Seek the average position to move towards the group.
    return this.seek(sum);
  } else {
    return createVector(0, 0);
  }
};

// FOLLOW MOUSE
// Attracts boids towards the mouse while the mouse is held down.

Boid.prototype.mouse = function () {
  if (mouseIsPressed) {
    return this.seek(createVector(mouseX, mouseY));
  } else {
    return createVector(0, 0);
  }
};
