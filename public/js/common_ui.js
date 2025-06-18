// public/js/common_ui.js

document.addEventListener('DOMContentLoaded', () => {
    let userInfoSpan = document.getElementById('user-info')?.querySelector('span');
    let currentDatetimeSpan = document.getElementById('current-datetime');
    let pageTitleH1 = document.getElementById('page-title');
    let logoutLink = document.getElementById('logout-link');
    let navLinks = document.querySelectorAll('.nav-menu a.nav-link');
    let feedbackDiv = document.getElementById('feedback');

    const CONFIG = {
        LOCAL_STORAGE_AUTH_TOKEN_KEY: 'authToken',
        LOCAL_STORAGE_USER_EMAIL_KEY: 'loggedInUserEmail',
        API_BASE_URL: window.location.origin + '/.netlify/functions',
    };

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
        feedbackDiv.className = 'p-4 mb-6 rounded-md border font-medium text-center';
        feedbackDiv.classList.add(type);
        feedbackDiv.classList.remove('hidden');

        setTimeout(() => {
            feedbackDiv.classList.add('hidden');
        }, duration);
    }

    function checkAuth() {
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
        const cleanEndpoint = endpoint.startsWith('/') ? endpoint.substring(1) : endpoint;
        const url = `${CONFIG.API_BASE_URL}/${cleanEndpoint}`;

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
            console.error(`Erro na API (${url}):`, error); // Correção aqui
            if (!error.message.includes("Sessão expirada") && !error.message.includes("Token") && !error.message.includes("Network request failed")) {
                showFeedback(`Erro ao comunicar com o servidor: ${error.message}`, 'error');
            }
            throw error;
        }
    }

    async function loadReusableComponents() {
        const headerPlaceholder = document.getElementById('header-placeholder');
        const sidebarPlaceholder = document.getElementById('sidebar-placeholder');

        if (headerPlaceholder) {
            try {
                const headerResponse = await fetch('/includes/header.html'); 
                headerPlaceholder.innerHTML = await headerResponse.text();
            } catch (error) {
                console.error("Erro ao carregar header.html:", error);
                headerPlaceholder.innerHTML = "<header class='page-header bg-red-100 text-red-700 p-4'>Erro ao carregar cabeçalho</header>";
            }
        }
        if (sidebarPlaceholder) {
            try {
                const sidebarResponse = await fetch('/includes/sidebar.html'); 
                sidebarPlaceholder.innerHTML = await sidebarResponse.text();
            } catch (error) {
                console.error("Erro ao carregar sidebar.html:", error);
                sidebarPlaceholder.innerHTML = "<nav class='sidebar bg-red-100 text-red-700 p-4'>Erro ao carregar menu lateral</nav>";
            }
        }

        setTimeout(() => {
            userInfoSpan = document.getElementById('user-info')?.querySelector('span');
            currentDatetimeSpan = document.getElementById('current-datetime');
            pageTitleH1 = document.getElementById('page-title');
            logoutLink = document.getElementById('logout-link');
            navLinks = document.querySelectorAll('.nav-menu a.nav-link');

            updateDateTime();
            loadUserInfo();
            setActiveNavigationLink();

            if (logoutLink) {
                logoutLink.addEventListener('click', (e) => {
                    e.preventDefault();
                    localStorage.removeItem(CONFIG.LOCAL_STORAGE_AUTH_TOKEN_KEY);
                    localStorage.removeItem(CONFIG.LOCAL_STORAGE_USER_EMAIL_KEY);
                    showFeedback("Logout realizado com sucesso!", 'info');
                    setTimeout(() => window.location.href = 'login.html', 1500);
                });
            }
        }, 100);
    }

    window.commonUi = {
        CONFIG,
        updateDateTime,
        loadUserInfo,
        showFeedback,
        apiFetch,
        setActiveNavigationLink,
        checkAuth,
        loadReusableComponents
    };

    loadReusableComponents();
});