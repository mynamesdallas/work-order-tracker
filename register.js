const form = document.getElementById("registerForm");

form.addEventListener("submit", (e) => {
    e.preventDefault();

    const username = regUsername.value.trim();
    const password = regPassword.value.trim();

    let users = JSON.parse(localStorage.getItem("users")) || {};

    if (users[username]) {
        alert("Username already exists");
        return;
    }

    users[username] = {
        password,
        workOrders: []
    };

    localStorage.setItem("users", JSON.stringify(users));
    alert("Account created!");
    window.location.href = "login.html";
});
