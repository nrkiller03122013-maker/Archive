// Common Header Component
const HeaderComponent = {
  // Generate header HTML based on authentication state
  generateHeader() {
    const isLoggedIn = AuthManager && AuthManager.isLoggedIn();
    const user = isLoggedIn ? AuthManager.getCurrentUser() : null;
    
    // Base navigation items
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    const homeHref = currentPage === 'index.html' ? '#top' : 'index.html';
    
    const baseNavItems = [
      { href: homeHref, text: 'Home' },
      { href: 'course.html', text: 'Courses' },
      { href: 'blog.html', text: 'Blog' },
      { href: 'contact.html', text: 'Contacts' }
    ];
    
    // Auth-based navigation items
    const authNavItems = isLoggedIn ? [
      { href: 'profile.html', text: 'Profile' }
    ] : [
      { href: 'login.html', text: 'Login' },
      { href: 'signup.html', text: 'Sign Up' }
    ];
    
    // Combine all nav items
    const allNavItems = [...baseNavItems, ...authNavItems];
    
    // Generate navigation HTML
    const navItemsHTML = allNavItems.map(item => `
      <li class="navbar-item">
        <a href="${item.href}" class="navbar-link title-sm" ${item.onclick ? `onclick="${item.onclick}"` : ''} data-nav-link>
          ${item.text}
        </a>
      </li>
    `).join('');
    
    return `
      <header class="header" data-header>
        <div class="container">
          <a href="index.html" class="logo">
            <img src="./assets/images/logo.svg" width="145" height="27" alt="Youdemi home" />
          </a>

          <nav class="navbar" data-navbar>
            <div class="navbar-top">
              <a href="index.html" class="logo">
                <img src="./assets/images/logo.svg" width="145" height="27" alt="Youdemi home" />
              </a>

              <button class="nav-close-btn" aria-label="close menu" data-nav-toggler>
                <ion-icon name="close-outline" aria-hidden="true"></ion-icon>
              </button>
            </div>

            <ul class="navbar-list">
              ${navItemsHTML}
            </ul>
          </nav>

          <button class="nav-open-btn" aria-label="open menu" data-nav-toggler>
            <ion-icon name="menu-outline" aria-hidden="true"></ion-icon>
          </button>

          <div class="overlay" data-overlay data-nav-toggler></div>
        </div>
      </header>
    `;
  },

  // Initialize header on page load
  init() {
    // Wait for AuthManager to be available
    const initHeader = () => {
      const headerContainer = document.getElementById('header-container');
      if (headerContainer) {
        headerContainer.innerHTML = this.generateHeader();
        
        // Re-initialize any header scripts (like mobile menu)
        this.initializeHeaderScripts();
      }
    };

    // Check if AuthManager is available, if not wait a bit
    if (typeof AuthManager !== 'undefined') {
      initHeader();
    } else {
      setTimeout(initHeader, 100);
    }
  },

  // Initialize header-related scripts
  initializeHeaderScripts() {
    // Mobile menu toggle functionality
    const navTogglers = document.querySelectorAll('[data-nav-toggler]');
    const navbar = document.querySelector('[data-navbar]');
    const overlay = document.querySelector('[data-overlay]');

    if (navTogglers.length > 0 && navbar && overlay) {
      const toggleNav = () => {
        navbar.classList.toggle('active');
        overlay.classList.toggle('active');
        document.body.classList.toggle('nav-active');
      };

      // Add event listeners to all nav togglers
      navTogglers.forEach(toggler => {
        toggler.addEventListener('click', toggleNav);
      });
      
      // Close nav on nav link click (mobile)
      const navLinks = document.querySelectorAll('.navbar-link');
      navLinks.forEach(link => {
        link.addEventListener('click', () => {
          if (navbar.classList.contains('active')) {
            toggleNav();
          }
        });
      });
    }
  },

  // Update header when auth state changes
  updateHeader() {
    this.init();
  }
};

// Auto-initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  HeaderComponent.init();
});

// Make HeaderComponent globally available
window.HeaderComponent = HeaderComponent;
