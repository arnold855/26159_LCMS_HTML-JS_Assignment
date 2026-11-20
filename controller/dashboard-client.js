import { requireRole } from "./session.js";
import { getForClient, getUserName, getStats } from "../model/data-store.js";

const user = requireRole("client");

if (user) {
  document.getElementById("welcomeName").textContent = user.name;
  loadDashboard();
}

async function loadDashboard() {
  const tbody = document.getElementById("casesTableBody");
  try {
    const cases = await getForClient(user.id);
    const stats = getStats(cases);

    document.getElementById("statTotal").textContent = stats.total;
    document.getElementById("statOpen").textContent = stats.open;
    document.getElementById("statInProgress").textContent = stats.inProgress;
    document.getElementById("statClosed").textContent = stats.closed;
    document.getElementById("statUpcoming").textContent = stats.upcomingHearings;

    tbody.innerHTML = "";

    if (cases.length === 0) {
      tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;padding:24px;color:#6b7280">No cases assigned yet.</td></tr>';
      return;
    }

    for (const c of cases) {
      const lawyerName = await getUserName(c.lawyerId);
      const row = document.createElement("tr");
      row.innerHTML = `
        <td style="font-family:monospace;color:#6b7280">${c.id}</td>
        <td style="font-weight:600">${escapeHtml(c.title)}</td>
        <td>${c.type}</td>
        <td>${statusBadge(c.status)}</td>
        <td>${escapeHtml(lawyerName)}</td>
        <td>${c.hearing ? `<span style="color:var(--navy);font-weight:500">${c.hearing}</span>` : '<span style="color:#6b7280">—</span>'}</td>
      `;
      tbody.appendChild(row);
    }
  } catch (err) {
    console.error(err);
    tbody.innerHTML = '<tr><td colspan="6">Could not load case data. Make sure this page is opened through a local server (e.g. http://localhost/...), not opened directly as a file.</td></tr>';
  }
}

function statusBadge(status) {
  if (status === "Open") return '<span class="badge badge-open">Open</span>';
  if (status === "In Progress") return '<span class="badge badge-progress">In Progress</span>';
  if (status === "Closed") return '<span class="badge badge-closed">Closed</span>';
  return `<span class="badge">${status}</span>`;
}

function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}
