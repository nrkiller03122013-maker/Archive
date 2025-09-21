// Authentication utilities
const AuthManager = {
  // Check if user is logged in
  isLoggedIn() {
    const token = localStorage.getItem('auth_token');
    const user = localStorage.getItem('user');
    return !!(token && user);
  },

  // Get current user data
  getCurrentUser() {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  // Get auth token
  getToken() {
    return localStorage.getItem('auth_token');
  },

  // Logout user
  logout() {
    // Clear authentication data
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
    
    // Mark that user was logged out
    sessionStorage.setItem('wasLoggedOut', 'true');
    
    // Clear browser history to prevent back button access
    if (window.history && window.history.pushState) {
      // Replace current page in history
      window.history.replaceState(null, null, 'login.html');
      // Add login page to history
      window.history.pushState(null, null, 'login.html');
      
      // Handle back button attempts
      window.addEventListener('popstate', function(event) {
        window.history.pushState(null, null, 'login.html');
      });
    }
    
    // Redirect to login page
    window.location.replace('login.html');
  },

  // Verify token with server (optional)
  async verifyToken() {
    const token = this.getToken();
    if (!token) return false;

    try {
      const response = await fetch('http://localhost:4000/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (!response.ok) {
        this.logout();
        return false;
      }
      
      const data = await response.json();
      if (data && data.user) {
        localStorage.setItem('user', JSON.stringify(data.user));
        return true;
      }
      
      this.logout();
      return false;
    } catch (error) {
      console.log('Token verification failed:', error);
      // Don't logout on network errors, just return false
      return this.isLoggedIn();
    }
  },

  // Update navigation based on auth state (deprecated - use HeaderComponent instead)
  updateNavigation() {
    // This method is now handled by HeaderComponent
    if (typeof HeaderComponent !== 'undefined') {
      HeaderComponent.updateHeader();
      return;
    }

    // Fallback for pages not using HeaderComponent
    const navbar = document.querySelector('.navbar-list');
    if (!navbar) return;

    // Remove existing auth-related nav items
    const existingAuthItems = navbar.querySelectorAll('.auth-nav-item');
    existingAuthItems.forEach(item => item.remove());

    if (this.isLoggedIn()) {
      const user = this.getCurrentUser();
      
      // Add Profile link
      const profileItem = document.createElement('li');
      profileItem.className = 'auth-nav-item';
      profileItem.innerHTML = `<a href="profile.html" class="navbar-link title-sm">Profile</a>`;
      navbar.appendChild(profileItem);

      // Add Logout link
      const logoutItem = document.createElement('li');
      logoutItem.className = 'auth-nav-item';
      logoutItem.innerHTML = `<a href="#" class="navbar-link title-sm" onclick="AuthManager.logout()">Logout</a>`;
      navbar.appendChild(logoutItem);

      // Update any user display elements
      const userDisplays = document.querySelectorAll('.user-display');
      userDisplays.forEach(display => {
        display.textContent = user ? user.firstname || user.name || 'User' : 'User';
      });
    } else {
      // Add Login link
      const loginItem = document.createElement('li');
      loginItem.className = 'auth-nav-item';
      loginItem.innerHTML = `<a href="login.html" class="navbar-link title-sm">Login</a>`;
      navbar.appendChild(loginItem);

      // Add Signup link
      const signupItem = document.createElement('li');
      signupItem.className = 'auth-nav-item';
      signupItem.innerHTML = `<a href="signup.html" class="navbar-link title-sm">Sign Up</a>`;
      navbar.appendChild(signupItem);
    }
  }
};

// Prevent back button access after logout
function preventBackButtonAccess() {
  // Disable page caching
  if (typeof(Storage) !== "undefined") {
    // Check if user was logged out
    const wasLoggedOut = sessionStorage.getItem('wasLoggedOut');
    if (wasLoggedOut === 'true' && !AuthManager.isLoggedIn()) {
      // Clear the flag and redirect to login
      sessionStorage.removeItem('wasLoggedOut');
      window.location.replace('login.html');
      return;
    }
  }

  // Add cache control meta tags
  const metaTags = [
    { name: 'Cache-Control', content: 'no-cache, no-store, must-revalidate' },
    { name: 'Pragma', content: 'no-cache' },
    { name: 'Expires', content: '0' }
  ];

  metaTags.forEach(tag => {
    const meta = document.createElement('meta');
    meta.httpEquiv = tag.name;
    meta.content = tag.content;
    document.head.appendChild(meta);
  });

  // Handle page visibility changes
  document.addEventListener('visibilitychange', function() {
    if (!document.hidden && !AuthManager.isLoggedIn()) {
      // Page became visible but user is not logged in
      window.location.replace('login.html');
    }
  });

  // Handle browser back/forward navigation
  window.addEventListener('pageshow', function(event) {
    // If page is loaded from cache and user is not logged in
    if (event.persisted && !AuthManager.isLoggedIn()) {
      window.location.replace('login.html');
    }
  });

  // Prevent page caching
  window.addEventListener('beforeunload', function() {
    if (!AuthManager.isLoggedIn()) {
      // Mark that user was logged out
      sessionStorage.setItem('wasLoggedOut', 'true');
    }
  });
}

// Initialize authentication on page load
document.addEventListener('DOMContentLoaded', function() {
  // Prevent back button access first
  preventBackButtonAccess();
  
  // Small delay to ensure HeaderComponent is loaded
  setTimeout(() => {
    // Update navigation based on auth state
    AuthManager.updateNavigation();
    
    // Verify token periodically (optional)
    if (AuthManager.isLoggedIn()) {
      AuthManager.verifyToken();
    }
  }, 50);
});

// Guard function for protected pages
function requireAuth() {
  if (!AuthManager.isLoggedIn()) {
    // Clear any cached page data
    if (typeof(Storage) !== "undefined") {
      sessionStorage.setItem('wasLoggedOut', 'true');
    }
    
    // Prevent page from being cached
    if (window.history && window.history.replaceState) {
      window.history.replaceState(null, null, window.location.href);
    }
    
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    window.location.replace(`login.html?redirect=${encodeURIComponent(currentPage)}`);
    return false;
  }
  
  // Clear logout flag if user is properly authenticated
  if (typeof(Storage) !== "undefined") {
    sessionStorage.removeItem('wasLoggedOut');
  }
  
  return true;
}

// Make AuthManager globally available
window.AuthManager = AuthManager;


