let gameState = null;
const gameRef = db.ref('active_game');
let gameLoopTimer = null;

gameRef.on('value', (snapshot) => {
    gameState = snapshot.val() || {};
    renderPlayers();

    let statusText = "Veritabanı Boş/Açılmadı";
    if (gameState.status === 'lobby') statusText = "Lobi Açık (Öğrenciler giriyor)";
    else if (gameState.status === 'question') statusText = `Soru ${gameState.currentQuestionIndex + 1} Sürülüyor`;
    else if (gameState.status === 'result') {
        statusText = `Soru ${gameState.currentQuestionIndex + 1} Sonucu Gösteriliyor`;
    }
    else if (gameState.status === 'game_over') {
        statusText = "Oyun Bitti (ŞAMPİYONLUK TABLOSU GÖSTERİLİYOR)";
    }
    document.getElementById('admin-status').innerText = statusText;

    const qBox = document.getElementById('admin-question-box');
    if (qBox) {
        if (gameState.status === 'question' || gameState.status === 'result') {
            const q = questions[gameState.currentQuestionIndex];
            if (q) {
                document.getElementById('admin-question-text').innerText = `Soru ${gameState.currentQuestionIndex + 1}: ${q.question}`;
                const ul = document.getElementById('admin-question-answers');
                ul.innerHTML = '';
                const colors = ['#e21b3c', '#1368ce', '#d89e00', '#26890c'];
                q.answers.forEach((ans, idx) => {
                    const li = document.createElement('li');
                    li.style.padding = '8px 12px';
                    li.style.marginBottom = '8px';
                    li.style.color = 'white';
                    li.style.fontWeight = 'bold';
                    li.style.borderRadius = '4px';
                    li.style.backgroundColor = colors[idx];

                    if (gameState.status === 'result') {
                        if (idx === q.correctIndex) {
                            li.innerHTML = `✅ ${ans}`;
                        } else {
                            li.innerHTML = `❌ ${ans}`;
                            li.style.opacity = '0.4';
                        }
                    } else {
                        li.innerText = ans;
                    }
                    ul.appendChild(li);
                });
                qBox.style.display = 'block';
            }
        } else {
            qBox.style.display = 'none';
        }
    }

    // OTOMASYON: Eğer oyundayasak ve herkes cevap verdiyse süreyi beklemeden geç
    if (gameState.status === 'question' && gameState.players) {
        const playersArr = Object.values(gameState.players);
        const answeredCount = playersArr.filter(p => p.currentAnswer !== null && p.currentAnswer !== undefined).length;
        if (playersArr.length > 0 && answeredCount === playersArr.length) {
            console.log("Herkes cevap verdi, süre beklenmeden geçiliyor...");
            clearTimeout(gameLoopTimer);
            transitionToResult(gameState.currentQuestionIndex);
        }
    }
});

document.getElementById('btn-start-lobby').addEventListener('click', () => {
    if (confirm("Tüm veri silinip Lobi yeniden açılacak, emin misiniz?")) {
        clearTimeout(gameLoopTimer);
        gameRef.set({
            status: 'lobby',
            currentQuestionIndex: -1,
            players: {}
        });
    }
});

document.getElementById('btn-start-game').addEventListener('click', () => {
    if (!gameState || !gameState.players || Object.keys(gameState.players).length === 0) {
        if (!confirm("Lobide hiç oynayan öğrenci gömülü değil! Yine de tek başınıza/otomatik başlatılsın mı?")) return;
    }
    transitionToQuestion(0);
});

const transitionToQuestion = (index) => {
    if (index >= questions.length) {
        gameRef.update({ status: 'result', currentQuestionIndex: questions.length });
        return;
    }

    const updates = {
        status: 'question',
        currentQuestionIndex: index,
        correctIndex: -1,
        questionStartTime: Date.now()
    };

    if (gameState && gameState.players) {
        Object.keys(gameState.players).forEach(pid => {
            updates[`players/${pid}/currentAnswer`] = null;
        });
    }
    gameRef.update(updates);

    // 15 Saniye (15000 ms) sonra sonucu otomatik göster
    clearTimeout(gameLoopTimer);
    gameLoopTimer = setTimeout(() => {
        transitionToResult(index);
    }, 15500);
};

