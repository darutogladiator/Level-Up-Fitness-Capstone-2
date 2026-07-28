document.addEventListen("DOMContentLoaded", () => {
    const sidebar = document.querySelector(".sidebar");
    const navigation = sidebar?.querySelector(".dropdown");

    if(!sidebar || !navigation){
        return;
    }

    const button = document.createElement("button");

    button.className = "dropdown-btn mobile-menu-btn";
    button.type = "button";
    button.setAttribute("aria-expanded", "false");
    button.setAttribute("aria-controls", "mainNavigation");
    button.textContent = "Menu";
    
    navigation.id = "mainNavigation";

    sidebar.insertBefore(button, navigation);

    button.addEventListener("click", () => {
        const isOpen = navigation.classList.toggle("menu-open");

        button.setAttribute("aria-expanded", String(isOpen));
        button.textContent = isOpen ? "Close Menu" : "Menu";
    });

    navigation.querySelectorAll("a").forEach((link) => {
        link.addEventListener("click", () => {
            navigation.classList.remove("menu-open");
            button.setAttribute("aria-expanded", "false");
            button.textContent = "Menu";
        });
    });
});