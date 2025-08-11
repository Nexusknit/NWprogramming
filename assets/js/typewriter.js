// Multi-element typewriter (data-typewriter)
(function () {
  const els = document.querySelectorAll("[data-typewriter]");
  if (!els.length) return;
  function run(el, words) {
    let i = 0,
      j = 0,
      deleting = false;
    const speed = 55,
      pause = 1200,
      del = 35;
    (function tick() {
      const w = words[i];
      if (!deleting) {
        el.textContent = w.slice(0, ++j);
        if (j === w.length) {
          deleting = true;
          return setTimeout(tick, pause);
        }
      } else {
        el.textContent = w.slice(0, --j);
        if (j === 0) {
          deleting = false;
          i = (i + 1) % words.length;
        }
      }
      setTimeout(tick, deleting ? del : speed);
    })();
  }
  els.forEach((el, idx) => {
    let words = [];
    const raw = el.getAttribute("data-typewriter");
    try {
      words = JSON.parse(raw);
    } catch {
      words = (raw || "")
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
    }
    if (words && words.length) setTimeout(() => run(el, words), idx * 250);
  });
})();
