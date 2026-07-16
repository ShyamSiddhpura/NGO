/* ==========================================================================
   TEAM PRAYAS ADOPTION & FORM SCRIPTS (js/adoption.js)
   ========================================================================== */

// --- Static Animal Listing Database ---
const ANIMALS_DB = [
  {
    id: "pet-1",
    name: "Rocky",
    type: "dog",
    breed: "Golden Retriever",
    age: "Young (1.5 years)",
    ageCategory: "Young",
    gender: "Male",
    vaccinated: true,
    sterilized: true,
    photo: "assets/images/dog_rocky.jpg",
    description: "Rocky is an extremely playful, friendly, and smart golden retriever. He was rescued from an orthopedic injury but is now fully recovered, runs like wind, and loves playing with rubber balls.",
    personality: "Outgoing, energetic, highly trainable, and affectionate.",
    medical: "Fully vaccinated, spayed, minor fracture recovery complete."
  },
  {
    id: "pet-2",
    name: "Luna",
    type: "cat",
    breed: "Persian Mix",
    age: "Kitten (6 months)",
    ageCategory: "Puppy/Kitten",
    gender: "Female",
    vaccinated: true,
    sterilized: false,
    photo: "assets/images/cat_luna.jpg",
    description: "Luna is a soft, quiet grey fluffball. She enjoys sleeping in sunny corners, eating wet food, and cuddling on cozy laps. Very friendly with other cats and children.",
    personality: "Gentle, calm, quiet, and loves lap cuddling.",
    medical: "Initial immunization complete, spayed scheduled next month."
  },
  {
    id: "pet-3",
    name: "Bella",
    type: "dog",
    breed: "Indie Breed",
    age: "Puppy (3 months)",
    ageCategory: "Puppy/Kitten",
    gender: "Female",
    vaccinated: true,
    sterilized: false,
    photo: "assets/images/dog_bella.jpg",
    description: "Bella is a small, energetic Indie puppy. She was rescued off the street in heavy rains and is super affectionate. She loves nibbling toys and cuddling with humans.",
    personality: "Playful, vocal, affectionate, and curious.",
    medical: "Primary deworming and first 7-in-1 vaccination completed."
  },
  {
    id: "pet-4",
    name: "Milo",
    type: "cat",
    breed: "Domestic Shorthair",
    age: "Adult (3 years)",
    ageCategory: "Adult",
    gender: "Male",
    vaccinated: true,
    sterilized: true,
    photo: "assets/images/cat_milo.jpg",
    description: "Milo is a cool, calm domestic shorthair cat. He has a gorgeous black & white coat, is fully toilet trained, and enjoys playing with feather wands. Best suited for quiet apartments.",
    personality: "Independent, peaceful, and clean.",
    medical: "Vaccinations current, neutered, FIV negative."
  }
];

document.addEventListener("DOMContentLoaded", () => {
  initAdoptionGrid();
  initAdoptionWizard();
});

/* ==========================================================================
   1. ANIMAL FILTERING & SEARCH
   ========================================================================== */
