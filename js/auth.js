// Handle login form submission
document.addEventListener("DOMContentLoaded", () => {
  // Initialize Supabase client from the global variable
  const supabase = window.supabase

  if (document.getElementById("login-form")) {
    const loginForm = document.getElementById("login-form")
    const errorMessage = document.getElementById("error-message")

    loginForm.addEventListener("submit", async (e) => {
      e.preventDefault()

      const email = document.getElementById("email").value
      const password = document.getElementById("password").value

      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })

        if (error) throw error

        // Store user in localStorage to maintain session
        localStorage.setItem("user", JSON.stringify(data.user))

        // Redirect to dashboard
        window.location.href = "dashboard.html"
      } catch (error) {
        console.error("Login error:", error)
        errorMessage.textContent = error.message
      }
    })
  }

  // Handle register form submission
  if (document.getElementById("register-form")) {
    const registerForm = document.getElementById("register-form")
    const errorMessage = document.getElementById("error-message")

    registerForm.addEventListener("submit", async (e) => {
      e.preventDefault()

      const name = document.getElementById("name").value
      const email = document.getElementById("email").value
      const phone = document.getElementById("phone").value
      const password = document.getElementById("password").value

      try {
        // Register user with Supabase auth
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email,
          password,
        })

        if (authError) throw authError

        // Add user details to Users table
        const { error: profileError } = await supabase.from("Users").insert([
          {
            UserID: authData.user.id,
            Name: name,
            Email: email,
            Phone: phone,
          },
        ])

        if (profileError) throw profileError

        alert("Registration successful! Please login.")
        window.location.href = "login.html"
      } catch (error) {
        console.error("Registration error:", error)
        errorMessage.textContent = error.message
      }
    })
  }

  // Handle logout
  if (document.getElementById("logout-btn")) {
    const logoutBtn = document.getElementById("logout-btn")

    logoutBtn.addEventListener("click", async () => {
      await supabase.auth.signOut()
      localStorage.removeItem("user")
      window.location.href = "login.html"
    })
  }
})

