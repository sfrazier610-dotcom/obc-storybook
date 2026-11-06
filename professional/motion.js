/* Calm scroll-reveal for professional pages. No-ops for reduced motion and missing observers. */
(function () {
  if (window.__obcReveal) return;
  window.__obcReveal = true;
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduce || !("IntersectionObserver" in window)) return;
  var grids = ".sgrid,.cgrid,.tgrid,.agrid,.two,.res-grid";
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("in");
      io.unobserve(entry.target);
    });
  }, { threshold: 0.16, rootMargin: "0px 0px -8% 0px" });
  function arm(el, delay) {
    var rect = el.getBoundingClientRect();
    if (rect.width === 0 && rect.height === 0) return;
    if (rect.top < window.innerHeight * 0.94 && rect.bottom > 0) return;
    el.classList.add("reveal");
    if (delay) el.style.setProperty("--d", delay);
    io.observe(el);
  }
  function armKids(node) {
    Array.prototype.forEach.call(node.children, function (child, i) {
      if (child.classList.contains("collage")) return;
      arm(child, (i % 4) * 50 + "ms");
    });
  }
  document.querySelectorAll("main > section, main > article").forEach(function (block) {
    var gridsIn = block.querySelectorAll(grids);
    if (!gridsIn.length) {
      armKids(block);
      return;
    }
    Array.prototype.forEach.call(block.children, function (child, i) {
      if (child.matches(grids)) armKids(child);
      else arm(child, (i % 3) * 40 + "ms");
    });
  });
  document.querySelectorAll("main > .bridge, main > h1, main > h2, main > h3, main > .lead, main > .warn, main > .banner-ok, main > ul, main > ol, main > p").forEach(function (el, i) {
    if (el.closest("section, article")) return;
    arm(el, (i % 3) * 40 + "ms");
  });
})();
