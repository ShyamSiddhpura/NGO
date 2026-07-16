/* ==========================================================================
   TEAM PRAYAS ADMINISTRATOR PORTAL SCRIPT (js/admin.js)
   ========================================================================== */

// --- Admin Credentials Constants (Easy to customize) ---
const ADMIN_CREDENTIALS = {
  USERNAME: "admin_dev",
  PASSWORD: "1234"
};

let applications = [];
let currentPanel = "dashboard";
let currentApplicationId = null;

// Table controls variables
let tableSearchQuery = "";
let tableStatusFilter = "All";
let tableSortColumn = "date";
let tableSortOrder = "desc"; // or "asc"
let tableCurrentPage = 1;
const tablePageSize = 5;

// Inactivity autologout variables
let idleTime = 0;
let idleInterval = null;

document.addEventListener("DOMContentLoaded", () => {
  initLoginHandler();
  initSidebarNavigation();
  initMobileSidebarToggle();
  initTableHandlers();
  initDetailsHandlers();
  initSettingsForm();

  // Session recovery guard
  if (sessionStorage.getItem("team_prayas_admin_logged") === "true") {
    showDashboardWorkspace();
  }
});

/* ==========================================================================
   1. SECURE LOGIN & SESSION TIMEOUT
   ========================================================================== */
function initLoginHandler() {
  const loginForm = document.getElementById("admin-login-form");
  const loginCard = document.getElementById("login-card-container");
  
  if (!loginForm) return;

  loginForm.addEventListener("submit", (e) => {
    e.preventDefault();
    
    const userVal = document.getElementById("login-username").value.trim();
    const passVal = document.getElementById("login-password").value.trim();

    // Check credentials against constants (fallback to LocalStorage custom change if exists)
    const storedCredentials = JSON.parse(localStorage.getItem("team_prayas_admin")) || {
      username: ADMIN_CREDENTIALS.USERNAME,
      password: ADMIN_CREDENTIALS.PASSWORD
    };

    if (userVal === storedCredentials.username && passVal === storedCredentials.password) {
      sessionStorage.setItem("team_prayas_admin_logged", "true");
      showDashboardWorkspace();
      showToast("Access Authorized. Welcome back!", "success");
      loginForm.reset();
    } else {
      loginCard.classList.add("shake");
      showToast("Access Denied: Invalid credentials.", "error");
      setTimeout(() => {
        loginCard.classList.remove("shake");
      }, 500);
    }
  });

  // Logout button
  const logoutBtn = document.getElementById("admin-logout-btn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      performLogout("Session closed successfully.");
    });
  }
}

function showDashboardWorkspace() {
  document.getElementById("admin-login-screen").classList.add("hidden");
  document.getElementById("admin-dashboard-container").classList.remove("hidden");
  
  loadApplicationsFromStorage();
  refreshStats();
  renderApplicationsTable();
  renderActivityTimelineFeed();
  
  startInactivityTimer();
}

function performLogout(message = "Session closed.") {
  sessionStorage.removeItem("team_prayas_admin_logged");
  stopInactivityTimer();
  
  document.getElementById("admin-dashboard-container").classList.add("hidden");
  document.getElementById("admin-login-screen").classList.remove("hidden");
  showToast(message, "warning");
}

function startInactivityTimer() {
  idleTime = 0;
  
  function resetTimer() {
    idleTime = 0;
  }
  
  // Track actions
  window.addEventListener("mousemove", resetTimer);
  window.addEventListener("keypress", resetTimer);
  window.addEventListener("mousedown", resetTimer);
  window.addEventListener("scroll", resetTimer);
  window.addEventListener("click", resetTimer);

  // Check every 1 minute
  idleInterval = setInterval(() => {
    idleTime++;
    if (idleTime >= 15) { // 15 minutes idle
      performLogout("Logged out due to 15 minutes of inactivity.");
    }
  }, 60000);
}

function stopInactivityTimer() {
  if (idleInterval) {
    clearInterval(idleInterval);
  }
  // Remove event listeners
  window.removeEventListener("mousemove", () => {});
  window.removeEventListener("keypress", () => {});
  window.removeEventListener("mousedown", () => {});
  window.removeEventListener("scroll", () => {});
  window.removeEventListener("click", () => {});
}

/* ==========================================================================
   2. SIDEBAR PAGE ROUTING
   ========================================================================== */
function initSidebarNavigation() {
  const links = document.querySelectorAll(".sidebar-link");
  links.forEach(link => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      const panelId = link.getAttribute("data-panel");
      switchPanel(panelId);
    });
  });
}

function switchPanel(panelId) {
  currentPanel = panelId;
  const links = document.querySelectorAll(".sidebar-link");
  const panels = document.querySelectorAll(".admin-panel");
  const titleEl = document.getElementById("page-panel-title");

  // Toggle highlight
  links.forEach(l => {
    if (l.getAttribute("data-panel") === panelId) {
      l.classList.add("active");
    } else {
      l.classList.remove("active");
    }
  });

  // Toggle visibility
  panels.forEach(p => {
    if (p.id === `panel-${panelId}`) {
      p.classList.add("active");
    } else {
      p.classList.remove("active");
    }
  });

  // Set Topbar Title
  let pageTitle = panelId.charAt(0).toUpperCase() + panelId.slice(1);
  if (panelId === "details") pageTitle = "Adopter Application Details";
  titleEl.textContent = pageTitle;

  // Collapse sidebar drawer on mobile after selection
  document.getElementById("admin-sidebar").classList.remove("active");

  loadApplicationsFromStorage();
  
  if (panelId === "dashboard") {
    refreshStats();
    renderActivityTimelineFeed();
  } else if (panelId === "applications") {
    renderApplicationsTable();
  } else if (panelId === "analytics") {
    renderAnalyticsCharts();
  } else if (panelId === "settings") {
    loadSettingsFields();
  }
}

