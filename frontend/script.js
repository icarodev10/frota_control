// Tudo dentro deste evento para garantir que o HTML carregou 100%
document.addEventListener('DOMContentLoaded', async () => {
    // Inicializa o sistema
    await carregarMotoristas();
    await carregarVeiculos();
    carregarTabelaViagens();
    carregarTabelaInfracoes();
});

// --- CONFIGURAÇÃO VISUAL (Alertas SweetAlert2) ---
const Toast = Swal.mixin({
    target: 'body',
    color: '#e4e4e7', // zinc-200
    background: '#27272a', // zinc-800
    confirmButtonColor: '#5e1724', // Vinho
    customClass: {
        popup: 'border border-zinc-700 shadow-2xl'
    }
});

// Função para mensagens de Sucesso 
function avisarSucesso(titulo) {
    Swal.fire({
        icon: 'success',
        title: titulo,
        confirmButtonText: 'OK!',
        confirmButtonColor: '#5e1724',
        color: '#e4e4e7',
        background: '#27272a',
        customClass: {
            popup: 'border border-zinc-700 shadow-2xl'
        }
    });
}

// Função para mensagens de Erro 
function avisarErro(titulo, mensagem) {
    Swal.fire({
        icon: 'error',
        title: titulo,
        text: mensagem,
        confirmButtonText: 'Entendido',
        confirmButtonColor: '#5e1724',
        color: '#e4e4e7',
        background: '#27272a',
        customClass: {
            popup: 'border border-zinc-700 shadow-2xl'
        }
    });
}

// Mapas para traduzir IDs para Nomes/Placas nas tabelas
let mapaMotoristas = {};
let mapaVeiculos = {};

// --- CONFIGURAÇÕES DE API ---
const API_URL = "http://127.0.0.1:8000/veiculos/";
let opcoesMotoristasGlobais = '<option value="">Carregando...</option>';

// --- 1. MOTORISTAS ---
async function carregarMotoristas() {
    try {
        const resposta = await fetch("http://127.0.0.1:8000/motoristas/");
        const motoristas = await resposta.json();

        opcoesMotoristasGlobais = '<option value="">Selecione o motorista...</option>';
        motoristas.forEach(mot => {

            // SALVANDO NO DICIONÁRIO:
            mapaMotoristas[mot.id] = mot.nome;

            const alerta = mot.status_cnh === "Provisória" ? " (PPD ⚠️)" : "";
            opcoesMotoristasGlobais += `<option value="${mot.id}">${mot.nome}${alerta}</option>`;
        });

        carregarTabelaMotoristas(motoristas);
    } catch (erro) {
        opcoesMotoristasGlobais = '<option value="">Erro de conexão</option>';
        console.error(erro);
    }
}

// --- 2. VEÍCULOS & DASHBOARD ---
async function carregarVeiculos() {
    try {
        const resposta = await fetch(API_URL);
        const veiculos = await resposta.json();
        const grid = document.getElementById("grid-veiculos");
        if (!grid) return;

        grid.innerHTML = "";
        let total = veiculos.length;
        let livres = 0;
        let emUso = 0;

        veiculos.forEach(carro => {

            // SALVANDO NO DICIONÁRIO:
            mapaVeiculos[carro.id] = carro.placa;

            let btnHTML = "";
            let corStatus = "";

            if (carro.status === "Livre") {
                livres++;
                corStatus = "bg-green-500 shadow-[0_0_8px_#22c55e]";
                btnHTML = `<button onclick="abrirModalDinamico('saida_viagem', ${carro.id}, ${carro.km_atual})" class="mt-5 w-full bg-vinho hover-bg-vinho text-white font-semibold py-2 px-4 rounded text-sm transition-colors shadow-md">Retirar Veículo 🔑</button>`;
            } else {
                emUso++;
                corStatus = "bg-orange-500 shadow-[0_0_8px_#f97316]";
                btnHTML = `<button onclick="abrirModalDinamico('retorno_viagem', ${carro.id}, ${carro.km_atual})" class="mt-5 w-full bg-orange-600 hover:bg-orange-700 text-white font-semibold py-2 px-4 rounded text-sm transition-colors shadow-md">Registrar Retorno 🏁</button>`;
            }

            grid.innerHTML += `
                <div class="bg-zinc-800 p-6 rounded-lg shadow-lg border border-zinc-700 hover:border-vinho transition-colors">
                    <div class="flex justify-between items-start mb-4">
                        <div>
                            <h2 class="text-2xl font-bold text-white">${carro.placa}</h2>
                            <p class="text-zinc-400 font-medium">${carro.modelo}</p>
                        </div>
                        <span class="flex h-3 w-3 mt-2 rounded-full ${corStatus}"></span>
                    </div>
                    <div class="mt-4 pt-4 border-t border-zinc-700 flex justify-between items-center text-sm">
                        <span class="text-zinc-400">Odômetro Atual:</span>
                        <span class="font-bold text-zinc-200">${carro.km_atual} KM</span>
                    </div>
                    ${btnHTML}
                </div>
            `;
        });

        document.getElementById("dash-total").innerText = total;
        document.getElementById("dash-livres").innerText = livres;
        document.getElementById("dash-em-uso").innerText = emUso;
    } catch (erro) { console.error(erro); }
}

