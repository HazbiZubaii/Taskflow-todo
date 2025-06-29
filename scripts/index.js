// scripts/index.js
document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('registration-form');
  const nameInput = document.getElementById('name');
  const dobInput = document.getElementById('dob');
  const errorMessage = document.getElementById('error-message');

  // Redirect if user already registered
  const user = JSON.parse(localStorage.getItem('user'));
  if (user && user.name && user.dob) {
    window.location.href = 'app.html';
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = nameInput.value.trim();
    const dob = dobInput.value;
    if (!name || !dob) {
      errorMessage.textContent = 'Please fill all fields.';
      return;
    }
    const age = calculateAge(dob);
    if (age <= 10) {
      errorMessage.textContent = 'You must be over 10 years old.';
      return;
    }
    // Set firstLogin flag for welcome message
    localStorage.setItem('firstLogin', 'true');
    localStorage.setItem('user', JSON.stringify({ name, dob }));
    window.location.href = 'app.html';
  });

  function calculateAge(dob) {
    const today = new Date();
    const birthDate = new Date(dob);
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  }
});

