(function () {
  "use strict";
  var html = document.documentElement;
  var root = html.getAttribute("data-root") || "./";

  /* Theme: system -> dark -> light -> system */
  function storedTheme() { try { return localStorage.getItem("theme") || "system"; } catch (e) { return "system"; } }
  function resolve(setting) {
    if (setting === "system") return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    return setting;
  }
  function applyTheme(setting) {
    html.setAttribute("data-theme-setting", setting);
    html.setAttribute("data-theme", resolve(setting));
  }
  function setTheme(setting) {
    try { localStorage.setItem("theme", setting); } catch (e) {}
    applyTheme(setting);
  }
  window.setThemeSetting = setTheme;
  var toggle = document.getElementById("light-toggle");
  if (toggle) toggle.addEventListener("click", function () {
    var order = { system: "dark", dark: "light", light: "system" };
    setTheme(order[storedTheme()] || "system");
  });
  if (window.matchMedia) {
    window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", function () { applyTheme(storedTheme()); });
  }

  /* Mobile nav */
  var toggler = document.querySelector(".navbar-toggler");
  var collapse = document.getElementById("navbarNav");
  if (toggler && collapse) toggler.addEventListener("click", function () {
    var open = collapse.classList.toggle("show");
    toggler.classList.toggle("collapsed", !open);
    toggler.setAttribute("aria-expanded", String(open));
  });

  /* Abstract / BibTeX toggles */
  document.querySelectorAll(".entry .links [data-toggle]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var entry = btn.closest(".entry");
      var kind = btn.getAttribute("data-toggle");
      ["abstract", "bibtex"].forEach(function (k) {
        var panel = entry.querySelector(".hidden." + k);
        var b = entry.querySelector('[data-toggle="' + k + '"]');
        if (!panel || !b) return;
        var open = k === kind ? !panel.classList.contains("open") : false;
        panel.classList.toggle("open", open);
        b.setAttribute("aria-expanded", String(open));
      });
    });
  });

  /* Back to top */
  var top = document.getElementById("back-to-top");
  if (top) {
    var onScroll = function () { top.classList.toggle("show", window.scrollY > 400); };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    top.addEventListener("click", function () { window.scrollTo({ top: 0, behavior: "smooth" }); });
  }

  /* Search palette (ctrl/cmd + k) */
  var items = [
    { g: "Navigation", t: "about", u: "" },
    { g: "Navigation", t: "publications", d: "Publications and work under review", u: "publications/" },
    { g: "Navigation", t: "experience", d: "Research and industry experience, education", u: "experience/" },
    { g: "Navigation", t: "projects", d: "Research projects and code", u: "projects/" },
    { g: "Navigation", t: "announcements", u: "news/" },
    { g: "Navigation", t: "cv", d: "Curriculum vitae (PDF)", u: "cv.pdf" },
    { g: "Publications", t: "Can Translation Bridge the Data Gap for Low-Resource Languages? A Case Study of Hindi and Telugu", d: "BabyLM Workshop 2026", u: "publications/#pulipaka-barak-2026-translation" },
    { g: "Publications", t: "Evaluating Dedicated Monolingual and Joint Multilingual Causal Models for Dravidian Languages", d: "arXiv 2026", u: "publications/#pulipaka2026dravidian" },
    { g: "Publications", t: "Reproducible Fairness Regression Testing for Large Language Model Updates", d: "Under review", u: "publications/#pulipaka2026fairness" },
    { g: "Publications", t: "Script and Morphology Effects on Telugu and Hindi Tokenization Are Tokenizer-Dependent", d: "Under review", u: "publications/#pulipaka2026tokenization" },
    { g: "Projects", t: "Translated BabyLM", d: "BabyLM-scale corpora for Hindi and Telugu via machine translation", x: "https://github.com/NLPlabMSU/babylm-translation-scripts" },
    { g: "Projects", t: "Dravidian LMs", d: "Monolingual vs. joint multilingual causal LMs for four Dravidian languages", x: "https://github.com/vishnup22/dravidian-lm-research" },
    { g: "Projects", t: "Fairness Drift", d: "Fairness regression testing across LLM releases", x: "https://github.com/pulipakav1/fairness-drift-llms" },
    { g: "Projects", t: "Telugu Dialects", d: "Dialect variation in Telugu and Hindi (ongoing)", x: "https://github.com/vishnup22/telugu-dialect-nlp" },
    { g: "Socials", t: "email", x: "mailto:vishnupulipaka22@gmail.com" },
    { g: "Socials", t: "GitHub", x: "https://github.com/vishnup22" },
    { g: "Socials", t: "LinkedIn", x: "https://www.linkedin.com/in/vishnup22" },
    { g: "Socials", t: "Hugging Face", x: "https://huggingface.co/pulipakav-1" },
    { g: "Theme", t: "Change theme to light", f: function () { setTheme("light"); } },
    { g: "Theme", t: "Change theme to dark", f: function () { setTheme("dark"); } },
    { g: "Theme", t: "Use system default theme", f: function () { setTheme("system"); } }
  ];

  var backdrop = document.createElement("div");
  backdrop.className = "search-backdrop";
  backdrop.innerHTML =
    '<div class="search-box" role="dialog" aria-modal="true" aria-label="Search">' +
    '<input type="text" placeholder="Type to start searching" aria-label="Search" autocomplete="off" spellcheck="false">' +
    '<ul class="search-results" role="listbox"></ul>' +
    '<div class="search-foot"><span><kbd>&uarr;</kbd> <kbd>&darr;</kbd> to navigate</span><span><kbd>enter</kbd> to select</span><span><kbd>esc</kbd> to close</span></div>' +
    "</div>";
  document.body.appendChild(backdrop);
  var input = backdrop.querySelector("input");
  var list = backdrop.querySelector(".search-results");
  var shown = [], sel = 0;

  function render() {
    var q = input.value.trim().toLowerCase();
    shown = items.filter(function (it) { return !q || (it.t + " " + (it.d || "") + " " + it.g).toLowerCase().indexOf(q) !== -1; });
    if (sel >= shown.length) sel = 0;
    list.innerHTML = "";
    if (!shown.length) { list.innerHTML = '<li class="empty">No results</li>'; return; }
    var last = "";
    shown.forEach(function (it, i) {
      if (it.g !== last) {
        var g = document.createElement("li"); g.className = "group"; g.textContent = it.g; list.appendChild(g); last = it.g;
      }
      var li = document.createElement("li");
      li.className = "item" + (i === sel ? " selected" : "");
      li.setAttribute("role", "option");
      li.textContent = it.t;
      if (it.d) { var s = document.createElement("small"); s.textContent = it.d; li.appendChild(s); }
      li.addEventListener("mousemove", function () { if (sel !== i) { sel = i; mark(); } });
      li.addEventListener("click", function () { run(it); });
      list.appendChild(li);
    });
  }
  function mark() {
    list.querySelectorAll(".item").forEach(function (el, i) {
      el.classList.toggle("selected", i === sel);
      if (i === sel) el.scrollIntoView({ block: "nearest" });
    });
  }
  function run(it) {
    close();
    if (it.f) it.f();
    else if (it.x) { if (it.x.indexOf("mailto:") === 0) location.href = it.x; else window.open(it.x, "_blank", "noopener"); }
    else location.href = root + it.u;
  }
  function open() { backdrop.classList.add("open"); input.value = ""; sel = 0; render(); input.focus(); }
  function close() { backdrop.classList.remove("open"); }
  backdrop.addEventListener("click", function (e) { if (e.target === backdrop) close(); });
  input.addEventListener("input", function () { sel = 0; render(); });
  input.addEventListener("keydown", function (e) {
    if (e.key === "ArrowDown") { e.preventDefault(); if (shown.length) { sel = (sel + 1) % shown.length; mark(); } }
    else if (e.key === "ArrowUp") { e.preventDefault(); if (shown.length) { sel = (sel - 1 + shown.length) % shown.length; mark(); } }
    else if (e.key === "Enter") { e.preventDefault(); if (shown[sel]) run(shown[sel]); }
    else if (e.key === "Escape") { close(); }
  });
  document.addEventListener("keydown", function (e) {
    if ((e.ctrlKey || e.metaKey) && (e.key === "k" || e.key === "K")) { e.preventDefault(); backdrop.classList.contains("open") ? close() : open(); }
  });
  var st = document.getElementById("search-toggle");
  if (st) st.addEventListener("click", open);
})();
