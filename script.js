// ======================================
// VARIÁVEIS GLOBAIS
// ======================================

let indiceEdicao = null;

const feriados = [
    "2026-01-01",
    "2026-04-21",
    "2026-05-01",
    "2026-09-07",
    "2026-10-12",
    "2026-11-02",
    "2026-11-15",
    "2026-12-25"
];


function mostrarMensagem(texto, tipo = "erro") {
    const div = document.getElementById("mensagem");

    div.textContent = texto;
    div.className = "";
    div.classList.add(tipo === "erro" ? "mensagem-erro" : "mensagem-sucesso");
    div.style.display = "block";

    setTimeout(() => {
        div.style.display = "none";
    }, 3000);
}


// ======================================
// EVENTOS
// ======================================

document.getElementById("data").addEventListener("change", gerarHorarios);

// ======================================
// FUNÇÕES AUXILIARES
// ======================================

function limparFormulario() {
    document.getElementById("nome").value = "";
    document.getElementById("placa").value = "";
    document.getElementById("data").value = "";
    document.getElementById("hora").innerHTML = "<option value=''>Selecione um horário</option>";
    indiceEdicao = null;
}

function obterVistorias() {
    return JSON.parse(localStorage.getItem("vistorias")) || [];
}

function salvarVistorias(vistorias) {
    localStorage.setItem("vistorias", JSON.stringify(vistorias));
}

// ======================================
// GERAR HORÁRIOS DISPONÍVEIS
// ======================================

function gerarHorarios() {
    const selectHora = document.getElementById("hora");
    const data = document.getElementById("data").value;

    selectHora.innerHTML = "<option value=''>Selecione um horário</option>";
    if (!data) return;

    // Bloquear feriados
    if (feriados.includes(data)) {
        alert("Este dia é feriado. Escolha outra data.");
        document.getElementById("data").value = "";
        return;
    }

    const dataSelecionada = new Date(data + "T00:00");
    const diaSemana = dataSelecionada.getDay(); // 0=Dom | 6=Sáb

    if (diaSemana === 0 || diaSemana === 6) {
        alert("Agendamentos não são permitidos aos sábados e domingos.");
        document.getElementById("data").value = "";
        return;
    }

    const vistorias = obterVistorias();

    for (let h = 8; h < 18; h++) {
        for (let m of [0, 30]) {
            const horaFormatada =
                String(h).padStart(2, "0") + ":" +
                String(m).padStart(2, "0");

            const ocupado = vistorias.some((v, index) => {
                if (indiceEdicao !== null && index === indiceEdicao) return false;
                return v.data === data && v.hora === horaFormatada;
            });

            if (!ocupado) {
                const option = document.createElement("option");
                option.value = horaFormatada;
                option.textContent = horaFormatada;
                selectHora.appendChild(option);
            }
        }
    }
}

// ======================================
// FUNÇÃO PRINCIPAL (AGENDAR)
// ======================================

function agendar() {
    const nome = document.getElementById("nome").value;
    const placa = document.getElementById("placa").value;
    const data = document.getElementById("data").value;
    const hora = document.getElementById("hora").value;

    if (!nome || !placa || !data || !hora) {
        mostrarMensagem("Preencha todos os campos.", "erro");
        return;

    }
    

    const dataHoraAgendada = new Date(`${data}T${hora}`);
    const agora = new Date();

    if (dataHoraAgendada < agora) {
        mostrarMensagem("Não é possível agendar para o passado.", "erro");
        return;

    }
    
    mostrarMensagem("Agendamento salvo com sucesso!", "sucesso");

    const vistorias = obterVistorias();

    if (indiceEdicao === null) {
        vistorias.push({ nome, placa, data, hora });
    } else {
        vistorias[indiceEdicao] = { nome, placa, data, hora };
    }

    salvarVistorias(vistorias);
    limparFormulario();
    mostrarAgendamentos();
}

// ======================================
// EDITAR / EXCLUIR / LISTAR
// ======================================

function editar(index) {
    const vistorias = obterVistorias();
    const v = vistorias[index];

    document.getElementById("nome").value = v.nome;
    document.getElementById("placa").value = v.placa;
    document.getElementById("data").value = v.data;

    indiceEdicao = index;
    gerarHorarios();
    document.getElementById("hora").value = v.hora;
}

function excluir(index) {
    const vistorias = obterVistorias();

    if (confirm("Deseja excluir este agendamento?")) {
        vistorias.splice(index, 1);
        salvarVistorias(vistorias);
        mostrarAgendamentos();
    }
}

function mostrarAgendamentos() {
    const lista = document.getElementById("lista");
    lista.innerHTML = "";

    const vistorias = obterVistorias();

    vistorias.forEach((v, index) => {
        const li = document.createElement("li");
        li.innerHTML = `
            <strong>${v.nome}</strong><br>
            Placa: ${v.placa}<br>
            ${v.data} às ${v.hora}
            <div class="acoes">
                <button class="btn-editar" onclick="editar(${index})">Editar</button>
                <button class="btn-excluir" onclick="excluir(${index})">Excluir</button>
            </div>
        `;
        lista.appendChild(li);
    });
}

// Inicialização
mostrarAgendamentos();


