/* =============================== */
/* ======= CLASSE TAREFA ========= */
/* =============================== */

class Tarefa {
    constructor(id, titulo, concluida = false) {
        this.id = id;
        this.titulo = titulo;
        this.concluida = concluida;
    }
}

/* =============================== */
/* ======= GERENCIADOR BD ======== */
/* =============================== */

class BD {
    constructor() {
        let tarefas = localStorage.getItem("tarefas");
        if (!tarefas) {
            localStorage.setItem("tarefas", JSON.stringify([]));
        }
    }

    /* Obtém todas as tarefas do LocalStorage */
    obterTarefas() {
        return JSON.parse(localStorage.getItem("tarefas")) || [];
    }

    /* Salvando as tarefas no LocalStorage */
    salvarTarefas(tarefas) {
        localStorage.setItem("tarefas", JSON.stringify(tarefas));
    }

    /* Adiciona uma nova tarefa */
    adicionarTarefa(tarefa) {
        let tarefas = this.obterTarefas();
        tarefas.push(tarefa);
        this.salvarTarefas(tarefas);
    }

    /* Remove uma tarefa pelo ID */
    removerTarefa(id) {
        let tarefas = this.obterTarefas().filter(t => t.id !== id);
        this.salvarTarefas(tarefas);
    }

    /* Atualiza o título de uma tarefa */
    atualizarTarefa(id, novoTitulo) {
        let tarefas = this.obterTarefas().map(t => {
            if (t.id === id) {
                t.titulo = novoTitulo;
            }
            return t;
        });
        this.salvarTarefas(tarefas);
    }

    /* Alterna o status de concluída da tarefa */
    alternarStatus(id) {
        let tarefas = this.obterTarefas().map(t => {
            if (t.id === id) {
                t.concluida = !t.concluida;
            }
            return t;
        });
        this.salvarTarefas(tarefas);
    }
}

/* =============================== */
/* ======= ELEMENTOS HTML ======== */
/* =============================== */

const bd = new BD();
const form = document.getElementById("task-form");
const listaTarefas = document.getElementById("task-list");
const botaoTema = document.getElementById("toggle-theme");
const totalTasks = document.getElementById("total-tasks");
const pendingTasks = document.getElementById("pending-tasks");
const completedTasks = document.getElementById("completed-tasks");

/* =============================== */
/* ======= EVENTOS PRINCIPAIS ==== */
/* =============================== */

/* Carrega as tarefas ao carregar a página */
document.addEventListener("DOMContentLoaded", carregarTarefas);

/* Adiciona uma nova tarefa ao formulário */
form.addEventListener("submit", adicionarTarefa);

/* Alterna entre tema claro e escuro */
botaoTema.addEventListener("click", alternarTema);

/* =============================== */
/* ======= FUNÇÕES PRINCIPAIS ==== */
/* =============================== */

/* Carrega e exibe todas as tarefas na tela */
function carregarTarefas() {
    listaTarefas.innerHTML = ""; // Limpa a lista antes de carregar novamente
    const tarefas = bd.obterTarefas();
    
    tarefas.forEach(tarefa => criarElementoTarefa(tarefa)); // Cria os elementos
    atualizarEstatisticas(tarefas); // Atualiza as estatísticas
}

/* Adiciona uma nova tarefa à lista */
function adicionarTarefa(event) {
    event.preventDefault();
    
    const input = document.getElementById("task-title");
    if (input.value.trim() === "") return; // Impede tarefas vazias

    const novaTarefa = new Tarefa(Date.now(), input.value.trim());
    bd.adicionarTarefa(novaTarefa);

    criarElementoTarefa(novaTarefa);
    input.value = ""; // Limpa o input

    carregarTarefas(); // Recarrega a lista
}

/* Cria o elemento HTML de uma tarefa */
function criarElementoTarefa(tarefa) {
    const li = document.createElement("li");
    li.dataset.id = tarefa.id;

    li.innerHTML = `
        <input type="checkbox" ${tarefa.concluida ? "checked" : ""}>
        <span class="task-text" contenteditable="false">${tarefa.titulo}</span>
        <div class="task-buttons">
            <button class="editar">Editar</button>
            <button class="remover">Remover</button>
        </div>
    `;

    // Referência aos elementos
    const checkbox = li.querySelector("input");
    const span = li.querySelector(".task-text");
    const botaoEditar = li.querySelector(".editar");
    const botaoRemover = li.querySelector(".remover");

    /* Alterna o status de concluído */
    checkbox.addEventListener("change", () => {
        bd.alternarStatus(tarefa.id);
        carregarTarefas();
    });

    /* Habilita a edição do título da tarefa */
    botaoEditar.addEventListener("click", () => {
        span.contentEditable = "true";
        span.focus();
        botaoEditar.style.display = "none"; // Esconde o botão

        span.addEventListener("blur", salvarEdicao);
        span.addEventListener("keypress", (e) => {
            if (e.key === "Enter") {
                e.preventDefault();
                span.blur(); // Salva ao pressionar Enter
            }
        });

        function salvarEdicao() {
            const novoTitulo = span.textContent.trim();
            if (novoTitulo) {
                bd.atualizarTarefa(tarefa.id, novoTitulo);
            } else {
                span.textContent = tarefa.titulo;
            }
            span.contentEditable = "false"; 
            botaoEditar.style.display = "inline-block"; 
            span.removeEventListener("blur", salvarEdicao);
        }
    });

    /* Remove a tarefa ao clicar no botão */
    botaoRemover.addEventListener("click", () => {
        bd.removerTarefa(tarefa.id);
        carregarTarefas();
    });

    listaTarefas.appendChild(li);
}

/* Alterna entre modo claro e escuro */
function alternarTema() {
    document.body.classList.toggle("dark-mode");

    const temaAtivo = document.body.classList.contains("dark-mode");
    localStorage.setItem("tema", temaAtivo ? "escuro" : "claro");

    botaoTema.textContent = temaAtivo ? "Modo Claro" : "Modo Escuro";
}

/* Mantém o tema salvo ao carregar a página */
document.addEventListener("DOMContentLoaded", () => {
    const temaSalvo = localStorage.getItem("tema");
    if (temaSalvo === "escuro") {
        document.body.classList.add("dark-mode");
        botaoTema.textContent = "Modo Claro";
    }
});

/* Atualiza as estatísticas de tarefas */
function atualizarEstatisticas(tarefas) {
    const total = tarefas.length;
    const pendentes = tarefas.filter(tarefa => !tarefa.concluida).length;
    const concluidas = total - pendentes;

    totalTasks.textContent = `Total de Tarefas: ${total}`;
    pendingTasks.textContent = `Tarefas Pendentes: ${pendentes}`;
    completedTasks.textContent = `Tarefas Concluídas: ${concluidas}`;
}
