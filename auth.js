// ===== AUTHENTICATION =====

async function handleLogin() {
  const email = document.getElementById('loginEmail').value;
  const password = document.getElementById('loginPassword').value;
  const errorDiv = document.getElementById('loginError');

  errorDiv.textContent = '';

  if (!email || !password) {
    errorDiv.textContent = 'Email and password required';
    return;
  }

  try {
    const response = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const data = await response.json();

    if (!response.ok) {
      errorDiv.textContent = data.error || 'Login failed';
      return;
    }

    // Store token and email
    localStorage.setItem('token', data.token);
    localStorage.setItem('email', data.email);

    // Show app, hide auth
    showApp();
  } catch (error) {
    errorDiv.textContent = 'Network error. Please try again.';
  }
}

async function handleSignup() {
  const email = document.getElementById('signupEmail').value;
  const password = document.getElementById('signupPassword').value;
  const confirmPassword = document.getElementById('signupConfirmPassword').value;
  const errorDiv = document.getElementById('signupError');

  errorDiv.textContent = '';

  if (!email || !password || !confirmPassword) {
    errorDiv.textContent = 'All fields required';
    return;
  }

  if (password !== confirmPassword) {
    errorDiv.textContent = 'Passwords do not match';
    return;
  }

  if (password.length < 6) {
    errorDiv.textContent = 'Password must be at least 6 characters';
    return;
  }

  try {
    const response = await fetch('/api/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, confirmPassword })
    });

    const data = await response.json();

    if (!response.ok) {
      errorDiv.textContent = data.error || 'Signup failed';
      return;
    }

    // Store token and email
    localStorage.setItem('token', data.token);
    localStorage.setItem('email', data.email);

    // Show app, hide auth
    showApp();
  } catch (error) {
    errorDiv.textContent = 'Network error. Please try again.';
  }
}

function handleLogout() {
  localStorage.removeItem('token');
  localStorage.removeItem('email');
  
  // Hide app, show auth
  document.getElementById('appContainer').style.display = 'none';
  document.getElementById('authContainer').classList.remove('hidden');
  
  // Show login form, hide signup
  document.getElementById('loginForm').style.display = 'block';
  document.getElementById('signupForm').style.display = 'none';
  
  clearAuthForms();
}

function toggleAuthForm() {
  const loginForm = document.getElementById('loginForm');
  const signupForm = document.getElementById('signupForm');

  loginForm.style.display = loginForm.style.display === 'none' ? 'block' : 'none';
  signupForm.style.display = signupForm.style.display === 'none' ? 'block' : 'none';
  clearErrors();
}

function clearAuthForms() {
  document.getElementById('loginEmail').value = '';
  document.getElementById('loginPassword').value = '';
  document.getElementById('signupEmail').value = '';
  document.getElementById('signupPassword').value = '';
  document.getElementById('signupConfirmPassword').value = '';
  clearErrors();
}

function clearErrors() {
  document.getElementById('loginError').textContent = '';
  document.getElementById('signupError').textContent = '';
}

function showApp() {
  // Hide auth, show app
  document.getElementById('authContainer').classList.add('hidden');
  document.getElementById('appContainer').style.display = 'block';
  
  document.getElementById('userEmail').textContent = localStorage.getItem('email');
  renderHome();
}

// Check if user is logged in on page load
window.addEventListener('DOMContentLoaded', () => {
  const token = localStorage.getItem('token');
  const email = localStorage.getItem('email');
  
  if (token && email) {
    showApp();
  } else {
    // Ensure login form is shown
    document.getElementById('authContainer').classList.remove('hidden');
    document.getElementById('loginForm').style.display = 'block';
    document.getElementById('signupForm').style.display = 'none';
    clearAuthForms();
  }
});