function initAdoptionGrid() {
  const grid = document.getElementById("adoption-listings-grid");
  const homeFeaturedGrid = document.getElementById("home-featured-animals-grid");
  
  if (!grid && !homeFeaturedGrid) return;

  const searchInput = document.getElementById("pet-search");
  const filterType = document.getElementById("filter-type");
  const filterGender = document.getElementById("filter-gender");
  const filterAge = document.getElementById("filter-age");
  const resetBtn = document.getElementById("filter-reset");

  function createPetCard(pet) {
    const col = document.createElement("div");
    col.className = "animal-card reveal active";
    
    const genderIcon = pet.gender === "Male" ? "fa-solid fa-mars gender-male" : "fa-solid fa-venus gender-female";

    col.innerHTML = `
      <div class="animal-photo-wrapper">
        <img src="${pet.photo}" alt="${pet.name}" class="animal-photo" loading="lazy">
        <span class="animal-tag">${pet.breed}</span>
        <div class="animal-gender-tag"><i class="${genderIcon}"></i></div>
      </div>
      <div class="animal-info-content">
        <div class="animal-header-line">
          <h3 class="animal-name">${pet.name}</h3>
          <span class="animal-age">${pet.age}</span>
        </div>
        <p class="animal-breed">${pet.type.toUpperCase()}</p>
        <div class="animal-stats-row">
          ${pet.vaccinated ? '<span class="animal-badge badge-vaccinated"><i class="fa-solid fa-syringe"></i> Vaccinated</span>' : ''}
          ${pet.sterilized ? '<span class="animal-badge badge-sterilized"><i class="fa-solid fa-shield-cat"></i> Sterilized</span>' : ''}
        </div>
        <p class="animal-description">${pet.description.substring(0, 100)}...</p>
        <button class="btn btn-gradient btn-full view-pet-details-btn" data-id="${pet.id}">
          View Profile & Adopt
        </button>
      </div>
    `;

    // Bind Details Action
    col.querySelector(".view-pet-details-btn").addEventListener("click", () => {
      openAnimalDetailsModal(pet.id);
    });

    return col;
  }

  function renderGrid() {
    if (!grid) return;
    grid.innerHTML = "";

    const searchVal = searchInput.value.toLowerCase().trim();
    const typeVal = filterType.value;
    const genderVal = filterGender.value;
    const ageVal = filterAge.value;

    const filtered = ANIMALS_DB.filter(pet => {
      const matchSearch = pet.name.toLowerCase().includes(searchVal) || 
                          pet.breed.toLowerCase().includes(searchVal) || 
                          pet.description.toLowerCase().includes(searchVal);
      const matchType = typeVal === "all" || pet.type === typeVal;
      const matchGender = genderVal === "all" || pet.gender === genderVal;
      const matchAge = ageVal === "all" || pet.ageCategory === ageVal;

      return matchSearch && matchType && matchGender && matchAge;
    });

    const noResults = document.getElementById("no-animals-found");

    if (filtered.length === 0) {
      if (noResults) noResults.classList.remove("hidden");
    } else {
      if (noResults) noResults.classList.add("hidden");
      filtered.forEach(pet => {
        grid.appendChild(createPetCard(pet));
      });
    }
  }

  // Bind listings page controls
  if (grid) {
    searchInput.addEventListener("input", renderGrid);
    filterType.addEventListener("change", renderGrid);
    filterGender.addEventListener("change", renderGrid);
    filterAge.addEventListener("change", renderGrid);

    if (resetBtn) {
      resetBtn.addEventListener("click", () => {
        searchInput.value = "";
        filterType.value = "all";
        filterGender.value = "all";
        filterAge.value = "all";
        renderGrid();
        showToast("Filters cleared.", "success");
      });
    }

    renderGrid(); // Initial Load
  }

  // Featured Animal previews on home index page
  if (homeFeaturedGrid) {
    homeFeaturedGrid.innerHTML = "";
    ANIMALS_DB.slice(0, 3).forEach(pet => {
      homeFeaturedGrid.appendChild(createPetCard(pet));
    });
  }
}

/* ==========================================================================
   2. ANIMAL DETAILS MODAL VIEWER
   ========================================================================== */
function openAnimalDetailsModal(petId) {
  const pet = ANIMALS_DB.find(p => p.id === petId);
  if (!pet) return;

  // Render elements in document popup modal template
  let detailsModal = document.getElementById("pet-details-modal");
  
  // Create modal markup dynamically if not exists in DOM
  if (!detailsModal) {
    detailsModal = document.createElement("div");
    detailsModal.id = "pet-details-modal";
    detailsModal.className = "modal-overlay";
    document.body.appendChild(detailsModal);
  }

  const genderIcon = pet.gender === "Male" ? "fa-solid fa-mars gender-male" : "fa-solid fa-venus gender-female";

  detailsModal.innerHTML = `
    <div class="modal-card modal-large animate-up">
      <button class="modal-close-btn" id="details-modal-close" aria-label="Close modal">&times;</button>
      
      <div class="details-modal-layout">
        <div class="details-modal-visual">
          <img src="${pet.photo}" alt="${pet.name}" class="details-modal-img">
          <div class="details-modal-tags">
            <span class="animal-tag">${pet.breed}</span>
            <span class="animal-gender-tag"><i class="${genderIcon}"></i></span>
          </div>
        </div>
        
        <div class="details-modal-info">
          <h2>Adopt ${pet.name}</h2>
          <p class="details-modal-subtitle">${pet.type.toUpperCase()} &bull; ${pet.age}</p>
          
          <div class="details-divider"></div>
          
          <div class="details-meta-grid">
            <div class="meta-item">
              <span class="meta-label">Personality</span>
              <span class="meta-val">${pet.personality}</span>
            </div>
            <div class="meta-item">
              <span class="meta-label">Medical Records</span>
              <span class="meta-val">${pet.medical}</span>
            </div>
          </div>
          
          <div class="details-divider"></div>
          
          <p class="details-bio-text">${pet.description}</p>
          
          <button class="btn btn-gradient btn-full margin-top-medium" id="details-adopt-trigger-btn">
            Adopt ${pet.name} Now <i class="fa-solid fa-heart"></i>
          </button>
        </div>
      </div>
    </div>
  `;

  detailsModal.classList.add("active");
  document.body.style.overflow = "hidden"; // disable background scrolling

  // Bind close
  detailsModal.querySelector("#details-modal-close").addEventListener("click", () => {
    detailsModal.classList.remove("active");
    document.body.style.overflow = "";
  });

  // Close by clicking backdrop
  detailsModal.addEventListener("click", (e) => {
    if (e.target === detailsModal) {
      detailsModal.classList.remove("active");
      document.body.style.overflow = "";
    }
  });

  // Bind adopt trigger inside details modal
  detailsModal.querySelector("#details-adopt-trigger-btn").addEventListener("click", () => {
    detailsModal.classList.remove("active");
    document.body.style.overflow = "";
    openAdoptionWizardForm(pet);
  });
}

