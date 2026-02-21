async function loadUsers() {
    try {
        const response = await fetch("/admin/users/list");
        const usersResult = await response.json();

        const usersTableBody = document.getElementById("users-table-body");
        usersTableBody.innerHTML = "";

        if (!usersResult.success) {
            usersTableBody.innerHTML = '<tr><td colspan="3">Failed to load users</td></tr>';
            return;
        }

        usersResult.data.forEach((user) => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${user.username}</td>
                <td>${user.email}</td>
                <td>${user.role}</td>
            `;
            usersTableBody.appendChild(row);
        });
    } catch (error) {
        console.error("Load users error:", error);
    }
}

document.getElementById("create-user-form").addEventListener("submit", async (event) => {
    event.preventDefault();

    const payload = {
        username: document.getElementById("username").value,
        email: document.getElementById("email").value,
        password: document.getElementById("password").value,
        confirmPassword: document.getElementById("confirmPassword").value,
        role: document.getElementById("role").value
    };

    const statusMessage = document.getElementById("status-message");

    try {
        const response = await fetch("/admin/users", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        const createUserResult = await response.json();
        statusMessage.textContent = createUserResult.message;
        statusMessage.style.color = createUserResult.success ? "#1f8f4a" : "#be2d2d";

        if (createUserResult.success) {
            document.getElementById("create-user-form").reset();
            loadUsers();
        }
    } catch (error) {
        statusMessage.textContent = "Server error";
        statusMessage.style.color = "#be2d2d";
    }
});

loadUsers();
