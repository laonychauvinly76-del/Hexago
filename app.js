const searchForm = document.getElementById("searchForm");
const searchInput = document.getElementById("searchInput");
const searchFormTop = document.getElementById("searchFormTop");
const searchInputTop = document.getElementById("searchInputTop");
const homePage = document.getElementById("home");
const resultsPage = document.getElementById("resultsPage");
const resultsList = document.getElementById("resultsList");
const resultsMeta = document.getElementById("resultsMeta");
const homeError = document.getElementById("homeError");
const aiPanel = document.getElementById("aiPanel");
const aiLoading = document.getElementById("aiLoading");
const aiAnswer = document.getElementById("aiAnswer");
const aiError = document.getElementById("aiError");
const aiSources = document.getElementById("aiSources");

function currentQuery() {
  return resultsPage.classList.contains("hidden")
    ? searchInput.value
    : searchInputTop.value;
}

function showResults(query) {
  homePage.classList.add("hidden");
  resultsPage.classList.remove("hidden");
  searchInputTop.value = query;
  window.scrollTo(0, 0);
}

function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

function domainOf(url) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

async function doSearch(query) {
  query = query.trim();
  if (!query) return;
  showResults(query);
  homeError.classList.add("hidden");
  resultsMeta.textContent = "Recherche en cours…";
  resultsList.innerHTML = "";
  aiPanel.classList.add("hidden");
  aiAnswer.textContent = "";
  aiSources.innerHTML = "";
  aiError.classList.add("hidden");
  try {
    const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Erreur de recherche");
    resultsMeta.textContent = `${data.results.length} résultats web · source : ${data.provider}`;
    if (data.results.length === 0) {
      resultsList.innerHTML = "<p class='snippet'>Aucun résultat trouvé. Essayez d'autres mots-clés.</p>";
      return;
    }
    resultsList.innerHTML = data.results
      .map(
        (r) => `
      <div class="result">
        <span class="url">${escapeHtml(domainOf(r.url))}</span>
        <a class="title" href="${escapeHtml(r.url)}" target="_blank" rel="noopener">${escapeHtml(r.title)}</a>
        <span class="snippet">${escapeHtml(r.snippet)}</span>
      </div>`
      )
      .join("");
  } catch (error) {
    resultsMeta.textContent = "";
    resultsList.innerHTML = `<p class="error">${escapeHtml(error.message)}</p>`;
  }
}

async function askAi(query) {
  query = query.trim();
  if (!query) return;
  showResults(query);
  aiPanel.classList.remove("hidden");
  aiPanel.scrollIntoView({ behavior: "smooth", block: "start" });
  aiLoading.classList.remove("hidden");
  aiError.classList.add("hidden");
  aiAnswer.textContent = "";
  aiSources.innerHTML = "";
  try {
    const response = await fetch("/api/answer", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question: query }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Erreur de l'IA");
    const labels = {
      mistral: "par Mistral AI 🇫🇷",
      openrouter: "via OpenRouter · modèle gratuit",
      gemini: "par Google Gemini · gratuit",
    };
    document.getElementById("aiPowered").textContent = labels[data.provider] || data.provider;
    renderAnswer(data.answer);
    aiSources.innerHTML =
      "<strong style='font-size:13px'>Sources utilisées :</strong>" +
      data.sources
        .map(
          (s, i) =>
            `<a href="${escapeHtml(s.url)}" target="_blank" rel="noopener">[${i + 1}] ${escapeHtml(s.title)} — ${escapeHtml(domainOf(s.url))}</a>`
        )
        .join("");
  } catch (error) {
    aiError.textContent = error.message;
    aiError.classList.remove("hidden");
  } finally {
    aiLoading.classList.add("hidden");
  }
}

function renderAnswer(text) {
  const withLinks = escapeHtml(text).replace(
    /\[(\d+)\]/g,
    '<span style="color:var(--orange-soft);font-weight:700">[$1]</span>'
  );
  aiAnswer.innerHTML = withLinks;
}

searchForm.addEventListener("submit", (e) => {
  e.preventDefault();
  doSearch(searchInput.value);
});

searchFormTop.addEventListener("submit", (e) => {
  e.preventDefault();
  doSearch(searchInputTop.value);
});

document.getElementById("askAiBtn").addEventListener("click", () => askAi(searchInput.value));
document.getElementById("askAiBtnTop").addEventListener("click", () => askAi(searchInputTop.value));

document.querySelectorAll(".chip").forEach((chip) => {
  chip.addEventListener("click", () => {
    searchInput.value = chip.dataset.q;
    doSearch(chip.dataset.q);
  });
});
