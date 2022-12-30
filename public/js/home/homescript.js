let itens = document.getElementsByClassName("grid-item-connections");

// let buscaFilhosValidos = (itens) => {
//     //Pego todos os filhos validos, ou seja, ignoro todos os #text, e salvo no array filhosValidos
//     let filhos = itens.childNodes;
//     let filhosValidos = [];
//     for (let i = 0; i < filhos.length; i++) {
//         if (filhos[i].nodeType == 1) {
//             filhosValidos.push(filhos[i]);
//         }
//     }

//     return filhosValidos;
// }

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
    // console.log(dados)
    //Percorro todos os itens da minha lista
    
    //Só entrará no for se tiver algum item cadastrado
    if(itens.length > 0){
        for(let index = 0; index < itens.length; index++){ //Acessa as linhas
            //Busco seus filhos validos para que eu possa trabalhar neles.
            // let filhosValidos = buscaFilhosValidos(itens[i]);
            // let index = dados.findIndex(obj => obj.host.toString() == filhosValidos[2].textContent);
            // console.log(itens);
            //Verifico o estado do host e mudo a cor dele de acordo com o estado atual.
            console.log(dados[index])
            if(dados[index].estado == 0){
                itens[index].className = "grid-item-connections item-online";
            }else if(dados[index].estado > 0 && dados[index].estado < 3){
                itens[index].className = "grid-item-connections item-alert";
            }else{
                itens[index].className = "grid-item-connections item-offline";
            }
            // //O alerta vai se dar caso um dos filhos esteja offline
            // if(dados[index].log != null){
            //     console.log("Caiu no if")
            //     function adicionar() {
            //         let lista  = document.getElementById("listaLogs").innerHTML;
            //         lista = lista + "<li>" + dados[index].log.date  + " Serviço "  + dados[index].log.nome  + " com IP " + dados[index].log.host  + " se " + (dados[index].log.evento == 1 ? "desconectou" : "reconectou") + "</li>"
            //         document.getElementById("listaLogs").innerHTML = lista;
            //     }
            //     adicionar();
            // }
        }
        //Vou verificar quantos tem online e offline, os em alert eu ignoro
            let qtdOffline = 0;

            for(dado of dados){ //Percorro meu vetor de dados verificando quantos estão com estado 5 (offline)
                if(dado.estado === 3){
                    qtdOffline++;
                }
            }
            //Altero o conteudo dos meus informativos
            let conOnline = document.getElementById("status-online-number");
            let totalCon = document.getElementById("total-amount-number");
            if(qtdOffline === 0){
                conOnline.textContent = totalCon.textContent;
            }else{
                conOnline.textContent = totalCon.textContent - qtdOffline;
            }

            let conOffline = document.getElementById("status-offline-number");
            conOffline.textContent = qtdOffline;
    }
}