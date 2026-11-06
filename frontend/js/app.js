(function () {
  "use strict";

  var companies = window.C2C_COMPANIES || [];
  var categories = window.C2C_CATEGORIES || ["All"];
  var state = { query: "", category: "All" };

  var $ = function (id) { return document.getElementById(id); };
  var list = $("companyList"), empty = $("emptyState"), status = $("resultStatus");
  var searchBox = $("companySearch"), chipsBox = $("chips");

  /* ---------- Mobile menu ---------- */
  var toggle = $("navToggle"), menu = $("menu");
  function setMenu(open) {
    menu.classList.toggle("open", open);
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  }
  toggle.addEventListener("click", function () { setMenu(!menu.classList.contains("open")); });
  menu.addEventListener("click", function (e) { if (e.target.closest("a")) setMenu(false); });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && menu.classList.contains("open")) { setMenu(false); toggle.focus(); }
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") { e.preventDefault(); $("navSearchInput").focus(); }
  });

  /* ---------- Nav search: sends the query to the company search ---------- */
  $("navSearch").addEventListener("submit", function (e) {
    e.preventDefault();
    var input = $("navSearchInput");
    state.query = input.value.trim().toLowerCase();
    searchBox.value = input.value.trim();
    setMenu(false);
    render();
    $("companies").scrollIntoView();
    searchBox.focus({ preventScroll: true });
  });

  /* ---------- Filters ---------- */
  function buildChips() {
    categories.forEach(function (cat) {
      var b = document.createElement("button");
      b.type = "button"; b.className = "chip"; b.textContent = cat;
      b.setAttribute("aria-pressed", String(cat === state.category));
      b.addEventListener("click", function () { state.category = cat; syncChips(); render(); });
      chipsBox.appendChild(b);
    });
  }
  function syncChips() {
    Array.prototype.forEach.call(chipsBox.children, function (b) {
      b.setAttribute("aria-pressed", String(b.textContent === state.category));
    });
  }

  function matches(c) {
    if (state.category !== "All" && c.category !== state.category) return false;
    if (!state.query) return true;
    var hay = [c.name, c.category, c.roles, c.blurb, c.topics.join(" ")].join(" ").toLowerCase();
    return state.query.split(/\s+/).every(function (w) { return hay.indexOf(w) !== -1; });
  }

  /* ---------- Cards ---------- */
  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text) n.textContent = text;
    return n;
  }

  /* Logo box: loads the company website icon; shows initials if the remote icon is unavailable. */
  function initials(name) {
    var words = name.split(/\s+/);
    return (words.length > 1 ? words[0][0] + words[1][0] : name.slice(0, 2)).toUpperCase();
  }
  function buildLogo(c) {
    var box = el("span", "logo");
    function fallback() {
      box.textContent = initials(c.name);
      box.classList.add("logo-fallback");
    }
    if (!c.logo) { fallback(); return box; }
    var img = document.createElement("img");
    img.alt = c.name + " website icon";
    img.loading = "lazy";
    img.decoding = "async";
    img.referrerPolicy = "no-referrer";
    img.addEventListener("error", fallback, { once: true });
    img.src = c.logo;
    box.appendChild(img);
    return box;
  }

  /* Detail page URL uses the stable company id, e.g. pages/company.html?id=barclays */
  function detailUrl(c) { return "pages/company.html?id=" + encodeURIComponent(c.id); }

  function buildCard(c) {
    var card = el("article", "card");
    card.dataset.cat = c.category;
    card.appendChild(el("span", "sample", "Placement history"));
    var head = el("div", "card-head");
    head.appendChild(buildLogo(c));
    var title = el("h3");
    var nameLink = el("a", "name-link", c.name);
    nameLink.href = detailUrl(c);
    title.appendChild(nameLink);
    head.appendChild(title);
    card.appendChild(head);
    card.appendChild(el("p", "meta", c.category + " — " + c.roles));
    var ul = el("ul", "topics");
    c.topics.forEach(function (t) { ul.appendChild(el("li", "", t)); });
    card.appendChild(ul);

    var preview = el("p", "preview", c.blurb + " Company-specific details are not available yet.");
    preview.id = "preview-" + c.id; preview.hidden = true;
    var btn = el("button", "more", "Preview topics →");
    btn.type = "button";
    btn.setAttribute("aria-expanded", "false");
    btn.setAttribute("aria-controls", preview.id);
    btn.addEventListener("click", function () {
      var open = preview.hidden;
      preview.hidden = !open;
      btn.setAttribute("aria-expanded", String(open));
      btn.textContent = open ? "Hide preview" : "Preview topics →";
    });
    var explore = el("a", "explore", "Explore company →");
    explore.href = detailUrl(c);
    explore.setAttribute("aria-label", "Explore " + c.name);
    var actions = el("div", "card-actions");
    actions.appendChild(explore);
    actions.appendChild(btn);
    card.appendChild(preview);
    card.appendChild(actions);
    return card;
  }

  function render() {
    var results = companies.filter(matches);
    list.textContent = "";
    results.forEach(function (c) { list.appendChild(buildCard(c)); });
    empty.hidden = results.length > 0;
    status.textContent = results.length + (results.length === 1 ? " company shown" : " companies shown");
  }

  searchBox.addEventListener("input", function () {
    state.query = searchBox.value.trim().toLowerCase();
    render();
  });
  $("resetBtn").addEventListener("click", function () {
    state.query = ""; state.category = "All"; searchBox.value = ""; $("navSearchInput").value = "";
    syncChips(); render(); searchBox.focus();
  });

  /* ---------- Hero photo with fallback ----------
     assets/campus.png is the main image. If it fails to load, show the illustration instead. */
  var photo = $("campusPhoto"), art = $("campusArt");
  function showFallback() { photo.hidden = true; art.hidden = false; }
  photo.addEventListener("error", showFallback);
  if (photo.complete && photo.naturalWidth === 0) showFallback();

  buildChips();
  render();
})();
