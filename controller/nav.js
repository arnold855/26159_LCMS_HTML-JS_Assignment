import { getSession, logout } from "./session.js";

export function renderHeader() {
  const user = getSession();
  const header = document.getElementById("site-header");
  if (!header) return;

  const page = window.location.pathname.split("/").pop();

  function navLink(href, label) {
    const active = (page === href || (href === "index.html" && page === "")) ? "nav-active" : "";
    return `<a href="${href}" class="${active}">${label}</a>`;
  }

  let userSection = "";
  if (user) {
    const initials = user.name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
    const firstName = user.name.split(" ")[0];
    userSection = `
      <a href="profile.html" style="text-decoration:none">
        <span class="nav-user-badge">
          <span class="nav-avatar">${initials}</span>
          <span class="nav-user-name">${firstName}</span>
        </span>
      </a>
      <a href="dashboard-${user.role}.html" class="${page === "dashboard-" + user.role + ".html" ? "nav-active" : ""}">Dashboard</a>
      <a href="#" id="logoutLink">Logout</a>
    `;
  } else {
    userSection = `
      ${navLink("login.html", "Login")}
      ${navLink("register.html", "Register")}
    `;
  }

  header.innerHTML = `
    <a href="index.html" class="brand">
      <span class="brand-icon"><img src="image.jpg" alt="logo" style="width:100%;height:100%;object-fit:cover;border-radius:6px;"></span>
      LegalCase MS
    </a>
    <nav>
      ${navLink("index.html", "Home")}
      ${navLink("about.html", "About")}
      ${navLink("contact.html", "Contact")}
      ${navLink("server-datetime.php", "Server Time")}
      ${userSection}
    </nav>
  `;

  const logoutLink = document.getElementById("logoutLink");
  if (logoutLink) {
    logoutLink.addEventListener("click", function (e) {
      e.preventDefault();
      logout();
    });
  }
}

export function renderFooter() {
  const footer = document.getElementById("site-footer");
  if (!footer) return;
  footer.innerHTML = `<p style="margin:0">&copy; ${new Date().getFullYear()} Legal Case Management System &mdash; KG 7 Ave, Kigali, Rwanda</p>`;
}
