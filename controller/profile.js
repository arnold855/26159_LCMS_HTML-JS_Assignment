const raw = localStorage.getItem("lex_user");

if (!raw) {
  window.location.href = "login.html";
} else {
  const user = JSON.parse(raw);

  document.getElementById("profileAvatar").textContent = user.name.charAt(0).toUpperCase();
  document.getElementById("profileName").textContent   = user.name;
  document.getElementById("profileEmail").textContent  = user.email;
  document.getElementById("profilePhone").textContent  = user.phone || "—";
  document.getElementById("profileRole").textContent   = user.role.charAt(0).toUpperCase() + user.role.slice(1);
  document.getElementById("profileId").textContent     = user.id;

  const badge = document.getElementById("profileBadge");
  badge.textContent = user.role === "lawyer" ? "⚖️ Lawyer" : " Client";
  badge.style.background = user.role === "lawyer" ? "#1b2a49" : "#ffd166";
  badge.style.color      = user.role === "lawyer" ? "#ffd166" : "#1b2a49";
}
