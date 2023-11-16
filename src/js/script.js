let canvas, ctx, player, asteroids, bestTime, startTime, lastTime, elapsedTime;
window.onload = function () {
    canvas = document.getElementById("gameCanvas");
    ctx = canvas.getContext("2d");

    // Postavljanje dimenzija canvasa na veličinu prozora
    canvas.width = window.innerWidth * 0.999;
    canvas.height = window.innerHeight * 0.999;

    player = {
        x: canvas.width / 2,
        y: canvas.height / 2,
        width: 35,
        height: 35,
        color: "red",
        speed: 15,
        direction: { x: 0, y: 0 }
    };

    asteroids = [];
    generateAsteroids(5);

    bestTime = localStorage.getItem("bestTime") || "N/A";

    window.addEventListener("keydown", handleKeyPress);
    window.addEventListener("keyup", handleKeyUp);

    startTime = new Date().getTime();
    lastTime = startTime;

    window.addEventListener("resize", handleResize); // Dodano praćenje promjena veličine prozora

    setInterval(updateGame, 16.67); // 60 fps
};

function handleResize() {
    // Prilagodi dimenzije canvasa prilikom promjene veličine prozora
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Ponovno postavi igrača i asteroide kako bi se prilagodili novim dimenzijama
    player.x = canvas.width / 2;
    player.y = canvas.height / 2;

    asteroids = [];
    generateAsteroids(5);
    resetGame();
}

function generateAsteroids(count) {
    for (let i = 0; i < count; i++) {
        const randomGray = Math.floor(Math.random() * 256);
        const grayColor = `rgb(${randomGray}, ${randomGray}, ${randomGray})`;

        const side = Math.floor(Math.random() * 4);

        let initialX, initialY;

        switch (side) {
            case 0: // Top
                initialX = Math.random() * canvas.width;
                initialY = -50;
                break;
            case 1: // Right
                initialX = canvas.width + 50;
                initialY = Math.random() * canvas.height;
                break;
            case 2: // Bottom
                initialX = Math.random() * canvas.width;
                initialY = canvas.height + 50;
                break;
            case 3: // Left
                initialX = -50;
                initialY = Math.random() * canvas.height;
                break;
        }

        
        let speedX = (Math.random() * 3 + 3) * (Math.random() < 0.5 ? -1 : 1);;
        let speedY = (Math.random() * 3 + 3) * (Math.random() < 0.5 ? -1 : 1);;

        asteroids.push({
            x: initialX,
            y: initialY,
            width: 50,
            height: 50,
            color: grayColor,
            speedX: speedX,
            speedY: speedY
        });
    }
}





function checkCollision(obj1, obj2) {
    return (
        obj1.x < obj2.x + obj2.width &&
        obj1.x + obj1.width > obj2.x &&
        obj1.y < obj2.y + obj2.height &&
        obj1.y + obj1.height > obj2.y
    );
}

function updateGame() {
    const currentTime = new Date().getTime();
    elapsedTime = (currentTime - startTime) / 1000; // in seconds
    const deltaTime = (currentTime - lastTime) / 1000; // in seconds

    movePlayer(deltaTime);
    moveAsteroids();
    lastTime = currentTime;

    updatePlayerDirection();

    for (let asteroid of asteroids) {
        if (checkCollision(player, asteroid)) {
            handleCollision();
            return;
        }
    }

    // Add an asteroid every minute
    if (Math.floor(elapsedTime) > (asteroids.length - 4) * 20) {
        generateAsteroids(1);
    }

    drawGame();
}


function movePlayer(deltaTime) {
    player.x += player.direction.x * player.speed * deltaTime;
    player.y += player.direction.y * player.speed * deltaTime;

    // Pomicanje igrača na suprotnu stranu ako izađe izvan rubova
    if (player.x < 0) player.x = canvas.width - player.width;
    if (player.x + player.width > canvas.width) player.x = 0;
    if (player.y < 0) player.y = canvas.height - player.height;
    if (player.y + player.height > canvas.height) player.y = 0;
}