function initMobileSidebarToggle() {
  const toggleBtn = document.getElementById("sidebar-toggle-btn");
  const sidebar = document.getElementById("admin-sidebar");
  
  if (!toggleBtn) return;

  toggleBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    sidebar.classList.toggle("active");
  });

  document.addEventListener("click", (e) => {
    if (window.innerWidth <= 768 && !sidebar.contains(e.target) && sidebar.classList.contains("active")) {
      sidebar.classList.remove("active");
    }
  });
}

/* ==========================================================================
   3. STATS COMPUTATION & TIMELINE FEED
   ========================================================================== */
function loadApplicationsFromStorage() {
  applications = JSON.parse(localStorage.getItem("team_prayas_applications")) || [];
}

function refreshStats() {
  document.getElementById("val-total-apps").textContent = applications.length;
  document.getElementById("val-pending-apps").textContent = applications.filter(a => a.status === "Pending").length;
  document.getElementById("val-approved-apps").textContent = applications.filter(a => a.status === "Approved").length;
  document.getElementById("val-rejected-apps").textContent = applications.filter(a => a.status === "Rejected").length;

  // Today and weekly calculations
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  const todayCount = applications.filter(a => new Date(a.date) >= startOfToday).length;
  const weeklyCount = applications.filter(a => new Date(a.date) >= oneWeekAgo).length;

  document.getElementById("val-today-apps").textContent = todayCount;
  document.getElementById("val-weekly-apps").textContent = weeklyCount;
}

function renderActivityTimelineFeed() {
  const feedEl = document.getElementById("dashboard-activity-feed");
  if (!feedEl) return;

  feedEl.innerHTML = "";

  // Aggregate all timelines
  let events = [];
  applications.forEach(app => {
    app.timeline.forEach(event => {
      events.push({
        appId: app.id,
        appName: app.name,
        action: event.action,
        timestamp: event.timestamp,
        details: event.details
      });
    });
  });

  // Sort descending
  events.sort((x, y) => new Date(y.timestamp) - new Date(x.timestamp));

  const displayEvents = events.slice(0, 6);

  if (displayEvents.length === 0) {
    feedEl.innerHTML = `<li class="text-center" style="padding:20px; color:var(--muted-slate);">No logs registered inside database.</li>`;
    return;
  }

  displayEvents.forEach(evt => {
    const li = document.createElement("li");
    li.className = "activity-feed-item";

    let circleClass = "circle-submitted";
    let iconClass = "fa-solid fa-cloud-arrow-up";

    if (evt.action === "Status Changed") {
      circleClass = "circle-status-change";
      iconClass = "fa-solid fa-arrows-spin";
      if (evt.details.includes("Approved")) {
        circleClass = "circle-approved";
        iconClass = "fa-solid fa-circle-check";
      } else if (evt.details.includes("Rejected")) {
        circleClass = "circle-rejected";
        iconClass = "fa-solid fa-circle-xmark";
      }
    } else if (evt.action.includes("Note")) {
      circleClass = "circle-note";
      iconClass = "fa-solid fa-note-sticky";
    }

    const readableTime = new Date(evt.timestamp).toLocaleString();

    li.innerHTML = `
      <div class="activity-feed-icon-circle ${circleClass}">
        <i class="${iconClass}"></i>
      </div>
      <div class="activity-feed-details">
        <div class="activity-feed-text"><strong>${evt.appName} (${evt.appId}):</strong> ${evt.details}</div>
        <div class="activity-feed-meta">${readableTime}</div>
      </div>
    `;
    feedEl.appendChild(li);
  });
}

/* ==========================================================================
   4. APPLICATIONS DATA TABLE
   ========================================================================== */
function initTableHandlers() {
  const searchInput = document.getElementById("table-search");
  const filterTabs = document.querySelectorAll(".filter-tab-btn");
  const headers = document.querySelectorAll(".applications-table th.sortable");

  if (!searchInput) return;

  searchInput.addEventListener("input", (e) => {
    tableSearchQuery = e.target.value.toLowerCase().trim();
    tableCurrentPage = 1;
    renderApplicationsTable();
  });

  filterTabs.forEach(tab => {
    tab.addEventListener("click", () => {
      filterTabs.forEach(t => t.classList.remove("active"));
      tab.classList.add("active");
      
      tableStatusFilter = tab.getAttribute("data-filter");
      tableCurrentPage = 1;
      renderApplicationsTable();
    });
  });

  headers.forEach(th => {
    th.addEventListener("click", () => {
      const col = th.getAttribute("data-sort");
      if (tableSortColumn === col) {
        tableSortOrder = tableSortOrder === "asc" ? "desc" : "asc";
      } else {
        tableSortColumn = col;
        tableSortOrder = "asc";
      }

      headers.forEach(h => {
        h.querySelector("i").className = "fa-solid fa-sort";
      });
      const icon = th.querySelector("i");
      icon.className = tableSortOrder === "asc" ? "fa-solid fa-sort-up" : "fa-solid fa-sort-down";

      renderApplicationsTable();
    });
  });

  document.getElementById("btn-page-prev").addEventListener("click", () => {
    if (tableCurrentPage > 1) {
      tableCurrentPage--;
      renderApplicationsTable();
    }
  });

  document.getElementById("btn-page-next").addEventListener("click", () => {
    const totalFiltered = getFilteredApplications().length;
    const maxPage = Math.ceil(totalFiltered / tablePageSize);
    if (tableCurrentPage < maxPage) {
      tableCurrentPage++;
      renderApplicationsTable();
    }
  });
}

