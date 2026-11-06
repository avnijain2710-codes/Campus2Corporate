/* Local demo profile flow (register, demo access, profile). Frontend-only:
   data lives in this browser's localStorage, which is editable and NOT secure account storage.
   Passwords are never requested or stored. */
(function () {
  "use strict";

  var PROFILE_KEY = "c2c_demo_profile_v1";
  var ATTEMPTS_KEY = "c2c_demo_attempts_v1";
  var GITHUB_HOSTS = ["github.com", "www.github.com"];
  var LEETCODE_HOSTS = ["leetcode.com", "www.leetcode.com"];
  var $ = function (id) { return document.getElementById(id); };

  /* ---------- storage ---------- */
  function loadProfile() {
    try {
      var p = JSON.parse(localStorage.getItem(PROFILE_KEY));
      return p && typeof p === "object" && typeof p.name === "string" && typeof p.email === "string" ? p : null;
    } catch (e) { return null; }
  }
  function saveProfile(p) {
    try { localStorage.setItem(PROFILE_KEY, JSON.stringify(p)); return true; } catch (e) { return false; }
  }
  function loadAttempts() {
    try {
      var a = JSON.parse(localStorage.getItem(ATTEMPTS_KEY));
      return (Array.isArray(a) ? a : []).filter(function (x) {
        return x && typeof x.title === "string" && Number.isFinite(x.correct) && Number.isFinite(x.total) && x.total > 0;
      });
    } catch (e) { return []; }
  }

  /* ---------- validation ---------- */
  /* Accepts only https links on the expected site with a username path; drops query and hash. */
  function checkProfileUrl(raw, hosts, siteName) {
    var v = String(raw || "").trim();
    if (!v) return { ok: true, value: "" };
    var u;
    try { u = new URL(v); } catch (e) { return { ok: false, error: "Enter a full link starting with https://" }; }
    if (u.protocol !== "https:") return { ok: false, error: "The link must start with https://" };
    if (hosts.indexOf(u.hostname.toLowerCase()) === -1) return { ok: false, error: "This must be a " + siteName + " link." };
    if (u.pathname.replace(/\//g, "") === "") return { ok: false, error: "Include your username in the link." };
    return { ok: true, value: u.origin + u.pathname.replace(/\/+$/, "") };
  }

  var FIELDS = ["name", "email", "branch", "year", "github", "leetcode"];

  function setError(id, msg) {
    var input = $("f-" + id), err = $("e-" + id);
    if (msg) {
      err.textContent = msg; err.hidden = false;
      input.setAttribute("aria-invalid", "true");
    } else {
      err.textContent = ""; err.hidden = true;
      input.removeAttribute("aria-invalid");
    }
  }

  /* Returns { ok, data }. Shows an error under every invalid field and focuses the first. */
  function readAndValidate() {
    var v = {}, errs = {};
    v.name = $("f-name").value.trim().replace(/\s+/g, " ");
    if (v.name.length < 2) errs.name = "Enter your full name (at least 2 characters).";
    v.email = $("f-email").value.trim();
    if (!v.email) errs.email = "Enter your email address.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.email)) errs.email = "Enter a valid email address, for example name@example.com.";
    v.branch = $("f-branch").value;
    if (!v.branch) errs.branch = "Choose your branch or degree.";
    var yearRaw = $("f-year").value.trim();
    v.year = Number(yearRaw);
    if (!yearRaw) errs.year = "Enter your graduation year.";
    else if (!Number.isInteger(v.year) || v.year < 2020 || v.year > 2035) errs.year = "Enter a year between 2020 and 2035.";
    var gh = checkProfileUrl($("f-github").value, GITHUB_HOSTS, "GitHub");
    var lc = checkProfileUrl($("f-leetcode").value, LEETCODE_HOSTS, "LeetCode");
    if (!gh.ok) errs.github = gh.error; else v.github = gh.value;
    if (!lc.ok) errs.leetcode = lc.error; else v.leetcode = lc.value;

    var first = null;
    FIELDS.forEach(function (id) {
      setError(id, errs[id]);
      if (errs[id] && !first) first = id;
    });
    if (first) { $("f-" + first).focus(); return { ok: false }; }
    return { ok: true, data: v };
  }

  function fillForm(p) {
    $("f-name").value = p ? p.name : "";
    $("f-email").value = p ? p.email : "";
    $("f-branch").value = p ? p.branch : "";
    $("f-year").value = p ? p.year : "";
    $("f-github").value = p ? p.github || "" : "";
    $("f-leetcode").value = p ? p.leetcode || "" : "";
    FIELDS.forEach(function (id) { setError(id, ""); });
  }
  function status(id, msg) { var n = $(id); if (n) n.textContent = msg; }

  /* ---------- Register ---------- */
  function initRegister() {
    if (loadProfile()) $("existingNotice").hidden = false;
    $("profileForm").addEventListener("submit", function (e) {
      e.preventDefault();
      var r = readAndValidate();
      if (!r.ok) { status("formStatus", "Please fix the highlighted fields."); return; }
      var now = new Date().toISOString();
      var profile = { name: r.data.name, email: r.data.email, branch: r.data.branch, year: r.data.year,
                      github: r.data.github, leetcode: r.data.leetcode, createdAt: now, updatedAt: now };
      if (!saveProfile(profile)) { status("formStatus", "This browser blocked local storage, so the demo profile could not be saved."); return; }
      $("submitBtn").disabled = true;
      status("formStatus", "Demo profile saved in this browser. Opening your profile…");
      window.setTimeout(function () { window.location.href = "profile.html"; }, 700);
    });
  }

  /* ---------- Login (demo access only) ---------- */
  function initLogin() {
    var p = loadProfile();
    if (p) {
      $("loginName").textContent = p.name;
      $("loginEmail").textContent = p.email;
      $("loginFound").hidden = false;
    } else {
      $("loginMissing").hidden = false;
    }
  }

  /* ---------- Profile ---------- */
  function setLink(rowId, linkId, stored, hosts, site) {
    var row = $(rowId), a = $(linkId);
    var chk = checkProfileUrl(stored, hosts, site); /* re-validate: storage can be edited by the user */
    if (stored && chk.ok && chk.value) {
      a.href = chk.value;
      a.textContent = chk.value.replace(/^https:\/\//, "");
      row.hidden = false;
    } else {
      a.removeAttribute("href"); a.textContent = ""; row.hidden = true;
    }
  }

  function renderProfile() {
    var p = loadProfile();
    $("emptyState").hidden = !!p;
    $("profileView").hidden = !p;
    if (!p) return;
    $("profName").textContent = p.name;
    $("profSub").textContent = p.branch + " · Class of " + p.year;
    $("vEmail").textContent = p.email;
    $("vBranch").textContent = p.branch;
    $("vYear").textContent = String(p.year);
    setLink("rowGithub", "vGithub", p.github, GITHUB_HOSTS, "GitHub");
    setLink("rowLeetcode", "vLeetcode", p.leetcode, LEETCODE_HOSTS, "LeetCode");
    renderSummary();
  }

  function fmtDate(iso) {
    var d = new Date(iso);
    return isNaN(d) ? "" : d.toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });
  }

  /* Only real attempts recorded by the practice page are shown. Nothing is invented. */
  function renderSummary() {
    var attempts = loadAttempts();
    $("sumEmpty").hidden = attempts.length > 0;
    $("sumData").hidden = attempts.length === 0;
    if (!attempts.length) return;
    function pct(a) { return a.correct / a.total; }
    var best = attempts.reduce(function (b, a) { return pct(a) > pct(b) ? a : b; });
    var latest = attempts[attempts.length - 1];
    $("sAttempts").textContent = String(attempts.length);
    $("sBest").textContent = best.correct + "/" + best.total + " · " + best.title;
    $("sLatest").textContent = latest.correct + "/" + latest.total + " · " + latest.title;
    var list = $("attemptList");
    list.textContent = "";
    attempts.slice(-5).reverse().forEach(function (a) {
      var li = document.createElement("li");
      var t = document.createElement("span"); t.textContent = a.title;
      var s = document.createElement("span"); s.textContent = a.correct + "/" + a.total + (a.date ? " · " + fmtDate(a.date) : "");
      li.appendChild(t); li.appendChild(s);
      list.appendChild(li);
    });
  }

  function toggleEdit(on) {
    $("editBox").hidden = !on;
    $("detailsBox").hidden = on;
    if (on) { fillForm(loadProfile()); $("f-name").focus(); }
    else { $("editBtn").focus(); }
  }

  function initProfile() {
    renderProfile();
    $("editBtn").addEventListener("click", function () { status("pageStatus", ""); toggleEdit(true); });
    $("cancelBtn").addEventListener("click", function () { status("formStatus", ""); toggleEdit(false); });
    $("deleteBtn").addEventListener("click", function () {
      if (!window.confirm("Remove the demo profile from this browser? Practice attempt history will stay.")) return;
      try { localStorage.removeItem(PROFILE_KEY); } catch (e) { /* ignore */ }
      renderProfile();
    });
    $("profileForm").addEventListener("submit", function (e) {
      e.preventDefault();
      var current = loadProfile();
      if (!current) { renderProfile(); return; }
      var r = readAndValidate();
      if (!r.ok) { status("formStatus", "Please fix the highlighted fields."); return; }
      var updated = { name: r.data.name, email: r.data.email, branch: r.data.branch, year: r.data.year,
                      github: r.data.github, leetcode: r.data.leetcode,
                      createdAt: current.createdAt || new Date().toISOString(), updatedAt: new Date().toISOString() };
      if (!saveProfile(updated)) { status("formStatus", "This browser blocked local storage, so changes could not be saved."); return; }
      status("formStatus", "");
      toggleEdit(false);
      renderProfile();
      status("pageStatus", "Profile updated in this browser.");
      $("profName").focus();
    });
  }

  var page = document.body.getAttribute("data-page");
  if (page === "register") initRegister();
  else if (page === "login") initLogin();
  else if (page === "profile") initProfile();
})();
