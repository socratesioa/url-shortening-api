// --- DOM ELEMENTS ---
const form = document.getElementById("shortener");
const urlInput = document.getElementById("url");
const urlError = document.getElementById("url-error");
const resultContainer = document.getElementById("result"); // Make sure this exists in HTML

// --- CLEAR ERRORS ON INPUT ---
urlInput.addEventListener("input", () => {
  urlInput.classList.remove("input__error");
  urlInput.removeAttribute("aria-invalid");
  urlError.textContent = "";
  resultContainer.textContent = "";
});

// --- VALIDATORS ---
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

// --- SUBMIT HANDLER ---
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

  // --- Send input as-is to Netlify function ---
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

    // --- Render short URL with copy button ---
    resultContainer.innerHTML = `
      <div class="shortened__urls">
        <span class="original__url">${longUrl}</span>
        <a href="https://${result.shortUrl}" class="short__link" target="_blank">${result.shortUrl}</a>
        <button class="copy__btn">Copy</button>
      </div>
    `;
  } catch (error) {
    showApiError("Network error. Please try again.");
  }
});

// --- COPY BUTTON FUNCTIONALITY ---
resultContainer.addEventListener("click", (e) => {
  if (e.target.classList.contains("copy__btn")) {
    const container = e.target.closest(".shortened__urls");
    if (!container) return;

    const shortLinkEl = container.querySelector(".short__link");
    if (!shortLinkEl) return;

    const shortUrl = shortLinkEl.href;

    navigator.clipboard
      .writeText(shortUrl)
      .then(() => {
        e.target.textContent = "Copied!";
        setTimeout(() => (e.target.textContent = "Copy"), 1500);
      })
      .catch(() => {
        e.target.textContent = "Failed";
        setTimeout(() => (e.target.textContent = "Copy"), 1500);
      });
  }
});

// --- API ERROR HANDLER ---
function showApiError(message) {
  urlError.textContent = message;
  urlInput.setAttribute("aria-invalid", "true");
  urlInput.classList.add("input__error");
}
