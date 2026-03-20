/**
 * AWS & IHK Quiz App Logic
 * Modular Version (app.js)
 */

// --- i18n Definitions ---
const i18n = {
    de: {
        title: "AWS Cloud<br>Practitioner",
        subtitle: "Zertifizierungs-Quiz & IHK Basics",
        labelQuestions: "Fragenanzahl",
        labelMode: "Modus",
        btnStart: "Quiz starten",
        modeStudy: "Lernmodus",
        modeExam: "Prüfungsmodus",
        btnNext: "Nächste Frage",
        btnSubmit: "Abgeben",
        progressPrefix: "Frage",
        progressOf: "VON",
        pass: "Bestanden!",
        fail: "Leider nicht bestanden",
        resultDetails: (correct, total) => `Du hast ${correct} von ${total} richtig beantwortet.`,
        chooseTwo: "(Wähle zwei Antworten)",
        chooseThree: "(Wähle drei Antworten)",
        feedbackCorrect: "RICHTIG",
        feedbackIncorrect: "FALSCH",
        timeLeft: "Verbleibende Zeit",
        btnRestart: "Erneut versuchen",
        loading: "Fragen werden geladen...",
        errorLoading: "Fehler beim Laden der Fragen. Bitte lade die Seite neu.",
        // New Strings
        labelPath: "Wähle deinen Pfad",
        pathRandomTitle: "Globaler Random-Modus",
        pathRandomDesc: "Prüfungs-Simulation (Alle Themen gemischt)",
        pathTopicTitle: "Themen-spezifisch",
        pathTopicDesc: "Gezieltes Lernen nach Kategorien",
        labelTopics: "Kategorie wählen",
        btnBack: "Zurück",
        labelSettings: "Einstellungen"
    },
    en: {
        title: "AWS Cloud<br>Practitioner",
        subtitle: "Certification Quiz & IHK Basics",
        labelQuestions: "Questions",
        labelMode: "Quiz Mode",
        btnStart: "Start Quiz",
        modeStudy: "Study Mode",
        modeExam: "Exam Mode",
        btnNext: "Next Question",
        btnSubmit: "Submit",
        progressPrefix: "Question",
        progressOf: "OF",
        pass: "Passed!",
        fail: "Failed",
        resultDetails: (correct, total) => `You answered ${correct} out of ${total} correctly.`,
        chooseTwo: "(Choose two correct answers)",
        chooseThree: "(Choose three correct answers)",
        feedbackCorrect: "CORRECT",
        feedbackIncorrect: "INCORRECT",
        timeLeft: "Time Left",
        btnRestart: "Try Again",
        loading: "Loading questions...",
        errorLoading: "Error loading questions. Please refresh the page.",
        // New Strings
        labelPath: "Choose Your Path",
        pathRandomTitle: "Global Random Mode",
        pathRandomDesc: "Exam Simulation (All topics mixed)",
        pathTopicTitle: "Topic-specific",
        pathTopicDesc: "Targeted learning by category",
        labelTopics: "Select Category",
        btnBack: "Back",
        labelSettings: "Settings"
    }
};

// --- State Management ---
// --- State Management ---
let lang = 'de';
let config = { 
    count: 10, 
    mode: 'study', 
    path: 'random', // 'random' or 'topic'
    topic: null 
};
let allQuestions = [];
let activeQuestions = [];
let currentIndex = 0;
let score = 0;
let timer = null;
let secondsLeft = 0;

/**
 * Load questions from external JSON
 */
async function loadQuestions() {
    const startBtn = document.getElementById('ui-btn-start');
    const subtitle = document.getElementById('ui-subtitle');
    
    try {
        subtitle.innerText = i18n[lang].loading;
        startBtn.disabled = true;

        const response = await fetch('questions.json');
        if (!response.ok) throw new Error('Network response was not ok');
        
        allQuestions = await response.json();
        
        // Extract Unique Topics
        renderTopics();

        // Update Slider Max
        const slider = document.getElementById('ui-slider-questions');
        const input = document.getElementById('ui-input-questions');
        const max = allQuestions.length;
        
        slider.max = max;
        input.max = max;
        
        // Default to 10 or max if less
        updateCount(Math.min(10, max));

        subtitle.innerText = i18n[lang].subtitle;
        startBtn.disabled = false;
        console.log("Questions loaded successfully");
    } catch (error) {
        console.error("Failed to load questions:", error);
        subtitle.innerText = i18n[lang].errorLoading;
        subtitle.classList.add('text-red-500', 'not-italic');
    }
}