function getFilteredApplications() {
  let filtered = [...applications];

  // Search
  if (tableSearchQuery) {
    filtered = filtered.filter(app => 
      app.name.toLowerCase().includes(tableSearchQuery) ||
      app.id.toLowerCase().includes(tableSearchQuery) ||
      app.phone.toLowerCase().includes(tableSearchQuery) ||
      app.email.toLowerCase().includes(tableSearchQuery)
    );
  }

  // Filter Status
  if (tableStatusFilter !== "All") {
    filtered = filtered.filter(app => app.status === tableStatusFilter);
  }

  // Sort
  filtered.sort((a, b) => {
    let valA = a[tableSortColumn];
    let valB = b[tableSortColumn];

    if (tableSortColumn === "date") {
      valA = new Date(valA);
      valB = new Date(valB);
    } else {
      valA = valA.toString().toLowerCase();
      valB = valB.toString().toLowerCase();
    }

    if (valA < valB) return tableSortOrder === "asc" ? -1 : 1;
    if (valA > valB) return tableSortOrder === "asc" ? 1 : -1;
    return 0;
  });

  return filtered;
}

function renderApplicationsTable() {
  const tbody = document.getElementById("table-body");
  if (!tbody) return;

  tbody.innerHTML = "";
  const filtered = getFilteredApplications();

  const totalItems = filtered.length;
  const totalPages = Math.ceil(totalItems / tablePageSize) || 1;

  if (tableCurrentPage > totalPages) {
    tableCurrentPage = totalPages;
  }

  const startIdx = (tableCurrentPage - 1) * tablePageSize;
  const endIdx = Math.min(startIdx + tablePageSize, totalItems);

  document.getElementById("btn-page-prev").disabled = tableCurrentPage === 1;
  document.getElementById("btn-page-next").disabled = tableCurrentPage === totalPages;

  const infoEl = document.getElementById("pagination-info");
  if (totalItems === 0) {
    infoEl.textContent = "Showing 0 to 0 of 0 entries";
    tbody.innerHTML = `<tr><td colspan="7" class="text-center" style="padding:30px; color:var(--muted-slate); font-weight:500;">No matching applications found.</td></tr>`;
    return;
  }

  infoEl.textContent = `Showing ${startIdx + 1} to ${endIdx} of ${totalItems} entries`;

  const pageItems = filtered.slice(startIdx, endIdx);
  pageItems.forEach(app => {
    const tr = document.createElement("tr");
    
    let badgeClass = "status-pending";
    if (app.status === "Under Review") badgeClass = "status-review";
    else if (app.status === "Approved") badgeClass = "status-approved";
    else if (app.status === "Rejected") badgeClass = "status-rejected";

    const dateVal = new Date(app.date).toLocaleDateString("en-IN", {
      year: "numeric", month: "short", day: "numeric"
    });

    tr.innerHTML = `
      <td><strong>${app.id}</strong></td>
      <td>${app.name}</td>
      <td>${app.phone}</td>
      <td>${app.email}</td>
      <td>${app.animal} (${app.breed})</td>
      <td>${dateVal}</td>
      <td><span class="app-status-badge ${badgeClass}">${app.status}</span></td>
      <td>
        <button class="btn btn-secondary btn-small view-details-btn" style="padding: 6px 12px; font-size:0.8rem;" data-id="${app.id}">
          <i class="fa-solid fa-eye"></i> View
        </button>
      </td>
    `;
    
    tr.querySelector(".view-details-btn").addEventListener("click", () => {
      openApplicationProfile(app.id);
    });

    tbody.appendChild(tr);
  });
}

/* ==========================================================================
   5. APPLICANT DETAILS PROFILE & INTERNAL NOTES CRUD
   ========================================================================== */
function initDetailsHandlers() {
  const backBtn = document.getElementById("details-back-btn");
  const printBtn = document.getElementById("btn-print-app");
  const deleteBtn = document.getElementById("btn-delete-app");
  const statusBtns = document.querySelectorAll(".status-change-btn");
  const noteForm = document.getElementById("details-add-note-form");

  if (backBtn) {
    backBtn.addEventListener("click", () => {
      switchPanel("applications");
    });
  }

  statusBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      const targetStatus = btn.getAttribute("data-status");
      if (confirm(`Are you sure you want to update this application's status to "${targetStatus}"?`)) {
        updateApplicationStatus(currentApplicationId, targetStatus);
      }
    });
  });

  if (noteForm) {
    noteForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const textEl = document.getElementById("note-text-input");
      const textVal = textEl.value.trim();
      if (textVal) {
        addInternalNote(currentApplicationId, textVal);
        textEl.value = "";
      }
    });
  }

  if (deleteBtn) {
    deleteBtn.addEventListener("click", () => {
      if (confirm(`WARNING: Are you absolutely sure you want to delete application ${currentApplicationId}? This action cannot be undone.`)) {
        deleteApplication(currentApplicationId);
      }
    });
  }

  if (printBtn) {
    printBtn.addEventListener("click", () => {
      prepareAndTriggerPrint(currentApplicationId);
    });
  }
}

