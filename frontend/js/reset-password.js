document.getElementById("password-reset-form").addEventListener("submit", async (event) => {
    event.preventDefault();

    const username = document.getElementById("username").value;
    const newPassword = document.getElementById("newPassword").value;
    const confirmPassword = document.getElementById("confirmPassword").value;
    const errorMessage = document.getElementById("error-message");

    const response = await fetch("/for", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, newPassword, confirmPassword })
    });

    const resetPasswordResult = await response.json();
    errorMessage.textContent = resetPasswordResult.message;
    errorMessage.style.display = "block";
    errorMessage.style.color = resetPasswordResult.success ? "#1f8f4a" : "#be2d2d";
});
