// main.js
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('service-worker.js').catch(()=>{});
}
document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll(".current-year").forEach(e => {
    e.textContent = (new Date()).getFullYear();
  });
});