function openApplicationProfile(appId) {
  currentApplicationId = appId;
  switchPanel("details");
  loadApplicationsFromStorage();

  const app = applications.find(a => a.id === appId);
  if (!app) return;

  // Render values
  document.getElementById("det-name").textContent = app.name;
  document.getElementById("det-id").textContent = app.id;
  document.getElementById("det-age-gender").textContent = `${app.age} yrs / ${app.gender} (DOB: ${app.dob})`;
  document.getElementById("det-occupation").textContent = app.occupation;
  document.getElementById("det-phone").textContent = app.phone;
  document.getElementById("det-email").textContent = app.email;
  document.getElementById("det-address").textContent = `${app.address}, ${app.city}, ${app.state}`;
  document.getElementById("det-house").textContent = `${app.houseType} (${app.ownRent})`;
  document.getElementById("det-family").textContent = `${app.family} Member(s) (Other Pets: ${app.existingPets})`;
  document.getElementById("det-animal").textContent = `${app.animal} (${app.breed})`;
  document.getElementById("det-experience").textContent = app.experience;
  document.getElementById("det-reason").textContent = app.reason;
  
  // Extra fields
  const emergencyInfo = `Emergency Contact: ${app.emergency} | Financials: ${app.financial} | Time Availability: ${app.time}`;
  document.getElementById("det-photo").textContent = `ID Filename: ${app.photo} | ${emergencyInfo}`;

  // Status Badge
  const statusEl = document.getElementById("det-status");
  statusEl.className = `det-status-badge ${app.status.replace(" ", "_")}`;
  statusEl.textContent = app.status;

  // Highlight active status buttons
  const statusBtns = document.querySelectorAll(".status-change-btn");
  statusBtns.forEach(btn => {
    if (btn.getAttribute("data-status") === app.status) {
      btn.classList.add("active");
    } else {
      btn.classList.remove("active");
    }
  });

  renderNotes(app);
  renderHistoryTimeline(app);
}

function updateApplicationStatus(appId, newStatus) {
  loadApplicationsFromStorage();
  const idx = applications.findIndex(a => a.id === appId);
  if (idx === -1) return;

  const oldStatus = applications[idx].status;
  applications[idx].status = newStatus;

  // Audit timeline
  const timestamp = new Date().toISOString();
  applications[idx].timeline.push({
    action: "Status Changed",
    timestamp: timestamp,
    details: `Status updated from ${oldStatus} to ${newStatus} by admin.`
  });

  localStorage.setItem("team_prayas_applications", JSON.stringify(applications));
  openApplicationProfile(appId);
  showToast(`Application successfully updated to ${newStatus}.`, "success");
}

function renderNotes(app) {
  const listEl = document.getElementById("det-notes-list");
  if (!listEl) return;

  listEl.innerHTML = "";

  const notesList = app.notesLog || [];

  if (notesList.length === 0) {
    listEl.innerHTML = `<li style="padding:15px; color:var(--muted-slate); font-size:0.85rem; font-weight:500;" class="text-center">No internal notes written for this applicant.</li>`;
    return;
  }

  notesList.forEach(note => {
    const li = document.createElement("li");
    li.className = "note-item";
    
    const noteTime = new Date(note.timestamp).toLocaleString();

    li.innerHTML = `
      <div class="note-item-header">
        <span class="note-author"><i class="fa-solid fa-user-shield"></i> ${note.author}</span>
        <div class="note-actions">
          <button class="note-action-btn note-edit-btn" title="Edit Note" data-note-id="${note.id}"><i class="fa-solid fa-pen-to-square"></i></button>
          <button class="note-action-btn note-delete-btn" title="Delete Note" data-note-id="${note.id}"><i class="fa-solid fa-trash"></i></button>
        </div>
      </div>
      <span class="note-time">${noteTime}</span>
      <p class="note-text">${note.text}</p>
    `;

    // Bind Edit
    li.querySelector(".note-edit-btn").addEventListener("click", () => {
      const updatedText = prompt("Edit internal note:", note.text);
      if (updatedText && updatedText.trim() !== "") {
        editInternalNote(app.id, note.id, updatedText.trim());
      }
    });

    // Bind Delete
    li.querySelector(".note-delete-btn").addEventListener("click", () => {
      if (confirm("Are you sure you want to delete this internal note?")) {
        deleteInternalNote(app.id, note.id);
      }
    });

    listEl.appendChild(li);
  });
}

function addInternalNote(appId, noteText) {
  loadApplicationsFromStorage();
  const idx = applications.findIndex(a => a.id === appId);
  if (idx === -1) return;

  const noteId = `note-${Date.now()}`;
  const timestamp = new Date().toISOString();

  const newNote = {
    id: noteId,
    text: noteText,
    author: "admin_dev",
    timestamp: timestamp
  };

  if (!applications[idx].notesLog) {
    applications[idx].notesLog = [];
  }

  applications[idx].notesLog.unshift(newNote);

  // Timeline audit log
  applications[idx].timeline.push({
    action: "Note Added",
    timestamp: timestamp,
    details: `Note added by admin: "${noteText.substring(0, 30)}${noteText.length > 30 ? '...' : ''}"`
  });

  localStorage.setItem("team_prayas_applications", JSON.stringify(applications));
  openApplicationProfile(appId);
  showToast("Note added successfully.", "success");
}

function editInternalNote(appId, noteId, newText) {
  loadApplicationsFromStorage();
  const idx = applications.findIndex(a => a.id === appId);
  if (idx === -1) return;

  const noteIdx = applications[idx].notesLog.findIndex(n => n.id === noteId);
  if (noteIdx === -1) return;

  applications[idx].notesLog[noteIdx].text = newText;
  applications[idx].notesLog[noteIdx].timestamp = new Date().toISOString();

  applications[idx].timeline.push({
    action: "Note Edited",
    timestamp: new Date().toISOString(),
    details: `Note updated: "${newText.substring(0, 30)}..."`
  });

  localStorage.setItem("team_prayas_applications", JSON.stringify(applications));
  openApplicationProfile(appId);
  showToast("Note edited successfully.", "success");
}

