const canvas = document.querySelector('canvas');

const context = canvas.getContext('2d');

canvas.width = innerWidth;
canvas.height = innerHeight;

const scoreEl = document.querySelector('#scoreEl');
const startGameBtn = document.querySelector('#startGameBtn');

const modalEl = document.querySelector('#modalEl');

const bigScoreEl = document.querySelector('#bigScoreEl');

class Player {
    constructor(x, y, radius, color) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
    }
    drawPlayer() {
        context.beginPath();
        context.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        context.fillStyle = this.color;
        context.fill();
    }
}

class Projectile {
    constructor(x, y, radius, color, velocity) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
        this.velocity = velocity;
    }
    drawProjectile() {
        context.beginPath();
        context.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        context.fillStyle = this.color;
        context.fill();
    }

    update() {
        this.drawProjectile();
        this.x = this.x + this.velocity.x;
        this.y = this.y + this.velocity.y;
    }
}

class Enemy {
    constructor(x, y, radius, color, velocity) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
        this.velocity = velocity;
    }
    drawProjectile() {
        context.beginPath();
        context.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        context.fillStyle = this.color;
        context.fill();
    }

    drawBunny() {
        context.beginPath();
        context.arc(75, 75, 50, 0, Math.PI * 2, true);
        context.moveTo(110, 75);
        context.arc(75, 75, 35, 0, Math.PI, false);
        context.moveTo(65, 65);
        context.arc(60, 65, 5, 0, Math.PI * 2, true);
        context.moveTo(95, 65);
        context.arc(90, 65, 5, 0, Math.PI * 2, true);
        context.fill();
    }

    update() {
        this.drawProjectile();
        this.drawBunny();
        this.x = this.x + this.velocity.x;
        this.y = this.y + this.velocity.y;
    }
}

const friction = 0.98;
class Particle {
    constructor(x, y, radius, color, velocity) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
        this.velocity = velocity;
        this.alpha = 1;
    }

    drawProjectile() {
        context.save();
        context.globalAlpha = this.alpha;
        context.beginPath();
        context.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        context.fillStyle = this.color;
        context.fill();
        context.restore();
    }

    drawBunny() {
        context.save();
        context.globalAlpha = this.alpha;
        context.beginPath();
        context.arc(75, 75, 50, 0, Math.PI * 2, true); 
        context.moveTo(110, 75);
        context.arc(75, 75, 35, 0, Math.PI, false);  
        context.moveTo(65, 65);
        context.arc(60, 65, 5, 0, Math.PI * 2, true);  
        context.moveTo(95, 65);
        context.arc(90, 65, 5, 0, Math.PI * 2, true);  
        context.fill();
        context.restore();
    }

    update() {
        this.drawProjectile();
        this.drawBunny();
        this.velocity.x *= friction;
        this.velocity.y *= friction;
        this.x = this.x + this.velocity.x;
        this.y = this.y + this.velocity.y;
        this.alpha -= 0.01;
    }
}

const x = canvas.width / 2;
const y = canvas.height / 2;

let player = new Player(x, y, 10, 'white');

let projectiles = [];
let enemies = [];
let bunnies = [];
let particles = [];

function init() {
    player = new Player(x, y, 10, 'white');

    projectiles = [];
    enemies = [];
    bunnies = [];
    particles = [];

    score = 0;

    scoreEl.innerHTML = score;
    bigScoreEl.innerHTML = score;
}

function spawnEnemies() {
  setInterval(() => {
    const radius =  Math.random() * (30 - 5) + 5;

    let x;
    let y;

    if (Math.random() < 0.5) {
      x = Math.random() < 0.5 ? 0 - radius : canvas.width + radius;
      y = Math.random() * canvas.height;
    } else {
      x = Math.random() * canvas.width;
      y = Math.random() < 0.5 ? 0 - radius : canvas.height + radius;
    }

    const color = `hsl(${Math.random() * 360}, 50%, 50%)`;

    const angle = Math.atan2(
        canvas.height / 2 - y,
        canvas.width / 2 - x
        );

    const velocity = {
        x: Math.cos(angle),
        y: Math.sin(angle)
    };

    enemies.push(new Enemy(x, y, radius, color, velocity));
    bunnies.push(new Bunny(x, y, radius, color, velocity));

  }, 1000);
}

