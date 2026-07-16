/* ==========================================================================
   TEAM PRAYAS PHOTO GALLERY RENDERER (js/gallery.js)
   ========================================================================== */

document.addEventListener("DOMContentLoaded", () => {
  initCategoryFilter();
  initLightboxViewer();
});

/* ==========================================================================
   1. GALLERY GRID CATEGORY FILTER
   ========================================================================== */
function initCategoryFilter() {
  const filterBtns = document.querySelectorAll(".filter-btn");
  const galleryItems = document.querySelectorAll(".gallery-item");

  if (filterBtns.length === 0) return;

  filterBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      // Toggle active classes on tabs
      filterBtns.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");

      const selectedCategory = btn.getAttribute("data-filter");

      // Filter gallery cards
      galleryItems.forEach(item => {
        const itemCategory = item.getAttribute("data-category");

        if (selectedCategory === "all" || itemCategory === selectedCategory) {
          item.classList.remove("hidden");
          // Re-trigger scroll reveal transitions for filtered results
          item.style.opacity = "1";
          item.style.transform = "scale(1)";
        } else {
          item.classList.add("hidden");
        }
      });
    });
  });
}

/* ==========================================================================
   2. GALLERY LIGHTBOX MODAL WITH NAVIGATION KEYS
   ========================================================================== */
function initLightboxViewer() {
  const modal = document.getElementById("lightbox-modal");
  if (!modal) return;

  const lightboxImg = document.getElementById("lightbox-img");
  const lightboxCaption = document.getElementById("lightbox-caption");
  const closeBtn = document.getElementById("lightbox-close");
  const prevBtn = document.getElementById("lightbox-prev");
  const nextBtn = document.getElementById("lightbox-next");
  const galleryItems = document.querySelectorAll(".gallery-item img");

  let currentIndex = 0;
  const visibleImagesList = [];

  // Recalculate list of active/visible images
  function refreshVisibleImages() {
    visibleImagesList.length = 0; // Clear
    document.querySelectorAll(".gallery-item:not(.hidden)").forEach(item => {
      const img = item.querySelector("img");
      const labelEl = item.querySelector(".gallery-overlay span");
      visibleImagesList.push({
        src: img.getAttribute("src"),
        caption: labelEl ? labelEl.textContent : img.getAttribute("alt") || ""
      });
    });
  }

  function openLightbox(index) {
    refreshVisibleImages();
    // Find index inside visible list
    const clickedImg = galleryItems[index];
    const clickedSrc = clickedImg.getAttribute("src");
    
    currentIndex = visibleImagesList.findIndex(img => img.src === clickedSrc);
    if (currentIndex === -1) currentIndex = 0;

    updateLightboxData();
    modal.classList.add("active");
    document.body.style.overflow = "hidden"; // Disable main window scroll
  }

  function closeLightbox() {
    modal.classList.remove("active");
    document.body.style.overflow = ""; // Re-enable main window scroll
  }

  function updateLightboxData() {
    if (visibleImagesList.length === 0) return;
    const currentImg = visibleImagesList[currentIndex];
    
    lightboxImg.src = currentImg.src;
    lightboxCaption.textContent = currentImg.caption;
  }

  function showNextImage() {
    if (visibleImagesList.length === 0) return;
    currentIndex = (currentIndex + 1) % visibleImagesList.length;
    updateLightboxData();
  }

  function showPrevImage() {
    if (visibleImagesList.length === 0) return;
    currentIndex = (currentIndex - 1 + visibleImagesList.length) % visibleImagesList.length;
    updateLightboxData();
  }

  // Bind clicks to items
  galleryItems.forEach((img, idx) => {
    img.closest(".gallery-item").addEventListener("click", () => {
      openLightbox(idx);
    });
  });

  // Bind controls
  closeBtn.addEventListener("click", closeLightbox);
  nextBtn.addEventListener("click", showNextImage);
  prevBtn.addEventListener("click", showPrevImage);

  // Close by clicking background backdrop
  modal.addEventListener("click", (e) => {
    if (e.target === modal) {
      closeLightbox();
    }
  });

  // Keyboard navigation support
  document.addEventListener("keydown", (e) => {
    if (!modal.classList.contains("active")) return;
    
    if (e.key === "Escape") closeLightbox();
    if (e.key === "ArrowRight") showNextImage();
    if (e.key === "ArrowLeft") showPrevImage();
  });
}
