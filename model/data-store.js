const USERS_URL = "../data/users.json";
const CASES_URL = "../data/cases.json";
const SAVE_USER_URL = "save-user.php";
const SAVE_CASE_URL = "save-case.php";

export async function getAllUsers() {
  const response = await fetch(USERS_URL, { cache: "no-store" });
  if (!response.ok) {
    throw new Error("Could not load data/users.json (status " + response.status + ")");
  }
  return response.json();
}

export async function findForLogin(email, password, role) {
  const response = await fetch("check-login.php", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password, role })
  });
  if (!response.ok) return null;
  return response.json();
}

export async function emailExists(email) {
  const users = await getAllUsers();
  return users.some(u => u.email === email);
}


export async function createUser(name, email, phone, password, role) {
  const response = await fetch(SAVE_USER_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email, phone, password, role })
  });

  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.error || "Could not save the new user.");
  }
  return result;
}

export async function getClients() {
  const users = await getAllUsers();
  return users.filter(u => u.role === "client");
}

export async function getUserName(id) {
  const users = await getAllUsers();
  const user = users.find(u => u.id == id);
  return user ? user.name : "Unknown";
}

export async function getAllCases() {
  const response = await fetch(CASES_URL, { cache: "no-store" });
  if (!response.ok) {
    throw new Error("Could not load data/cases.json (status " + response.status + ")");
  }
  return response.json();
}

export async function getForLawyer(lawyerId) {
  const cases = await getAllCases();
  return cases.filter(c => c.lawyerId == lawyerId);
}

export async function getForClient(clientId) {
  const cases = await getAllCases();
  return cases.filter(c => c.clientId == clientId);
}

export async function createCase(title, type, lawyerId, clientId, filed, hearing, description) {
  const response = await fetch(SAVE_CASE_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title, type, lawyerId, clientId, filed, hearing, description })
  });

  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.error || "Could not save the new case.");
  }
  return result;
}

export function getStats(cases) {
  const stats = {
    total: cases.length,
    open: 0,
    inProgress: 0,
    closed: 0,
    upcomingHearings: 0,
    byType: {}
  };

  const now = new Date();
  const in30Days = new Date();
  in30Days.setDate(now.getDate() + 30);

  cases.forEach(c => {
    if (c.status === "Open") stats.open++;
    else if (c.status === "In Progress") stats.inProgress++;
    else if (c.status === "Closed") stats.closed++;

    if (c.hearing) {
      const hearingDate = new Date(c.hearing);
      if (hearingDate >= now && hearingDate <= in30Days) {
        stats.upcomingHearings++;
      }
    }

    stats.byType[c.type] = (stats.byType[c.type] || 0) + 1;
  });

  return stats;
}

export async function updateCaseStatus(id, status) {
  const response = await fetch("update-case-status.php", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id, status })
  });
  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.error || "Could not update case status.");
  }
  return result;
}
