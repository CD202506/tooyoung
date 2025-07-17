function renderNavbar() {
    const loggedIn = !!localStorage.getItem('loggedIn');
    const username = localStorage.getItem('username') || '團員';
    let nav = '';
    if (loggedIn) {
        nav = `
            <nav>
                <a href="knowledge.html">照護知識</a> |
                <a href="travelers.html">旅人遊記</a> |
                <a href="member_profile.html">團員資料</a> |
                <span>${username}</span> |
                <a href="#" onclick="logout(); return false;">登出</a>
            </nav>
            <hr>
        `;
    } else {
        nav = `
            <nav>
                <a href="knowledge.html">照護知識</a> |
                <a href="travelers.html">旅人遊記</a>
            </nav>
            <hr>
        `;
    }
    const navbar = document.getElementById("navbar");
    if(navbar) navbar.innerHTML = nav;
}
function logout() {
    localStorage.removeItem('loggedIn');
    localStorage.removeItem('username');
    localStorage.removeItem('visitor');
    window.location.href = "knowledge.html";
}
document.addEventListener("DOMContentLoaded", renderNavbar);