let animationId;
let score = 0;
function animate() {
    animationId = requestAnimationFrame(animate);
    context.fillStyle = 'rgba(0, 0, 0, 0.1)';
    context.fillRect(0, 0, canvas.width, canvas.height);
    player.drawPlayer();
    particles.forEach((particle, index) => { 
        if (particle.alpha <= 0) {
            particles.splice(index, 1);
        } else {
            particle.update();
        }
    });

    projectiles.forEach((projectile, index) => {
       projectile.update();
    
       if (projectile.x + projectile.radius < 0 || projectile.x - projectile.radius > canvas.width ||
        projectile.y + projectile.radius < 0 || projectile.y - projectile.radius > canvas.height)
       {
           setTimeout(() => {
                projectiles.splice(index, 1);
            }, 0);
       }
    });

    enemies.forEach((enemy, index) => {
      enemy.update();

      const dist = Math.hypot(player.x - enemy.x, player.y - enemy.y);

      if (dist - enemy.radius - player.radius < 1)
          {
              cancelAnimationFrame(animationId);
              modalEl.style.display = 'flex';
              bigScoreEl.innerHTML = score;
          }


      projectiles.forEach((projectile, projectileIndex) => {
          const dist = Math.hypot(projectile.x - enemy.x, projectile.y - enemy.y);

          if (dist - enemy.radius - projectile.radius < 1)
          {
            score += 100;
            scoreEl.innerHTML = score;
            
            for (let i = 0; i < enemy.radius * 2; i++) {
                particles.push(
                    new Particle(projectile.x, projectile.y, Math.random() * 2, enemy.color, 
                    {
                        x: (Math.random() - 0.5) * (Math.random() * 5), 
                        y: (Math.random() - 0.5) * (Math.random() * 5)
                    }) 
                );
            }

              if (enemy.radius - 10 > 5) {
                  score += 100;
                  scoreEl.innerHTML = score;
                  
                  gsap.to(enemy, {
                      radius: enemy.radius - 10
                  });
                  setTimeout(() => {
                    projectiles.splice(projectileIndex, 1);
                    }, 0);
              } else {
                score += 200;
                scoreEl.innerHTML = score;

                setTimeout(() => {
                    enemies.splice(index, 1);
                    projectiles.splice(projectileIndex, 1);
                }, 0);
             }
          }
      });
    });

    bunnies.forEach((bunny, index) => {
        bunny.update();
  
        const dist = Math.hypot(player.x - bunny.x, player.y - bunny.y);
  
        if (dist - bunny.radius - player.radius < 1)
            {
                cancelAnimationFrame(animationId);
                modalEl.style.display = 'flex';
                bigScoreEl.innerHTML = score;
            }
  
  
        projectiles.forEach((projectile, projectileIndex) => {
            const dist = Math.hypot(projectile.x - bunny.x, projectile.y - bunny.y);
  
            if (dist - bunny.radius - projectile.radius < 1)
            {
              score += 100;
              scoreEl.innerHTML = score;
              
              for (let i = 0; i < bunny.radius * 2; i++) {
                  particles.push(
                      new Particle(projectile.x, projectile.y, Math.random() * 2, bunny.color, 
                      {
                          x: (Math.random() - 0.5) * (Math.random() * 5), 
                          y: (Math.random() - 0.5) * (Math.random() * 5)
                      }) 
                  );
              }
  
                if (bunny.radius - 10 > 5) {
                    score += 100;
                    scoreEl.innerHTML = score;
                    
                    gsap.to(bunny, {
                        radius: bunny.radius - 10
                    });
                    setTimeout(() => {
                      projectiles.splice(projectileIndex, 1);
                      }, 0);
                } else {
                  score += 200;
                  scoreEl.innerHTML = score;
  
                  setTimeout(() => {
                      bunnies.splice(index, 1);
                      projectiles.splice(projectileIndex, 1);
                  }, 0);
               }
            }
        });
      });
}

addEventListener('click', (event) => {
    const angle = Math.atan2(
        event.clientY - canvas.height / 2,
        event.clientX - canvas.width / 2
        );

    const velocity = {
        x: Math.cos(angle) * 5,
        y: Math.sin(angle) * 5
    };
    
    projectiles.push(new Projectile(
        canvas.width / 2,
        canvas.height / 2,
        5,
        'white',
        velocity
        ));
});

startGameBtn.addEventListener('click', () => {
    init();
    animate();
    spawnEnemies();
    modalEl.style.display = 'none';
});
