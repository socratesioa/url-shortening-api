// Declarations
const form = document.getElementById("shortener");
const urlInput = document.getElementById("url");
const urlError = document.getElementById("url-error");
const resultContainer = document.getElementById("result");

const STORAGE_KEY = "shortenedUrls";

// Local Storage
function getStoredUrls() {
  return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
}

function saveUrlPair(originalUrl, shortUrl) {
  const existing = getStoredUrls();
  existing.unshift({ originalUrl, shortUrl });
  localStorage.setItem(STORAGE_KEY, JSON.stringify(existing));
}

// Rendering
function renderUrlItem(originalUrl, shortUrl) {
  const div = document.createElement("div");
  div.className = "shortened__urls";

  div.innerHTML = `
    <span class="original__url">${originalUrl}</span>
    <a href="https://${shortUrl}" class="short__link" target="_blank">
      ${shortUrl}
    </a>
    <button type="button" class="copy__btn">Copy</button>
  `;

  resultContainer.prepend(div);
}

// Load stored URLs
document.addEventListener("DOMContentLoaded", () => {
  const stored = getStoredUrls();
  stored.forEach(({ originalUrl, shortUrl }) => {
    renderUrlItem(originalUrl, shortUrl);
  });
});

// Clear errors on input
urlInput.addEventListener("input", () => {
  urlInput.classList.remove("input__error");
  urlInput.removeAttribute("aria-invalid");
  urlError.textContent = "";
});

// Validators
function validateUrl(value) {
  const trimmed = value.trim();

  if (!trimmed) {
    return "Please add a link";
  }

  if (/\s/.test(trimmed)) {
    return "URLs cannot contain spaces";
  }

  return "";
}

const validators = { url: validateUrl };

// Submit Handler
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const formData = new FormData(form);
  const data = Object.fromEntries(formData.entries());

  let isValid = true;

  // Client-side validation
  for (const [field, validator] of Object.entries(validators)) {
    const inputEl = document.getElementById(field);
    const errorSpan = document.getElementById(`${field}-error`);
    const errorMessage = validator(data[field]);

    if (errorMessage) {
      isValid = false;
      errorSpan.textContent = errorMessage;
      inputEl.setAttribute("aria-invalid", "true");
      inputEl.classList.add("input__error");
    } else {
      errorSpan.textContent = "";
      inputEl.removeAttribute("aria-invalid");
      inputEl.classList.remove("input__error");
    }
  }

  if (!isValid) return;

  const longUrl = data.url.trim();

  try {
    const response = await fetch("/.netlify/functions/shorten", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: longUrl }),
    });

    const result = await response.json();

    if (result.error) {
      showApiError(result.error);
      return;
    }

    // Success
    renderUrlItem(longUrl, result.shortUrl);
    saveUrlPair(longUrl, result.shortUrl);
    form.reset();
  } catch (error) {
    showApiError("Network error. Please try again.");
  }
});

// Copy Button Functionality
resultContainer.addEventListener("click", (e) => {
  if (!e.target.classList.contains("copy__btn")) return;

  const container = e.target.closest(".shortened__urls");
  if (!container) return;

  const shortLinkEl = container.querySelector(".short__link");
  if (!shortLinkEl) return;

  const shortUrl = shortLinkEl.href;
  const btn = e.target;

  navigator.clipboard
    .writeText(shortUrl)
    .then(() => {
      btn.classList.add("copied");
      btn.textContent = "Copied!";

      setTimeout(() => {
        btn.classList.remove("copied");
        btn.textContent = "Copy";
      }, 4000);
    })
    .catch(() => {
      btn.classList.add("failed");
      btn.textContent = "Failed";

      setTimeout(() => {
        btn.classList.remove("failed");
        btn.textContent = "Copy";
      }, 2500);
    });
});

// Api Error Handler
function showApiError(message) {
  urlError.textContent = message;
  urlInput.setAttribute("aria-invalid", "true");
  urlInput.classList.add("input__error");
}
