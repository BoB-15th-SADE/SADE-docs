// Copy the article text without making a network request.
document.addEventListener("click", async (event) => {
  const button = event.target.closest("[data-copy-page]");
  if (!button) return;
  const article = button.closest(".md-content__inner");
  if (!article) return;
  const text = article.innerText.replace(article.querySelector(".sade-page-tools").innerText, "").trim();
  const label = button.querySelector("span");
  try {
    await navigator.clipboard.writeText(text);
    label.textContent = button.dataset.copied;
  } catch {
    label.textContent = button.dataset.failed;
  }
  window.setTimeout(() => { label.textContent = button.dataset.label; }, 2000);
});