/* ==========================================================================
   3. MULTI-STEP ADOPTION WIZARD
   ========================================================================== */
function openAdoptionWizardForm(pet = null) {
  let wizardModal = document.getElementById("adoption-wizard-modal");
  
  if (!wizardModal) {
    // Return early if page layout has no adoption modal HTML template structure (should be added inside adoption.html)
    return;
  }

  // Pre-fill fields if a specific pet is selected
  if (pet) {
    const typeSelect = document.getElementById("app-pref-animal");
    const breedInput = document.getElementById("app-pref-breed");
    const ageSelect = document.getElementById("app-pref-age");
    const genderSelect = document.getElementById("app-pref-gender");

    if (typeSelect) {
      // Set value based on type
      if (pet.type === "dog") typeSelect.value = "Dog";
      else if (pet.type === "cat") typeSelect.value = "Cat";
      else typeSelect.value = "Other";
    }
    if (breedInput) breedInput.value = pet.breed;
    if (ageSelect) {
      if (pet.ageCategory === "Puppy/Kitten") ageSelect.value = "Puppy / Kitten";
      else if (pet.ageCategory === "Young") ageSelect.value = "Young";
      else ageSelect.value = "Adult";
    }
    if (genderSelect) genderSelect.value = pet.gender;
  }

  wizardModal.classList.add("active");
  document.body.style.overflow = "hidden"; // disable background scrolling
}

