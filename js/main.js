$(document).ready(function() {
    // Foca no campo de entrada quando a página carrega
    $("#input").focus();

    // Anexa a função de busca ao evento keyup com debounce
    let searchTimeout;
    $("#input").on("keyup", function() {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(searchAddresses, 300); // Debounce de 300ms
    });

    // Limpa o campo de entrada ao pressionar Enter
    $('#input').on('keydown', function(e) {
        if (e.which === 13) { // Verifica a tecla Enter
            e.preventDefault();
            $(this).val('');
            clearResults();
        }
    });

    // Carregar estatísticas iniciais
    loadStats();
});

function searchAddresses() {
    const input = document.getElementById("input");
    const query = input.value.trim();

    if (!query || query.length < 2) {
        clearResults();
        return;
    }

    // Mostrar indicador de carregamento
    showLoading();

    // Fazer requisição para a API
    fetch(`/api/cep/search?q=${encodeURIComponent(query)}&limit=50`)
        .then(response => response.json())
        .then(data => {
            hideLoading();
            if (data.success && data.data) {
                displayResults(data.data, query);
            } else {
                showNoResults(query);
            }
        })
        .catch(error => {
            hideLoading();
            console.error('Erro na busca:', error);
            showError('Erro ao buscar endereços. Tente novamente.');
        });
}

// Busca por voz
function startVoiceSearch() {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
        alert('Seu navegador não suporta reconhecimento de voz');
        return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    recognition.lang = 'pt-BR';
    recognition.continuous = false;
    recognition.interimResults = false;

    const input = document.getElementById("input");
    const voiceBtn = document.getElementById("voice-btn");

    voiceBtn.innerHTML = '🎤 Ouvindo...';
    voiceBtn.disabled = true;

    recognition.onresult = function(event) {
        const transcript = event.results[0][0].transcript;
        input.value = transcript;
        searchAddresses();
    };

    recognition.onerror = function(event) {
        console.error('Erro no reconhecimento de voz:', event.error);
        alert('Erro no reconhecimento de voz. Tente novamente.');
    };

    recognition.onend = function() {
        voiceBtn.innerHTML = '🎤 Voz';
        voiceBtn.disabled = false;
    };

    recognition.start();
}

function displayResults(addresses) {
    const ul = document.getElementById("ul");
    ul.innerHTML = '';

    if (addresses.length === 0) {
        showNoResults();
        return;
    }

    addresses.forEach(address => {
        const li = document.createElement('li');
        li.style.display = 'flex';

        const a = document.createElement('a');
        a.href = '#';

        // Construir o texto do endereço
        let addressText = address.logradouro;
        let locationText = '';

        if (address.bairro) {
            locationText += address.bairro;
        }
        if (address.cidade) {
            if (locationText) locationText += ', ';
            locationText += address.cidade;
        }

        a.innerHTML = `
            ${addressText}
            <strong>|${address.cep}|</strong>
            ${locationText}
        `;

        // Adicionar evento de clique para copiar CEP
        a.addEventListener('click', function(e) {
            e.preventDefault();
            copyToClipboard(address.cep);
            showCopyFeedback(this);
        });

        li.appendChild(a);
        ul.appendChild(li);
    });
}

function clearResults() {
    const ul = document.getElementById("ul");
    ul.innerHTML = '';
}

function showLoading() {
    const ul = document.getElementById("ul");
    ul.innerHTML = '<li style="display: flex;"><a href="#" style="justify-content: center;">🔍 Buscando...</a></li>';
}

function hideLoading() {
    // A função displayResults ou showNoResults irá substituir o conteúdo
}

function showNoResults() {
    const ul = document.getElementById("ul");
    ul.innerHTML = '<li style="display: flex;"><a href="#" style="justify-content: center; color: #666;">Nenhum endereço encontrado</a></li>';
}

function showError(message) {
    const ul = document.getElementById("ul");
    ul.innerHTML = `<li style="display: flex;"><a href="#" style="justify-content: center; color: #d32f2f;">❌ ${message}</a></li>`;
}

function copyToClipboard(text) {
    if (navigator.clipboard) {
        navigator.clipboard.writeText(text).catch(err => {
            console.error('Erro ao copiar:', err);
        });
    } else {
        // Fallback para navegadores mais antigos
        const textArea = document.createElement('textarea');
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
    }
}

function showCopyFeedback(element) {
    const originalText = element.innerHTML;
    element.style.backgroundColor = '#4caf50';
    element.innerHTML = originalText.replace(/\|([^|]+)\|/, '|$1 ✓ Copiado!|');

    setTimeout(() => {
        element.style.backgroundColor = '';
        element.innerHTML = originalText;
    }, 2000);
}

function loadStats() {
    fetch('/api/cep/stats/info')
        .then(response => response.json())
        .then(data => {
            if (data.success && data.data) {
                updateStatsDisplay(data.data);
            }
        })
        .catch(error => {
            console.error('Erro ao carregar estatísticas:', error);
        });
}

function updateStatsDisplay(stats) {
    // Adicionar informações de estatísticas no rodapé ou em outro local
    const container = document.querySelector('.container');
    let statsDiv = document.getElementById('stats-info');

    if (!statsDiv) {
        statsDiv = document.createElement('div');
        statsDiv.id = 'stats-info';
        statsDiv.style.textAlign = 'center';
        statsDiv.style.marginTop = '20px';
        statsDiv.style.fontSize = '12px';
        statsDiv.style.color = '#666';
        container.appendChild(statsDiv);
    }

    statsDiv.innerHTML = `
        📊 Base de dados: ${stats.total.toLocaleString()} endereços |
        🏙️ ${stats.cidades} cidades |
        📅 Última atualização: ${new Date(stats.ultima_atualizacao || Date.now()).toLocaleDateString('pt-BR')}
    `;
}