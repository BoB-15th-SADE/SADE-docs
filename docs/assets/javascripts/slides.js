// Step screenshots as a horizontal slider: step chips, arrows, keyboard and swipe.
(function () {
  function build(root) {
    if (root.dataset.ready) return;
    root.dataset.ready = "1";
    const slides = Array.from(root.querySelectorAll(":scope > .sade-slide"));
    if (!slides.length) return;
    const korean = document.documentElement.lang !== "en";
    const track = document.createElement("div");
    track.className = "sade-slides__track";
    track.setAttribute("tabindex", "0");
    track.setAttribute("aria-label", korean ? "단계별 화면" : "Step screens");
    slides.forEach((s) => track.appendChild(s));
    const chips = document.createElement("div");
    chips.className = "sade-slides__chips";
    chips.setAttribute("role", "tablist");
    const buttons = slides.map((s, i) => {
      const b = document.createElement("button");
      b.type = "button";
      b.setAttribute("role", "tab");
      b.innerHTML = '<span class="n">' + (i + 1) + "</span>" + (s.dataset.title || "");
      b.addEventListener("click", () => go(i));
      chips.appendChild(b);
      return b;
    });
    const nav = document.createElement("div");
    nav.className = "sade-slides__nav";
    const prev = document.createElement("button");
    prev.type = "button"; prev.className = "prev"; prev.setAttribute("aria-label", korean ? "이전 단계" : "Previous step"); prev.textContent = korean ? "← 이전" : "← Previous";
    const next = document.createElement("button");
    next.type = "button"; next.className = "next"; next.setAttribute("aria-label", korean ? "다음 단계" : "Next step"); next.textContent = korean ? "다음 →" : "Next →";
    const count = document.createElement("span");
    count.className = "count";
    nav.append(count, prev, next);
    root.append(chips, track, nav);
    let current = 0;
    function mark(i) {
      current = i;
      buttons.forEach((b, k) => { b.setAttribute("aria-selected", k === i ? "true" : "false"); b.classList.toggle("on", k === i); });
      count.textContent = (i + 1) + " / " + slides.length;
      prev.disabled = i === 0; next.disabled = i === slides.length - 1;
    }
    function go(i) {
      i = Math.max(0, Math.min(slides.length - 1, i));
      track.scrollTo({ left: slides[i].offsetLeft - track.offsetLeft, behavior: "smooth" });
      mark(i);
    }
    prev.addEventListener("click", () => go(current - 1));
    next.addEventListener("click", () => go(current + 1));
    track.addEventListener("keydown", (e) => {
      if (e.key === "ArrowRight") { e.preventDefault(); go(current + 1); }
      if (e.key === "ArrowLeft") { e.preventDefault(); go(current - 1); }
    });
    let timer;
    track.addEventListener("scroll", () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        const i = Math.round(track.scrollLeft / track.clientWidth);
        if (i !== current) mark(i);
      }, 80);
    });
    mark(0);
  }
  function init() { document.querySelectorAll(".sade-slides").forEach(build); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init); else init();
})();
