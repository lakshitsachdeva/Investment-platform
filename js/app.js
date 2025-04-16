// app.js - Main application entry point

// Global application state
const app = {
  currentUser: null,
  isAuthenticated: false,

  // Initialize the application
  async init() {
    try {
      // Get Supabase client from the global variable
      const supabase = window.supabase

      // Check if user is authenticated
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser()

      if (error) {
        console.error("Auth error:", error)
        this.redirectToLogin()
        return
      }

      if (user) {
        this.currentUser = user
        this.isAuthenticated = true
        this.setupNavigation()
        this.setupEventListeners()

        // Redirect if on authentication pages
        const currentPath = window.location.pathname
        if (this.isAuthPage(currentPath)) {
          window.location.href = "dashboard.html"
        }
      } else {
        // If not authenticated and not on auth pages, redirect to login
        const currentPath = window.location.pathname
        if (!this.isAuthPage(currentPath)) {
          this.redirectToLogin()
        }
      }
    } catch (error) {
      console.error("Error initializing app:", error.message)
      this.redirectToLogin()
    }
  },

  isAuthPage(path) {
    return path.includes("login.html") || path.includes("register.html") || path === "/" || path.includes("index.html")
  },

  redirectToLogin() {
    window.location.href = "login.html"
  },

  // Setup navigation based on authentication status
  setupNavigation() {
    const navElement = document.querySelector("nav")
    if (!navElement) return

    if (this.isAuthenticated) {
      navElement.innerHTML = `
        <ul>
          <li><a href="dashboard.html">Dashboard</a></li>
          <li><a href="portfolio.html">Portfolio</a></li>
          <li><a href="transactions.html">Transactions</a></li>
          <li><a href="watchlist.html">Watchlist</a></li>
          <li><a href="profile.html">Profile</a></li>
          <li><a href="#" id="logout-btn">Logout</a></li>
        </ul>
      `

      // Add logout event listener
      const logoutBtn = document.getElementById("logout-btn")
      if (logoutBtn) {
        logoutBtn.addEventListener("click", async (e) => {
          e.preventDefault()
          const supabase = window.supabase
          await supabase.auth.signOut()
          localStorage.removeItem("user")
          window.location.href = "login.html"
        })
      }
    } else {
      navElement.innerHTML = `
        <ul>
          <li><a href="index.html">Home</a></li>
          <li><a href="login.html">Login</a></li>
          <li><a href="register.html">Register</a></li>
        </ul>
      `
    }
  },

  // Setup global event listeners
  setupEventListeners() {
    // Currency formatter for displaying monetary values
    document.querySelectorAll(".currency").forEach((el) => {
      const value = Number.parseFloat(el.textContent)
      el.textContent = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      }).format(value)
    })

    // Date formatter for displaying dates
    document.querySelectorAll(".date-format").forEach((el) => {
      const date = new Date(el.textContent)
      el.textContent = new Intl.DateTimeFormat("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      }).format(date)
    })
  },

  // Helper to fetch user data from Users table
  async getUserData() {
    if (!this.currentUser) return null

    try {
      const supabase = window.supabase
      const { data, error } = await supabase.from("Users").select("*").eq("UserID", this.currentUser.id).single()

      if (error) throw error
      return data
    } catch (error) {
      console.error("Error fetching user data:", error.message)
      return null
    }
  },

  // Helper to format currency values
  formatCurrency(value) {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(value)
  },
}

// Initialize the app when DOM is fully loaded
document.addEventListener("DOMContentLoaded", () => {
  app.init()
})