// --- 3. MODAIS & FORMULÁRIOS ---
function fecharModalGlobal() {
    document.getElementById("modalGlobal").classList.add("hidden");
}

function abrirModalDinamico(tipo, idVeiculo = null, kmAtual = null) {
    const modal = document.getElementById("modalGlobal");
    const titulo = document.getElementById("modalTitulo");
    const conteudo = document.getElementById("modalConteudo");
    const btnAcao = document.getElementById("modalBtnAcao");

    modal.classList.remove("hidden");
    const inputClass = "mt-1 block w-full bg-zinc-900 border border-zinc-600 text-white rounded-md p-2 focus:ring-vinho focus:border-vinho outline-none";

    if (tipo === 'novo_veiculo') {
        titulo.innerText = "Cadastrar Veículo";
        btnAcao.innerText = "Salvar";
        btnAcao.className = "bg-zinc-600 hover:bg-zinc-500 text-white font-semibold py-2 px-4 rounded";
        btnAcao.onclick = salvarVeiculo;
        conteudo.innerHTML = `
            <div><label class="text-sm font-medium text-zinc-400">Placa</label><input type="text" id="inputPlaca" placeholder="ABC-1234" class="${inputClass}"></div>
            <div><label class="text-sm font-medium text-zinc-400">Modelo</label><input type="text" id="inputModelo" placeholder="Uno Mille" class="${inputClass}"></div>
        `;
    }
    else if (tipo === 'novo_motorista') {
        titulo.innerText = "Cadastrar Motorista 🧑‍✈️";
        btnAcao.innerText = "Salvar";
        btnAcao.className = "bg-zinc-600 hover:bg-zinc-500 text-white font-semibold py-2 px-4 rounded";
        btnAcao.onclick = salvarMotorista;
        conteudo.innerHTML = `
            <div><label class="text-sm font-medium text-zinc-400">Nome</label><input type="text" id="inputNomeMotorista" placeholder="Nome completo" class="${inputClass}"></div>
            <div><label class="text-sm font-medium text-zinc-400">CNH</label><input type="number" id="inputCnhMotorista" placeholder="Apenas números" class="${inputClass}"></div>
            <div>
                <label class="text-sm font-medium text-zinc-400">Status da CNH</label>
                <select id="selectStatusCnh" class="${inputClass}">
                    <option value="Definitiva">Definitiva</option>
                    <option value="Provisória">Provisória (PPD)</option>
                </select>
            </div>
        `;
    }
    else if (tipo === 'saida_viagem') {
        titulo.innerText = "Liberar Saída de Veículo 🔑";
        btnAcao.innerText = "Confirmar Saída";
        btnAcao.className = "bg-vinho hover-bg-vinho text-white font-semibold py-2 px-4 rounded";
        btnAcao.onclick = () => finalizarAcaoViagem('saida');
        conteudo.innerHTML = `
            <input type="hidden" id="inputVeiculoId" value="${idVeiculo}">
            <div><label class="text-sm font-medium text-zinc-400">Quem está retirando?</label>
            <select id="selectMotoristaModal" class="${inputClass}">${opcoesMotoristasGlobais}</select></div>
            <div class="mt-4"><label class="text-sm font-medium text-zinc-400">Odômetro de Saída</label>
            <input type="number" id="inputKmInicial" value="${kmAtual}" readonly class="${inputClass} opacity-50"></div>
        `;
    }
    else if (tipo === 'retorno_viagem') {
        titulo.innerText = "Registrar Retorno (Check-in) 🏁";
        btnAcao.innerText = "Confirmar Chegada";
        btnAcao.className = "bg-orange-600 hover:bg-orange-700 text-white font-semibold py-2 px-4 rounded";
        btnAcao.onclick = () => finalizarAcaoViagem('retorno');
        conteudo.innerHTML = `
            <input type="hidden" id="inputVeiculoId" value="${idVeiculo}">
            <input type="hidden" id="inputKmInicial" value="${kmAtual}">
            <div><label class="text-sm font-medium text-zinc-400">Confirmar quem está devolvendo</label>
            <select id="selectMotoristaModal" class="${inputClass}">${opcoesMotoristasGlobais}</select></div>
            <div class="mt-4"><label class="text-sm font-medium text-zinc-400">Odômetro Final (Chegada)</label>
            <input type="number" id="inputKmFinal" placeholder="Ex: 10500" class="${inputClass}"></div>
        `;
    }
    else if (tipo === 'multa') {
        titulo.innerText = "Sistema de Radar 📸";
        btnAcao.innerText = "Aplicar Multa";
        btnAcao.className = "bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded";
        btnAcao.onclick = salvarMulta;
        conteudo.innerHTML = `
            <div><label class="text-sm font-medium text-zinc-400">ID do Veículo Infrator</label><input type="number" id="inputVeiculoMulta" placeholder="Ex: 1" class="${inputClass}"></div>
            <div class="mt-4"><label class="text-sm font-medium text-zinc-400">Pontos na CNH</label><input type="number" id="inputPontosMulta" placeholder="Ex: 7" class="${inputClass}"></div>
        `;
    }
}

