// main.js

const API_URL = 'http://localhost:3000/api/records';

// 取得所有紀錄（可加篩選條件）
async function fetchRecords() {
  const response = await fetch(API_URL);
  if (!response.ok) throw new Error('讀取失敗');
  return await response.json();
}

// 新增一筆評估紀錄
// record: { patientId, assessmentType, score, result }
async function addRecord(record) {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(record)
  });
  if (!response.ok) throw new Error('新增失敗');
  return await response.json();
}

// 依病患ID過濾紀錄（for 病患紀錄頁）
async function fetchRecordsByPatient(patientId) {
  const all = await fetchRecords();
  return all.filter(rec => rec.patientId === patientId);
}

// 依評估工具、病患ID查詢
async function fetchRecordsByType(patientId, assessmentType) {
  const all = await fetchRecords();
  return all.filter(rec => 
    rec.patientId === patientId && rec.assessmentType === assessmentType
  );
}

// ----------- 下面可根據需求自行調用以上函式 ----------- //
// 範例：送出表單時寫入資料
/*
document.getElementById('assessmentForm').addEventListener('submit', async function(e) {
  e.preventDefault();
  const patientId = document.getElementById('patientId').value;
  const assessmentType = document.getElementById('assessmentType').value;
  const score = Number(document.getElementById('score').value);
  const result = document.getElementById('result').value;
  await addRecord({ patientId, assessmentType, score, result });
  alert('紀錄已儲存！');
});
*/
// 範例：顯示某個病患的所有紀錄
/*
const showPatientRecords = async (patientId) => {
  const list = await fetchRecordsByPatient(patientId);
  // 這裡自行填充頁面內容
  console.log(list);
};
*/

// 你可以根據需求自行補充或直接呼叫這些函式。
