// public/js/common_ui.js

document.addEventListener('DOMContentLoaded', () => {
    // --- Seletores Comuns (podem variar, mas os IDs são padronizados) ---
    const userInfoSpan = document.getElementById('user-info')?.querySelector('span');
    const currentDatetimeSpan = document.getElementById('current-datetime');
    const pageTitleH1 = document.getElementById('page-title');
    const logoutLink = document.getElementById('logout-link');
    const navLinks = document.querySelectorAll('.nav-menu a.nav-link');
    const feedbackDiv = document.getElementById('feedback'); // O elemento #feedback global

    // --- Configurações (Ajuste conforme a necessidade do seu backend/local dev) ---
    const CONFIG = {
        LOCAL_STORAGE_AUTH_TOKEN_KEY: 'authToken',
        LOCAL_STORAGE_USER_EMAIL_KEY: 'loggedInUserEmail',
        // BASE_URL pode ser necessária se suas APIs não forem relativas
        API_BASE_URL: window.location.origin + '/.netlify/functions', // Exemplo para Netlify Functions
        // OPENWEATHER_API_KEY: 'SUA_CHAVE_API_OPENWEATHERMAP_AQUI' // Se usar globalmente
    };

    // --- Funções Utilitárias Globais ---

    /**
     * Atualiza a exibição de data e hora no cabeçalho.
     */
    function updateDateTime() {
        if (currentDatetimeSpan) {
            currentDatetimeSpan.textContent = new Date().toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'medium' });
        }
    }

    /**
     * Carrega as informações do usuário logado (ex: nome/email) e as exibe no cabeçalho.
     * Assume que o email/nome do usuário está salvo no localStorage.
     * No futuro, esta função faria uma chamada a uma API de autenticação.
     */
    function loadUserInfo() {
        if (userInfoSpan) {
            const userEmail = localStorage.getItem(CONFIG.LOCAL_STORAGE_USER_EMAIL_KEY);
            userInfoSpan.textContent = userEmail || "Visitante";
        }
    }

    /**
     * Exibe uma mensagem de feedback na tela.
     * @param {string} message - A mensagem a ser exibida.
     * @param {string} type - Tipo da mensagem ('success', 'error', 'info', 'warning').
     * @param {number} duration - Duração em milissegundos para a mensagem desaparecer (padrão: 5000ms).
     */
    function showFeedback(message, type = 'info', duration = 5000) {
        if (!feedbackDiv) {
            console.warn("Elemento de feedback (#feedback) não encontrado no DOM. Exibindo alerta.");
            alert(message); // Fallback para alerta se o elemento não existir
            return;
        }
        feedbackDiv.textContent = message;
        // Limpa todas as classes de tipo antes de adicionar a nova
        feedbackDiv.className = 'p-4 mb-6 rounded-md border font-medium text-center'; // Reset
        feedbackDiv.classList.add(type); // Adiciona a classe de tipo
        feedbackDiv.classList.remove('hidden'); // Garante que esteja visível

        setTimeout(() => {
            feedbackDiv.classList.add('hidden'); // Esconde a mensagem após a duração
        }, duration);
    }

    /**
     * Define o link de navegação ativo na barra lateral e atualiza o título da página.
     * Com base no `window.location.pathname`.
     */
    function setActiveNavigationLink() {
        const currentPagePath = window.location.pathname; // Ex: /public/diariodeobras.html

        navLinks.forEach(link => {
            const linkHref = link.getAttribute('href'); // Ex: diario_de_obras.html
            
            // Remove a classe 'active' de todos os links primeiro
            link.classList.remove('active');

            // Verifica se o link corresponde à página atual
            if (linkHref && currentPagePath.includes(linkHref)) { // Adicionado linkHref &&
                link.classList.add('active');
                // Atualiza o título da página no cabeçalho
                if (pageTitleH1 && link.dataset.pageTitle) {
                    pageTitleH1.textContent = link.dataset.pageTitle;
                }
                // Adiciona classe 'active' ao pai (se for um submenu)
                const parentUl = link.closest('ul');
                if (parentUl) {
                    const parentSectionTitle = parentUl.previousElementSibling; // span.section-title-sidebar
                    if (parentSectionTitle && parentSectionTitle.tagName === 'SPAN') {
                        const parentLi = parentSectionTitle.closest('li');
                        if (parentLi && parentLi.querySelector('a.nav-link')) { // Se a categoria tiver um link principal (ex: Dashboard)
                            // Não marca o span como ativo, mas o link principal da categoria se for o caso
                        }
                    }
                }
            }
        });
         // Se nenhum link de navegação corresponder à página atual, pode ser um sub-item
        if (pageTitleH1 && !pageTitleH1.textContent) {
            // Tenta pegar o título da tag <title>
            pageTitleH1.textContent = document.title.split(' - ')[0] || 'Sistema Studio 57';
        }
    }

    /**
     * Função genérica para chamadas de API.
     * Inclui tratamento de token de autenticação e feedback.
     * @param {string} endpoint - O caminho da API (ex: '/funcionarios').
     * @param {object} options - Opções para o fetch (method, headers, body, etc.).
     * @returns {Promise<any>} - A resposta da API (JSON ou texto).
     * @throws {Error} - Em caso de falha na requisição ou resposta HTTP não OK.
     */
    async function apiFetch(endpoint, options = {}) {
        // Garante que o endpoint comece com '/' para que a URL base funcione corretamente.
        const formattedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
        const url = `${CONFIG.API_BASE_URL}${formattedEndpoint}`;
        const token = localStorage.getItem(CONFIG.LOCAL_STORAGE_AUTH_TOKEN_KEY);
        
        const headers = {
            // Se o corpo for FormData (para uploads de arquivos), não defina 'Content-Type'
            ...(options.body instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
            ...options.headers,
        };

        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        } else {
            console.warn("Token de autenticação não encontrado. Algumas ações podem falhar.");
        }

        try {
            const response = await fetch(url, { ...options, headers });

            if (!response.ok) {
                let errorData = { message: `Erro HTTP: ${response.status} ${response.statusText}`, status: response.status };
                try {
                    const responseBody = await response.json();
                    errorData.message = responseBody.message || responseBody.error || errorData.message;
                } catch (e) { /* Mantém a mensagem de erro HTTP se o corpo não for JSON */ }

                if (response.status === 401) { // Unauthorized
                    showFeedback("Sessão expirada ou inválida. Por favor, faça login novamente.", 'error', 4000);
                    setTimeout(() => window.location.href = 'login.html', 3000);
                }
                throw new Error(errorData.message);
            }

            if (response.status === 204) return null; // No Content (para DELETE, por exemplo)

            const contentType = response.headers.get("content-type");
            if (contentType && contentType.includes("application/json")) {
                return await response.json();
            }
            return await response.text(); // Para respostas não-JSON
        } catch (error) {
            console.error('Erro na API:', error.message, 'Endpoint:', formattedEndpoint);
            // Evita mostrar feedback duplicado se já for um erro de autenticação ou de rede
            if (!error.message.includes("Sessão expirada") && !error.message.includes("Token") && !error.message.includes("Network request failed")) {
                showFeedback(`Erro ao comunicar com o servidor: ${error.message}`, 'error');
            }
            throw error; // Re-throw para que o chamador possa tratar se necessário
        }
    }


    // --- Inicialização de Funções Comuns ---
    updateDateTime(); // Chama imediatamente
    setInterval(updateDateTime, 1000); // Atualiza a cada segundo

    loadUserInfo(); // Carrega info do usuário

    setActiveNavigationLink(); // Marca o link ativo na sidebar

    // Listener para o botão de logout (se existir)
    logoutLink?.addEventListener('click', (e) => {
        e.preventDefault();
        localStorage.removeItem(CONFIG.LOCAL_STORAGE_AUTH_TOKEN_KEY);
        localStorage.removeItem(CONFIG.LOCAL_STORAGE_USER_EMAIL_KEY);
        showFeedback("Logout realizado com sucesso!", 'info');
        setTimeout(() => window.location.href = 'login.html', 1500);
    });

    // Exporta as funções e a constante CONFIG para uso em outros scripts
    window.commonUi = {
        CONFIG,
        updateDateTime,
        loadUserInfo,
        showFeedback,
        apiFetch,
        setActiveNavigationLink // Exportar para que páginas específicas possam chamá-lo
    };
});
