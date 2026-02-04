const form = document.getElementById("loginForm");

form.addEventListener("submit", (e) => {
    e.preventDefault();

    const username = loginUsername.value.trim();
    const password = loginPassword.value.trim();

    const users = JSON.parse(localStorage.getItem("users")) || {};

    if (!users[username] || users[username].password !== password) {
        alert("Invalid username or password");
        return;
    }

    localStorage.setItem("loggedInUser", JSON.stringify({ username }));
    window.location.href = "index.html";
})