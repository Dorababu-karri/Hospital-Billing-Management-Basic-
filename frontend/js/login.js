document.getElementById("login-form").addEventListener("submit", async (event) => {
    event.preventDefault();

    const username = document.getElementById("username").value;
    const role = document.getElementById("role").value;
    const password = document.getElementById("password").value;
    const errorMessage = document.getElementById("error-message");

    const response = await fetch("/login1", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, role, password })
    });

    const loginResult = await response.json();

    if (loginResult.success) {
        window.location.href = loginResult.redirect;
    } else {
        errorMessage.textContent = loginResult.message;
        errorMessage.style.display = "block";
    }
});
