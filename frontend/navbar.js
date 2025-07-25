// navbar.js
document.addEventListener("DOMContentLoaded", function () {
  const navbarHtml = `
    <nav class="navbar">
      <ul>
        <li><a href="index.html">首頁</a></li>
        <li><a href="traveler_diary.html">旅伴日記</a></li>
        <li><a href="travelers.html">旅伴</a></li>
        <li><a href="relationship_management.html">關係管理</a></li>
        <li><a href="traveler_co_manage.html">共同管理旅伴</a></li>
        <li><a href="assessment.html">認知評估</a></li>
        <li><a href="knowledge.html">照護知識</a></li>
        <li><a href="notifications.html">通知</a></li>
        <li><a href="faq.html">FAQ</a></li>
        <li><a href="policy.html">政策</a></li>
        <li><a href="login.html">登入/註冊</a></li>
      </ul>
    </nav>
  `;
  document.querySelectorAll("#navbar").forEach(e => e.innerHTML = navbarHtml);
});
