async function updateDashboardStats() {
    try {
        const response = await fetch("/stats");
        const statsResult = await response.json();

        if (statsResult.success) {
            document.getElementById("total-patients").textContent = statsResult.totalPatients;
            document.getElementById("admitted-patients").textContent = statsResult.admittedPatients;
            document.getElementById("discharged-patients").textContent = statsResult.dischargedPatients;
        }
    } catch (error) {
        console.error("Error fetching stats:", error);
    }
}

async function loadCurrentUser() {
    try {
        const response = await fetch("/me");
        const meResult = await response.json();

        if (!meResult.success) {
            return;
        }

        const currentUser = document.getElementById("current-user");
        const userName = document.createElement("span");
        userName.className = "user-name";
        userName.textContent = meResult.user.username;

        const roleTag = document.createElement("span");
        roleTag.className = "role-tag";
        roleTag.textContent = meResult.user.role === "admin" ? "Admin" : "Staff";

        currentUser.innerHTML = "";
        currentUser.appendChild(userName);
        currentUser.appendChild(roleTag);

        if (meResult.user.role === "admin") {
            const adminUsersLink = document.getElementById("admin-users-link");
            adminUsersLink.classList.remove("u-hidden");
            adminUsersLink.style.display = "";
        }
    } catch (error) {
        console.error("Error fetching current user:", error);
    }
}

updateDashboardStats();
loadCurrentUser();
