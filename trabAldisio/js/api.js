// Configuração da API
const API_BASE_URL = 'http://127.0.0.1:5000';

class ApiClient {
    static getHeaders(includeAuth = false) {
        const headers = {
            'Content-Type': 'application/json'
        };
        
        if (includeAuth) {
            const token = localStorage.getItem('token');
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }
        }
        
        return headers;
    }

    static async request(endpoint, options = {}) {
        const url = `${API_BASE_URL}${endpoint}`;
        
        try {
            const response = await fetch(url, {
                ...options,
                headers: {
                    ...ApiClient.getHeaders(options.auth),
                    ...options.headers
                }
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.erro || `HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    }

    static async login(email, senha) {
        return await ApiClient.request('/login', {
            method: 'POST',
            body: JSON.stringify({ email, senha })
        });
    }

    static async registrar(nome, email, senha) {
        return await ApiClient.request('/usuarios', {
            method: 'POST',
            body: JSON.stringify({ nome, email, senha })
        });
    }

    static async getPerfil() {
        return await ApiClient.request('/perfil', {
            method: 'GET',
            auth: true
        });
    }
    static async getCards() {
        return await ApiClient.request('/cards');
    }

    static async getCardById(id) {
        return await ApiClient.request(`/cards/${id}`);
    }

    static async getCardsByCategoria(categoria) {
        return await ApiClient.request(`/cards/categoria/${categoria}`);
    }

    static async getCategorias() {
        return await ApiClient.request('/categorias');
    }
}

class AuthManager {
    static saveToken(token) {
        localStorage.setItem('token', token);
    }

    static getToken() {
        return localStorage.getItem('token');
    }

    static removeToken() {
        localStorage.removeItem('token');
    }

    static isLoggedIn() {
        return !!AuthManager.getToken();
    }

    static async logout() {
        AuthManager.removeToken();
        window.location.href = '../auth/signIn.html';
    }

    static async requireAuth() {
        if (!AuthManager.isLoggedIn()) {
            window.location.href = '../auth/signIn.html';
            return false;
        }
        return true;
    }
}

class CartManager {
    static getCart() {
        const cart = localStorage.getItem('cart');
        return cart ? JSON.parse(cart) : [];
    }

    static saveCart(cart) {
        localStorage.setItem('cart', JSON.stringify(cart));
    }

    static addItem(product) {
        const cart = CartManager.getCart();
        const existingItem = cart.find(item => item.id === product.id);

        if (existingItem) {
            existingItem.quantidade += 1;
        } else {
            cart.push({
                ...product,
                quantidade: 1
            });
        }

        CartManager.saveCart(cart);
        CartManager.updateCartCounter();
    }

    static removeItem(productId) {
        const cart = CartManager.getCart();
        const updatedCart = cart.filter(item => item.id !== productId);
        CartManager.saveCart(updatedCart);
        CartManager.updateCartCounter();
    }

    static updateQuantity(productId, newQuantity) {
        if (newQuantity <= 0) {
            CartManager.removeItem(productId);
            return;
        }

        const cart = CartManager.getCart();
        const item = cart.find(item => item.id === productId);
        
        if (item) {
            item.quantidade = newQuantity;
            CartManager.saveCart(cart);
            CartManager.updateCartCounter();
        }
    }

    static clearCart() {
        localStorage.removeItem('cart');
        CartManager.updateCartCounter();
    }

    static getTotal() {
        const cart = CartManager.getCart();
        return cart.reduce((total, item) => total + (item.valor * item.quantidade), 0);
    }

    static getItemCount() {
        const cart = CartManager.getCart();
        return cart.reduce((total, item) => total + item.quantidade, 0);
    }

    static updateCartCounter() {
        const counter = document.querySelector('.cart-counter');
        if (counter) {
            const count = CartManager.getItemCount();
            counter.textContent = count;
            counter.style.display = count > 0 ? 'block' : 'none';
        }
    }
}

class FormValidator {
    static validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    static validatePassword(password) {
        return password.length >= 6;
    }

    static validateName(name) {
        return name.trim().length >= 2;
    }

    static showError(fieldId, message) {
        const field = document.getElementById(fieldId);
        const errorDiv = document.getElementById(`${fieldId}-error`);
        
        if (field) {
            field.classList.add('input-error');
            field.classList.remove('input-success');
        }
        
        if (errorDiv) {
            errorDiv.textContent = message;
            errorDiv.style.display = 'block';
        }
    }

    static showSuccess(fieldId) {
        const field = document.getElementById(fieldId);
        const errorDiv = document.getElementById(`${fieldId}-error`);
        
        if (field) {
            field.classList.remove('input-error');
            field.classList.add('input-success');
        }
        
        if (errorDiv) {
            errorDiv.style.display = 'none';
        }
    }

    static clearValidation(fieldId) {
        const field = document.getElementById(fieldId);
        const errorDiv = document.getElementById(`${fieldId}-error`);
        
        if (field) {
            field.classList.remove('input-error', 'input-success');
        }
        
        if (errorDiv) {
            errorDiv.style.display = 'none';
        }
    }
}

class NotificationManager {
    static show(message, type = 'success') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        
        const style = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 20px;
            border-radius: 5px;
            color: white;
            font-weight: bold;
            z-index: 10000;
            max-width: 300px;
            animation: slideIn 0.3s ease-out;
        `;
        
        const colors = {
            success: 'background-color: #27ae60;',
            error: 'background-color: #e74c3c;',
            warning: 'background-color: #f39c12;',
            info: 'background-color: #3498db;'
        };
        
        notification.style.cssText = style + colors[type];
        
        if (!document.querySelector('#notification-styles')) {
            const styleSheet = document.createElement('style');
            styleSheet.id = 'notification-styles';
            styleSheet.textContent = `
                @keyframes slideIn {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
                @keyframes slideOut {
                    from { transform: translateX(0); opacity: 1; }
                    to { transform: translateX(100%); opacity: 0; }
                }
            `;
            document.head.appendChild(styleSheet);
        }
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease-out';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 5000);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    CartManager.updateCartCounter();
});