function initAdoptionWizard() {
  const wizardForm = document.getElementById("adoption-wizard-form");
  const wizardModal = document.getElementById("adoption-wizard-modal");
  const closeBtn = document.getElementById("wizard-modal-close");

  if (!wizardForm) return;

  // Bind close trigger
  if (closeBtn) {
    closeBtn.addEventListener("click", () => {
      wizardModal.classList.remove("active");
      document.body.style.overflow = "";
    });
  }

  // Close clicking backdrop
  wizardModal.addEventListener("click", (e) => {
    if (e.target === wizardModal) {
      wizardModal.classList.remove("active");
      document.body.style.overflow = "";
    }
  });

  const nextBtns = document.querySelectorAll(".btn-next");
  const prevBtns = document.querySelectorAll(".btn-prev");
  const fileInput = document.getElementById("app-photo");
  const fileLabel = document.getElementById("file-upload-label");

  // Show filename in upload button design on selection
  fileInput.addEventListener("change", (e) => {
    if (e.target.files.length > 0) {
      fileLabel.textContent = e.target.files[0].name;
      fileLabel.style.color = "var(--primary-color)";
    } else {
      fileLabel.textContent = "Choose ID file...";
      fileLabel.style.color = "";
    }
  });

  // Next click listeners
  nextBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      const nextStep = parseInt(btn.getAttribute("data-next"));
      const currentStep = nextStep - 1;

      if (validateStep(currentStep)) {
        goToStep(nextStep);
      } else {
        showToast("Please correct highlighted errors.", "error");
      }
    });
  });

  // Prev click listeners
  prevBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      const prevStep = parseInt(btn.getAttribute("data-prev"));
      goToStep(prevStep);
    });
  });

  function goToStep(stepNumber) {
    const panels = document.querySelectorAll(".wizard-panel");
    const steps = document.querySelectorAll(".wizard-step");

    // Toggle panels
    panels.forEach(panel => {
      if (parseInt(panel.getAttribute("data-panel")) === stepNumber) {
        panel.classList.add("active");
      } else {
        panel.classList.remove("active");
      }
    });

    // Toggle steps visual progress
    steps.forEach(step => {
      const stepNum = parseInt(step.getAttribute("data-step"));
      if (stepNum === stepNumber) {
        step.classList.add("active");
        step.classList.remove("completed");
      } else if (stepNum < stepNumber) {
        step.classList.remove("active");
        step.classList.add("completed");
      } else {
        step.classList.remove("active");
        step.classList.remove("completed");
      }
    });
  }

  // Field validation helper functions
  function validateStep(stepNumber) {
    let isValid = true;

    if (stepNumber === 1) {
      const name = document.getElementById("app-name");
      const dob = document.getElementById("app-dob");
      const age = document.getElementById("app-age");
      const gender = document.getElementById("app-gender");
      const phone = document.getElementById("app-phone");
      const email = document.getElementById("app-email");

      isValid &= validateField(name, name.value.trim().length >= 3);
      isValid &= validateField(dob, dob.value !== "");
      isValid &= validateField(age, age.value && age.value >= 18 && age.value <= 100);
      isValid &= validateField(gender, gender.value !== "");
      isValid &= validateField(phone, /^[0-9]{10}$/.test(phone.value));
      isValid &= validateField(email, /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value));
    }

    if (stepNumber === 2) {
      const address = document.getElementById("app-address");
      const city = document.getElementById("app-city");
      const state = document.getElementById("app-state");
      const occupation = document.getElementById("app-occupation");
      const family = document.getElementById("app-family");
      const houseType = document.getElementById("app-house-type");
      const ownRent = document.getElementById("app-own-rent");

      isValid &= validateField(address, address.value.trim().length > 0);
      isValid &= validateField(city, city.value.trim().length > 0);
      isValid &= validateField(state, state.value.trim().length > 0);
      isValid &= validateField(occupation, occupation.value.trim().length > 0);
      isValid &= validateField(family, family.value && family.value >= 1 && family.value <= 20);
      isValid &= validateField(houseType, houseType.value !== "");
      isValid &= validateField(ownRent, ownRent.value !== "");
    }

    if (stepNumber === 3) {
      const typeSelect = document.getElementById("app-pref-animal");
      const breedInput = document.getElementById("app-pref-breed");
      const ageSelect = document.getElementById("app-pref-age");
      const genderSelect = document.getElementById("app-pref-gender");
      const experience = document.getElementById("app-experience");
      const reason = document.getElementById("app-reason");

      isValid &= validateField(typeSelect, typeSelect.value !== "");
      isValid &= validateField(breedInput, breedInput.value.trim().length > 0);
      isValid &= validateField(ageSelect, ageSelect.value !== "");
      isValid &= validateField(genderSelect, genderSelect.value !== "");
      isValid &= validateField(experience, experience.value !== "");
      isValid &= validateField(reason, reason.value.trim().length >= 15);
    }

    return !!isValid;
  }

  function validateField(inputEl, condition) {
    const group = inputEl.closest(".form-group");
    if (!group) return condition;

    if (condition) {
      group.classList.remove("has-error");
      return true;
    } else {
      group.classList.add("has-error");
      return false;
    }
  }

  // Handle Form Submission
  wizardForm.addEventListener("submit", (e) => {
    e.preventDefault();

    // Validate step 4
    const financial = document.getElementById("app-financial");
    const time = document.getElementById("app-time");
    const emergency = document.getElementById("app-emergency");
    const photo = document.getElementById("app-photo");
    const terms = document.getElementById("app-terms");
    
    let isStep4Valid = true;

    isStep4Valid &= validateField(financial, financial.value !== "");
    isStep4Valid &= validateField(time, time.value.trim().length > 0);
    isStep4Valid &= validateField(emergency, emergency.value.trim().length > 0);
    isStep4Valid &= validateField(photo, photo.files.length > 0);
    
    // Validate checkbox explicitly
    const termsGroup = terms.closest(".terms-checkbox-group");
    if (!terms.checked) {
      termsGroup.classList.add("has-error");
      isStep4Valid &= false;
    } else {
      termsGroup.classList.remove("has-error");
      isStep4Valid &= true;
    }

    if (!isStep4Valid) {
      showToast("Please agree to the terms and upload verification ID.", "error");
      return;
    }

    // Generate custom ID
    const dateYear = new Date().getFullYear();
    const hashId = Date.now().toString().slice(-4);
    const appID = `APP-${dateYear}-${hashId}`;

    const filename = photo.files[0] ? photo.files[0].name : "";
    const newApplication = {
      id: appID,
      name: document.getElementById("app-name").value,
      dob: document.getElementById("app-dob").value,
      age: document.getElementById("app-age").value,
      gender: document.getElementById("app-gender").value,
      phone: document.getElementById("app-phone").value,
      email: document.getElementById("app-email").value,
      address: document.getElementById("app-address").value,
      city: document.getElementById("app-city").value,
      state: document.getElementById("app-state").value,
      occupation: document.getElementById("app-occupation").value,
      family: document.getElementById("app-family").value,
      houseType: document.getElementById("app-house-type").value,
      ownRent: document.getElementById("app-own-rent").value,
      existingPets: document.getElementById("app-existing-pets") ? document.getElementById("app-existing-pets").value : "None",
      experience: document.getElementById("app-experience").value,
      animal: document.getElementById("app-pref-animal").value,
      breed: document.getElementById("app-pref-breed").value,
      prefAge: document.getElementById("app-pref-age").value,
      prefGender: document.getElementById("app-pref-gender").value,
      reason: document.getElementById("app-reason").value,
      financial: document.getElementById("app-financial").value,
      time: document.getElementById("app-time").value,
      emergency: document.getElementById("app-emergency").value,
      notes: document.getElementById("app-notes") ? document.getElementById("app-notes").value : "",
      photo: filename,
      status: "Pending",
      date: new Date().toISOString(),
      notesLog: [],
      timeline: [
        {
          action: "Application Submitted",
          timestamp: new Date().toISOString(),
          details: `Application submitted for a ${document.getElementById("app-pref-gender").value} ${document.getElementById("app-pref-breed").value} by ${document.getElementById("app-name").value}.`
        }
      ]
    };

    // Save to local storage
    let list = JSON.parse(localStorage.getItem("team_prayas_applications")) || [];
    list.unshift(newApplication);
    localStorage.setItem("team_prayas_applications", JSON.stringify(list));

    // Show Success Modal
    wizardModal.classList.remove("active");
    
    let successModal = document.getElementById("success-modal");
    if (!successModal) {
      successModal = document.createElement("div");
      successModal.id = "success-modal";
      successModal.className = "success-modal-overlay";
      document.body.appendChild(successModal);
    }

    successModal.innerHTML = `
      <div class="success-modal-card shadow-large text-center">
        <div class="success-check-wrapper">
          <div class="success-check-circle">
            <i class="fa-solid fa-check check-checkmark"></i>
          </div>
        </div>
        <h2 class="success-title">Application Submitted!</h2>
        <p class="success-desc">Thank you for applying. Your application has been logged under ID <strong id="success-app-id">${appID}</strong> and stored securely. Our team will contact you within 24-48 hours.</p>
        <button class="btn btn-gradient margin-top-medium" id="success-close-btn">Back to Adoption Page</button>
        <div id="confetti-container" class="confetti-container"></div>
      </div>
    `;

    successModal.classList.add("active");
    triggerConfetti();

    // Bind Close Button inside Success modal
    successModal.querySelector("#success-close-btn").addEventListener("click", () => {
      successModal.classList.remove("active");
      document.body.style.overflow = "";
      window.location.reload(); // Refresh listings and forms
    });

    wizardForm.reset();
    fileLabel.textContent = "Choose ID file...";
    fileLabel.style.color = "";
    goToStep(1);

    showToast("Application submitted successfully!", "success");
  });
}

// Confetti pieces falling animation creator
function triggerConfetti() {
  const container = document.getElementById("confetti-container");
  if (!container) return;

  container.innerHTML = "";
  const colors = ["#4CAF50", "#2E7D32", "#FFEB3B", "#FF5722", "#00BCD4", "#E91E63"];

  for (let i = 0; i < 60; i++) {
    const piece = document.createElement("div");
    piece.className = "confetti-piece";
    
    const size = Math.random() * 8 + 6;
    piece.style.width = `${size}px`;
    piece.style.height = `${size}px`;
    piece.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
    piece.style.left = `${Math.random() * 100}%`;
    piece.style.top = `-${Math.random() * 20}px`;
    piece.style.animationDelay = `${Math.random() * 1.5}s`;
    piece.style.animationDuration = `${Math.random() * 2 + 2}s`;
    
    container.appendChild(piece);
  }
}
