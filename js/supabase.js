// Import the Supabase client library
import { createClient } from "@supabase/supabase-js"

// Initialize Supabase client
const supabaseUrl = "https://nnxwuurlwhyalpogqgfs.supabase.co"
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5ueHd1dXJsd2h5YWxwb2dxZ2ZzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDMwODg5MTUsImV4cCI6MjA1ODY2NDkxNX0.qRlqZ3TBRyYKA6ZqH5tjKEH-VMaMIT16Zve3BKvf8j0"

// Create the Supabase client
const supabase = createClient(supabaseUrl, supabaseKey)

// Check if user is logged in
async function checkUser() {
  try {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser()
    if (error) {
      console.error("Auth error:", error)
      return null
    }
    return user
  } catch (error) {
    console.error("Check user error:", error)
    return null
  }
}

// Redirect if not logged in
async function requireAuth() {
  const user = await checkUser()
  if (!user) {
    window.location.href = "login.html"
    return null
  }
  return user
}

