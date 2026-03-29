import { db } from './firebase-config.js';
import { questions } from './questions.js';
import { ref, set, update, onValue, onDisconnect } from "https://www.gstatic.com/firebasejs/10.10.0/firebase-database.js";

let myPlayerId = localStorage.getItem('myPlayerId');
let myNickname = '';
let gameState = null;
let currentQuestionIndex = -1;

const gameRef = ref(db, 'active_game');

const switchView = (viewId) => {
    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
    document.getElementById(viewId).classList.add('active');
};

document.getElementById('btn-join-lobby').addEventListener('click', () => {
    const nickname = document.getElementById('nickname-input').value.trim();
    if (nickname) {
        myNickname = nickname;
        if (!myPlayerId) {
            myPlayerId = 'player_' + Math.random().toString(36).substr(2, 9);
            localStorage.setItem('myPlayerId', myPlayerId);
        }

        const playerRef = ref(db, `active_game/players/${myPlayerId}`);
        set(playerRef, { name: myNickname, score: 0, currentAnswer: null });
        onDisconnect(playerRef).remove();

        listenToGame();
    } else {
        alert("Lütfen bir takma ad girin!");
    }
});

const listenToGame = () => {
    onValue(gameRef, (snapshot) => {
        gameState = snapshot.val();
        if (!gameState) return;

        if (gameState.status === 'lobby') {
            switchView('view-lobby');
            renderLobby();
        }
        else if (gameState.status === 'question') {
            const hasAnswered = gameState.players && gameState.players[myPlayerId] && gameState.players[myPlayerId].currentAnswer !== null && gameState.players[myPlayerId].currentAnswer !== undefined;

            if (currentQuestionIndex !== gameState.currentQuestionIndex) {
                currentQuestionIndex = gameState.currentQuestionIndex;
                initQuestion();
            } else if (hasAnswered) {
                switchView('view-wait');
                updateWaitScreenCount();
            } else {
                switchView('view-question');
            }
        }
        else if (gameState.status === 'result') {
            showResult();
        }
    });
};

const renderLobby = () => {
    const list = document.getElementById('lobby-players-list');
    list.innerHTML = '';
    if (!gameState.players) {
        document.getElementById('lobby-player-count').innerText = 0;
        return;
    }
    const keys = Object.keys(gameState.players);
    document.getElementById('lobby-player-count').innerText = keys.length;

    keys.forEach(id => {
        const div = document.createElement('div');
        div.className = 'player-tag';
        div.innerText = gameState.players[id].name;
        list.appendChild(div);
    });
};

const initQuestion = () => {
    const q = questions[currentQuestionIndex];
    document.getElementById('result-chart').style.display = 'none';
    document.getElementById('result-feedback').style.display = 'none';
    document.getElementById('result-explanation').style.display = 'none';
    document.getElementById('leaderboard-section').style.display = 'none';

    document.getElementById('question-text').innerText = q.question;
    document.getElementById('ans-text-0').innerText = q.answers[0];
    document.getElementById('ans-text-1').innerText = q.answers[1];
    document.getElementById('ans-text-2').innerText = q.answers[2];
    document.getElementById('ans-text-3').innerText = q.answers[3];

    switchView('view-question');
};

document.querySelectorAll('.answer-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        if (gameState.status !== 'question') return;

        const index = parseInt(e.currentTarget.getAttribute('data-index'));
        update(ref(db, `active_game/players/${myPlayerId}`), {
            currentAnswer: index,
            timestamp: Date.now() // İstenen basma süresi eklendi
        });

        switchView('view-wait');
    });
});

const updateWaitScreenCount = () => {
    if (!gameState.players) return;
    let ansCount = Object.values(gameState.players).filter(p => p.currentAnswer !== null && p.currentAnswer !== undefined).length;
    document.getElementById('wait-answers-count').innerText = `${ansCount} Cevap İletildi`;
};

