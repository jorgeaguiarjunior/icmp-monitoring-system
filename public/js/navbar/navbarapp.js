let iconeNavMenu = document.getElementById("icone-navbar-menu");
let check = document.getElementById("checkbox-navbar");
let logo  = document.getElementById("logo-navbar");
let itensNavbar = document.getElementsByClassName("nome-item-navbar");

check.addEventListener("change", function () {
    if (this.checked) {
        iconeNavMenu.className = "fas fa-times";
        
        for(let i = 0; i < itensNavbar.length; i++){
            itensNavbar[i].style.visibility = "visible";
        }
    }else{
        iconeNavMenu.className = "fas fa-bars";
        
        for(let i = 0; i < itensNavbar.length; i++){
            itensNavbar[i].style.visibility = "hidden";
        }
    }
});