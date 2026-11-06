/* Company detail page: reads ?id=... and renders the company and matched learning resources. */
(function () {
  "use strict";

  var $ = function (id) { return document.getElementById(id); };
  var companies = Array.isArray(window.C2C_COMPANIES) ? window.C2C_COMPANIES : [];
  var id = new URLSearchParams(window.location.search).get("id");
  var company = companies.find(function (item) { return item.id === id; });

  function initials(name) {
    var words = String(name || "C2C").trim().split(/\s+/).filter(Boolean);
    return (words.length > 1 ? words[0][0] + words[1][0] : (words[0] || "C2C").slice(0, 2)).toUpperCase();
  }

  /* Company logo paths in data.js are site-root-relative. This page lives in /pages/. */
  function logoSrc(path) {
    if (!path) return "";
    return /^(https?:)?\/\/|^data:|^\.\.\//i.test(path) ? path : "../" + path.replace(/^\//, "");
  }

  function renderLogo(box) {
    if (!box) return;
    function fallback() {
      box.textContent = initials(company.name);
      box.classList.add("logo-fallback");
    }
    if (!company.logo) { fallback(); return; }
    var img = document.createElement("img");
    img.alt = company.name + " logo";
    img.loading = "lazy";
    img.decoding = "async";
    img.referrerPolicy = "no-referrer";
    img.addEventListener("error", function () {
      img.remove();
      fallback();
    }, { once: true });
    img.src = logoSrc(company.logo);
    box.appendChild(img);
  }

  function normalizeTopic(topic) {
    return String(topic || "").trim().toLowerCase().replace(/\s+/g, " ");
  }

  /* This function is intentionally in the main scope so valid company pages can call it. */
  function renderResources() {
    var list = $("dResources");
    var missingNote = $("dResMissing");
    if (!list || !company) return;

    list.textContent = "";
    if (missingNote) {
      missingNote.textContent = "";
      missingNote.hidden = true;
    }

    var resources = Array.isArray(window.C2C_RESOURCES) ? window.C2C_RESOURCES : [];
    var companyTopics = Array.isArray(company.topics) ? company.topics : [];
    var covered = Object.create(null);
    var shownIds = Object.create(null);

    resources.forEach(function (resource) {
      var resourceTopics = (Array.isArray(resource.topics) ? resource.topics : []).map(normalizeTopic);
      var matched = companyTopics.filter(function (topic) {
        return resourceTopics.indexOf(normalizeTopic(topic)) !== -1;
      });
      if (!matched.length || shownIds[resource.id || resource.url]) return;
      shownIds[resource.id || resource.url] = true;
      matched.forEach(function (topic) { covered[normalizeTopic(topic)] = true; });

      var item = document.createElement("li");
      item.className = "res";

      var title = document.createElement("h3");
      title.textContent = resource.title || "Learning resource";

      var provider = document.createElement("p");
      provider.className = "res-provider";
      provider.textContent = resource.provider || "External resource";

      var description = document.createElement("p");
      description.textContent = resource.description || "Explore this resource to learn more about the topic.";

      var tags = document.createElement("ul");
      tags.className = "topics";
      matched.forEach(function (topic) {
        var tag = document.createElement("li");
        tag.textContent = topic;
        tags.appendChild(tag);
      });

      var link = document.createElement("a");
      link.className = "res-link";
      link.href = resource.url || "";
      link.textContent = "Start learning →";
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      link.setAttribute("aria-label", "Start learning: " + (resource.title || "resource") + " on " + (resource.provider || "external site") + " (opens in a new tab)");

      [title, provider, description, tags, link].forEach(function (node) { item.appendChild(node); });
      list.appendChild(item);
    });

    var missing = companyTopics.filter(function (topic) { return !covered[normalizeTopic(topic)]; });
    if (missing.length && missingNote) {
      missingNote.textContent = "Resources for these topics are still being curated: " + missing.join(", ") + ".";
      missingNote.hidden = false;
    }

    if (!list.children.length) {
      var item = document.createElement("li");
      item.className = "res";
      var title = document.createElement("h3");
      title.textContent = "Resources are being curated";
      var description = document.createElement("p");
      description.textContent = "We are collecting reliable learning material for these preparation topics. Please check back soon.";
      item.appendChild(title);
      item.appendChild(description);
      list.appendChild(item);
    }
  }

  if (!company) {
    document.title = "Company not found — Campus2Corporate";
    var crumb = $("crumbCurrent");
    if (crumb) crumb.textContent = "Not found";
    var notFound = $("notFound");
    if (notFound) notFound.hidden = false;
    var detail = $("detail");
    if (detail) detail.hidden = true;
    return;
  }

  document.title = company.name + " — Campus2Corporate";
  if ($("crumbCurrent")) $("crumbCurrent").textContent = company.name;
  if ($("dName")) $("dName").textContent = company.name;
  if ($("dCategory")) $("dCategory").textContent = company.category || "Company";
  if ($("dRoles")) $("dRoles").textContent = "Focus: " + (company.roles || "General preparation");
  if ($("dBlurb")) $("dBlurb").textContent = company.blurb || "General preparation topics for this company.";
  renderLogo($("dLogo"));

  var topics = $("dTopics");
  if (topics) {
    topics.textContent = "";
    (Array.isArray(company.topics) ? company.topics : []).forEach(function (topic) {
      var item = document.createElement("li");
      item.textContent = topic;
      topics.appendChild(item);
    });
  }

  renderResources();
  if ($("detail")) $("detail").hidden = false;
})();