const renderChart = (correctIndex) => {
    const chartEl = document.getElementById('result-chart');
    chartEl.style.display = 'flex';
    chartEl.innerHTML = '';

    const votes = [0, 0, 0, 0];
    let totalVotes = 0;
    if (gameState.players) {
        Object.values(gameState.players).forEach(p => {
            if (p.currentAnswer !== null && p.currentAnswer !== undefined) {
                votes[p.currentAnswer]++;
                totalVotes++;
            }
        });
    }
    const maxVotes = Math.max(1, ...votes);

    const colors = ['#e21b3c', '#1368ce', '#d89e00', '#26890c'];
    for (let i = 0; i < 4; i++) {
        const h = (votes[i] / maxVotes) * 100;

        const colDiv = document.createElement('div');
        colDiv.style.display = 'flex'; colDiv.style.flexDirection = 'column';
        colDiv.style.alignItems = 'center'; colDiv.style.justifyContent = 'flex-end';
        colDiv.style.height = '100%'; colDiv.style.width = '20%';

        const countLabel = document.createElement('div');
        countLabel.innerText = votes[i];
        countLabel.style.fontWeight = 'bold'; countLabel.style.marginBottom = '5px';
        countLabel.style.fontSize = '1.5rem'; countLabel.style.color = 'black';

        const barDiv = document.createElement('div');
        barDiv.style.width = '100%'; barDiv.style.height = `${Math.max(2, h)}%`;
        barDiv.style.backgroundColor = colors[i]; barDiv.style.transition = 'height 1s ease-out';
        barDiv.style.borderRadius = '4px 4px 0 0';

        colDiv.appendChild(countLabel);
        colDiv.appendChild(barDiv);
        chartEl.appendChild(colDiv);
    }
};

const showResult = () => {
    switchView('view-result');
    const myP = gameState.players ? gameState.players[myPlayerId] : null;
    const myAnswer = myP ? myP.currentAnswer : null;
    const correctIndex = gameState.correctIndex;

    const feedbackEl = document.getElementById('result-feedback');
    feedbackEl.style.display = 'block';

    const explEl = document.getElementById('result-explanation');
    const q = questions[gameState.currentQuestionIndex];

    if (q && q.explanation) {
        explEl.innerText = "AÇIKLAMA: " + q.explanation;
        explEl.style.display = 'block';
    } else {
        explEl.style.display = 'none';
    }

    if (myAnswer === null || myAnswer === undefined) {
        feedbackEl.innerText = "Süre doldu, cevap vermediniz!";
        feedbackEl.className = 'result-feedback incorrect';
    } else if (myAnswer === correctIndex) {
        feedbackEl.innerText = `Doğru! Puanın: ${myP.score || 0}`;
        feedbackEl.className = 'result-feedback correct';
    } else {
        feedbackEl.innerText = `Yanlış! Puanın: ${myP.score || 0}`;
        feedbackEl.className = 'result-feedback incorrect';
    }

    renderChart(correctIndex);

    // Eğer son sorudaysak sıralamayı da göster
    if (gameState.currentQuestionIndex >= questions.length - 1) {
        document.getElementById('leaderboard-section').style.display = 'block';
        document.getElementById('result-title').innerText = "Oyun Bitti! Bütün sorular tamamlandı!";
        renderLeaderboard();
    } else {
        document.getElementById('leaderboard-section').style.display = 'none';
        document.getElementById('result-title').innerText = `Soru ${gameState.currentQuestionIndex + 1} Sonucu!`;
    }
};

const renderLeaderboard = () => {
    const list = document.getElementById('leaderboard-list');
    list.innerHTML = '';
    if (!gameState.players) return;

    const sortedPlayers = Object.values(gameState.players).sort((a, b) => (b.score || 0) - (a.score || 0));
    sortedPlayers.forEach((p, idx) => {
        const item = document.createElement('div');
        item.className = 'leaderboard-item';
        if (idx === 0) item.style.backgroundColor = 'var(--yellow)';
        item.innerHTML = `<span>${idx + 1}. ${p.name}</span> <span>${p.score || 0} 🏆</span>`;
        list.appendChild(item);
    });
};