function deleteInternalNote(appId, noteId) {
  loadApplicationsFromStorage();
  const idx = applications.findIndex(a => a.id === appId);
  if (idx === -1) return;

  const noteIdx = applications[idx].notesLog.findIndex(n => n.id === noteId);
  if (noteIdx === -1) return;

  const deletedNote = applications[idx].notesLog.splice(noteIdx, 1)[0];

  applications[idx].timeline.push({
    action: "Note Deleted",
    timestamp: new Date().toISOString(),
    details: `Note deleted: "${deletedNote.text.substring(0, 20)}..."`
  });

  localStorage.setItem("team_prayas_applications", JSON.stringify(applications));
  openApplicationProfile(appId);
  showToast("Note deleted.", "warning");
}

function renderHistoryTimeline(app) {
  const timelineEl = document.getElementById("det-history-list");
  if (!timelineEl) return;

  timelineEl.innerHTML = "";

  // Sort timeline logs descending
  const sortedLogs = [...app.timeline].sort((x, y) => new Date(y.timestamp) - new Date(x.timestamp));

  sortedLogs.forEach(evt => {
    const li = document.createElement("li");
    li.className = "history-item";
    
    const timeVal = new Date(evt.timestamp).toLocaleString();

    li.innerHTML = `
      <div>
        <span class="history-action">${evt.action}</span>
        <span class="history-time">${timeVal}</span>
      </div>
      <div class="history-details">${evt.details}</div>
    `;
    timelineEl.appendChild(li);
  });
}

function deleteApplication(appId) {
  loadApplicationsFromStorage();
  const filtered = applications.filter(a => a.id !== appId);
  localStorage.setItem("team_prayas_applications", JSON.stringify(filtered));
  
  showToast(`Application ${appId} deleted successfully.`, "warning");
  switchPanel("applications");
}

function prepareAndTriggerPrint(appId) {
  const app = applications.find(a => a.id === appId);
  if (!app) return;

  const printDiv = document.getElementById("print-container");
  if (!printDiv) return;

  const notesHtml = app.notesLog && app.notesLog.length > 0 
    ? app.notesLog.map(n => `
        <div style="border-left: 3px solid #000; padding-left:10px; margin-bottom:12px;">
          <div style="font-weight:bold; font-size:10pt;">${n.author} &bull; ${new Date(n.timestamp).toLocaleString()}</div>
          <div style="font-size:10pt; font-style:italic;">${n.text}</div>
        </div>
      `).join("")
    : "<p style='font-size:10pt;'>No administrative notes written.</p>";

  const timelineHtml = app.timeline.map(t => `
    <div style="font-size:9pt; margin-bottom:5px;">
      <strong>${t.action}</strong> [${new Date(t.timestamp).toLocaleString()}]: ${t.details}
    </div>
  `).join("");

  printDiv.innerHTML = `
    <div style="padding: 40px; font-family:'Helvetica Neue', Arial, sans-serif; color:#000000;">
      <div style="text-align:center; border-bottom: 3px double #000; padding-bottom:15px; margin-bottom:30px;">
        <h1 style="margin:0; font-size:24pt; text-transform:uppercase;">Team Prayas Surat Shelter</h1>
        <p style="margin:5px 0 0 0; font-size:10pt; letter-spacing:1px;">ADOPTION APPLICATION PROFILE SHEET</p>
      </div>

      <table style="width:100%; border-collapse:collapse; margin-bottom:30px; font-size:11pt;">
        <tr>
          <td style="width:20%; font-weight:bold; padding:8px 0;">Application ID:</td>
          <td style="width:30%; padding:8px 0;">${app.id}</td>
          <td style="width:20%; font-weight:bold; padding:8px 0;">Date Lodged:</td>
          <td style="width:30%; padding:8px 0;">${new Date(app.date).toLocaleDateString()}</td>
        </tr>
        <tr>
          <td style="font-weight:bold; padding:8px 0;">Applicant Name:</td>
          <td style="padding:8px 0;">${app.name}</td>
          <td style="font-weight:bold; padding:8px 0;">Age / Gender:</td>
          <td style="padding:8px 0;">${app.age} years / ${app.gender} (DOB: ${app.dob})</td>
        </tr>
        <tr>
          <td style="font-weight:bold; padding:8px 0;">Phone:</td>
          <td style="padding:8px 0;">${app.phone}</td>
          <td style="font-weight:bold; padding:8px 0;">Email:</td>
          <td style="padding:8px 0;">${app.email}</td>
        </tr>
        <tr>
          <td style="font-weight:bold; padding:8px 0;">Occupation:</td>
          <td style="padding:8px 0;">${app.occupation}</td>
          <td style="font-weight:bold; padding:8px 0;">Current Status:</td>
          <td style="padding:8px 0; font-weight:bold; text-transform:uppercase;">${app.status}</td>
        </tr>
        <tr>
          <td style="font-weight:bold; padding:8px 0; vertical-align:top;">Address:</td>
          <td colspan="3" style="padding:8px 0;">${app.address}, ${app.city}, ${app.state}</td>
        </tr>
        <tr>
          <td style="font-weight:bold; padding:8px 0;">House Type:</td>
          <td style="padding:8px 0;">${app.houseType} (${app.ownRent})</td>
          <td style="font-weight:bold; padding:8px 0;">Family Members:</td>
          <td style="padding:8px 0;">${app.family} Member(s) (Pets: ${app.existingPets})</td>
        </tr>
        <tr>
          <td style="font-weight:bold; padding:8px 0;">Preferred Pet:</td>
          <td style="padding:8px 0;">${app.animal} (${app.breed})</td>
          <td style="font-weight:bold; padding:8px 0;">Pet Experience:</td>
          <td style="padding:8px 0;">${app.experience}</td>
        </tr>
      </table>

      <div style="margin-bottom:30px;">
        <h3 style="border-bottom:1px solid #000; padding-bottom:5px; margin-bottom:10px; font-size:12pt; text-transform:uppercase;">Reason for Adoption</h3>
        <p style="font-size:10pt; line-height:1.6; font-style:italic;">"${app.reason}"</p>
      </div>

      <div style="margin-bottom:30px; page-break-inside:avoid;">
        <h3 style="border-bottom:1px solid #000; padding-bottom:5px; margin-bottom:10px; font-size:12pt; text-transform:uppercase;">Internal Notes Timeline</h3>
        ${notesHtml}
      </div>

      <div style="page-break-inside:avoid;">
        <h3 style="border-bottom:1px solid #000; padding-bottom:5px; margin-bottom:10px; font-size:12pt; text-transform:uppercase;">Application System Audit Trail</h3>
        ${timelineHtml}
      </div>
    </div>
  `;

  window.print();
}

