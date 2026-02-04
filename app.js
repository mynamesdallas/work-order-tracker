// -------------------------------
// INITIAL LOAD
// -------------------------------
document.addEventListener("DOMContentLoaded", () => {
    loadUsername();
    loadWorkOrders();
    populateTechFilter();
});

// DOM ELEMENTS
const usernameDisplay = document.getElementById("usernameDisplay");
const logoutBtn = document.getElementById("logoutBtn");

const form = document.getElementById("workOrderForm");
const titleInput = document.getElementById("title");
const assignedToInput = document.getElementById("assignedTo");
const locationInput = document.getElementById("location");
const priorityInput = document.getElementById("priority");
const workOrderList = document.getElementById("workOrderList");
const techFilter = document.getElementById("techFilter");

// MODAL ELEMENTS
const modal = document.getElementById("modalContainer");
const modalClose = document.querySelector(".close");
const modalTitle = document.getElementById("modalTitle");
const modalTech = document.getElementById("modalTech");
const modalPriority = document.getElementById("modalPriority");
const modalStatus = document.getElementById("modalStatus");
const modalStatusSelect = document.getElementById("modalStatusSelect");
const modalLocation = document.getElementById("modalLocation");
const modalNotes = document.getElementById("modalNotes");
const saveNotesBtn = document.getElementById("saveNotesBtn");


let activeWorkOrderId = null;

// -------------------------------
// USERNAME DISPLAY
// -------------------------------
function loadUsername() {
    const user = JSON.parse(localStorage.getItem("loggedInUser"));
    if (user) {
        document.getElementById("usernameDisplay").textContent = user.username;
    }
}

// -------------------------------
// WORK ORDER STORAGE HELPERS
// -------------------------------
function getWorkOrders() {
    return JSON.parse(localStorage.getItem("workOrders")) || [];
}

function saveWorkOrders(list) {
    localStorage.setItem("workOrders", JSON.stringify(list));
}

// -------------------------------
// ADD WORK ORDER
// -------------------------------
form.addEventListener("submit", (e) => {
    e.preventDefault();

    const title = document.getElementById("title").value.trim();
    const assignedTo = document.getElementById("assignedTo").value.trim();
    const location = document.getElementById("location").value.trim();
    const priority = document.getElementById("priority").value;

    const newOrder = {
        id: Date.now(),
        title,
        assignedTo,
        location,
        priority,
        status: "Open",
        notes: []
    };

    const orders = getWorkOrders();
    orders.push(newOrder);
    saveWorkOrders(orders);

    form.reset();
    populateTechFilter();
    loadWorkOrders();
});

// -------------------------------
// RENDER WORK ORDERS
// -------------------------------
function loadWorkOrders() {
    const orders = getWorkOrders();
    const filter = techFilter.value;

    workOrderList.innerHTML = "";

    const filtered = filter === "all"
        ? orders
        : orders.filter(o => o.assignedTo === filter);

    filtered.forEach(order => {
        const div = document.createElement("div");
        div.className = "work-order";
        div.innerHTML = `
            <h3>${order.title}</h3>
            <p><strong>Tech:</strong> ${order.assignedTo || "Unassigned"}</p>
            <p><strong>Priority:</strong> ${order.priority}</p>
            <p><strong>Status:</strong> ${order.status}</p>
            <button class="openModalBtn" data-id="${order.id}">View</button>
            <button class="mapBtn" onclick="openMapLocation(${order.id})">Directions</button>
            <button class="deleteBtn" data-id="${order.id}">Delete</button>
        `;
        workOrderList.appendChild(div);
    });

    attachCardEvents();
}

// -------------------------------
// TECH FILTER POPULATION
// -------------------------------
function populateTechFilter() {
    const orders = getWorkOrders();
    const techs = [...new Set(orders.map(o => o.assignedTo).filter(Boolean))];

    techFilter.innerHTML = `<option value="all">All Technicians</option>`;
    techs.forEach(t => {
        const opt = document.createElement("option");
        opt.value = t;
        opt.textContent = t;
        techFilter.appendChild(opt);
    });
}

techFilter.addEventListener("change", loadWorkOrders);

// -------------------------------
// CARD BUTTON EVENTS
// -------------------------------
function attachCardEvents() {
    document.querySelectorAll(".openModalBtn").forEach(btn => {
        btn.addEventListener("click", () => openModal(btn.dataset.id));
    });

    document.querySelectorAll(".deleteBtn").forEach(btn => {
        btn.addEventListener("click", () => deleteWorkOrder(btn.dataset.id));
    });
}

// -------------------------------
// DELETE WORK ORDER
// -------------------------------
function deleteWorkOrder(id) {
    let orders = getWorkOrders();
    orders = orders.filter(o => o.id != id);
    saveWorkOrders(orders);
    loadWorkOrders();
    populateTechFilter();
}

//--------------------------------
// OPEN MAP LOCATION
//--------------------------------
function openMapLocation(id) {
    const orders = getWorkOrders();
    const order = orders.find(o => o.id === id);

    if (!order || !order.location.trim()) {
        alert("No Location Available");
        return;
    }

    const encoded = encodeURIComponent(order.location.trim());
    const url = `https://www.google.com/maps/search/?api=1&query=${encoded}`;

    window.open(url, "_blank");
}

// -------------------------------
// MODAL LOGIC
// -------------------------------
function openModal(id) {

    const orders = getWorkOrders();
    const order = orders.find(o => o.id == id);
    if (!order) return;

    activeWorkOrderId = id;

    modalTitle.textContent = order.title;
    modalTech.textContent = order.assignedTo || "Unassigned";
    modalPriority.textContent = order.priority;
    modalStatus.textContent = order.status;
    modalStatusSelect.value = order.status;
    modalLocation.textContent = order.location;

    modalNotes.value = "";

    const notesContainer = document.getElementById("notesContainer");
    notesContainer.innerHTML = "";

    order.notes.forEach(note => {
        const div = document.createElement("div");
        div.className = "note-item";
        div.textContent = note;
        notesContainer.appendChild(div);
    });

    modal.classList.remove("hidden");
}

modalClose.addEventListener("click", () => {
    modal.classList.add("hidden");
});

// Close when clicking outside the modal box
modal.addEventListener("click", (e) => {
    if (e.target === modal) {
        modal.classList.add("hidden");
    }
});

modalStatusSelect.addEventListener("change", () => {
    const orders = getWorkOrders();
    const order = orders.find(o => o.id == activeWorkOrderId);

    if (order) {
        order.status = modalStatusSelect.value;
        saveWorkOrders(orders);
    }

    loadWorkOrders();
    modalStatus.textContent = order.status;
});


// -------------------------------
// SAVE NOTES
// -------------------------------
saveNotesBtn.addEventListener("click", () => {
    const orders = getWorkOrders();
    const order = orders.find(o => o.id == activeWorkOrderId);

    if (order) {
        const newNote = modalNotes.value.trim();
        if (newNote !== "") {
            order.notes.push(newNote)
        }
        saveWorkOrders(orders);
    }

    modalNotes.value = ""; // clear textarea
    openModal(activeWorkOrderId); // re-render notes list

});

// -------------------------------
// LOGOUT
// -------------------------------
logoutBtn.addEventListener("click", () => {
    localStorage.removeItem("loggedInUser");
    window.location.href = "login.html";
});