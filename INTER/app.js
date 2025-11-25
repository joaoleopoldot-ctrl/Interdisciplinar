/* =========================
   App + Auth (localStorage)
   ========================= */

const API_URL = 'http://localhost:8080/api'; // URL da sua API de Backend (mantido)

const LS_USERS = "ep_users_v1";
const LS_SESSION = "ep_session_v1";
const LS_DATA = "ep_data_v1";

/* -------- Seletores (UI e Auth) -------- */

const loginOverlay = document.getElementById("loginOverlay");
const loginTitle = document.getElementById("loginTitle"); 
const formLogin = document.getElementById("formLogin");
const btnLogin = document.getElementById("btnLogin"); 
const loginMsg = document.getElementById("loginMsg");
const chkRemember = document.getElementById("chkRemember"); 
const rememberMeContainer = document.getElementById("rememberMeContainer"); 
const loginNome = document.getElementById("loginNome"); 
const labelNome = document.getElementById("labelNome");
const loginEmail = document.getElementById("loginEmail"); 
const loginPass = document.getElementById("loginPass"); 
const passInfo = document.getElementById("passInfo");
const btnLogout = document.getElementById("btnLogout");
const welcomeUser = document.getElementById("welcomeUser");
const sidebar = document.querySelector(".sidebar"); 

/* -------- Seletores (Formulários de Dados) -------- */
// Certifique-se de que os IDs abaixo existem no seu index.html
const formDisciplina = document.getElementById("form-disciplina"); 
const discNome = document.getElementById("disc-nome"); 
const discDesc = document.getElementById("disc-desc");
const formTarefa = document.getElementById("form-tarefa");
const tarefasList = document.getElementById("tarefas-list"); 
const taskDesc = document.getElementById("task-desc"); 
const taskDiscSelect = document.getElementById("task-disc-select"); 
const taskPrio = document.getElementById("task-prio"); 
const taskDate = document.getElementById("task-date"); 

/* -------- Estado -------- */
let users = JSON.parse(localStorage.getItem(LS_USERS) || "[]");
let session = JSON.parse(localStorage.getItem(LS_SESSION) || "null");
let dataStore = JSON.parse(localStorage.getItem(LS_DATA) || "{}");
let isRegisterMode = true; 
let currentEmail = null;

/* -------- Helpers de Autenticação -------- */

function findUser(email) {
    return users.find(u => u.email.toLowerCase() === email.toLowerCase());
}

function showMessage(msg, err = true) {
    loginMsg.textContent = msg;
    loginMsg.style.color = err ? "var(--danger)" : "var(--success)"; 
}

// Alterna entre modo Cadastro e Login
window.toggleAuthMode = function(mode) {
    isRegisterMode = mode;
    
    const toggleMsgEl = document.querySelector('.auth-toggle-msg');
    
    if (mode) { // Modo Cadastro
        loginTitle.textContent = "Cadastre-se";
        toggleMsgEl.innerHTML = 'Já tem cadastro? <a href="#" class="link-accent" onclick="event.preventDefault(); toggleAuthMode(false);">Faça seu login</a>';
        btnLogin.textContent = "Efetuar cadastro";
        btnLogin.classList.add('btn-success-large');
        btnLogin.classList.remove('btn-primary');
        
        loginNome.hidden = false;
        labelNome.hidden = false;
        passInfo.hidden = false;
        rememberMeContainer.hidden = true;
        
    } else { // Modo Login
        loginTitle.textContent = "Faça seu login";
        toggleMsgEl.innerHTML = 'Não tem cadastro? <a href="#" class="link-accent" onclick="event.preventDefault(); toggleAuthMode(true);">Criar conta</a>';
        btnLogin.textContent = "Entrar";
        btnLogin.classList.remove('btn-success-large');
        btnLogin.classList.add('btn-primary');

        loginNome.hidden = true;
        labelNome.hidden = true;
        passInfo.hidden = true;
        loginNome.value = ""; 
        rememberMeContainer.hidden = false;
    }
    
    loginMsg.textContent = ""; 
    loginPass.type = 'password'; 
    // Assumindo que o chkShowPass está no HTML
    const chkShowPass = document.getElementById("chkShowPass");
    if(chkShowPass) chkShowPass.checked = false;
}

