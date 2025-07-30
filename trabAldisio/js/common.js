document.addEventListener('DOMContentLoaded', function() {
    CartManager.updateCartCounter();
    
    updateAuthUI();
});

function updateAuthUI() {
    const isLoggedIn = AuthManager.isLoggedIn();
    const loginLink = document.getElementById('loginLink');
    const registerLink = document.getElementById('registerLink');
    const userMenu = document.getElementById('userMenu');

    if (isLoggedIn) {
        if (loginLink) loginLink.style.display = 'none';
        if (registerLink) registerLink.style.display = 'none';
        if (userMenu) userMenu.style.display = 'flex';
    } else {
        if (loginLink) loginLink.style.display = 'inline-block';
        if (registerLink) registerLink.style.display = 'inline-block';
        if (userMenu) userMenu.style.display = 'none';
    }
}

function logout() {
    if (confirm('Deseja realmente sair?')) {
        AuthManager.logout();
    }
}

setInterval(() => {
    CartManager.updateCartCounter();
}, 2000);
