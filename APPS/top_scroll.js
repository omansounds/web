const toTop = document.querySelector(".to-top");

window.addEventListener("scroll", () => {
    const scrollPosition = window.pageYOffset;
    const windowHeight = window.innerHeight;
    const footer = document.querySelector("footer");
    const footerTop = footer.getBoundingClientRect().top;

    // Show the button if user scrolls more than 100px
    if (scrollPosition > 100) {
        toTop.classList.add("active");
    } else {
        toTop.classList.remove("active");
    }

    // Adjust the button position to avoid it being hidden by the footer
    if (footerTop < windowHeight) {
        // Adjust the button to sit above the footer
        toTop.style.bottom = `${windowHeight - footerTop + 20}px`;
    } else {
        toTop.style.bottom = "32px"; // Default bottom position when not near footer
    }
});