function registerLocal(nome, email, pass) {
    if (!nome || !email || !pass) return showMessage("Preencha todos os campos.");
    if (pass.length < 6) return showMessage("A senha deve ter no mínimo 6 caracteres.");

    if (findUser(email)) return showMessage("Conta já existe.");

    users.push({ nome, email, pass });
    localStorage.setItem(LS_USERS, JSON.stringify(users));

    dataStore[email] = { disciplinas: [], tarefas: [] }; // Estrutura básica de dados
    localStorage.setItem(LS_DATA, JSON.stringify(dataStore));

    return true; 
}

function loginLocal(email, pass, remember = false) {
    const u = findUser(email);
    if (!u || u.pass !== pass) {
        // Log para debug
        console.error("Tentativa de login falhou. Usuário encontrado:", !!u);
        return showMessage("Email ou senha inválidos.");
    }

    session = { email, ts: Date.now() };
    
    if (remember) {
        localStorage.setItem(LS_SESSION, JSON.stringify(session));
        localStorage.setItem(LS_SESSION + "_remember", "1");
    } else {
        sessionStorage.setItem(LS_SESSION, JSON.stringify(session)); 
        localStorage.removeItem(LS_SESSION + "_remember");
        localStorage.removeItem(LS_SESSION);
    }
    
    currentEmail = email; // Define o email da sessão
    openAppFor(email, u.nome); 
    return true;
}

window.logout = function() {
    session = null;
    currentEmail = null;
    localStorage.removeItem(LS_SESSION);
    localStorage.removeItem(LS_SESSION + "_remember");
    sessionStorage.removeItem(LS_SESSION);
    closeApp();
    showToast("Logout realizado.", true);
}


/* ---------- UI App Handling ---------- */

function openAppFor(email, nome) {
    loginOverlay.style.display = "none";
    
    // Mostra o layout principal
    const layout = document.querySelector(".layout");
    if(layout) layout.style.display = "grid"; 
    
    // Atualiza a sidebar
    welcomeUser.hidden = false;
    btnLogout.hidden = false;
    welcomeUser.textContent = `Olá, ${nome || email.split('@')[0]}!`; 
    
    // Recarrega os dados do usuário (Importante!)
    loadDisciplinas(); 
    loadTarefas(); 
}

function closeApp() {
    loginOverlay.style.display = "flex";
    
    // Oculta o layout principal
    const layout = document.querySelector(".layout");
    if(layout) layout.style.display = "none";
    
    welcomeUser.hidden = true;
    btnLogout.hidden = true;
    welcomeUser.textContent = "";
}

/* ---------- Login/Registro Listeners ---------- */

if (formLogin) {
    formLogin.addEventListener("submit", e => {
        e.preventDefault();
    
        const email = loginEmail.value.trim();
        const pass = loginPass.value;
        const nome = loginNome.value.trim();
    
        if (isRegisterMode) {
            if (registerLocal(nome, email, pass)) {
                // Tenta logar automaticamente após o cadastro
                loginLocal(email, pass, chkRemember.checked);
                showToast("Conta criada com sucesso!", true);
            }
        } else {
            // Modo Login
            if (!email || !pass) return showMessage("Preencha email e senha.");
            loginLocal(email, pass, chkRemember.checked);
        }
    });
}

if(btnLogout) btnLogout.addEventListener("click", logout);

/* ---------- Data / API / LocalStorage (Simulação de CRUD) ---------- */

function saveDataLocal() {
    localStorage.setItem(LS_DATA, JSON.stringify(dataStore));
}

// --- Disciplinas ---

window.loadDisciplinas = function() {
    if (!currentEmail || !dataStore[currentEmail]) return;
    const disciplinas = dataStore[currentEmail].disciplinas || [];
    document.getElementById('total-disc').innerText = disciplinas.length;
    renderDisciplinas(disciplinas);
    updateSelects(disciplinas);
}

