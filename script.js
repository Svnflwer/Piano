// 1. Создаем аудио-движок браузера
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

// 2. Функция, которая сама генерирует звук ноты (без mp3 файлов!)
function playTone(frequency, duration) {
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();

    oscillator.type = 'triangle'; // Мягкий звук, похожий на пианино
    oscillator.frequency.value = frequency;

    // Эффект затухания звука
    gainNode.gain.setValueAtTime(0.5, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);

    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    oscillator.start();
    oscillator.stop(audioCtx.currentTime + duration);
}

// 3. Таблица частот (E - Ми, B - Си, C - До, A - Ля)
const notes = {
    'E': 329.63,
    'B': 493.88,
    'C': 523.25,
    'A': 440.00
};

// 4. Массив нот для Rush E (можно легко дописывать буквы!)
const rushESong = [
    'E', 'E', 'E', 'E',             // Начальное туканье
    'E', 'E', 'E', 'E',             // Ускорение
    'E', 'B', 'C', 'B', 'A', 'E',   // Главный мотив
    'E', 'B', 'C', 'B', 'A', 'E'
];

// 5. Функция запуска песни (её вызывает кнопка из index.html)
function startRushE() {
    // Включаем звук в браузере, если он был "спящим"
    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }

    let tempo = 180; // Скорость воспроизведения (меньше — быстрее)

    rushESong.forEach((noteName, index) => {
        setTimeout(() => {
            playTone(notes[noteName], 0.2);
        }, index * tempo);
    });
}
