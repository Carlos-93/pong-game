const canvas = document.getElementById('pongCanvas');
const ctx = canvas.getContext('2d');
const url = new URLSearchParams(window.location.search);
const onePlayerMode = url.get('mode') === 'onePlayer';
const twoPlayerMode = url.get('mode') === 'twoPlayers';

// Constantes para las paletas
const PADDLE_HEIGHT = 100;
const PADDLE_WIDTH = 10;
const PADDLE_SPEED = 10;
const PADDLE_RADIUS = 5;

// Constantes para las teclas
const KEY_UP = "ArrowUp";
const KEY_DOWN = "ArrowDown";
const KEY_W = "W";
const KEY_S = "S";

// Variables para el estado de las teclas
let upPressed = false;
let downPressed = false;
let wPressed = false;
let sPressed = false;

// Variables para las puntuaciones
let scorePlayer1 = 0;
let scorePlayer2 = 0;

// Objeto de tipo bola (pelota)
const ball = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    dx: 8,
    dy: 8,
    radius: 10
};

// Objetos de tipo paleta izquierda
const leftPaddle = {
    x: 10,
    y: canvas.height / 2 - PADDLE_HEIGHT / 2,
    width: PADDLE_WIDTH,
    height: PADDLE_HEIGHT,
    dy: 0
};

// Objetos de tipo paleta derecha
const rightPaddle = {
    x: canvas.width - PADDLE_WIDTH - 10,
    y: canvas.height / 2 - PADDLE_HEIGHT / 2,
    width: PADDLE_WIDTH,
    height: PADDLE_HEIGHT,
    dy: 0
};

// Eventos para las teclas presionadas y soltadas
document.addEventListener('keydown', (e) => keyEvent(e, true), false);
document.addEventListener('keyup', (e) => keyEvent(e, false), false);

// Función para manejar eventos del teclado
function keyEvent(e, pressed) {
    // Si es modo multijugador, manejamos las teclas de ambas paletas
    switch (e.key.toLowerCase()) {
        case "arrowup": upPressed = pressed; break;
        case "arrowdown": downPressed = pressed; break;
        case "w": wPressed = pressed; break;
        case "s": sPressed = pressed; break;
    }
}

// Función para dibujar la bola en el canvas
function createBall() {
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    ctx.fillStyle = "#00D2FF";
    ctx.fill();
    ctx.closePath();
}

// Función para dibujar las palas (con esquinas redondeadas)
function createPaddle(x, y, width, height) {
    ctx.beginPath();
    ctx.moveTo(x + PADDLE_RADIUS, y);
    ctx.lineTo(x + width - PADDLE_RADIUS, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + PADDLE_RADIUS);
    ctx.lineTo(x + width, y + height - PADDLE_RADIUS);
    ctx.quadraticCurveTo(x + width, y + height, x + width - PADDLE_RADIUS, y + height);
    ctx.lineTo(x + PADDLE_RADIUS, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - PADDLE_RADIUS);
    ctx.lineTo(x, y + PADDLE_RADIUS);
    ctx.quadraticCurveTo(x, y, x + PADDLE_RADIUS, y);
    ctx.closePath();
    ctx.fillStyle = "#ff2323";
    ctx.fill();
}

// Función para mover la bola y manejar colisiones
function moveBall() {
    // Movimiento de la bola
    ball.x += ball.dx;
    ball.y += ball.dy;

    // Detectamos colisiones de la bola con los bordes del canvas
    if (ball.y - ball.radius < 0 || ball.y + ball.radius > canvas.height) {
        ball.dy = -ball.dy;
    }
    // Detectamos colisiones de la bola con la paleta izquierda
    if (ball.x - ball.radius < leftPaddle.x + leftPaddle.width && ball.y > leftPaddle.y && ball.y < leftPaddle.y + leftPaddle.height && ball.dx < 0) {
        ball.dx = -ball.dx;
    }
    // Detectamos colisiones de la bola con la paleta derecha
    if (ball.x + ball.radius > rightPaddle.x && ball.y > rightPaddle.y && ball.y < rightPaddle.y + rightPaddle.height && ball.dx > 0) {
        ball.dx = -ball.dx;
    }
}