function renderDisciplinas(lista) {
    const grid = document.getElementById('disciplinas-grid');
    if(!grid) return;
    grid.innerHTML = '';
    if (lista.length === 0) {
        grid.innerHTML = `<div class="empty-state" style="grid-column:1/-1"><i class="ph ph-books empty-icon"></i><p>Nenhuma disciplina ainda. Comece a organizar!</p></div>`;
        return;
    }
    lista.forEach(disc => {
        const card = document.createElement('div');
        card.className = 'card';
        card.innerHTML = `<div style="margin-bottom:15px; font-size:24px; color:var(--accent)"><i class="ph ph-notebook"></i></div><h3>${disc.nome}</h3><p>${disc.descricao || ''}</p>`;
        grid.appendChild(card);
    });
}

function updateSelects(disciplinas) {
    const select = document.getElementById('task-disc-select');
    if (!select) return;
    select.innerHTML = '<option value="" disabled selected>Selecione a Disciplina</option>';
    disciplinas.forEach(disc => {
        const option = document.createElement('option');
        option.value = disc.id;
        option.textContent = disc.nome;
        select.appendChild(option);
    });
}

if (formDisciplina) {
    formDisciplina.addEventListener('submit', (e) => {
        e.preventDefault();
        const nome = discNome.value;
        const desc = discDesc.value;

        if (!currentEmail || !dataStore[currentEmail]) return showToast("Erro: Usuário não logado.", false);

        const newId = Date.now(); 
        dataStore[currentEmail].disciplinas.push({ id: newId, nome: nome, descricao: desc });
        
        saveDataLocal();
        showToast("Disciplina criada!", true); 
        loadDisciplinas(); 
        closeModal('modal-disciplina'); 
        e.target.reset();
    });
}

// --- Tarefas ---

window.loadTarefas = function() {
    if (!currentEmail || !dataStore[currentEmail]) return;
    const tarefas = dataStore[currentEmail].tarefas || [];
    const pendentes = tarefas.filter(t => t.status !== 'Concluída').length;
    const concluidas = tarefas.filter(t => t.status === 'Concluída').length;
    document.getElementById('total-tasks').innerText = pendentes;
    document.getElementById('total-done').innerText = concluidas;
    renderTarefas(tarefas);
}

function renderTarefas(lista) {
    const list = document.getElementById('tarefas-list');
    if (!list) return;
    list.innerHTML = '';
    if (lista.length === 0) {
        list.innerHTML = `<div class="empty-state"><i class="ph ph-check-circle empty-icon"></i><p>Tudo feito! Sem tarefas pendentes.</p></div>`;
        return;
    }
    lista.forEach(task => {
        const item = document.createElement('li');
        item.className = 'meta-item';
        item.style.display = "flex"; item.style.justifyContent = "space-between"; item.style.alignItems = "center";
        
        let dataFormatada = task.prazo ? new Date(task.prazo + 'T00:00:00').toLocaleDateString('pt-BR', {day:'2-digit', month:'2-digit'}) : '';
        const isDone = task.status === 'Concluída';
        const decoration = isDone ? 'text-decoration: line-through; opacity: 0.5;' : '';
        
        const disc = dataStore[currentEmail].disciplinas.find(d => d.id == task.disciplinaId);
        const discNome = disc ? disc.nome : 'Geral';

        item.innerHTML = `
            <div style="display:flex; align-items:center; ${decoration}; flex-grow: 1;">
                <input type="checkbox" ${isDone ? 'checked' : ''} 
                       onchange="toggleStatus(${task.id}, '${task.status || 'Pendente'}')">
                <div style="margin-left: 10px;">
                    <strong style="color:var(--text-primary); display:block; font-size: 15px;">${task.descricao}</strong>
                    <small style="color:var(--text-secondary);"><i class="ph ph-tag" style="font-size:12px"></i> ${discNome} ${dataFormatada ? '• 📅 ' + dataFormatada : ''}</small>
                </div>
            </div>
            <div style="display:flex; align-items:center; gap:15px;">
                <span class="meta-status status-${task.prioridade.toLowerCase()}">${task.prioridade}</span>
                <button onclick="deletarTarefa(${task.id})" class="btn-ghost" title="Excluir"><i class="ph ph-trash" style="font-size: 18px; color: var(--danger);"></i></button>
            </div>
        `;
        list.appendChild(item);
    });
}

