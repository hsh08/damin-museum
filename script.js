/**
 * 다민박힌물관 — 모바일 메뉴 & 작품 라이트박스
 */

const nav = document.querySelector(".nav");
const navToggle = document.querySelector(".nav__toggle");
const lightbox = document.getElementById("lightbox");
const lightboxImage = document.querySelector(".lightbox__img");
const lightboxCaption = document.querySelector(".lightbox__caption");
const lightboxClose = document.querySelector(".lightbox__close");

// 모바일 햄버거 메뉴
if (navToggle && nav) {
  navToggle.addEventListener("click", () => {
    const isOpen = nav.classList.toggle("is-open");
    navToggle.setAttribute("aria-expanded", String(isOpen));
    navToggle.setAttribute("aria-label", isOpen ? "메뉴 닫기" : "메뉴 열기");
  });

  // 메뉴 링크 클릭 시 닫기
  nav.querySelectorAll(".nav__links a").forEach((link) => {
    link.addEventListener("click", () => {
      nav.classList.remove("is-open");
      navToggle.setAttribute("aria-expanded", "false");
      navToggle.setAttribute("aria-label", "메뉴 열기");
    });
  });
}

// 작품 클릭 → 라이트박스
function openLightbox(imageSrc, imageAlt, captionText) {
  if (!lightbox || !lightboxImage) return;

  lightboxImage.src = imageSrc;
  lightboxImage.alt = imageAlt;
  if (lightboxCaption) {
    lightboxCaption.textContent = captionText;
  }

  if (typeof lightbox.showModal === "function") {
    lightbox.showModal();
  }
}

function closeLightbox() {
  if (!lightbox) return;
  lightbox.close();
  if (lightboxImage) {
    lightboxImage.src = "";
  }
}

document.querySelectorAll(".artwork__trigger").forEach((trigger) => {
  trigger.addEventListener("click", () => {
    const artwork = trigger.closest(".artwork");
    if (!artwork) return;

    const img = artwork.querySelector(".artwork__frame img");
    const title = artwork.querySelector(".artwork__title");
    if (!img) return;

    const caption = title ? title.textContent : img.alt;
    openLightbox(img.src, img.alt, caption);
  });
});

if (lightboxClose) {
  lightboxClose.addEventListener("click", closeLightbox);
}

if (lightbox) {
  lightbox.addEventListener("click", (event) => {
    // 다이얼로그 바깥(백드롭) 클릭 시 닫기
    const rect = lightbox.getBoundingClientRect();
    const clickedOutside =
      event.clientX < rect.left ||
      event.clientX > rect.right ||
      event.clientY < rect.top ||
      event.clientY > rect.bottom;

    if (clickedOutside) {
      closeLightbox();
    }
  });

  lightbox.addEventListener("cancel", () => {
    if (lightboxImage) lightboxImage.src = "";
  });
}
