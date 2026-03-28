(function () {
  const papers = window.PAPER_DATA.papers;
  const searchInput = document.getElementById("publication-search");
  const datalist = document.getElementById("publication-options");

  const detailTitle = document.getElementById("detail-title");
  const detailFigure = document.getElementById("detail-figure");
  const detailSummary = document.getElementById("detail-summary");
  const detailPaperLink = document.getElementById("detail-paper-link");
  const detailVideoLink = document.getElementById("detail-video-link");
  const detailYear = document.getElementById("detail-year");
  const detailTags = document.getElementById("detail-tags");
  const detailCluster = document.getElementById("detail-cluster");

  const FALLBACK_VIDEO_PAGE = "assets/video-not-available.html";

  function findPaperById(id) {
    return papers.find(paper => paper.id === id) || papers[0];
  }

  function findPaperByTitle(title) {
    return papers.find(paper => paper.title.toLowerCase() === title.trim().toLowerCase());
  }

  function populateSearchOptions() {
    papers.forEach(paper => {
      const option = document.createElement("option");
      option.value = paper.title;
      datalist.appendChild(option);
    });
  }

  function getVideoHref(paper) {
    const value = typeof paper.videoUrl === "string" ? paper.videoUrl.trim() : "";
    return value ? value : FALLBACK_VIDEO_PAGE;
  }

  function updateDetailPanel(paper) {
    detailTitle.textContent = paper.title;
    detailFigure.src = paper.figure;
    detailFigure.alt = `Figure for ${paper.title}. Click to open the full-resolution PNG.`;
    detailFigure.title = "Click to open the full-resolution PNG";
    detailFigure.tabIndex = 0;
    detailSummary.textContent = paper.summary;
    detailPaperLink.href = paper.paperUrl;
    detailVideoLink.href = getVideoHref(paper);
    detailYear.textContent = String(paper.year);
    detailTags.textContent = paper.tags.join(", ");
    detailCluster.textContent = paper.cluster;
    searchInput.value = paper.title;
    window.NetworkView.highlightSelection(paper.id);
  }

  function selectPaperById(id) {
    const paper = findPaperById(id);
    updateDetailPanel(paper);
  }

  function openFigureInNewTab() {
    window.open(detailFigure.src, "_blank", "noopener,noreferrer");
  }

  function setupEvents() {
    searchInput.addEventListener("change", () => {
      const paper = findPaperByTitle(searchInput.value);
      if (paper) updateDetailPanel(paper);
    });

    searchInput.addEventListener("keydown", event => {
      if (event.key !== "Enter") return;
      const paper = findPaperByTitle(searchInput.value);
      if (paper) updateDetailPanel(paper);
    });

    document.addEventListener("paper:selected", event => {
      selectPaperById(event.detail.id);
    });

    detailFigure.addEventListener("click", openFigureInNewTab);
    detailFigure.addEventListener("keydown", event => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        openFigureInNewTab();
      }
    });
  }

  function init() {
    populateSearchOptions();
    window.NetworkView.draw(1);
    setupEvents();
    updateDetailPanel(papers[0]);
  }

  init();
})();
