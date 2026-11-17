
// ASSIGNED TO: KIM — PRACTICE
// PROJECT: Library Reservation Management System Practice

const moduleDefinitions = {
    bookReservations: {
        title: "Book Reservations",
        endpoint: "/BookReservations",
        memberEndpoint: "/BookReservations/my",
        columns: [
            ["Book", "bookTitle"],
            ["ISBN", "isbn"],
            ["Member", "memberName"],
            ["Reserved At", "reservedAt"],
            ["Expires At", "expiresAt"],
            ["Status", "status"]
        ]
    },
    borrowings: {
        title: "Borrowings",
        endpoint: "/Borrowings",
        memberEndpoint: "/Borrowings/my",
        columns: [
            ["Book", "bookTitle"],
            ["ISBN", "isbn"],
            ["Member", "memberName"],
            ["Borrowed At", "borrowedAt"],
            ["Due Date", "dueDate"],
            ["Returned At", "returnedAt"],
            ["Status", "status"]
        ]
    },
    seats: {
        title: "Seats",
        endpoint: "/Seats",
        columns: [
            ["Seat Number", "seatNumber"],
            ["Location", "location"],
            ["Active", "isActive"]
        ]
    },
    seatReservations: {
        title: "Seat Reservations",
        endpoint: "/SeatReservations",
        columns: [
            ["Member", "memberName"],
            ["Seat", "seatNumber"],
            ["Location", "location"],
            ["Start", "startTime"],
            ["End", "endTime"],
            ["Status", "status"]
        ]
    },
    readingSpaces: {
        title: "Reading Spaces",
        endpoint: "/ReadingSpaces",
        columns: [
            ["Name", "name"],
            ["Location", "location"],
            ["Capacity", "capacity"],
            ["Active", "isActive"]
        ]
    },
    readingSpaceReservations: {
        title: "Reading Space Reservations",
        endpoint: "/ReadingSpaceReservations",
        columns: [
            ["Member", "memberName"],
            ["Reading Space", "readingSpaceName"],
            ["Location", "location"],
            ["Start", "startTime"],
            ["End", "endTime"],
            ["People", "numberOfPeople"],
            ["Status", "status"]
        ]
    },
    qcpl: {
        title: "QCPL External Reservations",
        endpoint: "/QcplExternalReservations",
        columns: [
            ["Reference Number", "externalReferenceNumber"],
            ["Member", "memberName"],
            ["Book", "bookTitle"],
            ["Status", "reservationStatus"],
            ["Reservation Date", "reservationDate"],
            ["Last Synced", "lastSyncedAt"],
            ["Notes", "notes"]
        ]
    },
    users: {
        title: "Users",
        endpoint: "/Users",
        columns: [
            ["Full Name", "fullName"],
            ["Email", "email"],
            ["Role", "role"],
            ["Member Number", "memberNumber"],
            ["Membership Expiry", "membershipExpiry"],
            ["Active", "isActive"]
        ]
    }
};

const reportFields = [
    ["Total Books", "totalBooks"],
    ["Total Book Copies", "totalBookCopies"],
    ["Available Book Copies", "availableBookCopies"],
    ["Total Members", "totalMembers"],
    ["Total Borrowings", "totalBorrowings"],
    ["Total Book Reservations", "totalBookReservations"],
    ["Total Seats", "totalSeats"],
    ["Active Seats", "activeSeats"],
    ["Total Seat Reservations", "totalSeatReservations"],
    ["Total Reading Spaces", "totalReadingSpaces"],
    ["Active Reading Spaces", "activeReadingSpaces"],
    ["Total Reading Space Reservations", "totalReadingSpaceReservations"],
    ["Total QCPL External Reservations", "totalQcplExternalReservations"]
];