function moveAsteroids() {

    for (let asteroid of asteroids) {
        asteroid.x += asteroid.speedX;
        asteroid.y += asteroid.speedY;

        // Check if the asteroid is completely off-screen
        if (
            asteroid.x + asteroid.width < 0 ||
            asteroid.x > canvas.width ||
            asteroid.y + asteroid.height < 0 ||
            asteroid.y > canvas.height
        ) {
            // If off-screen, reposition the asteroid to a random side and give it a new random direction
            const side = Math.floor(Math.random() * 4); // Randomly choose a side (0: top, 1: right, 2: bottom, 3: left)

            switch (side) {
                case 0: // Top
                    asteroid.x = Math.random() * canvas.width;
                    asteroid.y = -asteroid.height;
                    break;
                case 1: // Right
                    asteroid.x = canvas.width;
                    asteroid.y = Math.random() * canvas.height;
                    break;
                case 2: // Bottom
                    asteroid.x = Math.random() * canvas.width;
                    asteroid.y = canvas.height;
                    break;
                case 3: // Left
                    asteroid.x = -asteroid.width;
                    asteroid.y = Math.random() * canvas.height;
                    break;
            }

            
            // Generate random speed between 4 and 8, then randomly make it negative
            asteroid.speedX = (Math.random() * 3 + 3) * (Math.random() < 0.5 ? -1 : 1);

            // Generate random speed between 4 and 8, then randomly make it negative
            asteroid.speedY = (Math.random() * 3 + 3) * (Math.random() < 0.5 ? -1 : 1);

            
        }
    }
}



function handleCollision() {
    updateBestTime();
    resetGame();
}

function updateBestTime() {
    const currentTime = new Date().getTime();
    const elapsedTime = (currentTime - startTime) / 1000;

    if (bestTime === "N/A" || elapsedTime > bestTime) {
        bestTime = elapsedTime.toFixed(3);
        localStorage.setItem("bestTime", bestTime);
    }
}

function resetGame() {
    startTime = new Date().getTime();
    lastTime = startTime;

    player.x = canvas.width / 2;
    player.y = canvas.height / 2;

    asteroids = [];
    generateAsteroids(5);
}

function drawGame() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = "white";
    ctx.lineWidth = 5;
    ctx.strokeRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = player.color;
    ctx.shadowColor = "rgba(255, 0, 0, 0.8)"; // Shadow color for player (red)
    ctx.shadowBlur = 10; // Shadow blur radius
    ctx.fillRect(player.x, player.y, player.width, player.height);
    ctx.shadowColor = "rgba(0, 0, 0, 0)"; // Reset shadow

    for (let asteroid of asteroids) {
        ctx.fillStyle = asteroid.color;
        ctx.strokeStyle = "black"; // Stroke color
        ctx.lineWidth = 2; // Stroke width

        // Add shadow to asteroid
        ctx.shadowColor = "rgba(0, 0, 0, 0.8)"; // Shadow color for asteroids
        ctx.shadowBlur = 10; // Shadow blur radius

        ctx.beginPath();
        ctx.rect(asteroid.x, asteroid.y, asteroid.width, asteroid.height);
        ctx.fill();
        ctx.stroke();

        // Reset shadow
        ctx.shadowColor = "rgba(0, 0, 0, 0)";
    }

    ctx.fillStyle = "white";
    ctx.font = "20px Arial";
    ctx.textAlign = "right";
    ctx.fillText("Najbolje vrijeme: " + secondsToMMSSSSS(bestTime), canvas.width - 10, 30);
    const currentTime = new Date().getTime();
    elapsedTime = ((currentTime - startTime) / 1000).toFixed(3);
    ctx.fillText("Vrijeme: " + secondsToMMSSSSS(elapsedTime), canvas.width - 10, 60);
}


function secondsToMMSSSSS(seconds) {
    if (seconds === "N/A") return seconds;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = (seconds % 60).toFixed(3);
    const formattedTime = `${minutes.toString().padStart(2, '0')}:${remainingSeconds.padStart(6, '0')}`;
    
    return formattedTime;
}


let keysPressed = {
    ArrowUp: false,
    ArrowDown: false,
    ArrowLeft: false,
    ArrowRight: false
};

function handleKeyPress(event) {
    keysPressed[event.key] = true;
}

function handleKeyUp(event) {
    keysPressed[event.key] = false;
}

function updatePlayerDirection() {
    let newDirection = { x: 0, y: 0 };

    // Ako su pritisnute tipke za gore i dolje istovremeno, zaustavi kretanje po Y osi
    if (keysPressed.ArrowUp && keysPressed.ArrowDown) {
        newDirection.y = 0;
    } else if (keysPressed.ArrowUp) {
        newDirection.y = -player.speed;
    } else if (keysPressed.ArrowDown) {
        newDirection.y = player.speed;
    }

    // Ako su pritisnute tipke za lijevo i desno istovremeno, zaustavi kretanje po X osi
    if (keysPressed.ArrowLeft && keysPressed.ArrowRight) {
        newDirection.x = 0;
    } else if (keysPressed.ArrowLeft) {
        newDirection.x = -player.speed;
    } else if (keysPressed.ArrowRight) {
        newDirection.x = player.speed;
    }

    // Postavi smjer igrača
    player.direction = newDirection;
}