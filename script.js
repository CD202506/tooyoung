
// script.js - 通用腳本

function applySettings() {
  const fontSize = localStorage.getItem('fontSize') || 'medium';
  const theme = localStorage.getItem('theme') || 'light';

  document.body.style.fontSize = fontSize === 'small' ? '14px' :
                                 fontSize === 'large' ? '18px' : '16px';

  if (theme === 'dark') {
    document.body.style.backgroundColor = "#333";
    document.body.style.color = "#eee";
  } else {
    document.body.style.backgroundColor = "#f9f9f9";
    document.body.style.color = "#333";
  }
}

function logout() {
  alert("已登出！");
  localStorage.removeItem('user');  // 清除模擬登入資訊
  window.location.href = "index.html";
}