// Función para mover la paleta izquierda (controlada por la IA)
function moveAutoPaddle() {
    // Si es modo multijugador, la paleta izquierda no se moverá automáticamente
    if (twoPlayerMode) return;

    // Si la bola está en la mitad izquierda del canvas, movemos la paleta izquierda
    if (ball.x < canvas.width / 2) {
        if (ball.y < leftPaddle.y + leftPaddle.height / 2) {
            leftPaddle.y -= PADDLE_SPEED;
        } else if (ball.y > leftPaddle.y + leftPaddle.height / 2) {
            leftPaddle.y += PADDLE_SPEED;
        }
    }
    // Evitamos que la paleta salga del canvas por arriba o por abajo
    if (leftPaddle.y < 0) {
        leftPaddle.y = 0;
    } else if (leftPaddle.y + leftPaddle.height > canvas.height) {
        leftPaddle.y = canvas.height - leftPaddle.height;
    }
}

// Función para mover las paletas
function movePaddles() {
    // Si es modo multijugador, controlamos la paleta izquierda con las teclas W y S
    if (twoPlayerMode) {
        if (wPressed && leftPaddle.y > 0) {
            leftPaddle.y -= PADDLE_SPEED;
        }
        if (sPressed && leftPaddle.y < canvas.height - PADDLE_HEIGHT) {
            leftPaddle.y += PADDLE_SPEED;
        }
    }
    // Controlamos la paleta derecha en cualquier modo
    if (upPressed && rightPaddle.y > 0) {
        rightPaddle.y -= PADDLE_SPEED;
    }
    if (downPressed && rightPaddle.y < canvas.height - PADDLE_HEIGHT) {
        rightPaddle.y += PADDLE_SPEED;
    }
}

// Función principal para actualizar el canvas y dibujar los elementos
function updateGame() {
    // Limpiamos el canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    createBall();
    createPaddle(leftPaddle.x, leftPaddle.y, leftPaddle.width, leftPaddle.height);
    createPaddle(rightPaddle.x, rightPaddle.y, rightPaddle.width, rightPaddle.height);

    // Movemos la bola y las paletas
    moveBall();
    movePaddles();
    moveAutoPaddle();

    // Comprobamos si la bola ha salido del canvas para actualizar la puntuación y terminar el juego
    if (ball.x + ball.radius < -ball.radius) {
        scorePlayer2++;
        document.getElementById('score-02').innerText = scorePlayer2;
        pauseAndUpdate();
    } else if (ball.x - ball.radius > canvas.width + ball.radius) {
        scorePlayer1++;
        document.getElementById('score-01').innerText = scorePlayer1;
        pauseAndUpdate();
    } else {
        requestAnimationFrame(updateGame);
    }
}

// Función para reiniciar el juego
function endGame() {
    // Reiniciamos la posición de la bola
    ball.x = canvas.width / 2;
    ball.y = canvas.height / 2;

    // Establecemos una dirección horizontal aleatoria (izquierda o derecha)
    ball.dx = (Math.random() < 0.5 ? -1 : 1) * 8;

    // Establecemos una dirección vertical aleatoria (arriba o abajo)
    ball.dy = (Math.random() < 0.5 ? -1 : 1) * 8;

    // Reiniciamos las posiciones de las paletas
    leftPaddle.y = canvas.height / 2 - PADDLE_HEIGHT / 2;
    rightPaddle.y = canvas.height / 2 - PADDLE_HEIGHT / 2;

    // Reiniciamos el color box-shadow del canvas
    canvas.classList.remove('canvas-scored');
}

// Función para pausar el juego y actualizar la puntuación
function pauseAndUpdate() {
    // Cambiamos el color box-shadow del canvas al puntuar un jugador
    canvas.classList.add('canvas-scored');
    cancelAnimationFrame(updateGame);
    setTimeout(function () {
        endGame();
        requestAnimationFrame(updateGame);
    }, 2000);
}
updateGame();