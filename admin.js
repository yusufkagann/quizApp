import { db } from './firebase-config.js';
import { questions } from './questions.js';
import { ref, set, update, onValue } from "https://www.gstatic.com/firebasejs/10.10.0/firebase-database.js";

let gameState = null;

const gameRef = ref(db, 'active_game');
onValue(gameRef, (snapshot) => {
    gameState = snapshot.val() || {};
    renderPlayers();
    document.getElementById('admin-status').innerText = gameState.status === 'lobby' ? "Lobi Açık (Öğrenciler giriyor)" :
        gameState.status === 'question' ? `Soru ${gameState.currentQuestionIndex + 1} Sürülüyor` :
            gameState.status === 'result' ? `Soru ${gameState.currentQuestionIndex + 1} Sonucu Gösterimde` : "Veritabanı Boş/Açılmadı";
});

document.getElementById('btn-start-lobby').addEventListener('click', () => {
    if (confirm("Tüm veri silinip Lobi yeniden açılacak, emin misiniz?")) {
        set(gameRef, {
            status: 'lobby',
            currentQuestionIndex: -1,
            players: {}
        });
    }
});

const controlsDiv = document.getElementById('question-controls');
questions.forEach((q, i) => {
    const box = document.createElement('div');
    box.style.border = '1px solid #ccc';
    box.style.padding = '10px';
    box.style.marginBottom = '20px';
    box.style.borderRadius = '8px';

    const title = document.createElement('h4');
    title.innerText = `Soru ${i + 1}`;
    title.style.marginBottom = '10px';

    const btnStart = document.createElement('button');
    btnStart.className = 'btn btn-primary btn-block';
    btnStart.innerText = `Soru ${i + 1}'e Geç (Yansıt)`;
    btnStart.style.marginBottom = '10px';
    btnStart.style.fontSize = '1rem';
    btnStart.style.padding = '0.5rem';
    btnStart.onclick = () => {
        const updates = {
            status: 'question',
            currentQuestionIndex: i,
            correctIndex: -1
        };
        if (gameState.players) {
            Object.keys(gameState.players).forEach(pid => {
                updates[`players/${pid}/currentAnswer`] = null;
            });
        }
        update(gameRef, updates);
    };

    const btnEnd = document.createElement('button');
    btnEnd.className = 'btn btn-secondary btn-block';
    btnEnd.style.backgroundColor = 'var(--purple)';
    btnEnd.style.color = 'white';
    btnEnd.style.border = 'none';
    btnEnd.innerText = `Soru ${i + 1} Sonucunu Göster`;
    btnEnd.style.fontSize = '1rem';
    btnEnd.style.padding = '0.5rem';
    btnEnd.onclick = () => {
        const updates = {
            status: 'result',
            correctIndex: questions[i].correctIndex
        };
        if (gameState.players) {
            Object.keys(gameState.players).forEach(pid => {
                const p = gameState.players[pid];
                if (p.currentAnswer === questions[i].correctIndex) {
                    updates[`players/${pid}/score`] = (p.score || 0) + 1000;
                }
            });
        }
        update(gameRef, updates);
    };

    box.appendChild(title);
    box.appendChild(btnStart);
    box.appendChild(btnEnd);
    controlsDiv.appendChild(box);
});

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

        div.innerText = `${p.name} - ${p.score} Puan ${ansStatus}`;
        list.appendChild(div);
    });
};
