const toggle = document.getElementById("toggle");
const status = document.getElementById("status");

chrome.storage.sync.get(["enabled"], (result) => {
  toggle.checked = result.enabled ?? true;
  status.textContent = toggle.checked ? "Enabled" : "Disabled";
});

toggle.addEventListener("change", () => {
  chrome.storage.sync.set({ enabled: toggle.checked });
  status.textContent = toggle.checked ? "Enabled" : "Disabled";
});