function moduleEscape(value) {
    return String(value ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

function moduleFormat(value) {
    if (value === null || value === undefined || value === "") {
        return "—";
    }

    if (typeof value === "boolean") {
        return value ? "Yes" : "No";
    }

    if (
        typeof value === "string" &&
        /^\d{4}-\d{2}-\d{2}T/.test(value)
    ) {
        return new Date(value).toLocaleString();
    }

    return moduleEscape(value);
}

function moduleRole() {
    return String(getCurrentUser()?.role || "");
}

function moduleIsStaff() {
    return ["Admin", "Librarian"].includes(moduleRole());
}

function moduleShowMessage(message, isError = false) {
    const area = document.getElementById("module-message");

    if (area) {
        area.textContent = message;
        area.className = isError
            ? "module-message error"
            : "module-message success";
    } else {
        alert(message);
    }
}

function moduleRenderActions(moduleKey, record) {
    const id = Number(record.id);
    const status = String(
        record.status || record.reservationStatus || ""
    );

    let actions = "";

    if (moduleIsStaff()) {
        if (
            [
                "bookReservations",
                "seatReservations",
                "readingSpaceReservations"
            ].includes(moduleKey) &&
            status === "Pending"
        ) {
            actions += `
                <button class="btn btn-small"
                    onclick="moduleUpdateStatus('${moduleKey}', ${id}, 'Approved')">
                    Approve
                </button>
                <button class="btn btn-small btn-danger"
                    onclick="moduleUpdateStatus('${moduleKey}', ${id}, 'Rejected')">
                    Reject
                </button>
            `;
        }

        if (moduleKey === "borrowings" && !record.returnedAt) {
            actions += `
                <button class="btn btn-small"
                    onclick="moduleReturnBorrowing(${id})">
                    Mark Returned
                </button>
            `;
        }

        if (moduleKey === "qcpl") {
            actions += `
                <button class="btn btn-small"
                    onclick="moduleRecordSync(${id})">
                    Record Sync
                </button>
            `;
        }

        if (["seats", "readingSpaces"].includes(moduleKey)) {
            actions += `
                <button class="btn btn-small btn-danger"
                    onclick="moduleDeactivate('${moduleKey}', ${id})">
                    Deactivate
                </button>
            `;
        }
    }

    if (
        moduleRole() === "Member" &&
        [
            "bookReservations",
            "seatReservations",
            "readingSpaceReservations"
        ].includes(moduleKey) &&
        status === "Pending"
    ) {
        actions += `
            <button class="btn btn-small btn-danger"
                onclick="moduleCancelReservation('${moduleKey}', ${id})">
                Cancel
            </button>
        `;
    }

    return actions || "—";
}

function moduleRenderTable(definition, records, moduleKey) {
    if (!Array.isArray(records) || records.length === 0) {
        return "<p>No records found.</p>";
    }

    const headings = definition.columns
        .map(([label]) => `<th>${moduleEscape(label)}</th>`)
        .join("");

    const rows = records.map(record => {
        const cells = definition.columns
            .map(([, field]) => `<td>${moduleFormat(record[field])}</td>`)
            .join("");

        return `
            <tr>
                ${cells}
                <td>${moduleRenderActions(moduleKey, record)}</td>
            </tr>
        `;
    }).join("");

    return `
        <div class="table-container">
            <table class="data-table">
                <thead>
                    <tr>${headings}<th>Actions</th></tr>
                </thead>
                <tbody>${rows}</tbody>
            </table>
        </div>
    `;
}

async function renderModuleView(moduleKey) {
    const content = document.getElementById("viewContainer");
    const definition = moduleDefinitions[moduleKey];

    if (!content) {
        console.error("viewContainer element was not found.");
        return;
    }

    if (moduleKey === "reports") {
        await moduleRenderReports(content);
        return;
    }

    if (!definition) {
        content.innerHTML = "<p>Module is not available.</p>";
        return;
    }

    content.innerHTML = `
        <section class="module-section">
            <div class="module-heading">
                <h2>${moduleEscape(definition.title)}</h2>
                <button class="btn" onclick="renderModuleView('${moduleKey}')">
                    Refresh
                </button>
            </div>
            <div id="module-message" class="module-message"></div>
            <div id="module-create-area"></div>
            <div id="module-records">Loading records...</div>
        </section>
    `;

    try {
        let endpoint = definition.endpoint;

        if (
            moduleRole() === "Member" &&
            definition.memberEndpoint
        ) {
            endpoint = definition.memberEndpoint;
        }

        const records = await apiRequest(endpoint);

        const recordsArea = document.getElementById("module-records");

        if (recordsArea) {
            recordsArea.innerHTML = moduleRenderTable(
                definition,
                records,
                moduleKey
            );
        }

        moduleRenderCreateForm(moduleKey);
    } catch (error) {
        const recordsArea = document.getElementById("module-records");

        if (recordsArea) {
            recordsArea.innerHTML = `
                <p class="error-message">${moduleEscape(error.message)}</p>
            `;
        }
    }
}

async function moduleRenderReports(content) {
    content.innerHTML = `
        <section class="module-section">
            <div class="module-heading">
                <h2>Library Reports</h2>
                <button class="btn" onclick="renderModuleView('reports')">
                    Refresh
                </button>
            </div>
            <div id="module-message" class="module-message"></div>
            <div id="report-records">Loading report...</div>
        </section>
    `;

    try {
        const report = await apiRequest("/Reports/summary");

        document.getElementById("report-records").innerHTML = `
            <div class="report-grid">
                ${reportFields.map(([label, field]) => `
                    <article class="report-card">
                        <h3>${moduleEscape(label)}</h3>
                        <p>${moduleFormat(report[field])}</p>
                    </article>
                `).join("")}
            </div>
            <p class="muted">
                Generated: ${moduleFormat(report.generatedAt)}
            </p>
        `;
    } catch (error) {
        document.getElementById("report-records").innerHTML = `
            <p class="error-message">${moduleEscape(error.message)}</p>
        `;
    }
}

function moduleRenderCreateForm(moduleKey) {
    const area = document.getElementById("module-create-area");

    if (!area || !moduleIsStaff()) return;

    const forms = {
        seats: `
            <form onsubmit="moduleCreateRecord(event, 'seats')">
                <h3>Add Seat</h3>
                <input name="seatNumber" placeholder="Seat number" maxlength="20" required>
                <input name="location" placeholder="Location" maxlength="100" required>
                <button class="btn" type="submit">Add Seat</button>
            </form>
        `,
        readingSpaces: `
            <form onsubmit="moduleCreateRecord(event, 'readingSpaces')">
                <h3>Add Reading Space</h3>
                <input name="name" placeholder="Space name" maxlength="100" required>
                <input name="location" placeholder="Location" maxlength="100" required>
                <input name="capacity" type="number" min="1" max="500" placeholder="Capacity" required>
                <button class="btn" type="submit">Add Reading Space</button>
            </form>
        `,
        qcpl: `
            <form onsubmit="moduleCreateRecord(event, 'qcpl')">
                <h3>Add QCPL External Reservation</h3>
                <input name="externalReferenceNumber" placeholder="External reference number" maxlength="100" required>
                <input name="memberName" placeholder="Member name" maxlength="150">
                <input name="bookTitle" placeholder="Book title" maxlength="200">
                <select name="reservationStatus" required>
                    <option value="Pending">Pending</option>
                    <option value="Approved">Approved</option>
                    <option value="Rejected">Rejected</option>
                    <option value="Cancelled">Cancelled</option>
                </select>
                <label>Reservation date</label>
                <input name="reservationDate" type="datetime-local" required>
                <textarea name="notes" placeholder="Notes" maxlength="500"></textarea>
                <button class="btn" type="submit">Add QCPL Reservation</button>
            </form>
        `
    };

    area.innerHTML = forms[moduleKey] || "";
}

async function moduleCreateRecord(event, moduleKey) {
    event.preventDefault();

    const form = event.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries());

    if (data.capacity !== undefined) {
        data.capacity = Number(data.capacity);
    }

    if (data.reservationDate) {
        data.reservationDate = new Date(data.reservationDate).toISOString();
    }

    const endpoints = {
        seats: "/Seats",
        readingSpaces: "/ReadingSpaces",
        qcpl: "/QcplExternalReservations"
    };

    try {
        await apiRequest(endpoints[moduleKey], {
            method: "POST",
            body: JSON.stringify(data)
        });

        await renderModuleView(moduleKey);
    } catch (error) {
        moduleShowMessage(error.message, true);
    }
}

async function moduleUpdateStatus(moduleKey, id, status) {
    const endpoints = {
        bookReservations: `/BookReservations/${id}/status`,
        seatReservations: `/SeatReservations/${id}/status`,
        readingSpaceReservations: `/ReadingSpaceReservations/${id}/status`
    };

    try {
        await apiRequest(endpoints[moduleKey], {
            method: "PUT",
            body: JSON.stringify({ status })
        });

        await renderModuleView(moduleKey);
    } catch (error) {
        moduleShowMessage(error.message, true);
    }
}

async function moduleCancelReservation(moduleKey, id) {
    const endpoints = {
        bookReservations: `/BookReservations/${id}/cancel`,
        seatReservations: `/SeatReservations/${id}/cancel`,
        readingSpaceReservations: `/ReadingSpaceReservations/${id}/cancel`
    };

    if (!confirm("Cancel this reservation?")) return;

    try {
        await apiRequest(endpoints[moduleKey], {
            method: "PUT"
        });

        await renderModuleView(moduleKey);
    } catch (error) {
        moduleShowMessage(error.message, true);
    }
}

async function moduleReturnBorrowing(id) {
    if (!confirm("Mark this borrowing as returned?")) return;

    try {
        await apiRequest(`/Borrowings/${id}/return`, {
            method: "PUT"
        });

        await renderModuleView("borrowings");
    } catch (error) {
        moduleShowMessage(error.message, true);
    }
}

async function moduleDeactivate(moduleKey, id) {
    const endpoints = {
        seats: `/Seats/${id}`,
        readingSpaces: `/ReadingSpaces/${id}`
    };

    if (!confirm("Deactivate this record?")) return;

    try {
        await apiRequest(endpoints[moduleKey], {
            method: "DELETE"
        });

        await renderModuleView(moduleKey);
    } catch (error) {
        moduleShowMessage(error.message, true);
    }
}

async function moduleRecordSync(id) {
    try {
        await apiRequest(`/QcplExternalReservations/${id}/record-sync`, {
            method: "POST"
        });

        await renderModuleView("qcpl");
    } catch (error) {
        moduleShowMessage(error.message, true);
    }
}
