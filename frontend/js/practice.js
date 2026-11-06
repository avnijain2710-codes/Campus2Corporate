/* Practice test: selection, one-question-at-a-time quiz, scoring, review and retake.
   Part 1 is pure logic (no DOM). Part 2 is the interface. */

/* ---------- Part 1: logic ---------- */
window.C2CPracticeCore = (function () {
  "use strict";

  function validateQuestion(q) {
    if (!q || typeof q !== "object") return false;
    var texts = ["id", "category", "topic", "difficulty", "question", "explanation"];
    for (var i = 0; i < texts.length; i++) {
      if (typeof q[texts[i]] !== "string" || !q[texts[i]].trim()) return false;
    }
    if (!Array.isArray(q.options) || q.options.length !== 4) return false;
    var seen = {};
    for (var j = 0; j < 4; j++) {
      if (typeof q.options[j] !== "string" || !q.options[j].trim()) return false;
      seen[q.options[j].trim()] = true;
    }
    if (Object.keys(seen).length !== 4) return false;
    return Number.isInteger(q.correctAnswer) && q.correctAnswer >= 0 && q.correctAnswer < 4;
  }

  /* Keep only valid questions with unique ids. */
  function cleanBank(raw) {
    var ids = {};
    return (Array.isArray(raw) ? raw : []).filter(function (q) {
      if (!validateQuestion(q) || ids[q.id]) return false;
      ids[q.id] = true;
      return true;
    });
  }

  function shuffle(arr) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  /* Questions for one attempt (category tests are shuffled). Mixed practice samples perCategory from every listed category. */
  function buildQuestions(test, bank) {
    if (test.category) {
      return shuffle(bank.filter(function (q) { return q.category === test.category; }));
    }
    var picked = [];
    (test.categories || []).forEach(function (cat) {
      var pool = bank.filter(function (q) { return q.category === cat; });
      picked = picked.concat(shuffle(pool).slice(0, test.perCategory || 2));
    });
    return shuffle(picked);
  }

  /* answers[i] is the chosen option index, or null if unanswered. Percentage uses ALL questions. */
  function computeResult(questions, answers) {
    var correct = 0, incorrect = 0, unanswered = 0;
    questions.forEach(function (q, i) {
      var a = answers[i];
      if (a === null || a === undefined) unanswered++;
      else if (a === q.correctAnswer) correct++;
      else incorrect++;
    });
    var total = questions.length;
    var pct = total ? Number(((correct / total) * 100).toFixed(2)) : 0;
    return { total: total, attempted: correct + incorrect, correct: correct,
             incorrect: incorrect, unanswered: unanswered, percentage: pct };
  }

  return { validateQuestion: validateQuestion, cleanBank: cleanBank,
           buildQuestions: buildQuestions, computeResult: computeResult };
})();