/* ==========================================================================
   6. PURE JS SVG CHARTS GENERATOR
   ========================================================================== */
function renderAnalyticsCharts() {
  drawMonthlySubmissionsChart();
  drawAnimalCategoriesDonut();
  drawAdoptionStatusPie();
  drawWeeklyTrendLine();
}

function drawMonthlySubmissionsChart() {
  const container = document.getElementById("bar-chart-container");
  if (!container) return;

  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const monthlyCounts = new Array(12).fill(0);

  applications.forEach(app => {
    const d = new Date(app.date);
    if (d.getFullYear() === new Date().getFullYear()) {
      monthlyCounts[d.getMonth()]++;
    }
  });

  const width = 450;
  const height = 220;
  const padding = 30;
  const chartWidth = width - 2 * padding;
  const chartHeight = height - 2 * padding;

  const maxVal = Math.max(...monthlyCounts, 5);

  let barsSvg = "";
  let gridLinesSvg = "";
  let axesLabelsSvg = "";

  const barWidth = (chartWidth / 12) * 0.65;
  const barSpacing = chartWidth / 12;

  // Grid lines
  for (let i = 0; i <= 4; i++) {
    const yGrid = padding + chartHeight - (chartHeight / 4) * i;
    const labelVal = Math.round((maxVal / 4) * i);
    gridLinesSvg += `<line x1="${padding}" y1="${yGrid}" x2="${width - padding}" y2="${yGrid}" class="chart-grid-line" />`;
    axesLabelsSvg += `<text x="${padding - 8}" y="${yGrid + 4}" text-anchor="end" class="chart-label">${labelVal}</text>`;
  }

  monthlyCounts.forEach((val, idx) => {
    const xBar = padding + idx * barSpacing + (barSpacing - barWidth) / 2;
    const barHeight = val > 0 ? (val / maxVal) * chartHeight : 2;
    const yBar = padding + chartHeight - barHeight;

    barsSvg += `
      <rect x="${xBar}" y="${yBar}" width="${barWidth}" height="${barHeight}" rx="3" class="chart-bar">
        <title>Month: ${months[idx]} \nApplications: ${val}</title>
      </rect>
    `;

    axesLabelsSvg += `<text x="${xBar + barWidth / 2}" y="${height - padding + 15}" text-anchor="middle" class="chart-label">${months[idx]}</text>`;
  });

  container.innerHTML = `
    <svg viewBox="0 0 ${width} ${height}" class="svg-chart">
      ${gridLinesSvg}
      <line x1="${padding}" y1="${padding}" x2="${padding}" y2="${height - padding}" class="chart-axis" />
      <line x1="${padding}" y1="${height - padding}" x2="${width - padding}" y2="${height - padding}" class="chart-axis" />
      ${barsSvg}
      ${axesLabelsSvg}
    </svg>
  `;
}

