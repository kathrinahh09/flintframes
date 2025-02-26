document.addEventListener("DOMContentLoaded", () => {
    // Attach click event to each image-link div
    document.querySelectorAll(".image-link").forEach(link => {
        link.addEventListener("click", () => {
            window.location.href = link.getAttribute("data-link");
        });
    });
});