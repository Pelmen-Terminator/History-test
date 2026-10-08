// ===== Конфигурация =====
const QUESTIONS_PER_TEST = 20; // сколько вопросов в одном прохождении

// ===== Состояние =====
let currentQuestions = [];
let currentIndex = 0;
let correctCount = 0;
let answered = false;

// ===== DOM =====
const startScreen = document.getElementById('start-screen');
const quizScreen = document.getElementById('quiz-screen');
const resultScreen = document.getElementById('result-screen');
const startBtn = document.getElementById('start-btn');
const nextBtn = document.getElementById('next-btn');
const restartBtn = document.getElementById('restart-btn');
const questionText = document.getElementById('question-text');
const answersContainer = document.getElementById('answers-container');
const questionCounter = document.getElementById('question-counter');
const scoreLive = document.getElementById('score-live');
const progressFill = document.getElementById('progress-fill');
const gradeCircle = document.getElementById('grade-circle');
const gradeNumber = document.getElementById('grade-number');
const resultTitle = document.getElementById('result-title');
const resultText = document.getElementById('result-text');
const correctCountEl = document.getElementById('correct-count');
const wrongCountEl = document.getElementById('wrong-count');
const percentEl = document.getElementById('percent');
const commentEl = document.getElementById('comment');

// ===== Утилиты =====
function shuffle(array) {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

// Перемешиваем варианты и пересчитываем индекс правильного
function prepareQuestion(q) {
    const correctText = q.a[q.c];
    const shuffled = shuffle(q.a);
    return {
        n: q.n,
        q: q.q,
        a: shuffled,
        c: shuffled.indexOf(correctText)
    };
}

function showScreen(screen) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    screen.classList.add('active');
}

// ===== Логика =====
function startQuiz() {
    const total = ALL_QUESTIONS.length;              // 300
    if (total < QUESTIONS_PER_TEST) {
        alert('Недостаточно вопросов в базе!');
        return;
    }
    // Выбор без возврата → без повторов
    const shuffled = shuffle(ALL_QUESTIONS);
    currentQuestions = shuffled.slice(0, QUESTIONS_PER_TEST).map(prepareQuestion);

    currentIndex = 0;
    correctCount = 0;
    answered = false;

    showScreen(quizScreen);
    renderQuestion();
}

function renderQuestion() {
    answered = false;
    nextBtn.disabled = true;
    nextBtn.textContent = (currentIndex === QUESTIONS_PER_TEST - 1) ? 'Завершить' : 'Далее →';

    const q = currentQuestions[currentIndex];

    questionCounter.textContent = `Вопрос ${currentIndex + 1} / ${QUESTIONS_PER_TEST} · №${q.n}`;
    scoreLive.textContent = `Правильно: ${correctCount}`;
    progressFill.style.width = `${(currentIndex / QUESTIONS_PER_TEST) * 100}%`;

    questionText.textContent = q.q;

    answersContainer.innerHTML = '';
    q.a.forEach((answerText, i) => {
        const btn = document.createElement('button');
        btn.className = 'answer';
        btn.textContent = answerText;
        btn.dataset.index = i;
        btn.addEventListener('click', () => selectAnswer(i));
        answersContainer.appendChild(btn);
    });
}

function selectAnswer(selectedIndex) {
    if (answered) return;
    answered = true;

    const q = currentQuestions[currentIndex];
    const buttons = answersContainer.querySelectorAll('.answer');

    buttons.forEach((btn, i) => {
        btn.classList.add('disabled');
        if (i === q.c) btn.classList.add('correct');
        else if (i === selectedIndex) btn.classList.add('wrong');
    });

    if (selectedIndex === q.c) {
        correctCount++;
        scoreLive.textContent = `Правильно: ${correctCount}`;
    }

    nextBtn.disabled = false;
}

function nextQuestion() {
    currentIndex++;
    if (currentIndex < QUESTIONS_PER_TEST) {
        renderQuestion();
    } else {
        showResults();
    }
}

