const firebaseConfig = {
    apiKey: "AIzaSyCgEVPqtQqDTzao1a2LgAL4yW6jk26JjNA",
    authDomain: "quizapp-2327e.firebaseapp.com",
    projectId: "quizapp-2327e",
    storageBucket: "quizapp-2327e.firebasestorage.app",
    messagingSenderId: "573771860460",
    appId: "1:573771860460:web:8289ea3fddebf097ce98c9",
    databaseURL: "https://quizapp-2327e-default-rtdb.europe-west1.firebasedatabase.app"
};

// V9/10 Compat (Eski tarz) başlatma
// Sizin uygulamanızda NPM/Server olmadığı için import/export KULLANILMAZ 
firebase.initializeApp(firebaseConfig);
const db = firebase.database();