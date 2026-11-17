
// ASSIGNED TO: CY
// PROJECT: Library Reservation Management System Practice

const API_BASE_URL = "/api";

function getAuthToken() {
    return localStorage.getItem("libraryToken");
}

function saveAuthSession(token, user) {
    localStorage.setItem("libraryToken", token);
    localStorage.setItem("libraryUser", JSON.stringify(user));
}

function getCurrentUser() {
    const userData = localStorage.getItem("libraryUser");

    if (!userData) {
        return null;
    }

    try {
        return JSON.parse(userData);
    } catch {
        return null;
    }
}

function clearAuthSession() {
    localStorage.removeItem("libraryToken");
    localStorage.removeItem("libraryUser");
}

async function apiRequest(endpoint, options = {}) {
    const headers = new Headers(options.headers || {});

    if (!headers.has("Content-Type") && options.body) {
        headers.set("Content-Type", "application/json");
    }

    const token = getAuthToken();

    if (token) {
        headers.set("Authorization", `Bearer ${token}`);
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers
    });

    const responseText = await response.text();
    let responseData = null;

    if (responseText) {
        try {
            responseData = JSON.parse(responseText);
        } catch {
            responseData = responseText;
        }
    }

    if (!response.ok) {
        const errorMessage =
            responseData?.message ||
            responseData?.title ||
            (typeof responseData === "string" ? responseData : null) ||
            `Request failed with status ${response.status}.`;

        const error = new Error(errorMessage);
        error.status = response.status;
        error.data = responseData;
        throw error;
    }

    return responseData;
}