// --- 4. ENVIO DE DADOS (POST) ---
async function finalizarAcaoViagem(acao) {
    const veiculo_id = parseInt(document.getElementById("inputVeiculoId").value);
    const km_inicial = parseFloat(document.getElementById("inputKmInicial").value);
    const motorista_id = parseInt(document.getElementById("selectMotoristaModal").value);

    if (!motorista_id) {
        return avisarErro("Campo Vazio", "Por favor, selecione o motorista responsável.");
    }

    let km_final = 0;
    if (acao === 'retorno') {
        km_final = parseFloat(document.getElementById("inputKmFinal").value);
        if (!km_final || km_final <= km_inicial) {
            return avisarErro("Erro no Odômetro", "O valor de chegada deve ser maior que o de saída!");
        }
    }

    let dados = { veiculo_id, km_inicial, motorista_id, km_final };

    try {
        const res = await fetch("http://127.0.0.1:8000/viagens/", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(dados)
        });

        if (res.ok) {
            fecharModalGlobal();
            carregarVeiculos();
            carregarTabelaViagens();
            avisarSucesso(acao === 'saida' ? "Veículo liberado!" : "Retorno registrado!");
        } else {
            const err = await res.json();
            avisarErro("Operação Recusada", err.detail);
        }
    } catch (e) { console.error(e); }
}

async function salvarVeiculo() {
    const placa = document.getElementById("inputPlaca").value;
    const modelo = document.getElementById("inputModelo").value;
    if (!placa || !modelo) return avisarErro("Dados incompletos", "Preencha a placa e o modelo!");
    try {
        const res = await fetch(API_URL, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ placa, modelo, km_atual: 0.0, status: "Livre" }) });
        if (res.ok) {
            fecharModalGlobal();
            carregarVeiculos();
            avisarSucesso("Veículo cadastrado!");
        } else {
            avisarErro("Erro", "Esta placa já existe no sistema.");
        }
    } catch (e) { console.error(e); }
}

async function salvarMotorista() {
    const nome = document.getElementById("inputNomeMotorista").value;
    const cnh = document.getElementById("inputCnhMotorista").value;
    const status_cnh = document.getElementById("selectStatusCnh").value;
    if (!nome || !cnh) return avisarErro("Dados incompletos", "Preencha o nome e a CNH!");

    // VALIDAÇÃO DO NOME
    // testa se o nome tem apenas letras (incluindo acentos) e espaços
    const regexLetras = /^[a-zA-ZÀ-ÿ\s]+$/;
    if (!regexLetras.test(nome)) {
        return avisarErro("Nome Inválido", "O nome do motorista deve conter apenas letras!");
    }
    
    if (nome.length < 3) {
        return avisarErro("Nome Inválido", "O nome deve ter pelo menos 3 letras.");
    }

    try {
        const res = await fetch("http://127.0.0.1:8000/motoristas/", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ nome, cnh, status_cnh }) });
        if (res.ok) {
            fecharModalGlobal();
            carregarMotoristas();
            avisarSucesso("Motorista cadastrado!");
        } else {
            avisarErro("Erro", "Esta CNH já está cadastrada.");
        }
    } catch (e) { console.error(e); }
}

