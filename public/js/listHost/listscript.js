let checkboxs = document.getElementsByClassName("checkExpande");
let icones = document.getElementsByClassName("iconeLista");
let itens = document.getElementsByClassName("itemListHost");

let buscaFilhosValidos = (itens) => {
    //Pego todos os filhos validos, ou seja, ignoro todos os #text, e salvo no array filhosValidos
    let filhos = itens.childNodes;
    let filhosValidos = [];
    for (let i = 0; i < filhos.length; i++) {
        if (filhos[i].nodeType == 1) {
            filhosValidos.push(filhos[i]);
        }
    }

    return filhosValidos;
}
for (let i = 0; i < icones.length; i++) {

    let filhosValidos = buscaFilhosValidos(itens[i]);

    //Verifico se a quantidade de filhos ultrapassa o limite, ou seja, se ultrapassar então existe um "ul" dentro do "li"
    if (filhosValidos.length > 6) { //Quantidade total de itens que estão em cada li, esse valor é variavel dependendo do que eu adicionar a mais
        icones[i].className = "fas fa-angle-right iconeLista iconExpande"
    } else {
        icones[i].className = "fas fa-genderless iconeLista iconNone"
    }

    //Adiciono o evento de click em todos os icones expansiveis, ativando o checkbox e mudando o icone do respectivo item.
    if(icones[i].className.includes("iconExpande")){
        icones[i].addEventListener("click", function () {
            if (checkboxs[i].checked) {
                checkboxs[i].checked = false;
                icones[i].className = "fas fa-angle-right iconeLista iconExpande"
                
            } else{
                checkboxs[i].checked = true;
                icones[i].className = "fas fa-angle-down iconeLista iconExpande"
            }
        });
    }
}


/*Algoritmo busca*/
document.getElementById("inputbusca").addEventListener("keyup", function (){
    let busca = document.getElementById("inputbusca").value.toLowerCase();

    for(let i = 0; i < itens.length; i++){ //Acessa as linhas

        let filhosValidos = buscaFilhosValidos(itens[i]);

        let achou = false;

        for(let j = 1; j < filhosValidos.length; j++){ //Acessa as colunas
            let value = filhosValidos[j].textContent.toLowerCase();

            if(value.includes(busca)){
                achou = true;
            }
        }

        if(achou){
            itens[i].style.display = "block";
        }else{
            itens[i].style.display = "none";
        }
    }
});
/*Fim algoritmo de busca*/

/*Algoritmo WebSocket*/
    var ws  = new WebSocket("ws://localhost:3001");
    //Posso alterar esse localhost por um ip para ele encontrar o servidor websocket
    //var ws  = new WebSocket("ws://100.64.19.67:3001");
    
    //Função que diz o que acontece quando abre o socket
    ws.onopen = function() {
        console.log("Conectei!")
    }
    
    //Função que diz o que acontece quando recebe uma mensagem
    ws.onmessage = function(msg) {
        //Transformo o meu arquivo JSON em um array de objetos javascript usando o JSON.parse
        let dados = JSON.parse(msg.data);
        console.log(dados)
        //Percorro todos os itens da minha lista
        
        //Só entrará no for se tiver algum item cadastrado
        if(itens.length > 0){
            for(let i = 0; i < itens.length; i++){ //Acessa as linhas
                //Busco seus filhos validos para que eu possa trabalhar neles.
                let filhosValidos = buscaFilhosValidos(itens[i]);
                let index = dados.findIndex(obj => obj.host.toString() == filhosValidos[2].textContent);
                
                if(dados[index].avg === "timeout"){
                    filhosValidos[3].textContent = dados[index].avg;
                }else{
                    filhosValidos[3].textContent = dados[index].avg + "ms";
                }
    
                //Verifico o estado do host e mudo a cor dele de acordo com o estado atual.
                if(dados[index].estado == 0){
                    itens[i].className = "hostOn itemListHost";
                }else if(dados[index].estado > 0 && dados[index].estado < 3){
                    itens[i].className = "hostAlert itemListHost";
                }else{
                    itens[i].className = "hostOff itemListHost";
                }
                //O alerta vai se dar caso um dos filhos esteja offline
                if(dados[index].log != null){
                    console.log("Caiu no if")
                    function adicionar() {
                        let lista  = document.getElementById("listaLogs").innerHTML;
                        lista = lista + "<li>" + dados[index].log.date  + " Serviço "  + dados[index].log.nome  + " com IP " + dados[index].log.host  + " se " + (dados[index].log.evento == 1 ? "desconectou" : "reconectou") + "</li>"
                        document.getElementById("listaLogs").innerHTML = lista;
                    }
                    adicionar();
                }
            }
            //Vou verificar quantos tem online e offline, os em alert eu ignoro
                let qtdOffline = 0;

                for(dado of dados){ //Percorro meu vetor de dados verificando quantos estão com estado 5 (offline)
                    if(dado.estado === 3){
                        qtdOffline++;
                    }
                }
                //Altero o conteudo dos meus informativos
                let conOnline = document.getElementById("conexoesOnline");
                let totalCon = document.getElementById("totalConexoes");
                if(qtdOffline === 0){
                    conOnline.textContent = totalCon.textContent;
                }else{
                    conOnline.textContent = totalCon.textContent - qtdOffline;
                }

                let conOffline = document.getElementById("conexoesOffline");
                conOffline.textContent = qtdOffline;
        }
    }
    //error
    //close
/*Fim Algoritmo WebSocket*/