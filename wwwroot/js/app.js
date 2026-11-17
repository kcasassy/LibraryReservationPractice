
// ASSIGNED TO: KIM — PRACTICE
// PROJECT: Library Reservation Management System Practice

const authSection = document.getElementById("authSection");
const applicationSection = document.getElementById("applicationSection");
const loginForm = document.getElementById("loginForm");
const authMessage = document.getElementById("authMessage");
const logoutButton = document.getElementById("logoutButton");
const userInfo = document.getElementById("userInfo");
const roleBadge = document.getElementById("roleBadge");
const viewContainer = document.getElementById("viewContainer");
const pageTitle = document.getElementById("pageTitle");
const pageMessage = document.getElementById("pageMessage");

const viewNames = {
    dashboard: "Dashboard",
    books: "Books",
    bookReservations: "Book Reservations",
    borrowings: "Borrowings",
    seats: "Seats",
    seatReservations: "Seat Reservations",
    readingSpaces: "Reading Spaces",
    readingSpaceReservations: "Reading Space Reservations",
    qcpl: "QCPL External Reservations",
    reports: "Reports",
    users: "User Management"
};

function showMessage(element, message, type = "") {
    if (!element) return;

    element.textContent = message;
    element.className = `message ${type}`;
}

function showApplication(user) {
    authSection?.classList.add("hidden");
    applicationSection?.classList.remove("hidden");
    logoutButton?.classList.remove("hidden");
    userInfo?.classList.remove("hidden");

    const role = String(user.role || "").toLowerCase();

    if (userInfo) {
        userInfo.textContent = user.fullName || user.email || "Signed in";
    }

    if (roleBadge) {
        roleBadge.textContent = user.role || "User";
    }

    document.querySelectorAll(".staff-only").forEach(element => {
        element.classList.toggle(
            "hidden",
            role !== "admin" && role !== "librarian"
        );
    });

    document.querySelectorAll(".admin-only").forEach(element => {
        element.classList.toggle("hidden", role !== "admin");
    });

    openView("dashboard");
}

function showLogin() {
    applicationSection?.classList.add("hidden");
    authSection?.classList.remove("hidden");
    logoutButton?.classList.add("hidden");
    userInfo?.classList.add("hidden");
}

function isAllowedView(viewName, role) {
    if (["qcpl", "reports"].includes(viewName)) {
        return role === "admin" || role === "librarian";
    }

    if (viewName === "users") {
        return role === "admin";
    }

    return true;
}

function openView(viewName) {
    const user = getCurrentUser();
    const role = String(user?.role || "").toLowerCase();

    if (!viewNames[viewName]) {
        showMessage(pageMessage, "Unknown section.", "error");
        return;
    }

    if (!isAllowedView(viewName, role)) {
        showMessage(
            pageMessage,
            "You are not authorized to access this section.",
            "error"
        );
        return;
    }

    if (pageTitle) {
        pageTitle.textContent = viewNames[viewName];
    }

    document.querySelectorAll(".nav-link").forEach(button => {
        button.classList.toggle(
            "active",
            button.dataset.view === viewName
        );
    });

    showMessage(pageMessage, "");

    if (viewName === "dashboard") {
        viewContainer.innerHTML = `
            <section class="dashboard-view">
                <h2>Welcome to LibraryHub</h2>
                <p class="muted">
                    Welcome, ${escapeHTML(user?.fullName || user?.email || "User")}.
                    Select a section from the navigation menu.
                </p>
            </section>
        `;
        return;
    }

    if (viewName === "books") {
        if (typeof renderBooksView === "function") {
            renderBooksView();
        } else {
            viewContainer.innerHTML = `
                <h2>Books</h2>
                <p class="message error">Books module could not be loaded.</p>
            `;
        }
        return;
    }

    if (typeof renderModuleView === "function") {
        renderModuleView(viewName);
        return;
    }

    viewContainer.innerHTML = `
        <h2>${viewNames[viewName]}</h2>
        <p class="message error">Module could not be loaded.</p>
    `;
}

function escapeHTML(value) {
    return String(value ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

loginForm?.addEventListener("submit", async event => {
    event.preventDefault();

    const email = document.getElementById("email")?.value.trim();
    const password = document.getElementById("password")?.value;

    if (!email || !password) {
        showMessage(authMessage, "Enter your email and password.", "error");
        return;
    }

    showMessage(authMessage, "Signing in...");

    const submitButton = loginForm.querySelector("button[type='submit']");

    if (submitButton) {
        submitButton.disabled = true;
    }

    try {
        const result = await apiRequest("/Auth/login", {
            method: "POST",
            body: JSON.stringify({ email, password })
        });

        if (!result?.token) {
            throw new Error("Login response did not contain a token.");
        }

        if (!result.role || !result.userId) {
            throw new Error("Login response is missing user information.");
        }

        const user = {
            id: result.userId,
            fullName: result.fullName,
            email: result.email,
            role: result.role
        };

        saveAuthSession(result.token, user);

        loginForm.reset();
        showMessage(authMessage, "");
        showApplication(user);
    } catch (error) {
        showMessage(authMessage, error.message, "error");
    } finally {
        if (submitButton) {
            submitButton.disabled = false;
        }
    }
});

logoutButton?.addEventListener("click", () => {
    clearAuthSession();
    showLogin();
    showMessage(authMessage, "You have been logged out.", "success");
});

document.getElementById("navigation")?.addEventListener("click", event => {
    const button = event.target.closest("[data-view]");

    if (!button || button.classList.contains("hidden")) {
        return;
    }

    openView(button.dataset.view);
});

document.getElementById("brandLink")?.addEventListener("click", event => {
    event.preventDefault();

    if (getAuthToken()) {
        openView("dashboard");
    }
});

function initializeApplication() {
    const token = getAuthToken();
    const user = getCurrentUser();

    if (token && user && user.role) {
        showApplication(user);
        return;
    }

    clearAuthSession();
    showLogin();
}

initializeApplication();
