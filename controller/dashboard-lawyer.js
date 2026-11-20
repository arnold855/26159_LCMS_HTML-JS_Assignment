import { requireRole } from "./session.js";
import { getForLawyer, getClients, getUserName, createCase, getStats, updateCaseStatus } from "../model/data-store.js";

const user = requireRole("lawyer");

if (user) {
  document.getElementById("welcomeName").textContent = user.name;
  loadDashboard();

  document.getElementById("newCaseForm").addEventListener("submit", async function (e) {
    e.preventDefault();

    const filed = document.getElementById("caseFiled").value;
    const hearing = document.getElementById("caseHearing").value;
    const messageBox = document.getElementById("formMessage");

    messageBox.style.display = "none";
    messageBox.className = "";

    if (hearing !== "" && hearing < filed) {
      showMsg(messageBox, "Hearing date cannot be before the filing date.", "error-text");
      return;
    }

    const saveBtn = document.getElementById("saveBtn");
    saveBtn.textContent = "Saving...";
    saveBtn.disabled = true;

    try {
      const newCase = await createCase(
        document.getElementById("caseTitle").value,
        document.getElementById("caseType").value,
        user.id,
        document.getElementById("caseClient").value,
        filed,
        hearing,
        document.getElementById("caseDescription").value
      );
      showMsg(messageBox, "✓ Case " + newCase.id + " saved successfully.", "success-text");
      document.getElementById("newCaseForm").reset();
      loadDashboard();
    } catch (err) {
      console.error(err);
      showMsg(messageBox, err.message || "Could not save this case. Make sure the site is running through Apache.", "error-text");
    } finally {
      saveBtn.textContent = "Save Case";
      saveBtn.disabled = false;
    }
  });
}

async function loadDashboard() {
  try {
    const cases = await getForLawyer(user.id);
    const clients = await getClients();
    const stats = getStats(cases);
    renderStats(stats);
    renderCasesTable(cases);
    renderClientOptions(clients);
  } catch (err) {
    console.error(err);
    document.getElementById("casesTableBody").innerHTML =
      '<tr><td colspan="7" style="text-align:center;padding:24px;color:#6b7280">Could not load case data. Make sure this page is opened through a local server (e.g. http://localhost/...), not opened directly as a file.</td></tr>';
  }
}

function renderStats(stats) {
  document.getElementById("statTotal").textContent = stats.total;
  document.getElementById("statOpen").textContent = stats.open;
  document.getElementById("statInProgress").textContent = stats.inProgress;
  document.getElementById("statClosed").textContent = stats.closed;
  document.getElementById("statUpcoming").textContent = stats.upcomingHearings;

  const breakdownList = document.getElementById("typeBreakdown");
  breakdownList.innerHTML = "";
  Object.keys(stats.byType).forEach(function(type) {
    const li = document.createElement("li");
    li.textContent = type + ": " + stats.byType[type];
    breakdownList.appendChild(li);
  });
}

async function renderCasesTable(cases) {
  const tbody = document.getElementById("casesTableBody");
  tbody.innerHTML = "";

  if (cases.length === 0) {
    tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;padding:24px;color:#6b7280">No cases yet. Add one using the form below.</td></tr>';
    return;
  }

  for (const c of cases) {
    const clientName = await getUserName(c.clientId);
    const row = document.createElement("tr");
    row.innerHTML = `
      <td style="font-family:monospace;color:#6b7280">${c.id}</td>
      <td style="font-weight:600">${escapeHtml(c.title)}</td>
      <td>${c.type}</td>
      <td>${statusBadge(c.status)}</td>
      <td>${escapeHtml(clientName)}</td>
      <td>${c.hearing ? '<span style="color:var(--navy);font-weight:500">' + c.hearing + "</span>" : '<span style="color:#6b7280">—</span>'}</td>
      <td>
        <select class="status-select" data-id="${c.id}">
          <option value="Open"${c.status === "Open" ? " selected" : ""}>Open</option>
          <option value="In Progress"${c.status === "In Progress" ? " selected" : ""}>In Progress</option>
          <option value="Closed"${c.status === "Closed" ? " selected" : ""}>Closed</option>
        </select>
      </td>
    `;
    tbody.appendChild(row);
  }

  tbody.querySelectorAll(".status-select").forEach(function(sel) {
    sel.addEventListener("change", async function() {
      sel.disabled = true;
      try {
        await updateCaseStatus(sel.getAttribute("data-id"), sel.value);
        loadDashboard();
      } catch (err) {
        console.error(err);
        sel.disabled = false;
      }
    });
  });
}

function renderClientOptions(clients) {
  const select = document.getElementById("caseClient");
  select.innerHTML = '<option value="">-- Choose client --</option>';
  clients.forEach(function(client) {
    const option = document.createElement("option");
    option.value = client.id;
    option.textContent = client.name;
    select.appendChild(option);
  });
}

function statusBadge(status) {
  if (status === "Open") return '<span class="badge badge-open">Open</span>';
  if (status === "In Progress") return '<span class="badge badge-progress">In Progress</span>';
  if (status === "Closed") return '<span class="badge badge-closed">Closed</span>';
  return '<span class="badge">' + status + "</span>";
}

function showMsg(el, msg, cls) {
  el.textContent = msg;
  el.className = cls;
  el.style.display = "block";
}

function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}
