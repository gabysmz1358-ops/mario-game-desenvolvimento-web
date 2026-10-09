const mario = document.querySelector('.mario');
const pipe = document.querySelector('.pipe');
const gameOver = document.querySelector('.game-over');
const score = document.querySelector('.score');
const highScore = document.querySelector('#high-score');

const resetBtn = document.querySelector('#reset-record');
const tempo = document.querySelector('#tempo');
const mensagem = document.querySelector('#mensagem');

const jumpSound = new Audio('./sound/jump.wav');
const gameOverSound = new Audio('./sound/mariodie.wav');

const setCookie = function (name, value, expirationDays) {
    const date = new Date();
    date.setTime(date.getTime() + (expirationDays * 24 * 60 * 60 * 1000));
    let expires = "expires=" + date.toUTCString();

    document.cookie = name + "=" + value + ";" + expires + ";SameSite=Lax;path=/";
};

const getCookie = function (name) {
    let decodedCookie = decodeURIComponent(document.cookie);
    let ca = decodedCookie.split(';');
    name = name + "=";

    console.log(ca);
    for (let i = 0; i < ca.length; i++) {
        let c = ca[i];

        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }

        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }

    return "";
};

var scoreValue = -1;
var highScoreValue = getCookie('high-score');

highScore.textContent = getCookie('high-score');

let duracaoCano = 0.8;
let duracaoPendente = 0.8;

const aplicarVelocidade = () => {
    pipe.style.animation = 'none';
    void pipe.offsetWidth;
    pipe.style.animation = `pipe-animation ${duracaoCano}s infinite linear`;
};

pipe.addEventListener('animationiteration', () => {
    if (duracaoCano !== duracaoPendente) {
        duracaoCano = duracaoPendente;
        aplicarVelocidade();
    }
});

const atualizarSprite = (pulando) => {
    let caminho = './images/mario-starter.gif';

    if (scoreValue >= 10) {
        caminho = pulando ? './images/mario-flying.gif' : './images/mario-pro.gif';
    } else if (scoreValue >= 5) {
        caminho = './images/mario-beginner.gif';
    }

    if (mario.getAttribute('src') !== caminho) {
        mario.src = caminho;
    }
};

const atualizarMensagem = () => {
    if (scoreValue < 5) {
        mensagem.textContent = "Aquecendo...";
    } else if (scoreValue < 10) {
        mensagem.textContent = "Você pegou o jeito!";
    } else if (scoreValue < 15) {
        mensagem.textContent = "Mandando bem!";
    } else if (scoreValue < 20) {
        mensagem.textContent = "Nível profissional!";
    } else {
        mensagem.textContent = "Lendário!";
    }
};

let segundos = 0;

const contarTempo = () => {
    segundos++;
    tempo.textContent = segundos;
};

let relogio = setInterval(contarTempo, 1000);

const jump = () => {
    if (
        gameOver.style.display === 'block'
        || mario.classList.contains('jump')
    ) {
        return;
    }

    jumpSound.currentTime = 0;
    jumpSound.play();

    mario.classList.add('jump');

    scoreValue += 1;
    score.textContent = scoreValue;

    if (scoreValue > 0 && scoreValue % 5 === 0) {
        duracaoPendente = Math.max(0.4, duracaoPendente - 0.05);
    }

    atualizarMensagem();
    atualizarSprite(true);

    if (highScoreValue < scoreValue) {
        setCookie('high-score', scoreValue, 365);
        highScoreValue = scoreValue;
        highScore.textContent = highScoreValue;
    }

    setTimeout(() => {
        mario.classList.remove('jump');

        if (gameOver.style.display !== 'block') {
            atualizarSprite(false);
        }
    }, 500);
}

const waitingFailure = () => {
    const pipePosition = pipe.offsetLeft;
    const marioPosition = +window.getComputedStyle(mario).bottom.replace('px', '');

    if (
        pipePosition <= 120
        && pipePosition > 0
        && marioPosition < 112
    ) {
        gameOverSound.play();
        clearInterval(relogio);

        mario.style.animationPlayState = 'paused';
        mario.style.bottom = `${marioPosition}px`;

        pipe.style.animation = 'none';
        pipe.style.left = `${pipePosition}px`;

        mario.src = './images/game-over.png';
        mario.style.width = '75px';
        mario.style.marginLeft = '50px';

        gameOver.style.display = 'block';

        clearInterval(loop);

        document.removeEventListener('keydown', jump);
        document.removeEventListener('touchstart', jump);
    }
};

var loop = setInterval(waitingFailure, 10);

const restartGame = function () {
    gameOver.style.display = 'none';

    mario.style.animationPlayState = 'running';
    mario.src = './images/mario-starter.gif';
    mario.style.width = '150px';
    mario.style.marginLeft = '0';
    mario.style.bottom = '0';

    pipe.style.left = 'auto';
	
    duracaoCano = 0.8;
    duracaoPendente = 0.8;
    aplicarVelocidade();

    scoreValue = 0;
    score.textContent = scoreValue;
    atualizarMensagem();

    segundos = 0;
    tempo.textContent = segundos;
    clearInterval(relogio);
    relogio = setInterval(contarTempo, 1000);

    document.addEventListener('keydown', jump);
    document.addEventListener('touchstart', jump);

    loop = setInterval(waitingFailure, 10);
};

document.querySelector('.retry').addEventListener('click', restartGame);

resetBtn.addEventListener('click', function () {
    setCookie('high-score', 0, 365);
    highScoreValue = 0;
    highScore.textContent = 0;
    resetBtn.blur(); 
});

document.addEventListener('keydown', jump);
document.querySelector('.game-board').addEventListener('touchstart', jump);
