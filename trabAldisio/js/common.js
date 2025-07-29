// Script comum para inicialização das páginas
document.addEventListener('DOMContentLoaded', function() {
    CartManager.updateCartCounter();
    
    updateAuthUI();
});

function updateAuthUI() {
    const isLoggedIn = AuthManager.isLoggedIn();
    const loginLink = document.getElementById('loginLink');
    const registerLink = document.getElementById('registerLink');
    const userMenu = document.getElementById('userMenu');
    const userNameNav = document.getElementById('userNameNav');
    
    const authLinks = document.querySelectorAll('a[href*="signIn"], a[href*="signUp"]');
    
    if (isLoggedIn) {
        if (loginLink) loginLink.style.display = 'none';
        if (registerLink) registerLink.style.display = 'none';
        if (userMenu) {
            userMenu.style.display = 'block';
            loadUserName();
        }
        
        authLinks.forEach(link => {
            if (link.href.includes('signIn') || link.href.includes('signUp')) {
                const parent = link.parentElement;
                if (parent && !parent.querySelector('.user-status')) {
                    parent.innerHTML = '<div class="user-status" style="display: flex; align-items: center; gap: 10px;"><span style="color: #27ae60; font-size: 14px;"><i class="fa-solid fa-user"></i> Logado</span><button onclick="logout()" style="background: #e74c3c; color: white; border: none; padding: 5px 10px; border-radius: 3px; cursor: pointer; font-size: 12px;">Sair</button></div>';
                }
            }
        });
    } else {
        if (loginLink) loginLink.style.display = 'block';
        if (registerLink) registerLink.style.display = 'block';
        if (userMenu) userMenu.style.display = 'none';
        
        const userStatusElements = document.querySelectorAll('.user-status');
        userStatusElements.forEach(element => {
            const parent = element.parentElement;
            if (parent) {
                parent.innerHTML = '<a href="../auth/signIn.html">Entrar</a>';
            }
        });
    }
}

async function loadUserName() {
    try {
        const userInfo = await ApiClient.getPerfil();
        const userNameNav = document.getElementById('userNameNav');
        if (userNameNav && userInfo.nome) {
            userNameNav.textContent = 'Olá, ' + userInfo.nome;
        }
    } catch (error) {
        console.error('Erro ao carregar nome do usuário:', error);
        AuthManager.removeToken();
        updateAuthUI();
    }
}

function logout() {
    if (confirm('Deseja realmente sair?')) {
        AuthManager.logout();
    }
}

function addToCart(id, nome, valor, imagem, event) {
    if (event) {
        event.preventDefault();
        event.stopPropagation();
    }
    
    const product = {
        id: id,
        nome: nome,
        valor: valor,
        url_imagem: imagem
    };
    
    CartManager.addItem(product);
    NotificationManager.show(nome + ' adicionado ao carrinho!', 'success');
}

function formatCurrency(value) {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    }).format(value);
}

setInterval(() => {
    CartManager.updateCartCounter();
}, 2000);