/**
 * Initialize language and UI labels
 */
function setLanguage(l) {
    lang = l;
    document.documentElement.lang = l;
    
    // Highlight active lang with transition
    const deBtn = document.getElementById('lang-de');
    const enBtn = document.getElementById('lang-en');
    if(deBtn) deBtn.style.opacity = lang === 'de' ? '1' : '0.4';
    if(enBtn) enBtn.style.opacity = lang === 'en' ? '1' : '0.4';

    // Update Start Screen text
    if (!document.getElementById('screen-start').classList.contains('hidden')) {
        const t = i18n[lang];
        document.getElementById('ui-title').innerHTML = t.title;
        if(!allQuestions.length) {
             document.getElementById('ui-subtitle').innerText = t.loading;
        } else {
             document.getElementById('ui-subtitle').innerText = t.subtitle;
        }

        // Translation for new elements
        document.getElementById('ui-label-path').innerText = t.labelPath;
        document.getElementById('ui-path-random-title').innerText = t.pathRandomTitle;
        document.getElementById('ui-path-random-desc').innerText = t.pathRandomDesc;
        document.getElementById('ui-path-topic-title').innerText = t.pathTopicTitle;
        document.getElementById('ui-path-topic-desc').innerText = t.pathTopicDesc;
        document.getElementById('ui-label-topics').innerText = t.labelTopics;
        document.querySelectorAll('[onclick="goBack(\'path\')"], [onclick="goBack(\'topics\')"]').forEach(b => b.innerText = t.btnBack);

        document.getElementById('ui-label-questions').innerText = t.labelQuestions;
        document.getElementById('ui-label-mode').innerText = t.labelMode;
        document.getElementById('ui-btn-start').innerText = t.btnStart;
        document.getElementById('ui-mode-study').innerText = t.modeStudy;
        document.getElementById('ui-mode-exam').innerText = t.modeExam;
        document.getElementById('ui-btn-restart').innerText = t.btnRestart;

        // Re-render topics to update language
        if(allQuestions.length) renderTopics();
    }
}

/**
 * Path Selection Logic
 */
function selectPath(path) {
    config.path = path;
    document.getElementById('step-path').classList.add('hidden');
    
    if (path === 'topic') {
        document.getElementById('step-topics').classList.remove('hidden');
    } else {
        config.topic = null;
        const max = allQuestions.length;
        updateSliderLimits(max);
        document.getElementById('btn-back-to-topics').onclick = () => goBack('path');
        document.getElementById('step-settings').classList.remove('hidden');
    }
}

function selectTopic(topicName) {
    config.topic = topicName;
    const filteredCount = allQuestions.filter(q => q.category['de'] === topicName || q.category['en'] === topicName).length;
    updateSliderLimits(filteredCount);
    
    document.getElementById('step-topics').classList.add('hidden');
    document.getElementById('btn-back-to-topics').onclick = () => goBack('topics');
    document.getElementById('step-settings').classList.remove('hidden');
}

function goBack(step) {
    document.getElementById('step-topics').classList.add('hidden');
    document.getElementById('step-settings').classList.add('hidden');
    
    if (step === 'path') {
        document.getElementById('step-path').classList.remove('hidden');
    } else if (step === 'topics') {
        document.getElementById('step-topics').classList.remove('hidden');
    }
}

function updateSliderLimits(max) {
    const slider = document.getElementById('ui-slider-questions');
    const input = document.getElementById('ui-input-questions');
    slider.max = max;
    input.max = max;
    updateCount(Math.min(config.count, max));
}

function renderTopics() {
    const container = document.getElementById('topics-list');
    if (!container) return;

    // Get unique categories (using 'de' as key, but could be 'en')
    const categories = [...new Set(allQuestions.map(q => q.category['de']))];
    
    container.innerHTML = '';
    categories.forEach(cat => {
        // Find the category object to get both languages
        const q = allQuestions.find(q => q.category['de'] === cat);
        const displayLabel = q.category[lang];
        
        const btn = document.createElement('button');
        btn.onclick = () => selectTopic(cat);
        btn.className = "p-4 border-2 border-slate-100 rounded-2xl bg-white hover:border-amber-200 transition-all text-left font-bold text-slate-700 text-sm";
        btn.innerText = displayLabel;
        container.appendChild(btn);
    });
}

