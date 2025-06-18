// public/js/common_ui.js

document.addEventListener('DOMContentLoaded', () => {
    // --- Seletores Comuns ---
    let userInfoSpan = document.getElementById('user-info')?.querySelector('span');
    let currentDatetimeSpan = document.getElementById('current-datetime');
    let pageTitleH1 = document.getElementById('page-title');
    let logoutLink = document.getElementById('logout-link');
    let navLinks = document.querySelectorAll('.nav-menu a.nav-link');
    let feedbackDiv = document.getElementById('feedback'); // O elemento #feedback global

    // --- Configurações ---
    const CONFIG = {
        LOCAL_STORAGE_AUTH_TOKEN_KEY: 'authToken',
        LOCAL_STORAGE_USER_EMAIL_KEY: 'loggedInUserEmail',
        API_BASE_URL: window.location.origin + '/.netlify/functions', // Exemplo para Netlify Functions
    };

    // --- Funções Utilitárias Globais ---

    function updateDateTime() {
        if (currentDatetimeSpan) {
            currentDatetimeSpan.textContent = new Date().toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'medium' });
        }
    }

    function loadUserInfo() {
        if (userInfoSpan) {
            const userEmail = localStorage.getItem(CONFIG.LOCAL_STORAGE_USER_EMAIL_KEY);
            userInfoSpan.textContent = userEmail || "Visitante";
        }
    }

    function showFeedback(message, type = 'info', duration = 5000) {
        if (!feedbackDiv) {
            console.warn("Elemento de feedback (#feedback) não encontrado no DOM. Exibindo alerta.");
            alert(message);
            return;
        }
        feedbackDiv.textContent = message;
        feedbackDiv.className = 'p-4 mb-6 rounded-md border font-medium text-center'; // Reset
        feedbackDiv.classList.add(type);
        feedbackDiv.classList.remove('hidden');

        setTimeout(() => {
            feedbackDiv.classList.add('hidden');
        }, duration);
    }

    /**
     * Verifica o estado de autenticação do usuário. Se não autenticado, redireciona para login.
     * ATENÇÃO: Temporariamente desabilitado para facilitar o desenvolvimento.
     * REMOVER/AJUSTAR QUANDO O SISTEMA DE LOGIN FOR IMPLEMENTADO.
     * @returns {boolean} - True se autenticado, false caso contrário.
     */
    function checkAuth() {
        // const token = localStorage.getItem(CONFIG.LOCAL_STORAGE_AUTH_TOKEN_KEY);
        // if (!token) {
        //     showFeedback("Você não está autenticado. Redirecionando para login...", 'error', 4000);
        //     setTimeout(() => {
        //         window.location.href = 'login.html';
        //     }, 3000);
        //     return false;
        // }
        // return true;

        // RETORNA SEMPRE TRUE TEMPORARIAMENTE PARA DESENVOLVIMENTO
        return true; 
    }


    function setActiveNavigationLink() {
        const currentPath = window.location.pathname;
        const currentFileName = currentPath.split('/').pop();

        navLinks.forEach(link => {
            const linkHref = link.getAttribute('href');

            link.classList.remove('active');

            if (linkHref && currentFileName.includes(linkHref.split('/').pop())) {
                link.classList.add('active');
                if (pageTitleH1 && link.dataset.pageTitle) {
                    pageTitleH1.textContent = link.dataset.pageTitle;
                }
            }
        });
        if (pageTitleH1 && !pageTitleH1.textContent && document.title) {
            pageTitleH1.textContent = document.title.split(' - ')[0] || 'Sistema Studio 57';
        }
    }

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
                } catch (e) { /* silent */ }

                if (response.status === 401) {
                    showFeedback("Sessão expirada ou inválida. Por favor, faça login novamente.", 'error', 4000);
                    setTimeout(() => window.location.href = 'login.html', 3000);
                }
                throw new Error(errorData.message);
            }

            if (response.status === 204) return null;

            const contentType = response.headers.get("content-type");
            if (contentType && contentType.includes("application/json")) {
                return await response.json();
            }
            return await response.text();
        } catch (error) {
            console.error('Erro na API:', error.message, 'Endpoint:', formattedEndpoint);
            if (!error.message.includes("Sessão expirada") && !error.message.includes("Token") && !error.message.includes("Network request failed")) {
                showFeedback(`Erro ao comunicar com o servidor: ${error.message}`, 'error');
            }
            throw error;
        }
    }

    /**
     * Carrega dinamicamente o cabeçalho e a barra lateral de arquivos HTML separados.
     * Insere-os nos placeholders no DOM.
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

        // Após carregar os componentes, inicializa suas funcionalidades globais
        // com um pequeno atraso para garantir que o DOM esteja completamente atualizado.
        setTimeout(() => {
            // Re-seletores para garantir que os elementos carregados dinamicamente sejam encontrados
            // e atualizar as referências das variáveis de escopo superior
            userInfoSpan = document.getElementById('user-info')?.querySelector('span');
            currentDatetimeSpan = document.getElementById('current-datetime');
            pageTitleH1 = document.getElementById('page-title');
            logoutLink = document.getElementById('logout-link');
            navLinks = document.querySelectorAll('.nav-menu a.nav-link'); // Re-seleciona todos os links

            // Re-executa as funções de inicialização da UI Comum
            updateDateTime();
            loadUserInfo();
            setActiveNavigationLink(); // Ativa o link correto na sidebar carregada

            // Re-adiciona listener de logout se o elemento foi recarregado
            logoutLink?.addEventListener('click', (e) => {
                e.preventDefault();
                localStorage.removeItem(CONFIG.LOCAL_STORAGE_AUTH_TOKEN_KEY);
                localStorage.removeItem(CONFIG.LOCAL_STORAGE_USER_EMAIL_KEY);
                showFeedback("Logout realizado com sucesso!", 'info');
                setTimeout(() => window.location.href = 'login.html', 1500);
            });
        }, 100); // Pequeno atraso
    }


    // Exporta as funções e a constante CONFIG para uso em outros scripts
    window.commonUi = {
        CONFIG,
        updateDateTime,
        loadUserInfo,
        showFeedback,
        apiFetch,
        setActiveNavigationLink,
        checkAuth,
        loadReusableComponents // Continua exportando para páginas que precisam coordenar
    };

    // Chama o carregamento dos componentes reutilizáveis assim que o common_ui.js estiver pronto
    loadReusableComponents();
});
