require("dotenv").config();

const express = require("express");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

const searchCache = new Map();
const CACHE_TTL_MS = 5 * 60 * 1000;

function decodeDuckDuckGoLink(href) {
  try {
    if (href.startsWith("//")) href = "https:" + href;
    const url = new URL(href);
    const target = url.searchParams.get("uddg");
    return target ? decodeURIComponent(target) : href;
  } catch {
    return href;
  }
}

function stripTags(html) {
  return html
    .replace(/<[^>]*>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#x27;|&#39;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

async function searchWithBrave(query, count) {
  const apiKey = process.env.BRAVE_API_KEY;
  if (!apiKey) return null;
  const url = new URL("https://api.search.brave.com/res/v1/web/search");
  url.searchParams.set("q", query);
  url.searchParams.set("count", String(count));
  url.searchParams.set("safesearch", "moderate");
  const response = await fetch(url, {
    headers: {
      Accept: "application/json",
      "X-Subscription-Token": apiKey,
    },
  });
  if (!response.ok) {
    throw new Error(`Brave Search a répondu avec le code ${response.status}`);
  }
  const data = await response.json();
  const items = (data.web && data.web.results) || [];
  return items.slice(0, count).map((item) => ({
    title: item.title || "Sans titre",
    url: item.url,
    snippet: stripTags(item.description || ""),
  }));
}

async function searchWithDuckDuckGo(query, count) {
  const body = new URLSearchParams({ q: query, kl: "fr-fr" });
  const response = await fetch("https://html.duckduckgo.com/html/", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36",
      Accept: "text/html",
    },
    body: body.toString(),
  });
  if (!response.ok) {
    throw new Error(`DuckDuckGo a répondu avec le code ${response.status}`);
  }
  const html = await response.text();
  const results = [];
  const linkRegex = /<a[^>]*class="result__a"[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/g;
  const snippetRegex = /<a[^>]*class="result__snippet"[^>]*>([\s\S]*?)<\/a>/g;
  const links = [];
  let match;
  while ((match = linkRegex.exec(html)) !== null) {
    links.push({ href: match[1], title: stripTags(match[2]) });
  }
  const snippets = [];
  while ((match = snippetRegex.exec(html)) !== null) {
    snippets.push(stripTags(match[1]));
  }
  for (let i = 0; i < links.length && results.length < count; i++) {
    const url = decodeDuckDuckGoLink(links[i].href);
    if (!/^https?:\/\//i.test(url)) continue;
    results.push({
      title: links[i].title || url,
      url,
      snippet: snippets[i] || "",
    });
  }
  return results;
}

async function webSearch(query, count = 8) {
  const cacheKey = `${query}::${count}`;
  const cached = searchCache.get(cacheKey);
  if (cached && Date.now() - cached.at < CACHE_TTL_MS) {
    return cached.results;
  }
  let results = [];
  let provider = "duckduckgo";
  try {
    const brave = await searchWithBrave(query, count);
    if (brave) {
      results = brave;
      provider = "brave";
    }
  } catch (error) {
    console.error("Brave Search échoué:", error.message);
  }
  if (results.length === 0) {
    results = await searchWithDuckDuckGo(query, count);
  }
  searchCache.set(cacheKey, { at: Date.now(), results });
  return { provider, results };
}

function buildContext(results) {
  return results
    .map(
      (r, i) =>
        `[Source ${i + 1}] ${r.title}\nURL : ${r.url}\nExtrait : ${r.snippet}`
    )
    .join("\n\n");
}

function aiProviders() {
  const providers = [];
  if (process.env.MISTRAL_API_KEY) {
    providers.push({
      name: "mistral",
      url: "https://api.mistral.ai/v1/chat/completions",
      model: process.env.MISTRAL_MODEL || "mistral-small-latest",
      key: process.env.MISTRAL_API_KEY,
      headers: {},
    });
  }
  if (process.env.OPENROUTER_API_KEY) {
    providers.push({
      name: "openrouter",
      url: "https://openrouter.ai/api/v1/chat/completions",
      model: process.env.OPENROUTER_MODEL || "openrouter/free",
      key: process.env.OPENROUTER_API_KEY,
      headers: {
        "HTTP-Referer": process.env.PUBLIC_URL || "https://hexago.app",
        "X-Title": "HEXAGO",
      },
    });
  }
  if (process.env.GEMINI_API_KEY) {
    providers.push({
      name: "gemini",
      url: "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions",
      model: process.env.GEMINI_MODEL || "gemini-2.0-flash",
      key: process.env.GEMINI_API_KEY,
      headers: {},
    });
  }
  return providers;
}

async function askAI(question, results) {
  const providers = aiProviders();
  if (providers.length === 0) {
    const error = new Error(
      "Aucune IA configurée. Ajoutez GEMINI_API_KEY (gratuit) ou MISTRAL_API_KEY dans le fichier .env."
    );
    error.status = 503;
    throw error;
  }
  const context = buildContext(results);
  const messages = [
    {
      role: "system",
      content:
        "Tu es HEXAGO, un moteur de recherche intelligent européen. " +
        "Tu réponds toujours en français, de façon claire, factuelle et concise. " +
        "Tu te bases UNIQUEMENT sur les sources web fournies ci-dessous. " +
        "Cite tes sources avec des numéros entre crochets, par exemple [1] ou [2], " +
        "en te référant aux [Source N] du contexte. " +
        "Si les sources ne permettent pas de répondre, dis-le honnêtement. " +
        "Structure ta réponse en paragraphes courts. Termine par une ligne 'Sources :' " +
        "listant les numéros utilisés avec leur domaine.",
    },
    {
      role: "user",
      content: `Question de l'utilisateur : ${question}\n\nSources web trouvées :\n\n${context}`,
    },
  ];
  const errors = [];
  for (const provider of providers) {
    try {
      const response = await fetch(provider.url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${provider.key}`,
          ...provider.headers,
        },
        body: JSON.stringify({
          model: provider.model,
          temperature: 0.3,
          messages,
        }),
      });
      if (!response.ok) {
        const text = await response.text();
        throw new Error(`${provider.name} (code ${response.status}) : ${text.slice(0, 200)}`);
      }
      const data = await response.json();
      return { text: data.choices[0].message.content, provider: provider.name };
    } catch (error) {
      errors.push(error.message);
    }
  }
  const failure = new Error(`Toutes les IA ont échoué. Détails : ${errors.join(" | ")}`);
  failure.status = 502;
  throw failure;
}

app.get("/api/search", async (req, res) => {
  const query = (req.query.q || "").trim();
  if (!query) {
    return res.status(400).json({ error: "Recherche vide." });
  }
  try {
    const { provider, results } = await webSearch(query, 10);
    res.json({ query, provider, results });
  } catch (error) {
    console.error("Erreur de recherche:", error.message);
    res.status(502).json({ error: "La recherche a échoué. Réessayez dans un instant." });
  }
});

app.post("/api/answer", async (req, res) => {
  const question = (req.body.question || "").trim();
  if (!question) {
    return res.status(400).json({ error: "Question vide." });
  }
  try {
    const { results } = await webSearch(question, 6);
    if (results.length === 0) {
      return res.status(404).json({ error: "Aucune source trouvée pour cette question." });
    }
    const { text: answer, provider } = await askAI(question, results);
    res.json({
      question,
      answer,
      provider,
      sources: results.map((r) => ({ title: r.title, url: r.url })),
    });
  } catch (error) {
    console.error("Erreur de réponse IA:", error.message);
    const status = error.status || 502;
    res.status(status).json({ error: error.message || "La réponse IA a échoué." });
  }
});

app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    service: "HEXAGO",
    aiProviders: aiProviders().map((p) => p.name),
    braveConfigured: Boolean(process.env.BRAVE_API_KEY),
  });
});

app.listen(PORT, () => {
  console.log(`HEXAGO est en ligne sur http://localhost:${PORT}`);
});
