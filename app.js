let myPlayerId = sessionStorage.getItem('myPlayerId');
let myNickname = '';
let gameState = null;
let currentQuestionIndex = -1;

const gameRef = db.ref('active_game');

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
            sessionStorage.setItem('myPlayerId', myPlayerId);
        }

        const playerRef = db.ref(`active_game/players/${myPlayerId}`);
        // Oyuna ilk girişte eğer oyuncu yoksa sıfırdan ekle, varsa sadece ismini güncelle
        playerRef.once('value').then(snap => {
            if (!snap.exists()) {
                playerRef.set({ name: myNickname, score: 0, currentAnswer: null });
            } else {
                playerRef.update({ name: myNickname });
            }
        });

        // Gerçek zamanlı oyun akışını dinlemeye başla!
        listenToGame();
    } else {
        alert("Lütfen bir takma ad girin!");
    }
});

document.addEventListener("DOMContentLoaded", () => {
    const rejoinBtn = document.getElementById('btn-rejoin-lobby');
    if (rejoinBtn) {
        rejoinBtn.addEventListener('click', () => {
            if (!myNickname || !myPlayerId) return;
            const playerRef = db.ref(`active_game/players/${myPlayerId}`);
            playerRef.set({ name: myNickname, score: 0, currentAnswer: null });
            rejoinBtn.style.display = 'none';
        });
    }
});

const listenToGame = () => {
    gameRef.on('value', (snapshot) => {
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
            const myP = gameState.players ? gameState.players[myPlayerId] : null;

            if (myP && (myP.currentAnswer === null || myP.currentAnswer === undefined)) {
                switchView('view-lobby');
                renderLobby();
            } else {
                showResult();
            }
        }
        else if (gameState.status === 'game_over') {
            const myP = gameState.players ? gameState.players[myPlayerId] : null;
            // Eğer oyunu daha önce hiç oynamamış yepyeni birisiyse ve oyun çoktan bitmişse Lobi'de kalsın
            if (!myP || myP.score === 0 || myP.score === undefined) {
                switchView('view-lobby');
                renderLobby();
            } else {
                showGameOver();
            }
        }
    });
};

const renderLobby = () => {
    const list = document.getElementById('lobby-players-list');
    const rejoinBtn = document.getElementById('btn-rejoin-lobby');
    list.innerHTML = '';

    let amIinLobby = false;

    if (!gameState.players) {
        document.getElementById('lobby-player-count').innerText = 0;
    } else {
        const keys = Object.keys(gameState.players);
        document.getElementById('lobby-player-count').innerText = keys.length;

        keys.forEach(id => {
            if (id === myPlayerId) amIinLobby = true;
            const div = document.createElement('div');
            div.className = 'player-tag';
            div.innerText = gameState.players[id].name;
            list.appendChild(div);
        });
    }

    if (!amIinLobby && myNickname && rejoinBtn) {
        rejoinBtn.style.display = 'block';
    } else if (rejoinBtn) {
        rejoinBtn.style.display = 'none';
    }
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
        db.ref(`active_game/players/${myPlayerId}`).update({
            currentAnswer: index,
            timestamp: Date.now()
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

    const lastPoints = myP ? (myP.lastPoints || 0) : 0;
    const streak = myP ? (myP.streak || 0) : 0;
    const streakBonus = myP ? (myP.streakBonus || 0) : 0;

    let streakText = "";
    if (streak > 1) {
        streakText = `<br><span style="font-size:1rem; color: #ffeb3b;">🔥 ${streak} Doğru Cevap Serisi! (+${streakBonus} Bonus)</span>`;
    }

    const nextQIndicator = document.getElementById('next-question-indicator');

    // ARTIK her 'result' durumu standart puan/şema gösterimidir. 
    if (myAnswer === null || myAnswer === undefined) {
        feedbackEl.innerHTML = `Süre Doldu!<br><span style="font-size:1.2rem; font-weight:normal;">+0 Puan</span>`;
        feedbackEl.className = 'result-feedback incorrect';
    } else if (myAnswer === correctIndex) {
        feedbackEl.innerHTML = `Doğru!<br><span style="font-size:1.2rem; font-weight:normal;">+${lastPoints} Puan</span>${streakText}`;
        feedbackEl.className = 'result-feedback correct';
    } else {
        feedbackEl.innerHTML = `Yanlış!<br><span style="font-size:1.2rem; font-weight:normal;">+0 Puan</span>`;
        feedbackEl.className = 'result-feedback incorrect';
    }

    renderChart(correctIndex);
    document.getElementById('leaderboard-section').style.display = 'none';
    document.getElementById('result-title').innerText = `Soru ${gameState.currentQuestionIndex + 1} Sonucu!`;

    if (nextQIndicator) {
        if (gameState.currentQuestionIndex >= questions.length - 1) {
            nextQIndicator.style.display = 'none';
        } else {
            nextQIndicator.style.display = 'block';
        }
    }
};

const showGameOver = () => {
    switchView('view-result');
    const nextQIndicator = document.getElementById('next-question-indicator');
    const feedbackEl = document.getElementById('result-feedback');
    const explEl = document.getElementById('result-explanation');

    if (nextQIndicator) nextQIndicator.style.display = 'none';
    document.getElementById('result-chart').style.display = 'none';
    feedbackEl.style.display = 'none';
    if (explEl) explEl.style.display = 'none';

    document.getElementById('leaderboard-section').style.display = 'block';
    document.getElementById('result-title').innerText = "🏆 ŞAMPİYONLUK TABLOSU 🏆";
    renderLeaderboard();
};

const createPodiumStep = (player, rank, stepClass) => {
    const placeDiv = document.createElement('div');
    placeDiv.className = 'podium-place';

    const nameDiv = document.createElement('div');
    nameDiv.className = 'podium-name';
    nameDiv.innerText = player.name;

    const scoreDiv = document.createElement('div');
    scoreDiv.className = 'podium-score';
    scoreDiv.innerText = `${player.score || 0} P`;

    const stepDiv = document.createElement('div');
    stepDiv.className = `podium-step ${stepClass}`;
    stepDiv.innerText = rank;

    placeDiv.appendChild(nameDiv);
    placeDiv.appendChild(scoreDiv);
    placeDiv.appendChild(stepDiv);
    return placeDiv;
};

const renderLeaderboard = () => {
    const list = document.getElementById('leaderboard-list');
    list.innerHTML = '';
    if (!gameState.players) return;

    const sortedPlayers = Object.values(gameState.players).sort((a, b) => (b.score || 0) - (a.score || 0));

    // Kürsü (Podium) Eklemesi
    const podiumContainer = document.createElement('div');
    podiumContainer.className = 'podium-container';

    const p1 = sortedPlayers[0];
    const p2 = sortedPlayers[1];
    const p3 = sortedPlayers[2];

    // Soldan sağa dizilim: 3, 1, 2
    if (p3) podiumContainer.appendChild(createPodiumStep(p3, 3, 'step-3'));
    if (p1) podiumContainer.appendChild(createPodiumStep(p1, 1, 'step-1'));
    if (p2) podiumContainer.appendChild(createPodiumStep(p2, 2, 'step-2'));

    if (sortedPlayers.length > 0) {
        list.appendChild(podiumContainer);
    }

    // 4. ve 5. Sıralamalar vs
    for (let idx = 3; idx < sortedPlayers.length; idx++) {
        const p = sortedPlayers[idx];
        const item = document.createElement('div');
        item.className = 'leaderboard-item';
        item.innerHTML = `<span>${idx + 1}. ${p.name}</span> <span>${p.score || 0} 🏆</span>`;
        list.appendChild(item);
    }
};