/* ---------- Part 2: interface ---------- */
(function () {
  "use strict";
  var core = window.C2CPracticeCore;
  var $ = function (id) { return document.getElementById(id); };
  if (!$("selectView")) return;

  var tests = Array.isArray(window.C2C_PRACTICE_TESTS) ? window.C2C_PRACTICE_TESTS : [];
  var bank = core.cleanBank(window.C2C_PRACTICE_QUESTIONS);
  var state = null; /* { test, questions, answers, index, submitted, result } */
  var views = { select: $("selectView"), quiz: $("quizView"), result: $("resultView") };
  var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text !== undefined) n.textContent = text;
    return n;
  }
  function announce(msg) { $("announcer").textContent = msg; }
  function showView(name) {
    Object.keys(views).forEach(function (k) { views[k].hidden = k !== name; });
    window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
  }

  /* ----- Confirmation dialog (one shared dialog) ----- */
  var dialog = $("confirmDialog"), pending = null;
  function confirmDialog(opts) {
    $("dlgTitle").textContent = opts.title;
    $("dlgText").textContent = opts.message;
    $("dlgOk").textContent = opts.okText;
    $("dlgCancel").textContent = opts.cancelText;
    pending = opts.onConfirm;
    if (typeof dialog.showModal === "function") dialog.showModal();
    else dialog.setAttribute("open", "");
  }
  function closeDialog() {
    if (typeof dialog.close === "function") dialog.close(); else dialog.removeAttribute("open");
  }
  $("dlgCancel").addEventListener("click", function () { pending = null; closeDialog(); });
  dialog.addEventListener("cancel", function () { pending = null; });
  $("dlgOk").addEventListener("click", function () {
    var fn = pending; pending = null; closeDialog();
    if (fn) fn();
  });

  /* ----- Selection screen ----- */
  function renderTests() {
    var box = $("testList");
    box.textContent = "";
    var usable = 0;
    tests.forEach(function (t, i) {
      var qs = core.buildQuestions(t, bank);
      var count = t.category ? qs.length : qs.length;
      var card = el("article", "pr-test pr-t" + (i % 4));
      card.appendChild(el("p", "pr-cat", t.category || "All subjects"));
      card.appendChild(el("h2", "", t.title));
      card.appendChild(el("p", "", t.description));
      card.appendChild(el("p", "pr-count", count + (count === 1 ? " question" : " questions")));
      var btn = el("button", "btn btn-primary", "Start test");
      btn.type = "button";
      btn.setAttribute("aria-label", "Start test: " + t.title);
      if (count === 0) { btn.disabled = true; } else { usable++; }
      btn.addEventListener("click", function () { startTest(t); });
      card.appendChild(btn);
      box.appendChild(card);
    });
    var err = $("dataError");
    if (!tests.length || !usable) {
      err.textContent = "Practice questions could not be loaded. Please refresh the page or try again later.";
      err.hidden = false;
    } else if (bank.length < (window.C2C_PRACTICE_QUESTIONS || []).length) {
      console.warn("Some practice questions were skipped because they were malformed.");
    }
  }

  /* ----- Starting / retaking: always builds a completely fresh state ----- */
  function startTest(test) {
    var questions = core.buildQuestions(test, bank);
    if (!questions.length) return;
    state = {
      test: test, questions: questions,
      answers: questions.map(function () { return null; }),
      index: 0, submitted: false, result: null
    };
    $("reviewList").textContent = "";
    $("reviewList").hidden = true;
    $("reviewBtn").setAttribute("aria-expanded", "false");
    $("reviewBtn").textContent = "Review answers";
    $("submitBtn").disabled = false;
    $("quizCategory").textContent = test.title;
    buildQnav();
    showView("quiz");
    renderQuestion(true);
  }

  /* ----- Quiz ----- */
  function answeredCount() {
    return state.answers.filter(function (a) { return a !== null; }).length;
  }

  function buildQnav() {
    var nav = $("qNav");
    nav.textContent = "";
    state.questions.forEach(function (q, i) {
      var li = document.createElement("li");
      var b = el("button", "pr-dot", String(i + 1));
      b.type = "button";
      b.addEventListener("click", function () { goTo(i); });
      li.appendChild(b);
      nav.appendChild(li);
    });
  }

  function updateStatus() {
    var n = state.questions.length;
    $("quizCount").textContent = "Question " + (state.index + 1) + " of " + n;
    $("answeredCount").textContent = answeredCount() + " of " + n + " answered";
    var p = $("quizProgress");
    p.max = n; p.value = state.index + 1;
    p.setAttribute("aria-valuetext", "Question " + (state.index + 1) + " of " + n);
    Array.prototype.forEach.call($("qNav").children, function (li, i) {
      var b = li.firstChild, answered = state.answers[i] !== null;
      b.classList.toggle("answered", answered);
      b.setAttribute("aria-label", "Question " + (i + 1) + (answered ? ", answered" : ", not answered"));
      if (i === state.index) b.setAttribute("aria-current", "step"); else b.removeAttribute("aria-current");
    });
    $("prevBtn").disabled = state.index === 0;
    $("nextBtn").disabled = state.index === n - 1;
    $("submitBtn").hidden = state.index !== n - 1;
  }

  function renderQuestion(focus) {
    var q = state.questions[state.index];
    $("qMeta").textContent = q.topic + " · " + q.difficulty;
    $("qText").textContent = q.question;
    var box = $("options");
    box.textContent = "";
    q.options.forEach(function (text, i) {
      var label = el("label", "pr-option");
      var input = document.createElement("input");
      input.type = "radio"; input.name = "answer"; input.value = String(i);
      input.checked = state.answers[state.index] === i;
      input.addEventListener("change", function () {
        if (state.submitted) return;
        state.answers[state.index] = i;
        updateStatus();
      });
      label.appendChild(input);
      label.appendChild(el("span", "pr-letter", String.fromCharCode(65 + i)));
      label.appendChild(el("span", "pr-opt-text", text));
      box.appendChild(label);
    });
    updateStatus();
    announce("Question " + (state.index + 1) + " of " + state.questions.length);
    if (focus) $("qText").focus({ preventScroll: true });
  }

  function goTo(i) {
    if (!state || state.submitted) return;
    if (i < 0 || i >= state.questions.length) return;
    state.index = i;
    renderQuestion(true);
  }
  $("prevBtn").addEventListener("click", function () { goTo(state.index - 1); });
  $("nextBtn").addEventListener("click", function () { goTo(state.index + 1); });

  $("exitBtn").addEventListener("click", function () {
    confirmDialog({ title: "Leave this test?", message: "Your answers for this attempt will be lost.",
      okText: "Leave test", cancelText: "Keep practising",
      onConfirm: function () { state = null; showView("select"); } });
  });

  /* ----- Submit (confirmation, then a single scoring pass) ----- */
  $("submitBtn").addEventListener("click", function () {
    if (!state || state.submitted) return;
    var left = state.questions.length - answeredCount();
    confirmDialog({
      title: "Submit test?",
      message: left > 0
        ? "You have " + left + " unanswered question" + (left === 1 ? "" : "s") + ". Submit anyway?"
        : "You have answered every question. Submit now? You won't be able to change your answers.",
      okText: "Submit test", cancelText: "Return to test",
      onConfirm: finishTest
    });
  });

  /* Keeps a short, non-sensitive summary of each completed attempt in this browser so the demo
     profile page can show real practice history. Failure to save never affects the test. */
  function recordAttempt(r) {
    try {
      var key = "c2c_demo_attempts_v1";
      var list = JSON.parse(localStorage.getItem(key) || "[]");
      if (!Array.isArray(list)) list = [];
      list.push({ testId: state.test.id, title: state.test.title, correct: r.correct, total: r.total,
                  percentage: r.percentage, date: new Date().toISOString() });
      localStorage.setItem(key, JSON.stringify(list.slice(-50)));
    } catch (e) { /* storage unavailable: ignore */ }
  }

  function finishTest() {
    if (!state || state.submitted) return; /* guards against duplicate submission */
    state.submitted = true;
    $("submitBtn").disabled = true;
    state.result = core.computeResult(state.questions, state.answers);
    recordAttempt(state.result);
    renderResult();
    showView("result");
    $("resultTitle").focus({ preventScroll: true });
    announce("Test submitted. You scored " + state.result.correct + " out of " + state.result.total + ".");
  }

  /* ----- Results ----- */
  function renderResult() {
    var r = state.result;
    $("resultCategory").textContent = state.test.title;
    $("scoreFraction").textContent = r.correct + "/" + r.total;
    $("scorePercent").textContent = "(" + r.percentage + "%)";
    var dl = $("stats");
    dl.textContent = "";
    [["Total questions", r.total], ["Attempted", r.attempted + "/" + r.total], ["Correct", r.correct],
     ["Incorrect", r.incorrect], ["Unanswered", r.unanswered]].forEach(function (row) {
      var d = el("div", "pr-stat");
      d.appendChild(el("dt", "", row[0]));
      d.appendChild(el("dd", "", String(row[1])));
      dl.appendChild(d);
    });
  }

  /* ----- Review: built from the same question records used in the test ----- */
  function renderReview() {
    var box = $("reviewList");
    box.textContent = "";
    state.questions.forEach(function (q, i) {
      var chosen = state.answers[i];
      var status = chosen === null ? "Unanswered" : (chosen === q.correctAnswer ? "Correct" : "Incorrect");
      var item = el("article", "pr-rev pr-" + status.toLowerCase());
      var head = el("div", "pr-rev-head");
      head.appendChild(el("p", "pr-meta", "Question " + (i + 1) + " · " + q.topic + " · " + q.difficulty));
      head.appendChild(el("span", "pr-badge", status));
      item.appendChild(head);
      item.appendChild(el("p", "pr-qtext", q.question));
      var ul = el("ul", "pr-rev-opts");
      q.options.forEach(function (text, k) {
        var li = el("li", k === q.correctAnswer ? "is-correct" : (k === chosen ? "is-wrong" : ""));
        li.appendChild(el("span", "pr-letter", String.fromCharCode(65 + k)));
        li.appendChild(el("span", "pr-opt-text", text));
        var tags = [];
        if (k === chosen) tags.push("Your answer");
        if (k === q.correctAnswer) tags.push("Correct answer");
        if (tags.length) li.appendChild(el("span", "pr-tag", tags.join(" · ")));
        ul.appendChild(li);
      });
      item.appendChild(ul);
      if (chosen === null) item.appendChild(el("p", "pr-none", "You did not select an answer for this question."));
      var exp = el("p", "pr-exp");
      exp.appendChild(el("strong", "", "Explanation: "));
      exp.appendChild(document.createTextNode(q.explanation));
      item.appendChild(exp);
      box.appendChild(item);
    });
  }

  $("reviewBtn").addEventListener("click", function () {
    var box = $("reviewList");
    if (!state || !state.submitted) return;
    var open = box.hidden;
    if (open) renderReview();
    box.hidden = !open;
    this.setAttribute("aria-expanded", String(open));
    this.textContent = open ? "Hide review" : "Review answers";
    if (open) box.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
  });
  $("retakeBtn").addEventListener("click", function () { if (state) startTest(state.test); });
  $("backBtn").addEventListener("click", function () { state = null; showView("select"); });

  renderTests();
})();