const transitionToResult = (index) => {
    const correctIdx = questions[index].correctIndex;
    const updates = {
        status: 'result',
        correctIndex: correctIdx
    };

    // Orijinal Kahoot Puanlama Mantığı ve Streak Bonus
    if (gameState && gameState.players) {
        Object.keys(gameState.players).forEach(pid => {
            const p = gameState.players[pid];

            if (p.currentAnswer === correctIdx) {
                // 1. Gecikme süresini hesapla
                let delay = 15000;
                if (p.timestamp && gameState.questionStartTime) {
                    delay = p.timestamp - gameState.questionStartTime;
                }

                // 2. İnternet / Cihaz gecikmesi için 0.5 saniye (500ms) tolerans
                let effectiveDelay = Math.max(0, delay - 500);
                if (effectiveDelay > 14500) effectiveDelay = 14500;

                // 3. Oransal Puan Dağıtımı (İlk %50 Garanti, İkinci %50 Hız)
                const ratio = 1 - (effectiveDelay / 14500);
                let points = 500 + Math.round(ratio * 500);

                // 4. Streak (Seri) Bonus Hesaplama
                const newStreak = (p.streak || 0) + 1;
                let streakBonus = 0;
                if (newStreak >= 2) {
                    streakBonus = Math.min((newStreak - 1) * 100, 500); // Max 500 bonus
                }

                const totalPointsEarned = points + streakBonus;

                updates[`players/${pid}/score`] = (p.score || 0) + totalPointsEarned;
                updates[`players/${pid}/lastPoints`] = totalPointsEarned;
                updates[`players/${pid}/streak`] = newStreak;
                updates[`players/${pid}/streakBonus`] = streakBonus;

            } else {
                // Yanlış veya Boş Cevap durumunda seri sıfırlanır
                updates[`players/${pid}/lastPoints`] = 0;
                updates[`players/${pid}/streak`] = 0;
                updates[`players/${pid}/streakBonus`] = 0;
            }
        });
    }
    gameRef.update(updates);

    if (index < questions.length - 1) {
        // 8 saniye sonra otomatik diğer soruya geç
        clearTimeout(gameLoopTimer);
        gameLoopTimer = setTimeout(() => {
            transitionToQuestion(index + 1);
        }, 8000);
    } else {
        // Son Soru. Puanları göster, 10 saniye bekle ve sonra ŞAMPİYONLUK TABLOSUNA (game_over) atla!
        clearTimeout(gameLoopTimer);
        gameLoopTimer = setTimeout(() => {
            gameRef.update({ status: 'game_over' });
        }, 10000);
    }
};

const renderPlayers = () => {
    const list = document.getElementById('admin-players-list');
    list.innerHTML = '';
    if (!gameState.players) {
        document.getElementById('admin-player-count').innerText = "0";
        return;
    }
    const keys = Object.keys(gameState.players);
    document.getElementById('admin-player-count').innerText = keys.length;

    keys.sort((a, b) => gameState.players[b].score - gameState.players[a].score).forEach(id => {
        const p = gameState.players[id];
        const div = document.createElement('div');
        div.className = 'player-tag';
        div.style.color = "white";

        let ansStatus = "";
        if (gameState.status === 'question') {
            ansStatus = (p.currentAnswer !== null && p.currentAnswer !== undefined) ? " ✅(Cevapladı)" : " ⏳(Bekleniyor)";
        }

        div.innerText = `${p.name} - ${p.score || 0} Puan ${ansStatus}`;
        list.appendChild(div);
    });
};

document.addEventListener("DOMContentLoaded", () => {
    const qrBtn = document.getElementById('btn-show-qr');
    const qrOverlay = document.getElementById('qr-overlay');
    const qrCloseBtn = document.getElementById('btn-close-qr');

    if (qrBtn && qrOverlay && qrCloseBtn) {
        qrBtn.addEventListener('click', () => {
            qrOverlay.style.display = 'flex';
        });
        qrCloseBtn.addEventListener('click', () => {
            qrOverlay.style.display = 'none';
        });
        qrOverlay.addEventListener('click', (e) => {
            if (e.target === qrOverlay) qrOverlay.style.display = 'none';
        });
    }

    const loginOverlay = document.getElementById('admin-login-overlay');
    const appDiv = document.getElementById('app');
    const passInput = document.getElementById('admin-password-input');
    const loginBtn = document.getElementById('btn-admin-login');

    if (loginOverlay && appDiv && passInput && loginBtn) {
        if (sessionStorage.getItem('adminLoggedIn') === 'true') {
            loginOverlay.style.display = 'none';
            appDiv.style.display = 'flex';
        }

        loginBtn.addEventListener('click', () => {
            if (passInput.value === 'furkan123') {
                sessionStorage.setItem('adminLoggedIn', 'true');
                loginOverlay.style.display = 'none';
                appDiv.style.display = 'flex';
            } else {
                alert('Yanlış şifre!');
                passInput.value = '';
            }
        });

        passInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                loginBtn.click();
            }
        });
    }
});
