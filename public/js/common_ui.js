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
        API_BASE_URL: window.location.origin + '/.netlify/functions', // Exemplo para Netlify Functions
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
        feedbackDiv.className = 'p-4 mb-6 rounded-md border font-medium text-center'; // Reset
        feedbackDiv.classList.add(type); // Adiciona a classe de tipo
        feedbackDiv.classList.remove('hidden'); // Garante que esteja visível

        setTimeout(() => {
            feedbackDiv.classList.add('hidden'); // Esconde a mensagem após a duração
        }, duration);
    }

    /**
     * Verifica o estado de autenticação do usuário. Se não autenticado, redireciona para login.
     * @returns {boolean} - True se autenticado, false caso contrário.
     */
    function checkAuth() {
        const token = localStorage.getItem(CONFIG.LOCAL_STORAGE_AUTH_TOKEN_KEY);
        if (!token) {
            showFeedback("Você não está autenticado. Redirecionando para login...", 'error', 4000);
            setTimeout(() => {
                window.location.href = 'login.html'; // Ajuste para o nome da sua página de login
            }, 3000);
            return false;
        }
        return true;
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
            if (linkHref && currentPagePath.includes(linkHref)) {
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
                        // Não marca o span como ativo, mas o link principal da categoria se for o caso
                    }
                }
            }
        });
         // Se nenhum link de navegação corresponder à página atual, tenta pegar do <title>
        if (pageTitleH1 && !pageTitleH1.textContent) {
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
        const formattedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
        const url = `${CONFIG.API_BASE_URL}${formattedEndpoint}`;
        const token = localStorage.getItem(CONFIG.LOCAL_STORAGE_AUTH_TOKEN_KEY);
        
        const headers = {
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
            if (!error.message.includes("Sessão expirada") && !error.message.includes("Token") && !error.message.includes("Network request failed")) {
                showFeedback(`Erro ao comunicar com o servidor: ${error.message}`, 'error');
            }
            throw error; // Re-throw para que o chamador possa tratar se necessário
        }
    }

    /**
     * Carrega dinamicamente o cabeçalho e a barra lateral de arquivos HTML separados.
     * Esta função será chamada por cada página principal.
     */
    async function loadReusableComponents() {
        const headerPlaceholder = document.getElementById('header-placeholder');
        const sidebarPlaceholder = document.getElementById('sidebar-placeholder');

        if (headerPlaceholder) {
            try {
                const headerResponse = await fetch('includes/header.html');
                headerPlaceholder.innerHTML = await headerResponse.text();
            } catch (error) {
                console.error("Erro ao carregar header.html:", error);
                headerPlaceholder.innerHTML = "<header class='page-header bg-red-100 text-red-700 p-4'>Erro ao carregar cabeçalho</header>";
            }
        }
        if (sidebarPlaceholder) {
            try {
                const sidebarResponse = await fetch('includes/sidebar.html');
                sidebarPlaceholder.innerHTML = await sidebarResponse.text();
            } catch (error) {
                console.error("Erro ao carregar sidebar.html:", error);
                sidebarPlaceholder.innerHTML = "<nav class='sidebar bg-red-100 text-red-700 p-4'>Erro ao carregar menu lateral</nav>";
            }
        }
        // Após carregar os componentes, as funções do common_ui precisam ser executadas para eles.
        // Já estão em DOMContentLoaded, mas podemos chamar as específicas aqui para garantir.
        // No entanto, como elas dependem de seletores já estarem no DOM, o ideal é que elas
        // rodem após o carregamento do common_ui.js e os elementos já existam.
        // A lógica do common_ui.js já tem um DOMContentLoaded.

        // Após carregar os componentes, re-executa a lógica de ativação de links, pois os links agora estão no DOM
        setActiveNavigationLink();
        updateDateTime(); // Re-executa para garantir que a hora apareça
        loadUserInfo(); // Re-executa para garantir que o usuário apareça

        // Ajuste o link de voltar no header, se aplicável a esta página específica
        const backLink = document.querySelector('.page-header .back-link');
        if (backLink) {
            // Este backLink será tratado individualmente por cada página
            // para definir seu href e visibilidade.
        }
    }


    // --- Inicialização de Funções Comuns para TODAS as páginas ---
    // Estas funções são chamadas diretamente no DOMContentLoaded global do common_ui.js
    // para garantir que o header/sidebar sejam carregados e a UI comum funcione.
    loadReusableComponents(); // Inicia o carregamento dos componentes

    // Exporta as funções e a constante CONFIG para uso em outros scripts
    window.commonUi = {
        CONFIG,
        updateDateTime,
        loadUserInfo,
        showFeedback,
        apiFetch,
        setActiveNavigationLink,
        checkAuth, // Exportado para outras páginas poderem usar
        loadReusableComponents // Exportado para páginas que precisam coordenar o carregamento
    };
});
