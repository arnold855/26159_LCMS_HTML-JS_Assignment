const contactForm = document.getElementById("contactForm");

contactForm.addEventListener("submit", async function (e) {
  e.preventDefault();

  const errorBox = document.getElementById("errorMessage");
  const successBox = document.getElementById("successMessage");
  const name    = document.getElementById("fullName").value.trim();
  const email   = document.getElementById("email").value.trim();
  const subject = document.getElementById("subject").value;
  const message = document.getElementById("messageText").value.trim();

  errorBox.style.display = "none";
  successBox.style.display = "none";

  try {
    const response = await fetch("save-contact.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, subject, message })
    });

    const result = await response.json();

    if (!response.ok) {
      errorBox.textContent = result.error || "Could not send your message.";
      errorBox.style.display = "block";
      return;
    }

    successBox.textContent = "✓ Thank you " + name + ", your message has been received.";
    successBox.style.display = "block";
    contactForm.reset();
  } catch (err) {
    errorBox.textContent = "Could not send your message. Make sure the site is running through Apache.";
    errorBox.style.display = "block";
  }
});
