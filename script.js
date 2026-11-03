// 1. Аудио-движок со всеми нотами, которые есть на первом листе
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

const notesFreq = { 
    'A3': 220.00, 'B3': 246.94, 'C4': 261.63, 'D4': 293.66,
    'E4': 329.63, 'F4': 349.23, 'G4': 392.00, 'GS4': 415.30,
    'A4': 440.00, 'B4': 493.88, 'C5': 523.25, 'D5': 587.33,
    'E5': 659.25, 'F5': 698.46, 'A5': 880.00
};

function playTone(freq) {
    if (audioCtx.state === 'suspended') audioCtx.resume();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    
    osc.type = 'triangle'; // Мягкое звучание пианино
    osc.frequency.value = freq;
    
    gain.gain.setValueAtTime(0.4, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.2);
    
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + 0.2);
}

// 2. ТОЧНЫЕ НОТЫ ИЗ КАРТИНКИ (Такты 1-12)
// Дорожки: 0 = A, 1 = S, 2 = D, 3 = F
const rushEData = [
    // ТАКТЫ 1-2: Знаменитое вступление (Одиночные четверти E4, переходящие в ускоряющиеся восьмые)
    { lane: 0, note: 'E4', time: 0 },
    { lane: 0, note: 'E4', time: 600 },
    { lane: 0, note: 'E4', time: 1200 },
    { lane: 0, note: 'E4', time: 1800 },
    
    // Эффект ускорения (accel. на нотах), плитки летят быстрее
    { lane: 0, note: 'E4', time: 2300 },
    { lane: 0, note: 'E4', time: 2550 },
    { lane: 0, note: 'E4', time: 2800 },
    { lane: 0, note: 'E4', time: 3050 },
    
    // ТАКТЫ 3-4: Быстрый спам шестнадцатыми перед ударом аккорда
    { lane: 1, note: 'E4', time: 3250 },
    { lane: 1, note: 'E4', time: 3400 },
    { lane: 1, note: 'E4', time: 3550 },
    { lane: 1, note: 'E4', time: 3700 },
    { lane: 2, note: 'E4', time: 3850 },
    { lane: 2, note: 'E4', time: 4000 },
    { lane: 3, note: 'E5', time: 4150 }, // Переход на верхнюю октаву
    { lane: 3, note: 'E5', time: 4300 },

    // ТАКТ 5: Понеслась главная тема! Мелодия правой руки + басы
    { lane: 0, note: 'A4', time: 4800 },
    { lane: 1, note: 'B4', time: 4950 },
    { lane: 2, note: 'C5', time: 5100 },
    { lane: 3, note: 'D5', time: 5250 },
    { lane: 2, note: 'E5', time: 5400 },
    { lane: 1, note: 'D5', time: 5550 },
    { lane: 0, note: 'C5', time: 5700 },
    { lane: 1, note: 'B4', time: 5850 },

    // ТАКТ 6-7: Быстрые переходы по дорожкам вниз и вверх
    { lane: 0, note: 'A4', time: 6000 },
    { lane: 0, note: 'A4', time: 6150 },
    { lane: 1, note: 'C5', time: 6300 },
    { lane: 2, note: 'E5', time: 6450 },
    { lane: 3, note: 'A5', time: 6600 },
    { lane: 2, note: 'E5', time: 6750 },
    { lane: 1, note: 'C5', time: 6900 },
    { lane: 0, note: 'A4', time: 7050 },

    // ТАКТ 8-9: Драматичный спуск к Соль-диез (GS4)
    { lane: 1, note: 'B4', time: 7200 },
    { lane: 2, note: 'C5', time: 7350 },
    { lane: 3, note: 'D5', time: 7500 },
    { lane: 2, note: 'E5', time: 7650 },
    { lane: 1, note: 'D5', time: 7800 },
    { lane: 0, note: 'C5', time: 7950 },
    { lane: 1, note: 'B4', time: 8100 },
    { lane: 0, note: 'GS4', time: 8250 },
    { lane: 1, note: 'B4', time: 8400 },
    { lane: 2, note: 'E4', time: 8550 },
    
    // ТАКТЫ 10-12: Финальный разгон первой страницы
    { lane: 0, note: 'A4', time: 8900 },
    { lane: 1, note: 'B4', time: 9050 },
    { lane: 2, note: 'C5', time: 9200 },
    { lane: 3, note: 'D5', time: 9350 },
    { lane: 2, note: 'E5', time: 9500 },
    { lane: 1, note: 'A4', time: 9650 },
    { lane: 0, note: 'A4', time: 9800 }
];

let score = 0;
let activeTiles = []; 
let gameInterval;
const fallSpeed = 5.5; // Скорость падения подобрана под темп нот

function startGame() {
    score = 0;
    document.getElementById('score').innerText = score;
    activeTiles = []; 
    
    rushEData.forEach(tileData => {
        setTimeout(() => {
            if (gameInterval) {
                createTile(tileData.lane, tileData.note);
            }
        }, tileData.time);
    });

    gameInterval = requestAnimationFrame(updateGame);
}

function createTile(laneNum, noteName) {
    const laneElement = document.getElementById(`lane-${laneNum}`);
    if (!laneElement) return;
    
    const tile = document.createElement('div');
    tile.classList.add('tile');
    tile.style.top = '-90px'; 
    laneElement.appendChild(tile);

    activeTiles.push({
        element: tile,
        lane: laneNum,
        note: noteName,
        top: -90
    });
}

function updateGame() {
    if (!gameInterval) return;

    for (let i = activeTiles.length - 1; i >= 0; i--) {
        let tile = activeTiles[i];
        tile.top += fallSpeed;
        tile.element.style.top = tile.top + 'px';

        // Пропуск плитки — игра окончена
        if (tile.top > 540) { 
            tile.element.remove();
            activeTiles.splice(i, 1);
            cancelAnimationFrame(gameInterval);
            gameInterval = null;
            gameOver(score); 
            return;
        }
    }
    gameInterval = requestAnimationFrame(updateGame);
}

const keyToLane = { 'KeyA': 0, 'KeyS': 1, 'KeyD': 2, 'KeyF': 3 };

window.addEventListener('keydown', (e) => {
    if (!gameInterval) return; 
    
    const targetLane = keyToLane[e.code];
    
    if (targetLane !== undefined) {
        // Проверка попадания по плитке в районе красной линии
        const hitTileIndex = activeTiles.findIndex(tile => tile.lane === targetLane && tile.top > 380 && tile.top < 510);

        if (hitTileIndex !== -1) {
            playTone(notesFreq[activeTiles[hitTileIndex].note]); 
            activeTiles[hitTileIndex].element.remove(); 
            activeTiles.splice(hitTileIndex, 1);
            
            score += 10; 
            document.getElementById('score').innerText = score;
        }
    }
});
