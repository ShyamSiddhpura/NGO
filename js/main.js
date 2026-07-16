/* ==========================================================================
   TEAM PRAYAS CORE UTILITY & GLOBAL SCRIPTS (js/main.js)
   ========================================================================== */

// --- Global Configuration Constants ---
const APP_CONFIG = {
  ADMIN_USER: "admin_dev",
  ADMIN_PASS: "1234"
};

document.addEventListener("DOMContentLoaded", () => {
  initStickyHeader();
  initMobileNav();
  initScrollAnimations();
  initBackToTop();
  initButtonRipples();
  initGlobalMockData();
});

/* ==========================================================================
   1. STICKY HEADER SCROLL OBSERVER
   ========================================================================== */
function initStickyHeader() {
  const header = document.querySelector(".main-header");
  if (!header) return;

  function toggleHeaderSolid() {
    if (window.scrollY > 20) {
      header.classList.add("scrolled");
    } else {
      header.classList.remove("scrolled");
    }
  }

  window.addEventListener("scroll", toggleHeaderSolid);
  toggleHeaderSolid(); // Run initially in case page is refreshed while scrolled
}

/* ==========================================================================
   2. MOBILE NAV DRAWER ACTIONS
   ========================================================================== */
function initMobileNav() {
  const toggleBtn = document.getElementById("mobile-toggle");
  const closeBtn = document.getElementById("mobile-close");
  const overlay = document.getElementById("mobile-menu-overlay");
  const drawer = document.getElementById("mobile-menu-drawer");
  const mobileLinks = document.querySelectorAll(".mobile-link, .mobile-admin-link");

  if (!toggleBtn) return;

  function openMenu() {
    drawer.classList.add("active");
    overlay.classList.add("active");
    document.body.style.overflow = "hidden"; // Disable background scrolling
  }

  function closeMenu() {
    drawer.classList.remove("active");
    overlay.classList.remove("active");
    document.body.style.overflow = ""; // Re-enable background scrolling
  }

  toggleBtn.addEventListener("click", openMenu);
  closeBtn.addEventListener("click", closeMenu);
  overlay.addEventListener("click", closeMenu);

  mobileLinks.forEach(link => {
    link.addEventListener("click", closeMenu);
  });
}

/* ==========================================================================
   3. VIEWPORT SCROLL REVEAL ANIMATIONS
   ========================================================================== */
function initScrollAnimations() {
  const reveals = document.querySelectorAll(".reveal");
  if (reveals.length === 0) return;

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("active");
        revealObserver.unobserve(entry.target); // Trigger only once
      }
    });
  }, {
    threshold: 0.15,
    rootMargin: "0px 0px -50px 0px"
  });

  reveals.forEach(el => {
    revealObserver.observe(el);
  });
}

/* ==========================================================================
   4. BACK TO TOP BUTTON CONTROL
   ========================================================================== */
function initBackToTop() {
  // Create button dynamically if not exists
  let btn = document.getElementById("back-to-top-btn");
  if (!btn) {
    btn = document.createElement("button");
    btn.id = "back-to-top-btn";
    btn.className = "back-to-top";
    btn.setAttribute("aria-label", "Back to top");
    btn.innerHTML = `<i class="fa-solid fa-arrow-up"></i>`;
    document.body.appendChild(btn);
  }

  window.addEventListener("scroll", () => {
    if (window.scrollY > 300) {
      btn.classList.add("visible");
    } else {
      btn.classList.remove("visible");
    }
  });

  btn.addEventListener("click", () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  });
}

/* ==========================================================================
   5. BUTTON CLICK RIPPLE EFFECTS
   ========================================================================== */
function initButtonRipples() {
  const buttons = document.querySelectorAll(".btn, .ripple");
  
  buttons.forEach(button => {
    button.addEventListener("click", function(e) {
      // Create ripple span element
      const ripple = document.createElement("span");
      ripple.className = "ripple-effect";
      
      // Calculate coordinates relative to parent
      const rect = this.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      ripple.style.left = `${x}px`;
      ripple.style.top = `${y}px`;
      
      // Append and remove after animation ends
      this.appendChild(ripple);
      setTimeout(() => {
        ripple.remove();
      }, 600);
    });
  });
}