/**
 * Update Question Count from Slider/Input
 */
function updateCount(val) {
    const max = allQuestions.length || 10;
    let num = parseInt(val);
    
    if (isNaN(num)) num = 1;
    if (num > max) num = max;
    if (num < 1) num = 1;

    config.count = num;

    // Sync UI elements
    document.getElementById('ui-slider-questions').value = num;
    document.getElementById('ui-input-questions').value = num;
    document.getElementById('ui-question-count-display').innerText = num;
}

/**
 * Update Configuration Settings (Mode)
 */
function setConfig(type, val) {
    config[type] = val;
    // Only handle mode buttons now, count is handled by updateCount
    if (type === 'mode') {
        const btns = document.querySelectorAll(`.config-btn[data-type="mode"]`);
        btns.forEach(b => {
            const isActive = b.getAttribute('data-val') == val;
            b.classList.toggle('gold-border', isActive);
            b.classList.toggle('bg-amber-50', isActive);
            b.classList.toggle('border-slate-100', !isActive);
            b.classList.toggle('text-slate-400', !isActive);
            b.classList.toggle('text-slate-800', isActive);
        });
    }
}

/**
 * Start the Quiz
 */
function startQuiz() {
    if (!allQuestions.length) return;

    // Prep questions
    let qPool = [...allQuestions];

    // Filter by Topic if needed
    if (config.path === 'topic' && config.topic) {
        qPool = qPool.filter(q => q.category['de'] === config.topic || q.category['en'] === config.topic);
    }

    // Shuffle
    qPool.sort(() => 0.5 - Math.random());

    const limit = config.count;
    activeQuestions = qPool.slice(0, limit);
    
    currentIndex = 0;
    score = 0;
    secondsLeft = activeQuestions.length * 90; // 1.5 mins per question
    
    updateTimerDisplay();
    timer = setInterval(() => {
        secondsLeft--;
        updateTimerDisplay();
        if(secondsLeft <= 0) finish();
    }, 1000);

    // Navigation
    document.getElementById('screen-start').classList.add('hidden');
    document.getElementById('progress-container').classList.remove('hidden');
    document.getElementById('screen-quiz').classList.remove('hidden');
    
    renderQuestion();
}

function updateTimerDisplay() {
    const m = Math.floor(secondsLeft / 60);
    const s = secondsLeft % 60;
    document.getElementById('timer').innerText = `${m}:${s < 10 ? '0' : ''}${s}`;
}

/**
 * Render current question to screen
 */
function renderQuestion() {
    const q = activeQuestions[currentIndex];
    const t = i18n[lang];
    
    const container = document.getElementById('options-list');
    const qText = document.getElementById('question-text');
    const progText = document.getElementById('quiz-progress-text');
    const progBar = document.getElementById('progress-bar');
    const catLabel = document.getElementById('category-label');

    catLabel.innerText = q.category[lang];
    progText.innerText = `${t.progressPrefix} ${currentIndex + 1} ${t.progressOf} ${activeQuestions.length}`;
    progBar.style.width = `${((currentIndex) / activeQuestions.length) * 100}%`;

    let mainTxt = q.question[lang];
    if(q.type === 'multiple') {
        const badge = q.correct.length === 2 ? t.chooseTwo : t.chooseThree;
        mainTxt += `<br><span class="text-xs font-bold text-amber-500 bg-amber-50 px-2 py-0.5 rounded ml-2 uppercase tracking-wide inline-block mt-2">${badge}</span>`;
    }
    qText.innerHTML = mainTxt;

    container.innerHTML = '';
    q.options[lang].forEach((opt, idx) => {
        const el = document.createElement('div');
        el.innerHTML = `
            <label class="block relative cursor-pointer">
                <input type="${q.type === 'multiple' ? 'checkbox' : 'radio'}" name="q-opt" value="${idx}" class="hidden option-input">
                <div class="option-card flex items-center p-5 border-2 border-slate-50 bg-white rounded-2xl transition-all duration-300 hover:border-slate-100">
                    <div class="check-circle w-6 h-6 border-2 border-slate-100 rounded-full mr-4 flex items-center justify-center transition-all ${q.type === 'multiple' ? 'rounded-md' : 'rounded-full'} border-slate-200">
                        <div class="check-inner w-2 h-2 bg-white rounded-full opacity-0 transition-opacity"></div>
                    </div>
                    <span class="text-slate-600 font-bold">${opt}</span>
                </div>
            </label>
        `;
        container.appendChild(el);
    });

    document.getElementById('feedback-box').classList.add('hidden');
    document.getElementById('btn-next').innerText = (currentIndex === activeQuestions.length - 1 && config.mode === 'exam') ? t.btnSubmit : t.btnNext;
}

