(() => {
  const API = "https://api.currencyapi.com/v3";
  const API_KEY = "cur_live_gxw2uyFiBh17QdTkorhlT9MXhVYRcfgmlpas5N2U";

  // Currencies featured on the ticker tape and in the comparison table.
  const FEATURED = ["EUR", "USD", "GBP", "JPY", "CHF", "CNY", "AUD", "CAD", "SEK", "NOK", "CZK", "PLN", "TRY", "INR"];

  let currencyNames = {};
  let lastFlapValue = "";

  const $ = (id) => document.getElementById(id);

  async function fetchJSON(url) {
    const res = await fetch(url, { headers: { apikey: API_KEY } });
    if (!res.ok) throw new Error(`API error ${res.status}`);
    return res.json();
  }

  function fmt(n, decimals = 4) {
    return Number(n).toLocaleString("en-US", {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    });
  }

  function setUpdated(dateStr) {
    const d = new Date(dateStr);
    const nice = isNaN(d) ? dateStr : d.toLocaleString("ru-RU");
    $("lastUpdated").textContent = `Обновлено: ${nice}`;
  }

  /* ---------- Currency list & selects ---------- */
  async function loadCurrencyList() {
    const res = await fetchJSON(`${API}/currencies?apikey=${API_KEY}`);
    currencyNames = Object.fromEntries(
      Object.entries(res.data).map(([code, info]) => [code, info.name])
    );
    const codes = Object.keys(currencyNames).sort();

    const buildOptions = (selectEl, selected) => {
      selectEl.innerHTML = codes
        .map((c) => `<option value="${c}" ${c === selected ? "selected" : ""}>${c} — ${currencyNames[c]}</option>`)
        .join("");
    };

    buildOptions($("fromSelect"), "USD");
    buildOptions($("toSelect"), "EUR");
    buildOptions($("baseSelect"), "USD");
  }

  /* ---------- Ticker tape ---------- */
  async function loadTicker() {
    const targets = FEATURED.filter((c) => c !== "USD").join(",");
    const data = await fetchJSON(`${API}/latest?apikey=${API_KEY}&base_currency=USD&currencies=${targets}`);
    setUpdated(data.meta.last_updated_at);

    const items = [{ code: "USD", value: 1 }, ...Object.values(data.data).map((d) => ({ code: d.code, value: d.value }))];

    const renderItems = items
      .map((i) => `<span class="pair">USD/${i.code}</span><span class="value">${fmt(i.value, i.code === "JPY" ? 2 : 4)}</span>`)
      .join("");

    // duplicate content so the scroll loop is seamless
    $("tickerTrack").innerHTML = renderItems + renderItems;

    // reuse this call to also seed the comparison table if base is still USD
    if ($("baseSelect").value === "USD") {
      renderComparisonTable(data.data);
    }
  }

  /* ---------- Split-flap converter ---------- */
  function renderFlap(text) {
    const el = $("flapDisplay");
    const chars = text.split("");
    const prevChars = lastFlapValue.split("");
    el.innerHTML = "";

    chars.forEach((ch, i) => {
      const span = document.createElement("span");
      const isSymbolChar = /[A-Za-zА-Яа-я]/.test(ch) && i < 4; // currency code prefix
      span.className = "flap-char" + (isSymbolChar ? " symbol" : "");
      span.textContent = ch;
      if (prevChars[i] !== ch) span.classList.add("flip");
      el.appendChild(span);
    });

    lastFlapValue = text;
  }

  let convertDebounce;
  async function runConversion() {
    clearTimeout(convertDebounce);
    convertDebounce = setTimeout(async () => {
      const amount = parseFloat($("amountInput").value) || 0;
      const from = $("fromSelect").value;
      const to = $("toSelect").value;

      try {
        const data = await fetchJSON(`${API}/latest?apikey=${API_KEY}&base_currency=${from}&currencies=${to}`);
        const rate = data.data[to].value;
        const converted = amount * rate;

        renderFlap(`${to} ${fmt(converted, 2)}`);
        const updated = new Date(data.meta.last_updated_at);
        const niceDate = isNaN(updated) ? data.meta.last_updated_at : updated.toLocaleDateString("ru-RU");
        $("rateLine").textContent = `1 ${from} = ${fmt(rate, 6)} ${to} · ${niceDate}`;
      } catch (e) {
        $("rateLine").textContent = "Не удалось получить курс. Попробуйте позже.";
      }
    }, 500);
  }

  /* ---------- Comparison table ---------- */
  function renderComparisonTable(ratesData) {
    const table = $("comparisonTable");
    const entries = Object.values(ratesData).map((d) => [d.code, d.value]);
    const maxVal = Math.max(...entries.map(([, v]) => v));

    table.innerHTML = entries
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([code, value]) => {
        const pct = Math.max((value / maxVal) * 100, 2);
        return `
          <div class="row">
            <span class="code">${code}</span>
            <span class="bar-track"><span class="bar-fill" style="width:${pct}%"></span></span>
            <span class="rate-val">${fmt(value, value < 10 ? 4 : 2)}</span>
          </div>
        `;
      })
      .join("");
  }

  async function loadComparisonTable() {
    const base = $("baseSelect").value;
    const table = $("comparisonTable");
    table.innerHTML = `<div class="row row-loading">Загрузка таблицы…</div>`;

    try {
      const targets = FEATURED.filter((c) => c !== base);
      const data = await fetchJSON(`${API}/latest?apikey=${API_KEY}&base_currency=${base}&currencies=${targets.join(",")}`);
      renderComparisonTable(data.data);
    } catch (e) {
      table.innerHTML = `<div class="row row-loading">Не удалось загрузить таблицу.</div>`;
    }
  }

  /* ---------- Wiring ---------- */
  function swapCurrencies() {
    const from = $("fromSelect");
    const to = $("toSelect");
    const tmp = from.value;
    from.value = to.value;
    to.value = tmp;
    runConversion();
  }

  async function init() {
    try {
      await loadCurrencyList();
    } catch (e) {
      $("rateLine").textContent = "Не удалось загрузить список валют. Проверьте API-ключ.";
      return;
    }

    $("amountInput").addEventListener("input", runConversion);
    $("fromSelect").addEventListener("change", runConversion);
    $("toSelect").addEventListener("change", runConversion);
    $("swapBtn").addEventListener("click", swapCurrencies);
    $("baseSelect").addEventListener("change", loadComparisonTable);

    runConversion();
    loadTicker().catch(() => {
      $("tickerTrack").innerHTML = `<span class="ticker-loading">Тикер временно недоступен</span>`;
      loadComparisonTable();
    });

    // No auto-refresh: the free currencyapi.com plan is capped at 300
    // requests/month and updates once a day, so polling would just burn quota.
  }

  document.addEventListener("DOMContentLoaded", init);
})();
