// ASSIGNED TO: CY
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

function showMessage(element, message, type = "") {
    element.textContent = message;
    element.className = `message ${type}`;
}

function showApplication(user) {
    authSection.classList.add("hidden");
    applicationSection.classList.remove("hidden");
    logoutButton.classList.remove("hidden");
    userInfo.classList.remove("hidden");

    const role = String(user.role || "").toLowerCase();

    userInfo.textContent = user.email || "Signed in";
    roleBadge.textContent = user.role || "User";

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
    applicationSection.classList.add("hidden");
    authSection.classList.remove("hidden");
    logoutButton.classList.add("hidden");
    userInfo.classList.add("hidden");
}

function openView(viewName) {
    const viewNames = {
        dashboard: "Dashboard",
        books: "Books",
        bookReservations: "Book Reservations",
        borrowings: "Borrowings",
        seats: "Seats",
        seatReservations: "Seat Reservations",
        readingSpaces: "Reading Spaces",
        readingSpaceReservations: "Reading Space Reservations",
        qcpl: "QCPL External Reservation Monitoring",
        reports: "Reports",
        users: "User Management"
    };

    const role = String(getCurrentUser()?.role || "").toLowerCase();

    if (
        ["qcpl", "reports"].includes(viewName) &&
        role !== "admin" &&
        role !== "librarian"
    ) {
        showMessage(pageMessage, "You are not authorized to access this section.", "error");
        return;
    }

    if (viewName === "users" && role !== "admin") {
        showMessage(pageMessage, "Only administrators can access User Management.", "error");
        return;
    }

    pageTitle.textContent = viewNames[viewName] || "Dashboard";

    document.querySelectorAll(".nav-link").forEach(button => {
        button.classList.toggle(
            "active",
            button.dataset.view === viewName
        );
    });

    showMessage(pageMessage, "");

    if (viewName === "dashboard") {
        viewContainer.innerHTML = `
            <h2>Welcome to LibraryHub</h2>
            <p class="muted">
                Your account is signed in. Choose a section from the menu
                to manage library records and reservations.
            </p>
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

    viewContainer.innerHTML = `
        <h2>${viewNames[viewName] || "Library Section"}</h2>
        <p class="muted">
            This section will be connected in the upcoming frontend batches.
        </p>
    `;
}

loginForm.addEventListener("submit", async event => {
    event.preventDefault();

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;

    showMessage(authMessage, "Signing in...");

    const submitButton = loginForm.querySelector("button[type='submit']");
    submitButton.disabled = true;

    try {
        const result = await apiRequest("/Auth/login", {
            method: "POST",
            body: JSON.stringify({ email, password })
        });

        const token = result?.token || result?.accessToken;

        if (!token) {
            throw new Error("The login response did not contain an authentication token.");
        }

        const returnedUser = result.user || result;

        const user = {
            id: returnedUser.id || returnedUser.userId,
            email: returnedUser.email || email,
            role: returnedUser.role || result.role
        };

        if (!user.role) {
            throw new Error("The login response did not contain the user's role.");
        }

        saveAuthSession(token, user);
        loginForm.reset();
        showMessage(authMessage, "");
        showApplication(user);
    } catch (error) {
        showMessage(authMessage, error.message, "error");
    } finally {
        submitButton.disabled = false;
    }
});

logoutButton.addEventListener("click", () => {
    clearAuthSession();
    showLogin();
    showMessage(authMessage, "You have been logged out.", "success");
});

document.getElementById("navigation").addEventListener("click", event => {
    const button = event.target.closest("[data-view]");

    if (!button || button.classList.contains("hidden")) {
        return;
    }

    openView(button.dataset.view);
});

document.getElementById("brandLink").addEventListener("click", event => {
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