/**
 * Handle Next/Submit button
 */
function handleNext() {
    const selected = Array.from(document.querySelectorAll('.option-input:checked')).map(i => parseInt(i.value));
    if(selected.length === 0) return;

    if(config.mode === 'study') {
        if(document.getElementById('feedback-box').classList.contains('hidden')) {
            showFeedback(selected);
        } else {
            proceed();
        }
    } else {
        validateSilent(selected);
        proceed();
    }
}

function showFeedback(selected) {
    const q = activeQuestions[currentIndex];
    const t = i18n[lang];
    const correct = check(q, selected);
    if(correct) score++;

    const cards = document.querySelectorAll('.option-card');
    
    // Reveal correct answers (green)
    q.correct.forEach(i => {
        cards[i].classList.add('feedback-correct');
        cards[i].querySelector('.check-circle').classList.add('icon-correct');
    });
    
    // Reveal incorrect selections (red)
    selected.forEach(i => {
        if(!q.correct.includes(i)) {
            cards[i].classList.add('feedback-incorrect');
            cards[i].querySelector('.check-circle').classList.add('icon-incorrect');
        }
    });

    const box = document.getElementById('feedback-box');
    box.classList.remove('hidden');
    document.getElementById('feedback-icon').className = `w-2 h-2 rounded-full ${correct ? 'bg-green-500' : 'bg-red-500'}`;
    document.getElementById('feedback-text').innerText = correct ? t.feedbackCorrect : t.feedbackIncorrect;
    document.getElementById('feedback-text').className = `text-sm font-black uppercase tracking-widest ${correct ? 'text-green-600' : 'text-red-500'}`;
    document.getElementById('explanation-text').innerText = q.explanation[lang];
    
    document.querySelectorAll('.option-input').forEach(i => i.disabled = true);
    document.getElementById('btn-next').innerText = currentIndex === activeQuestions.length - 1 ? t.btnSubmit : t.btnNext;
}

function validateSilent(selected) {
    if(check(activeQuestions[currentIndex], selected)) score++;
}

function check(q, sel) {
    if(q.correct.length !== sel.length) return false;
    return q.correct.every(v => sel.includes(v));
}

function proceed() {
    currentIndex++;
    if(currentIndex < activeQuestions.length) renderQuestion();
    else finish();
}

/**
 * Final Result Screen
 */
function finish() {
    clearInterval(timer);
    const t = i18n[lang];
    const pct = Math.round((score / activeQuestions.length) * 100);
    const passed = pct >= 70;

    document.getElementById('screen-quiz').classList.add('hidden');
    document.getElementById('progress-container').classList.add('hidden');
    document.getElementById('screen-results').classList.remove('hidden');

    document.getElementById('result-status').innerText = passed ? t.pass : t.fail;
    document.getElementById('result-status').className = `text-4xl font-extrabold ${passed ? 'text-green-600' : 'text-red-500'}`;
    document.getElementById('result-score').innerText = `${pct}%`;
    document.getElementById('result-details').innerText = t.resultDetails(score, activeQuestions.length);
    document.getElementById('result-circle').style.borderColor = passed ? '#22c55e' : '#ef4444';
}

// Global Exports for HTML onclicks
window.setLanguage = setLanguage;
window.setConfig = setConfig;
window.updateCount = updateCount;
window.startQuiz = startQuiz;
window.handleNext = handleNext;
window.selectPath = selectPath;
window.selectTopic = selectTopic;
window.goBack = goBack;

// Init
document.addEventListener('DOMContentLoaded', () => {
    setLanguage('de');
    setConfig('count', 10);
    setConfig('mode', 'study');
    loadQuestions();
});
