// Initialize Supabase client
const supabaseUrl = 'https://nnxwuurlwhyalpogqgfs.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5ueHd1dXJsd2h5YWxwb2dxZ2ZzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDMwODg5MTUsImV4cCI6MjA1ODY2NDkxNX0.qRlqZ3TBRyYKA6ZqH5tjKEH-VMaMIT16Zve3BKvf8j0';
const supabase = supabase.createClient(supabaseUrl, supabaseKey);

// Check if user is logged in
async function checkUser() {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

// Redirect if not logged in
async function requireAuth() {
  const user = await checkUser();
  if (!user) {
    window.location.href = '/login.html';
  }
  return user;
}