// ===== Оценка и результат =====
function getGrade(correct, total) {
    const percent = (correct / total) * 100;
    if (percent >= 90) return 5;
    if (percent >= 70) return 4;
    if (percent >= 50) return 3;
    return 2;
}

function showResults() {
    showScreen(resultScreen);
    progressFill.style.width = '100%';

    const total = QUESTIONS_PER_TEST;
    const percent = Math.round((correctCount / total) * 100);
    const wrongCount = total - correctCount;
    const grade = getGrade(correctCount, total);

    gradeCircle.className = 'grade-circle grade-' + grade;
    gradeNumber.textContent = grade;

    const titles = {
        5: '🏆 Отличный результат!',
        4: '👍 Хороший результат!',
        3: '📚 Удовлетворительно',
        2: '😔 Стоит подтянуть знания'
    };
    resultTitle.textContent = titles[grade];

    const texts = {
        5: 'Вы прекрасно знаете историю! Так держать!',
        4: 'Хорошее знание материала, но есть куда расти.',
        3: 'Неплохо, но стоит повторить некоторые темы.',
        2: 'Попробуйте пройти тест ещё раз — материал обязательно запомнится!'
    };
    resultText.textContent = texts[grade];

    correctCountEl.textContent = correctCount;
    wrongCountEl.textContent = wrongCount;
    percentEl.textContent = percent + '%';

    const comments = {
        5: [
            '🌟 Вы — настоящий знаток истории! Ваши знания глубоки и системны. Возможно, стоит попробовать себя в исторических олимпиадах.',
            '🏛️ Блестящий результат! Вы отлично ориентируетесь как в отечественной, так и во всемирной истории. Так держать!',
            '📖 Великолепно! Такое знание истории вызывает уважение. Вы словно сами жили в те эпохи!',
            '🎓 Превосходно! Вы легко жонглируете датами, именами и событиями. Историки могут вами гордиться!'
        ],
        4: [
            '📘 Хороший результат! Вы уверенно знаете основные события, но некоторые детали стоит уточнить. Продолжайте в том же духе!',
            '✍️ Достойно! Ещё немного усилий — и будет отлично. Обратите внимание на даты и персоналии.',
            '🎯 Неплохо! Вы близки к совершенству. Повторите несколько тем и результат обязательно вырастет.',
            '📗 Крепкие знания! Осталось отшлифовать детали — и пятёрка в кармане.'
        ],
        3: [
            '📙 Средний результат. Основы вы знаете, но многие события и даты пока что ускользают. Рекомендуем повторить ключевые периоды.',
            '🗂️ Есть над чем поработать. Попробуйте составить хронологическую таблицу основных событий — это поможет запомнить даты.',
            '📝 Удовлетворительно. Не расстраивайтесь — история требует времени. Перечитайте учебник и попробуйте снова!',
            '📚 База есть, но глубины пока не хватает. Сфокусируйтесь на XX веке — там много важных дат.'
        ],
        2: [
            '📕 К сожалению, результат низкий. Но это не повод расстраиваться! Начните с повторения ключевых дат и событий.',
            '💡 Не отчаивайтесь! История — это увлекательно. Посмотрите документальные фильмы и попробуйте пройти тест ещё раз.',
            '🔁 Стоит серьёзно повторить материал. Начните с Древней Руси и постепенно двигайтесь к современности. У вас всё получится!',
            '🎬 Попробуйте изучать историю через фильмы и подкасты — так даты запоминаются легче. И обязательно вернитесь к тесту!'
        ]
    };
    const variant = comments[grade][Math.floor(Math.random() * comments[grade].length)];
    commentEl.textContent = variant;
}

// ===== Обработчики =====
startBtn.addEventListener('click', startQuiz);
nextBtn.addEventListener('click', nextQuestion);
restartBtn.addEventListener('click', () => showScreen(startScreen));