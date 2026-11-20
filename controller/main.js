const hour = new Date().getHours();
const greeting = document.getElementById("greeting");

if (hour < 12) {
  greeting.textContent = "Good Morning, Welcome to Legal Case Management System";
} else if (hour < 18) {
  greeting.textContent = "Good Afternoon, Welcome to Legal Case Management System";
} else {
  greeting.textContent = "Good Evening, Welcome to Legal Case Management System";
}