/* ==========================================================================
   6. GLOBAL TOAST MANAGER
   ========================================================================== */
function showToast(message, type = "success") {
  let container = document.getElementById("toast-container");
  if (!container) {
    container = document.createElement("div");
    container.id = "toast-container";
    container.className = "toast-container";
    document.body.appendChild(container);
  }

  const toast = document.createElement("div");
  toast.className = `toast toast-${type}`;
  
  let iconClass = "fa-solid fa-circle-check";
  if (type === "warning") iconClass = "fa-solid fa-circle-exclamation";
  if (type === "error") iconClass = "fa-solid fa-circle-xmark";

  toast.innerHTML = `
    <i class="${iconClass} toast-icon"></i>
    <span class="toast-message">${message}</span>
    <button class="toast-close"><i class="fa-solid fa-xmark"></i></button>
  `;

  // Bind close action
  toast.querySelector(".toast-close").addEventListener("click", () => {
    removeToast(toast);
  });

  container.appendChild(toast);

  // Auto remove toast after 4s
  setTimeout(() => {
    removeToast(toast);
  }, 4000);
}

function removeToast(toast) {
  toast.style.opacity = "0";
  toast.style.transform = "translateX(50px) scale(0.9)";
  toast.addEventListener("transitionend", () => {
    toast.remove();
  });
}

/* ==========================================================================
   7. INITIAL MOCK DATABASE SEEDING
   ========================================================================== */
