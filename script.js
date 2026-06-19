/* =========================================================
   GATEKEEPER — Validation engine
   Plain vanilla JS. No frameworks, no build step.

   Structure:
   1. Element references
   2. Validation rules (regex + helpers)
   3. UI helpers (field state, pipeline, live announcements)
   4. Event wiring (blur validation + submit)
   ========================================================= */

(() => {
  "use strict";

  // ---------- 1. Element references ----------
  const form = document.getElementById("signupForm");
  const formCard = document.getElementById("formCard");
  const successCard = document.getElementById("successCard");
  const submitBtn = document.getElementById("submitBtn");
  const resetBtn = document.getElementById("resetBtn");
  const formStatus = document.getElementById("formStatus");
  const jsonOutput = document.getElementById("jsonOutput");
  const passwordChecklist = document.getElementById("passwordChecklist");

  const fields = {
    fullName: document.getElementById("fullName"),
    email: document.getElementById("email"),
    password: document.getElementById("password"),
    confirmPassword: document.getElementById("confirmPassword"),
    terms: document.getElementById("terms"),
  };

  // ---------- 2. Validation rules ----------
  // Kept as small, named regex pieces (rather than one giant pattern)
  // so each rule is easy to read and easy to change later.
  const rules = {
    length: (v) => v.length >= 8,
    upper: (v) => /[A-Z]/.test(v),
    lower: (v) => /[a-z]/.test(v),
    digit: (v) => /[0-9]/.test(v),
    symbol: (v) => /[!@#$%^&*()_\-+=?]/.test(v),
  };

  // Unicode-aware: accepts names in any script (not just A-Z)
  const nameRegex = /^[\p{L}\s'-]{2,50}$/u;

  // Deliberately simple email check (text + @ + domain dot).
  // The brief itself warns that over-engineering this regex rejects
  // valid addresses — real verification belongs server-side.
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  function validators(value, all) {
    return {
      fullName: () => {
        if (!value.trim()) return "Full name is required.";
        if (!nameRegex.test(value.trim())) return "Letters and spaces only, 2–50 characters.";
        return null;
      },
      email: () => {
        if (!value.trim()) return "Email is required.";
        if (!emailRegex.test(value.trim())) return "Enter a valid email address.";
        return null;
      },
      password: () => {
        if (!value) return "Password is required.";
        const failed = Object.entries(rules).filter(([, test]) => !test(value));
        if (failed.length) return "Password doesn't meet all requirements yet.";
        return null;
      },
      confirmPassword: () => {
        if (!value) return "Re-enter your password.";
        if (value !== all.password) return "Passwords don't match.";
        return null;
      },
      terms: () => {
        if (!fields.terms.checked) return "You must accept the terms to continue.";
        return null;
      },
    };
  }

  // ---------- 3. UI helpers ----------
  function setFieldState(name, state, message) {
    const input = fields[name];
    const wrapper = input.closest(".field");
    const status = document.getElementById(`${name}-status`);

    wrapper.dataset.state = state; // "neutral" | "valid" | "invalid"
    input.setAttribute("aria-invalid", state === "invalid" ? "true" : "false");

    if (message !== undefined) status.textContent = message;
  }

  function updatePasswordChecklist(value) {
    passwordChecklist.querySelectorAll("li").forEach((li) => {
      const rule = li.dataset.rule;
      li.classList.toggle("met", rules[rule](value));
    });
  }

  function setStage(stageName, status) {
    // status: "active" | "success" | "failed" | "" (reset)
    const stage = document.querySelector(`.stage[data-stage="${stageName}"]`);
    stage.classList.remove("active", "success", "failed");
    if (status) stage.classList.add(status);
  }

  function resetPipeline() {
    ["input", "process", "output"].forEach((s) => setStage(s, ""));
  }

  function announce(message) {
    formStatus.textContent = message;
  }

  // ---------- 4. Single-field validation (used on blur) ----------
  function validateField(name) {
    const input = fields[name];
    const value = name === "terms" ? input.checked : input.value;
    const allValues = {
      password: fields.password.value,
    };
    const error = validators(value, allValues)[name]();

    if (error) {
      setFieldState(name, "invalid", error);
      return false;
    }

    const defaultHints = {
      fullName: "Letters and spaces only.",
      email: "We'll send your confirmation here.",
      password: "All requirements met.",
      confirmPassword: "Passwords match.",
      terms: "",
    };
    setFieldState(name, "valid", defaultHints[name]);
    return true;
  }

  // Mark the "Input" stage active as soon as the user starts typing anywhere.
  let inputStageMarked = false;
  function markInputStage() {
    if (inputStageMarked) return;
    inputStageMarked = true;
    setStage("input", "active");
  }

  // ---------- 5. Event wiring ----------
  Object.entries(fields).forEach(([name, el]) => {
    el.addEventListener("input", () => {
      markInputStage();
      if (name === "password") updatePasswordChecklist(el.value);
      // While typing, clear a previous error instead of validating on
      // every keystroke — matches the "polite, not interrupting" approach.
      const wrapper = el.closest(".field");
      if (wrapper.dataset.state === "invalid") {
        wrapper.dataset.state = "neutral";
        el.setAttribute("aria-invalid", "false");
      }
    });

    const eventName = name === "terms" ? "change" : "blur";
    el.addEventListener(eventName, () => {
      // Skip validating an untouched, empty optional flow on first blur-out
      // only for terms checkbox interaction noise; everything else validates.
      validateField(name);
    });
  });

  form.addEventListener("submit", (event) => {
    event.preventDefault(); // Phase 2: stop the default refresh/memory-wipe.

    setStage("process", "active");
    submitBtn.disabled = true;
    submitBtn.querySelector(".btn-label").textContent = "Verifying…";

    // Validate every field, regardless of which ones were already touched.
    const results = Object.keys(fields).map((name) => validateField(name));
    const allValid = results.every(Boolean);

    // Small delay so the "Process" stage is visible — this is purely a
    // UI cue, not an artificial restriction.
    window.setTimeout(() => {
      submitBtn.disabled = false;
      submitBtn.querySelector(".btn-label").textContent = "Request access";

      if (!allValid) {
        setStage("process", "");
        setStage("output", "failed");
        window.setTimeout(() => setStage("output", ""), 1200);

        const firstInvalid = Object.keys(fields).find(
          (name) => fields[name].closest(".field").dataset.state === "invalid"
        );
        if (firstInvalid) fields[firstInvalid].focus();

        announce("Form has errors. Please review the highlighted fields.");
        return;
      }

      setStage("process", "");
      setStage("output", "success");
      announce("Access granted. Your information has been verified.");
      showSuccess();
    }, 350);
  });

  function maskPassword(value) {
    return "•".repeat(Math.min(value.length, 12));
  }

  function showSuccess() {
    const payload = {
      status: "approved",
      timestamp: new Date().toISOString(),
      payload: {
        fullName: fields.fullName.value.trim(),
        email: fields.email.value.trim(),
        password: maskPassword(fields.password.value),
      },
    };

    jsonOutput.textContent = JSON.stringify(payload, null, 2);
    formCard.hidden = true;
    successCard.hidden = false;
    successCard.querySelector(".title").focus?.();
  }

  resetBtn.addEventListener("click", () => {
    form.reset();
    Object.keys(fields).forEach((name) => {
      const wrapper = fields[name].closest(".field");
      wrapper.dataset.state = "neutral";
      fields[name].setAttribute("aria-invalid", "false");
    });
    updatePasswordChecklist("");
    resetPipeline();
    inputStageMarked = false;

    successCard.hidden = true;
    formCard.hidden = false;
    fields.fullName.focus();
    announce("");
  });
})();