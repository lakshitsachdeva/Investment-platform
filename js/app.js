// app.js - Main application entry point
import { supabase } from './supabase.js';

// Global application state
const app = {
  currentUser: null,
  isAuthenticated: false,
  
  // Initialize the application
  async init() {
    try {
      // Check if user is authenticated
      const { data: { user }, error } = await supabase.auth.getUser();
      
      if (error) throw error;
      
      if (user) {
        this.currentUser = user;
        this.isAuthenticated = true;
        this.setupNavigation();
        this.setupEventListeners();
        
        // Redirect if on authentication pages
        const currentPath = window.location.pathname;
        if (currentPath.includes('login.html') || currentPath.includes('register.html') || currentPath === '/' || currentPath.includes('index.html')) {
          window.location.href = './pages/dashboard.html';
        }
      } else {
        // If not authenticated and not on auth pages, redirect to login
        const currentPath = window.location.pathname;
        if (!currentPath.includes('login.html') && !currentPath.includes('register.html') && !currentPath.includes('index.html')) {
          window.location.href = './login.html';
        }
      }
    } catch (error) {
      console.error('Error initializing app:', error.message);
    }
  },
  
  // Setup navigation based on authentication status
  setupNavigation() {
    const navElement = document.querySelector('nav');
    if (!navElement) return;
    
    if (this.isAuthenticated) {
      navElement.innerHTML = `
        <ul>
          <li><a href="./dashboard.html">Dashboard</a></li>
          <li><a href="./portfolio.html">Portfolio</a></li>
          <li><a href="./transactions.html">Transactions</a></li>
          <li><a href="./watchlist.html">Watchlist</a></li>
          <li><a href="./profile.html">Profile</a></li>
          <li><a href="#" id="logout-btn">Logout</a></li>
        </ul>
      `;
      
      // Add logout event listener
      document.getElementById('logout-btn').addEventListener('click', async (e) => {
        e.preventDefault();
        await supabase.auth.signOut();
        window.location.href = '../index.html';
      });
    } else {
      navElement.innerHTML = `
        <ul>
          <li><a href="./index.html">Home</a></li>
          <li><a href="./pages/login.html">Login</a></li>
          <li><a href="./pages/register.html">Register</a></li>
        </ul>
      `;
    }
  },
  
  // Setup global event listeners
  setupEventListeners() {
    // Currency formatter for displaying monetary values
    document.querySelectorAll('.currency').forEach(el => {
      const value = parseFloat(el.textContent);
      el.textContent = new Intl.NumberFormat('en-US', { 
        style: 'currency', 
        currency: 'USD' 
      }).format(value);
    });
    
    // Date formatter for displaying dates
    document.querySelectorAll('.date-format').forEach(el => {
      const date = new Date(el.textContent);
      el.textContent = new Intl.DateTimeFormat('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      }).format(date);
    });
  },
  
  // Helper to fetch user data from Users table
  async getUserData() {
    if (!this.currentUser) return null;
    
    try {
      const { data, error } = await supabase
        .from('Users')
        .select('*')
        .eq('UserID', this.currentUser.id)
        .single();
        
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching user data:', error.message);
      return null;
    }
  },
  
  // Helper to format currency values
  formatCurrency(value) {
    return new Intl.NumberFormat('en-US', { 
      style: 'currency', 
      currency: 'USD' 
    }).format(value);
  }
};

// Initialize the app when DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
  app.init();
});

// Export the app object for use in other modules
export { app };