function initGlobalMockData() {
  // If applications do not exist, write seed mock database for demonstration
  if (!localStorage.getItem("team_prayas_applications")) {
    const mockApps = [
      {
        id: "APP-2026-9812",
        name: "Abhinav Mishra",
        dob: "1998-05-15",
        age: "28",
        gender: "Male",
        phone: "9812345670",
        email: "abhinav.m@example.com",
        address: "Apartment 4B, Emerald Heights",
        city: "Surat",
        state: "Gujarat",
        occupation: "Chartered Accountant",
        family: "3",
        houseType: "Apartment",
        ownRent: "Own",
        existingPets: "None",
        experience: "Have owned pets before",
        animal: "Rocky",
        breed: "Golden Retriever",
        prefAge: "Young (1-3 yrs)",
        prefGender: "Male",
        reason: "We recently lost our elder labrador dog to old age. Our family feels empty without an animal, and we are ready to open our farmhouse to beautiful Rocky.",
        financial: "Ready",
        time: "Fully Available",
        emergency: "Father (+91 9999911111)",
        notes: "No other pets currently.",
        photo: "id_proof_card.jpg",
        status: "Approved",
        date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        notesLog: [
          {
            id: "note-1",
            text: "Home check completed. Spacious double bedroom apartment with pet safety nets installed on balconies. Family is highly experienced.",
            author: "admin_dev",
            timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString()
          }
        ],
        timeline: [
          { action: "Application Submitted", timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), details: "Logged via online website" },
          { action: "Status Changed", timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(), details: "Status updated to Under Review by admin" },
          { action: "Note Added", timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(), details: "Note: 'Home check completed...'" },
          { action: "Status Changed", timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), details: "Status updated to Approved by admin" }
        ]
      },
      {
        id: "APP-2026-3841",
        name: "Ritika Sharma",
        dob: "2002-11-20",
        age: "24",
        gender: "Female",
        phone: "9825199999",
        email: "ritika.sharma@example.com",
        address: "Green Villa, Lane 2, Dumas Road",
        city: "Surat",
        state: "Gujarat",
        occupation: "Graphic Designer",
        family: "4",
        houseType: "Independent House",
        ownRent: "Own",
        existingPets: "1 Cat",
        experience: "First-time owner",
        animal: "Luna",
        breed: "Persian Mix",
        prefAge: "Kitten (<1 yr)",
        prefGender: "Female",
        reason: "I have always adored cats and finally live in a spacious house with my parents. I want a quiet kitten companion and will keep her indoor-only.",
        financial: "Ready",
        time: "Partially Available",
        emergency: "Mother (+91 9825122222)",
        notes: "Cat is vaccinated.",
        photo: "electricity_bill.jpg",
        status: "Pending",
        date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        notesLog: [],
        timeline: [
          { action: "Application Submitted", timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), details: "Logged via online website" }
        ]
      },
      {
        id: "APP-2026-4421",
        name: "Priyesh Patel",
        dob: "1995-03-10",
        age: "31",
        gender: "Male",
        phone: "9879011111",
        email: "priyesh.patel@example.com",
        address: "H.No 120, Dumas Road Opp Airport",
        city: "Surat",
        state: "Gujarat",
        occupation: "Fitness Trainer",
        family: "1",
        houseType: "Independent House",
        ownRent: "Rent",
        existingPets: "None",
        experience: "Currently own pets",
        animal: "Bella",
        breed: "Indie Breed",
        prefAge: "Puppy (<1 yr)",
        prefGender: "Female",
        reason: "I already have a friendly 2 year old beagle dog and want to adopt a companion puppy for him. They will stay together at my fitness studio during days.",
        financial: "Ready",
        time: "Fully Available",
        emergency: "Friend (+91 9879022222)",
        notes: "Landlord has approved.",
        photo: "id_proof.jpg",
        status: "Under Review",
        date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        notesLog: [
          {
            id: "note-1",
            text: "Need to verify rented room agreement rules on pets. Priyesh claims his landlord is pet friendly but we require a written NOC.",
            author: "admin_dev",
            timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
          }
        ],
        timeline: [
          { action: "Application Submitted", timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), details: "Logged via online website" },
          { action: "Status Changed", timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), details: "Status updated to Under Review by admin" },
          { action: "Note Added", timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), details: "Note: 'Need to verify rented room agreement...'" }
        ]
      },
      {
        id: "APP-2026-1102",
        name: "Sonia Shah",
        dob: "2006-08-05",
        age: "20",
        gender: "Female",
        phone: "7654321098",
        email: "sonia.shah@example.com",
        address: "Girls Hostel, Block 1",
        city: "Surat",
        state: "Gujarat",
        occupation: "College Student",
        family: "4",
        houseType: "Apartment",
        ownRent: "Rent",
        existingPets: "None",
        experience: "First-time owner",
        animal: "Milo",
        breed: "Domestic Shorthair",
        prefAge: "Adult (>3 yrs)",
        prefGender: "Male",
        reason: "I live in a hostel flat with roommates and we love cats. We want to adopt Milo to keep in our dorm room for cuddling and de-stressing from exams.",
        financial: "Ready",
        time: "Fully Available",
        emergency: "Roommate (+91 7654321111)",
        notes: "Hostel Warden rules unclear.",
        photo: "college_id.jpg",
        status: "Rejected",
        date: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
        notesLog: [
          {
            id: "note-1",
            text: "Hostel flat rules strictly forbid dogs and cats. College administration confirmed students are not authorized to house pets. Highly unstable environment.",
            author: "admin_dev",
            timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
          }
        ],
        timeline: [
          { action: "Application Submitted", timestamp: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(), details: "Logged via online website" },
          { action: "Status Changed", timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), details: "Status updated to Under Review by admin" },
          { action: "Note Added", timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), details: "Note: 'Hostel flat rules strictly forbid...'" },
          { action: "Status Changed", timestamp: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(), details: "Status updated to Rejected by admin" }
        ]
      }
    ];

    localStorage.setItem("team_prayas_applications", JSON.stringify(mockApps));
  }

  // Seeding admin settings if empty
  if (!localStorage.getItem("team_prayas_admin")) {
    localStorage.setItem("team_prayas_admin", JSON.stringify({
      username: APP_CONFIG.ADMIN_USER,
      password: APP_CONFIG.ADMIN_PASS
    }));
  }
}
