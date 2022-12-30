/*Populando os dados locações
var dadosClientes = [
    ["1", "Joao", "51 934394832", "Rua Bla bla bla 934"],
    ["1", "Pedro", "51 934394832", "Rua Bla bla bla 934"],
    ["1", "Raul", "51 934394832", "Rua Bla bla bla 934"],
    ["1", "Fernanda", "51 934394832", "Rua Bla bla bla 934"],
    ["1", "Rokelle", "51 934394832", "Rua Bla bla bla 934"],
    ["1", "Mario", "51 934394832", "Rua Bla bla bla 934"],
    ["1", "Ricardo", "51 934394832", "Rua Bla bla bla 934"],
    ["1", "Joana", "51 934394832", "Rua Bla bla bla 934"]
];

var tbodyLocacoes = document.getElementById("tbodyTabela");
for(var i = 0; i < dadosClientes.length; i++){
    var trlocacoes = "<tr>" +
    "<td class='colunaID'>" + dadosClientes[i][0] + "</td>" +
    "<td class='colunaNome'>" + dadosClientes[i][1] + "</td>" +
    "<td class='colunaTelefone'>" + dadosClientes[i][2] + "</td>" +
    "<td class='colunaEndereco'>" + dadosClientes[i][3] + "</td>" +
    "<td class='colunaDetalhes'><a href='#'>Deletar</a></td>" +
    "</tr>";

    tbodyLocacoes.innerHTML += trlocacoes;
}

Fim da população dos dados locacoes*/

//Validando a criação de um usuario
var password = document.getElementById("password")
var confirm_password = document.getElementById("confirm_password");

function validatePassword(){
  if(password.value != confirm_password.value) {
    confirm_password.setCustomValidity("Senhas diferentes!");
  } else {
    confirm_password.setCustomValidity('');
  }
}

if(password){
  password.onchange = validatePassword;
}

if(confirm_password){
  confirm_password.onkeyup = validatePassword;
}

//Validando a alteração de um usuario
var newPassword = document.getElementById("newPassword")
var confirm_new_password = document.getElementById("confirm_new_password");

function validateNewPassword(){
  if(newPassword.value != confirm_new_password.value) {
    confirm_new_password.setCustomValidity("Senhas diferentes!");
  } else {
    confirm_new_password.setCustomValidity('');
  }
}

newPassword.onchange = validateNewPassword;
confirm_new_password.onkeyup = validateNewPassword;

let buscaFilhosValidos = (itens) => {
    let validos = [];
    for (let i = 0; i < itens.length; i++) {
        if (itens[i].nodeType == 1) {
            validos.push(itens[i]);
        }
    }

    return validos;
}

var tbodyLocacoes = document.getElementById("tbodyTabela");

/*Algoritmo busca Locações*/
document.getElementById("inputBusca").addEventListener("keyup", function (){
    var busca = document.getElementById("inputBusca").value.toLowerCase();

    let filhos = tbodyLocacoes.childNodes;

    let filhosValidos = buscaFilhosValidos(filhos);
  
    for(var i = 0; i < filhosValidos.length; i++){ //Acessa as linhas
        var achou = false;

        var trlocacoes = filhosValidos[i];
        var tdLocacoes = trlocacoes.childNodes;

        let tdlocacoes = buscaFilhosValidos(tdLocacoes);

        for(var j = 0; j < tdlocacoes.length - 1; j++){ //Acessa as colunas
            var value = tdlocacoes[j].childNodes[0].nodeValue.toLowerCase();

            if(value.indexOf(busca) >= 0){
                achou = true;
            }
        }

        if(achou){
            trlocacoes.style.display = "table-row";
        }else{
            trlocacoes.style.display = "none";
        }
    }
});
/*Fim algoritmo de busca Locações*/