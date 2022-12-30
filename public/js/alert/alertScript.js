let alert = document.getElementById("divAlert");
let button = document.getElementById("buttonEndAlert");

if(alert.className === "alertStatus1"){
    alert.style.display = "inline";
    console.log("Caiu no if")
}else{
    console.log("Não Caiu no if")
}

button.addEventListener("click", () => {
    if(alert.className === "alertStatus1"){
        alert.className = "alertStatus0"
        alert.style.display = "none";
    }
});