async function salvarMulta() {
    const veiculo_id = parseInt(document.getElementById("inputVeiculoMulta").value);
    const pontos = parseInt(document.getElementById("inputPontosMulta").value);
    if (!veiculo_id || !pontos) return avisarErro("Atenção", "Preencha o ID do carro e os pontos.");
    try {
        const res = await fetch("http://127.0.0.1:8000/infracoes/", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ veiculo_id, pontos }) });
        const dados = await res.json();
        if (res.ok) {
            fecharModalGlobal();
            carregarTabelaInfracoes();
            Toast.fire({ icon: 'info', title: 'Radar Processado', text: dados.alerta_gerado });
        } else {
            avisarErro("Falha no Radar", dados.detail);
        }
    } catch (e) { console.error(e); }
}

// --- 5. RENDERIZAÇÃO DE TABELAS ---
function carregarTabelaMotoristas(motoristas) {
    const tbody = document.getElementById("tabela-motoristas");
    if (!tbody) return;
    tbody.innerHTML = "";
    motoristas.forEach(mot => {
        let corCnh = mot.status_cnh === "Provisória" ? "text-orange-500 font-bold" : "text-green-500";
        tbody.innerHTML += `<tr><td class="p-3">${mot.id}</td><td class="p-3 font-semibold text-white">${mot.nome}</td><td class="p-3">${mot.cnh}</td><td class="p-3 ${corCnh}">${mot.status_cnh}</td></tr>`;
    });
}

async function carregarTabelaViagens() {
    try {
        const res = await fetch("http://127.0.0.1:8000/viagens/");
        const viagens = await res.json();
        const tbody = document.getElementById("tabela-viagens");
        if (!tbody) return;
        tbody.innerHTML = "";
        viagens.forEach(v => {
            // Traduz os IDs. Se por acaso ainda não tiver carregado, mostra o ID como reserva
            let nomeCarro = mapaVeiculos[v.veiculo_id] || `Carro #${v.veiculo_id}`;
            let nomeMotorista = mapaMotoristas[v.motorista_id] || `Motorista #${v.motorista_id}`;

            tbody.innerHTML += `
                <tr class="hover:bg-zinc-700 transition-colors">
                    <td class="p-3 text-vinho font-bold">${v.id}</td>
                    <td class="p-3 text-white font-medium">${nomeCarro}</td>
                    <td class="p-3 text-white">${nomeMotorista}</td>
                    <td class="p-3">${v.km_inicial} KM</td>
                    <td class="p-3 text-green-400 font-bold">${v.km_final} KM</td>
                </tr>`;
        });
    } catch (e) { console.error(e); }
}

async function carregarTabelaInfracoes() {
    try {
        const res = await fetch("http://127.0.0.1:8000/infracoes/");
        const infracoes = await res.json();
        const tbody = document.getElementById("tabela-infracoes");
        if (!tbody) return;
        tbody.innerHTML = "";
        infracoes.forEach(inf => {
            let nomeCarro = mapaVeiculos[inf.veiculo_id] || `Carro #${inf.veiculo_id}`;
            let nomeMotorista = mapaMotoristas[inf.motorista_culpado_id] || `Motorista #${inf.motorista_culpado_id}`;
            let corAlerta = inf.alerta_gerado.includes("ALERTA VERMELHO") ? "text-red-500 font-bold" : "text-zinc-400";

            tbody.innerHTML += `
                <tr class="hover:bg-zinc-700 transition-colors">
                    <td class="p-3 font-bold text-white">${nomeCarro}</td>
                    <td class="p-3 text-white">${nomeMotorista}</td>
                    <td class="p-3 text-red-400 font-bold">${inf.pontos} pts</td>
                    <td class="p-3 ${corAlerta} text-xs">${inf.alerta_gerado}</td>
                </tr>`;
        });
    } catch (e) { console.error(e); }
}

// --- FUNÇÃO DE FILTRO EM TEMPO REAL ---
function filtrarViagens() {
    let input = document.getElementById("inputPesquisaViagens");
    let filtro = input.value.toUpperCase();
    let tabela = document.getElementById("tabela-viagens");
    let linhas = tabela.getElementsByTagName("tr");

    for (let i = 0; i < linhas.length; i++) {
        // Pega o texto de todas as colunas daquela linha
        let textoLinha = linhas[i].textContent || linhas[i].innerText;

        // Se o texto digitado existir na linha, ela aparece. Se não, esconde.
        if (textoLinha.toUpperCase().indexOf(filtro) > -1) {
            linhas[i].style.display = "";
        } else {
            linhas[i].style.display = "none";
        }
    }
}