function drawAnimalCategoriesDonut() {
  const container = document.getElementById("donut-chart-container");
  if (!container) return;

  let dogs = 0;
  let cats = 0;
  let others = 0;

  applications.forEach(app => {
    const a = app.animal.toLowerCase();
    if (a.includes("dog")) dogs++;
    else if (a.includes("cat")) cats++;
    else others++;
  });

  const total = dogs + cats + others;

  if (total === 0) {
    container.innerHTML = "<p style='color:var(--muted-slate); font-size:0.85rem;'>No data available to display.</p>";
    return;
  }

  const dogPercent = Math.round((dogs / total) * 100);
  const catPercent = Math.round((cats / total) * 100);
  const otherPercent = 100 - (dogPercent + catPercent);

  const radius = 50;
  const circumference = 2 * Math.PI * radius; // ~314.16

  const dogStroke = (dogPercent / 100) * circumference;
  const catStroke = (catPercent / 100) * circumference;
  const otherStroke = (otherPercent / 100) * circumference;

  let currentOffset = 0;
  const slice1Offset = currentOffset;
  currentOffset -= dogStroke;
  const slice2Offset = currentOffset;
  currentOffset -= catStroke;
  const slice3Offset = currentOffset;

  container.innerHTML = `
    <svg viewBox="0 0 200 200" class="svg-chart" style="max-height:220px;">
      <!-- Dog (Forest Green) -->
      ${dogPercent > 0 ? `<circle cx="100" cy="100" r="${radius}" class="donut-slice" stroke="#2E7D32" stroke-dasharray="${dogStroke} ${circumference - dogStroke}" stroke-dashoffset="${slice1Offset}"><title>Dogs: ${dogs} (${dogPercent}%)</title></circle>` : ''}
      
      <!-- Cat (Sage Accent) -->
      ${catPercent > 0 ? `<circle cx="100" cy="100" r="${radius}" class="donut-slice" stroke="#81C784" stroke-dasharray="${catStroke} ${circumference - catStroke}" stroke-dashoffset="${slice2Offset}"><title>Cats: ${cats} (${catPercent}%)</title></circle>` : ''}
      
      <!-- Other (Slate) -->
      ${otherPercent > 0 ? `<circle cx="100" cy="100" r="${radius}" class="donut-slice" stroke="#94A3B8" stroke-dasharray="${otherStroke} ${circumference - otherStroke}" stroke-dashoffset="${slice3Offset}"><title>Others: ${others} (${otherPercent}%)</title></circle>` : ''}

      <text x="100" y="102" text-anchor="middle" class="donut-center-text-val">${total}</text>
      <text x="100" y="118" text-anchor="middle" class="donut-center-text-label">Total Requests</text>
    </svg>
    
    <div class="chart-legend-container">
      <div class="chart-legend-item"><span class="legend-color-dot" style="background:#2E7D32"></span><span>Dogs (${dogPercent}%)</span></div>
      <div class="chart-legend-item"><span class="legend-color-dot" style="background:#81C784"></span><span>Cats (${catPercent}%)</span></div>
      <div class="chart-legend-item"><span class="legend-color-dot" style="background:#94A3B8"></span><span>Others (${otherPercent}%)</span></div>
    </div>
  `;
}

function drawAdoptionStatusPie() {
  const container = document.getElementById("status-chart-container");
  if (!container) return;

  const approved = applications.filter(a => a.status === "Approved").length;
  const pending = applications.filter(a => a.status === "Pending").length;
  const review = applications.filter(a => a.status === "Under Review").length;
  const rejected = applications.filter(a => a.status === "Rejected").length;

  const total = approved + pending + review + rejected;

  if (total === 0) {
    container.innerHTML = "<p style='color:var(--muted-slate); font-size:0.85rem;'>No data available to display.</p>";
    return;
  }

  const radius = 50;
  const circumference = 2 * Math.PI * radius;

  const pApproved = Math.round((approved / total) * 100);
  const pPending = Math.round((pending / total) * 100);
  const pReview = Math.round((review / total) * 100);
  const pRejected = 100 - (pApproved + pPending + pReview);

  const approvedStroke = (pApproved / 100) * circumference;
  const pendingStroke = (pPending / 100) * circumference;
  const reviewStroke = (pReview / 100) * circumference;
  const rejectedStroke = (pRejected / 100) * circumference;

  let currentOffset = 0;
  const slice1Offset = currentOffset;
  currentOffset -= approvedStroke;
  const slice2Offset = currentOffset;
  currentOffset -= pendingStroke;
  const slice3Offset = currentOffset;
  currentOffset -= reviewStroke;
  const slice4Offset = currentOffset;

  container.innerHTML = `
    <svg viewBox="0 0 200 200" class="svg-chart" style="max-height:220px;">
      <!-- Approved (Green) -->
      ${pApproved > 0 ? `<circle cx="100" cy="100" r="${radius}" class="donut-slice" stroke="#10B981" stroke-dasharray="${approvedStroke} ${circumference - approvedStroke}" stroke-dashoffset="${slice1Offset}"><title>Approved: ${approved} (${pApproved}%)</title></circle>` : ''}
      
      <!-- Pending (Gray) -->
      ${pPending > 0 ? `<circle cx="100" cy="100" r="${radius}" class="donut-slice" stroke="#94A3B8" stroke-dasharray="${pendingStroke} ${circumference - pendingStroke}" stroke-dashoffset="${slice2Offset}"><title>Pending: ${pending} (${pPending}%)</title></circle>` : ''}
      
      <!-- Under Review (Orange) -->
      ${pReview > 0 ? `<circle cx="100" cy="100" r="${radius}" class="donut-slice" stroke="#F59E0B" stroke-dasharray="${reviewStroke} ${circumference - reviewStroke}" stroke-dashoffset="${slice3Offset}"><title>Review: ${review} (${pReview}%)</title></circle>` : ''}
      
      <!-- Rejected (Red) -->
      ${pRejected > 0 ? `<circle cx="100" cy="100" r="${radius}" class="donut-slice" stroke="#EF4444" stroke-dasharray="${rejectedStroke} ${circumference - rejectedStroke}" stroke-dashoffset="${slice4Offset}"><title>Rejected: ${rejected} (${pRejected}%)</title></circle>` : ''}

      <text x="100" y="108" text-anchor="middle" class="donut-center-text-val" style="font-size:20px;">${total}</text>
      <text x="100" y="122" text-anchor="middle" class="donut-center-text-label">Processed</text>
    </svg>

    <div class="chart-legend-container">
      <div class="chart-legend-item"><span class="legend-color-dot" style="background:#10B981"></span><span>Approved (${pApproved}%)</span></div>
      <div class="chart-legend-item"><span class="legend-color-dot" style="background:#94A3B8"></span><span>Pending (${pPending}%)</span></div>
      <div class="chart-legend-item"><span class="legend-color-dot" style="background:#F59E0B"></span><span>Review (${pReview}%)</span></div>
      <div class="chart-legend-item"><span class="legend-color-dot" style="background:#EF4444"></span><span>Rejected (${pRejected}%)</span></div>
    </div>
  `;
}

