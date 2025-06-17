// Inicializa o Nhost com as credenciais do seu projeto
const NHOST_SUBDOMAIN = 'ntppmtmghbomqfvyprrq'; // Subdomínio do seu projeto Nhost
const NHOST_REGION = 'sa-east-1'; // Região do seu projeto Nhost

const nhost = new Nhost({
    subdomain: NHOST_SUBDOMAIN,
    region: NHOST_REGION
});

document.addEventListener('DOMContentLoaded', () => {
    const userInfoSpan = document.getElementById('user-info')?.querySelector('span');
    const currentDatetimeSpan = document.getElementById('current-datetime');
    const logoutLink = document.getElementById('logout-link');
    const nhostUserIdSpan = document.getElementById('nhost-user-id');
    const nhostUserEmailSpan = document.getElementById('nhost-user-email');

    let dateTimeInterval;

    // --- Função para Atualizar Data/Hora no Cabeçalho ---
    function updateDateTime() {
        if (!currentDatetimeSpan) return;
        const now = new Date();
        const formattedDate = now.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
        const formattedTime = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        currentDatetimeSpan.textContent = `${formattedDate} ${formattedTime}`;
    }

    // --- Função para Carregar Informações do Usuário Nhost ---
    function loadNhostUserInfo() {
        // Verifica se o usuário está autenticado
        const user = nhost.auth.getUser();

        if (user) {
            // Exibe o nome de usuário (se disponível no profile do Nhost) ou o email
            if (userInfoSpan) {
                userInfoSpan.textContent = user.displayName || user.email;
            }
            // Exibe o ID e o email do Nhost
            if (nhostUserIdSpan) {
                nhostUserIdSpan.textContent = user.id;
            }
            if (nhostUserEmailSpan) {
                nhostUserEmailSpan.textContent = user.email;
            }
            console.log("Usuário Nhost logado:", user);

            // TODO: Futuramente, buscar dados da public.funcionarios_id associado ao user.id
            // para mostrar o nome completo do funcionário em vez do email do Nhost.
        } else {
            // Se não há usuário logado, redireciona para a página de login
            console.log("Nenhum usuário logado. Redirecionando para login.");
            window.location.href = 'index.html';
        }
    }

    // --- Lógica de Logout ---
    if (logoutLink) {
        logoutLink.addEventListener('click', async (event) => {
            event.preventDefault(); // Previne o comportamento padrão do link
            try {
                const { error } = await nhost.auth.signOut();
                if (error) {
                    console.error("Erro ao fazer logout:", error);
                    alert("Erro ao fazer logout. Tente novamente.");
                } else {
                    console.log("Logout bem-sucedido. Redirecionando para a página de login.");
                    window.location.href = 'index.html'; // Redireciona para a página de login
                }
            } catch (e) {
                console.error("Erro inesperado durante o logout:", e);
                alert("Ocorreu um erro inesperado. Tente novamente.");
            }
        });
    }

    // --- Inicialização da Página ---
    function initializePage() {
        // Verifica se o usuário está autenticado imediatamente ao carregar a página
        if (!nhost.auth.isAuthenticated()) {
            console.log("Usuário não autenticado. Redirecionando para index.html.");
            window.location.href = 'index.html';
            return; // Para a execução para evitar erros
        }

        // Atualiza data e hora
        updateDateTime();
        if (dateTimeInterval) clearInterval(dateTimeInterval);
        dateTimeInterval = setInterval(updateDateTime, 1000);

        // Carrega e exibe informações do usuário
        loadNhostUserInfo();

        console.log("Página Inicial carregada e pronta.");
    }

    // Inicializa a página quando o DOM estiver completamente carregado
    initializePage(); // Chamada direta, pois a verificação de autenticação é imediata.
});