// 病患紀錄頁：儲存紀錄
function savePatientRecord() {
  const userSelect = document.getElementById('user-select');
  const recordInput = document.getElementById('record-text');
  const historyList = document.getElementById('patient-history');

  const userOption = userSelect.options[userSelect.selectedIndex];
  const role = userOption.getAttribute('data-role');
  const userText = userOption.text;
  const recordText = recordInput.value.trim();

  if (!recordText) {
    alert("請輸入紀錄內容！");
    return;
  }

  const now = new Date();
  const dateString = `${now.getFullYear()}/${(now.getMonth() + 1).toString().padStart(2,'0')}/${now.getDate().toString().padStart(2,'0')}`;

  const newItem = document.createElement('li');
  newItem.setAttribute('data-role', role);
  newItem.innerHTML = `<strong>${dateString} ${userText}：</strong>${recordText}`;
  historyList.prepend(newItem);

  recordInput.value = '';
}

// 病患紀錄頁：篩選紀錄
function filterRecordsByRole() {
  const selectedRole = document.getElementById('role-select').value;
  const records = document.querySelectorAll('#patient-history li');

  records.forEach(record => {
    if (selectedRole === 'all' || record.getAttribute('data-role') === selectedRole) {
      record.style.display = 'block';
    } else {
      record.style.display = 'none';
    }
  });
}

// 知識頁：篩選文章
function filterArticles() {
  const selected = document.getElementById('category').value;
  const articles = document.querySelectorAll('.article-card');

  articles.forEach(article => {
    const category = article.getAttribute('data-category');
    if (selected === 'all' || selected === category) {
      article.style.display = 'block';
    } else {
      article.style.display = 'none';
    }
  });
}

// 設定頁：儲存設定
function saveSettings() {
  const time = document.getElementById('reminder-time').value;
  const fontSize = document.getElementById('font-size').value;
  const theme = document.getElementById('theme').value;
  const statusDiv = document.getElementById('settings-status');

  localStorage.setItem('reminderTime', time);
  localStorage.setItem('fontSize', fontSize);
  localStorage.setItem('theme', theme);

  statusDiv.textContent = `設定已儲存：提醒時間-${time || "未設定"}, 字體-${fontSize}, 模式-${theme}`;
  statusDiv.style.marginTop = "1rem";
  statusDiv.style.background = "#e5ecf5";
  statusDiv.style.padding = "0.5rem";
  statusDiv.style.borderRadius = "4px";
}

// 病患紀錄頁：載入病患資料
document.addEventListener("DOMContentLoaded", () => {
  const patientNameElem = document.getElementById("patient-name");
  const patientBirthElem = document.getElementById("patient-birth");

  if (patientNameElem && patientBirthElem) {
    const urlParams = new URLSearchParams(window.location.search);
    const patientId = urlParams.get('patientId');
    const patientData = {
      1: { name: "林阿嬤", birth: "1938/05/20" },
      2: { name: "李大叔", birth: "1945/11/02" },
      3: { name: "王奶奶", birth: "1940/03/15" },
    };
    const patient = patientData[patientId];
    if (patient) {
      patientNameElem.textContent = patient.name;
      patientBirthElem.textContent = `生日：${patient.birth}`;
    }
  }
});
