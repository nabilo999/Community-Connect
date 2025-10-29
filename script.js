// =============== THEME TOGGLE ===============
const toggle = document.getElementById("themeToggle");
if (toggle) {
  toggle.addEventListener("click", () => {
    document.body.classList.toggle("dark-mode");
    // Save theme preference
    const isDark = document.body.classList.contains("dark-mode");
    localStorage.setItem("theme", isDark ? "dark" : "light");
  });
}

// =============== REMEMBER THEME ===============
if (localStorage.getItem("theme") === "dark") {
  document.body.classList.add("dark-mode");
}

// =============== ACTIVE PAGE HIGHLIGHT ===============
const links = document.querySelectorAll(".nav-item");
links.forEach(link => {
  if (link.href === window.location.href) {
    link.classList.add("active");
  }
});