window.toggleStatus = function(id, statusAtual) {
    if (!currentEmail || !dataStore[currentEmail]) return;
    const tarefas = dataStore[currentEmail].tarefas;
    const task = tarefas.find(t => t.id === id);
    if (task) {
        task.status = statusAtual === 'Concluída' ? 'Pendente' : 'Concluída';
        saveDataLocal();
        loadTarefas();
    }
}

window.deletarTarefa = function(id) {
    if (!currentEmail || !dataStore[currentEmail] || !confirm("Apagar tarefa?")) return;
    
    let tarefas = dataStore[currentEmail].tarefas;
    dataStore[currentEmail].tarefas = tarefas.filter(t => t.id !== id);
    
    saveDataLocal();
    showToast("Tarefa removida", true); 
    loadTarefas();
}


if (formTarefa) {
    formTarefa.addEventListener('submit', (e) => {
        e.preventDefault();
        
        if (!currentEmail || !dataStore[currentEmail]) return showToast("Erro: Usuário não logado.", false);
        
        const novaTarefa = {
            id: Date.now(), 
            descricao: taskDesc.value,
            disciplinaId: taskDiscSelect.value,
            prioridade: taskPrio.value,
            prazo: taskDate.value,
            status: 'Pendente'
        };
        
        dataStore[currentEmail].tarefas.push(novaTarefa);
        
        saveDataLocal();
        showToast("Tarefa adicionada!", true); 
        loadTarefas(); 
        closeModal('modal-tarefa'); 
        e.target.reset();
    });
}


/* ---------- Toast (Mantido no app.js) ---------- */

window.showToast = function(msg, isSuccess = false) {
    const container = document.getElementById("toast-container");
    if (!container) return; // Se o container não existir, não faz nada
    const t = document.createElement("div");
    
    t.innerHTML = `${isSuccess ? '<i class="ph-fill ph-check-circle"></i>' : '<i class="ph-fill ph-warning-circle"></i>'} <span>${msg}</span>`;
    t.classList.add("toast"); 
    
    if (!isSuccess) {
        t.classList.add("error"); 
    }

    container.appendChild(t);
    
    setTimeout(() => t.classList.add('show'), 10);
    setTimeout(() => { t.classList.remove('show'); setTimeout(() => t.remove(), 300); }, 3000);
}


/* ---------- Init (Inicialização da Aplicação) ---------- */

function init() {
    // Tenta carregar dados existentes
    try {
        users = JSON.parse(localStorage.getItem(LS_USERS) || "[]");
        dataStore = JSON.parse(localStorage.getItem(LS_DATA) || "{}");
    } catch (e) {
        users = [];
        dataStore = {};
    }

    const storedLS = localStorage.getItem(LS_SESSION);
    const storedSS = sessionStorage.getItem(LS_SESSION);
    const remembered = localStorage.getItem(LS_SESSION + "_remember");
    
    let loadedSession = null;

    if (storedLS && remembered) {
        loadedSession = JSON.parse(storedLS);
    } else if (storedSS) {
        loadedSession = JSON.parse(storedSS);
    }

    // Se houver sessão, tenta abrir o app
    if (loadedSession) {
        session = loadedSession;
        const user = findUser(session.email);
        if (user) {
            openAppFor(session.email, user.nome);
            toggleAuthMode(false); // Mantém no modo Login para UX
            return;
        }
    }
    
    // Se não houver sessão válida, mostra a tela de cadastro
    closeApp();
    toggleAuthMode(true); // Inicia no modo Cadastro
}

document.addEventListener('DOMContentLoaded', init); // Inicia ao carregar a página