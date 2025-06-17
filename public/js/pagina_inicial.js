// Inicializa o Nhost com as credenciais do seu projeto
const NHOST_SUBDOMAIN = 'ntppmtmghbomqfvyprrq'; // Subdomínio do seu projeto Nhost
const NHOST_REGION = 'sa-east-1'; // Região do seu projeto Nhost

const nhost = new Nhost({
    subdomain: NHOST_SUBDOMAIN,
    region: NHOST_REGION
});

document.addEventListener('DOMContentLoaded', () => {
    const userInfoSpan = document.getElementById('user-info')?.querySelector('span'); //
    const currentDatetimeSpan = document.getElementById('current-datetime'); //
    const logoutLink = document.getElementById('logout-link'); //
    const nhostUserIdSpan = document.getElementById('nhost-user-id'); //
    const nhostUserEmailSpan = document.getElementById('nhost-user-email'); //

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
    async function loadNhostUserInfo() { // Tornar assíncrona para await no getUserSession
        // Espera a sessão do Nhost carregar
        const { session, error } = await nhost.auth.getUserSession(); //

        if (error) {
            console.error("Erro ao obter sessão Nhost:", error);
            // Se houver erro ao obter a sessão, assume que não está autenticado
            console.log("Sessão Nhost com erro. Redirecionando para login.");
            window.location.href = '/index.html'; // Caminho absoluto
            return;
        }

        const user = session?.user; //

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
            // Se não há usuário logado na sessão, redireciona para a página de login
            console.log("Nenhum usuário logado. Redirecionando para login.");
            window.location.href = '/index.html'; // Caminho absoluto
        }
    }

    // --- Lógica de Logout ---
    if (logoutLink) {
        logoutLink.addEventListener('click', async (event) => {
            event.preventDefault(); // Previne o comportamento padrão do link
            try {
                const { error } = await nhost.auth.signOut(); //
                if (error) {
                    console.error("Erro ao fazer logout:", error);
                    alert("Erro ao fazer logout. Tente novamente.");
                } else {
                    console.log("Logout bem-sucedido. Redirecionando para a página de login.");
                    window.location.href = '/index.html'; // Caminho absoluto
                }
            } catch (e) {
                console.error("Erro inesperado durante o logout:", e);
                alert("Ocorreu um erro inesperado. Tente novamente.");
            }
        });
    }

    // --- Inicialização da Página ---
    async function initializePage() { // Tornar assíncrona
        // Primeiro, tenta carregar as informações do usuário.
        // A função loadNhostUserInfo já lida com o redirecionamento se não houver sessão.
        await loadNhostUserInfo(); // Espera a função terminar de verificar a autenticação

        // Se o código chegou até aqui, significa que loadNhostUserInfo encontrou um usuário logado
        // ou já redirecionou. Não precisamos de uma verificação duplicada de `isAuthenticated` aqui,
        // pois `loadNhostUserInfo` já faz isso de forma mais completa com `getUserSession`.

        // Atualiza data e hora
        updateDateTime();
        if (dateTimeInterval) clearInterval(dateTimeInterval);
        dateTimeInterval = setInterval(updateDateTime, 1000);

        console.log("Página Inicial carregada e pronta.");
    }

    // Inicializa a página quando o DOM estiver completamente carregado
    initializePage(); // Chamada direta e assíncrona
});