function drawWeeklyTrendLine() {
  const container = document.getElementById("line-chart-container");
  if (!container) return;

  const dayCounts = new Array(7).fill(0);
  const dayLabels = [];
  const now = new Date();

  const datesList = [];
  for (let i = 6; i >= 0; i--) {
    const tempDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
    datesList.push(tempDate);
    dayLabels.push(tempDate.toLocaleDateString("en-IN", { day: "numeric", month: "short" }));
  }

  applications.forEach(app => {
    const appDate = new Date(app.date);
    datesList.forEach((dt, idx) => {
      if (appDate.getFullYear() === dt.getFullYear() && 
          appDate.getMonth() === dt.getMonth() && 
          appDate.getDate() === dt.getDate()) {
        dayCounts[idx]++;
      }
    });
  });

  const width = 450;
  const height = 220;
  const padding = 30;
  const chartWidth = width - 2 * padding;
  const chartHeight = height - 2 * padding;

  const maxVal = Math.max(...dayCounts, 4);

  let gridLinesSvg = "";
  let axesLabelsSvg = "";
  let pointsSvg = "";

  // Grid lines
  for (let i = 0; i <= 4; i++) {
    const yGrid = padding + chartHeight - (chartHeight / 4) * i;
    const labelVal = Math.round((maxVal / 4) * i);
    gridLinesSvg += `<line x1="${padding}" y1="${yGrid}" x2="${width - padding}" y2="${yGrid}" class="chart-grid-line" />`;
    axesLabelsSvg += `<text x="${padding - 8}" y="${yGrid + 4}" text-anchor="end" class="chart-label">${labelVal}</text>`;
  }

  const spacing = chartWidth / 6;
  const coords = [];

  dayCounts.forEach((val, idx) => {
    const x = padding + idx * spacing;
    const y = padding + chartHeight - (val / maxVal) * chartHeight;
    coords.push({ x, y });

    axesLabelsSvg += `<text x="${x}" y="${height - padding + 15}" text-anchor="middle" class="chart-label">${dayLabels[idx]}</text>`;
    pointsSvg += `<circle cx="${x}" cy="${y}" r="4" class="chart-line-point"><title>Date: ${dayLabels[idx]} \nApplications: ${val}</title></circle>`;
  });

  const pointsPathString = coords.map(pt => `${pt.x},${pt.y}`).join(" ");

  container.innerHTML = `
    <svg viewBox="0 0 ${width} ${height}" class="svg-chart">
      ${gridLinesSvg}
      <line x1="${padding}" y1="${padding}" x2="${padding}" y2="${height - padding}" class="chart-axis" />
      <line x1="${padding}" y1="${height - padding}" x2="${width - padding}" y2="${height - padding}" class="chart-axis" />
      <polyline points="${pointsPathString}" class="chart-line" stroke-dasharray="600" stroke-dashoffset="600" />
      ${pointsSvg}
      ${axesLabelsSvg}
    </svg>
  `;
}

/* ==========================================================================
   7. PORTAL SETTINGS & CREDENTIALS FORM
   ========================================================================== */
function initSettingsForm() {
  const form = document.getElementById("admin-settings-form");
  if (!form) return;

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const userVal = document.getElementById("settings-username").value.trim();
    const passVal = document.getElementById("settings-password").value.trim();

    if (userVal.length < 3 || passVal.length < 3) {
      showToast("Username and password must be at least 3 characters long.", "error");
      return;
    }

    localStorage.setItem("team_prayas_admin", JSON.stringify({
      username: userVal,
      password: passVal
    }));

    showToast("Credentials updated successfully.", "success");
  });
}

function loadSettingsFields() {
  const stored = JSON.parse(localStorage.getItem("team_prayas_admin")) || {
    username: ADMIN_CREDENTIALS.USERNAME,
    password: ADMIN_CREDENTIALS.PASSWORD
  };

  document.getElementById("settings-username").value = stored.username;
  document.getElementById("settings-password").value = stored.password;
}

/* ==========================================================================
   8. TOAST SYSTEM FOR ADMIN
   ========================================================================== */
function showToast(message, type = "success") {
  let container = document.getElementById("admin-toast-container");
  if (!container) {
    container = document.createElement("div");
    container.id = "admin-toast-container";
    container.className = "toast-container";
    document.body.appendChild(container);
  }

  const toast = document.createElement("div");
  toast.className = `toast toast-${type}`;
  
  let iconClass = "fa-solid fa-circle-check";
  if (type === "warning") iconClass = "fa-solid fa-circle-exclamation";
  if (type === "error") iconClass = "fa-solid fa-circle-xmark";

  toast.innerHTML = `
    <i class="${iconClass} toast-icon"></i>
    <span class="toast-message">${message}</span>
    <button class="toast-close"><i class="fa-solid fa-xmark"></i></button>
  `;

  toast.querySelector(".toast-close").addEventListener("click", () => {
    removeToast(toast);
  });

  container.appendChild(toast);

  setTimeout(() => {
    removeToast(toast);
  }, 4000);
}

function removeToast(toast) {
  toast.style.opacity = "0";
  toast.style.transform = "translateX(50px) scale(0.9)";
  toast.addEventListener("transitionend", () => {
    toast.remove();
  });
}
