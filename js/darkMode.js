// Get the HTML element and create a button for toggling
document.addEventListener('DOMContentLoaded', () => {
    const html = document.documentElement;
    const toggleButton = document.createElement('button');
    toggleButton.id = 'dark-mode-toggle';
    toggleButton.innerHTML = '🌙'; // Moon icon for initial state
    document.body.appendChild(toggleButton);
  
    // Check for saved preference in localStorage
    const darkMode = localStorage.getItem('dark-mode');
    if (darkMode) {
      html.classList.add('dark-mode');
      toggleButton.innerHTML = '☀️'; // Sun icon when in dark mode
    }
  
    // Toggle function
    function toggleDarkMode() {
      html.classList.toggle('dark-mode');
      
      // Save preference to localStorage
      if (html.classList.contains('dark-mode')) {
        localStorage.setItem('dark-mode', 'enabled');
        toggleButton.innerHTML = '☀️'; // Sun icon when in dark mode
      } else {
        localStorage.removeItem('dark-mode');
        toggleButton.innerHTML = '🌙'; // Moon icon when in light mode
      }
    }
  
    // Add click event to button
    toggleButton.addEventListener('click', toggleDarkMode);
  });
  