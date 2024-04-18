window.addEventListener('DOMContentLoaded', (event) => {
  fetch('/assets/html/navbar.html')
    .then(response => response.text())
    .then(html => {
      document.getElementById('nav-container').innerHTML = html;
    })
    .catch(error => {
      console.error('Error loading the navbar:', error);
    });
});
