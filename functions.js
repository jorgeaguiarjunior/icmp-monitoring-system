const WebSocket = require("ws");
const wss = new WebSocket.Server({ port: 3001 });
const Host = require("./models/pops")
const Log = require("./models/logs")
let allSockets = [];
const ping = require("ping");
const User = require("./models/users");

//Inicio já com um usuario root, que será o usuario master do sistema
let addAdminUser = async () => {
    let user = await User.find();
    if(user.length === 0){
        User.register(new User({ username: "root", email: "", telefone: "", nivel: 3 }), "root", (err, user) => {
            if (err) {
                console.log(err);
            }
        });
    }
}

//Função para organizar os elementos para a rota list (Ajuda na hora de ajeitar na lista)
let findOrdenados = async () => {
    let hosts = await Host.find();
    let vect = []; //Usado para guardar os elementos na ordem correta

    hosts.forEach(host => {
        if (host.parent === null) {
            vect.push(host);
        } else {
            let aux = []; //Usado para organizar
            for (elem of vect) {
                aux.push(elem); //Vou inserindo os elementos no meu vetor auxiliar

                if (elem.id === host.parent) {
                    aux.push(host); //Coloco o novo elemento após o seu pai
                }
            }
            vect = aux; //Substituo a informação do meu vect
        }
    })

    return vect; //Vetor organizado
}

let getDataFormatada = () => {
    let dataAtual = new Date();
    return `${dataAtual.getDate()}/${dataAtual.getMonth() + 1}/${dataAtual.getFullYear()} ${dataAtual.getHours()}:${dataAtual.getMinutes()}:${dataAtual.getSeconds()}`
}


//Pego todos os hosts disponiveis para pingar
let hosts = [];
//Vetor de resultados dos ping a serem enviados para o cliente
let result = [];

//Esse método vai ficar pingando todos os elementos do meu host indefinidamente em um intervalo de tempo
let pingaHosts = async () => {
    setInterval(async () => {
        //Busco todos os elementos do meu host, eu fico buscando toda hora pois os usuarios podem adicionar mais
        hosts = await Host.find();
        //Caso tenha algum objeto cadastrado, eu entro nesse if para então ir no for executar o ping

        if (hosts.length > 0) {
            //Verifico se o resultado tem mais informações do que tem de hosts cadastrados, se tiver
            //Eu verifico quem dos hosts foi excluído e retiro da minha lista de resultados para evitar ping desnecessário
            //Acho que da para fazer com filter, verificar isso depois.
            if (result.length > hosts.length) {
                let newVect = [];
                for (info of result) {
                    for (nodo of hosts) {
                        if (info.host == nodo.ip) {
                            newVect.push(info);
                        }
                    }
                }
                result = newVect;
            }

            //Percorro todos os elementos
            for (host of hosts) {
                //Executo o ping usando o método ping.promise.probe do pacote Ping
                let res = await ping.promise.probe(host.ip, {
                    timeout: 1
                });
                //Arredondo o valor da média ou digo que é um timeout se não tiver um resultado númerico
                let valor;
                if (!isNaN(res.avg)) {
                    valor = Number.parseFloat(res.avg);
                    valor.toFixed();
                } else {
                    valor = "timeout";
                }

                //Crio um objeto que vai guardar os resultados a serem enviados para o navegador
                let obj = {
                    log : null,
                    host: res.host.toString(),
                    avg: valor,
                    estado: 0 //Serve para definir o estado do host, se está online (0), em alerta (> 0 && < 3), ou offline (3)
                    //O alerta é necessário pois as vezes ocorre de perder um pacote, e isso não significa que teve uma queda real
                };

                //Verifico se o vetor é vazio, ou se o elemento ainda não existe no vetor, se passar eu insiro o primeiro elemento
                if (result.length === 0 || !result.find(item => item.host === obj.host)) {
                    if (!res.alive) { //Se estiver morto, o estado já fica em alerta
                        obj.estado = 1;
                    }
                    result.push(obj);
                } else { //Se existir, eu sobreescrevo, para isso eu pego o index de onde o resultado foi inserido
                    //Método para gerar um log e atualizar o objeto "obj"
                    let geraLog = async (type) => {
                        let pop = hosts.find(item => item.ip == result[index].host);
                        let log = new Log();
                        log.nome = pop.nome;
                        log.parent = pop.id;
                        log.host = pop.ip; //Pego o host
                        log.date = getDataFormatada(); //Pego o dia
                        log.evento = type; //Evento 1 que é de queda
                        await log.save();
                        obj.log = log;
                    }

                    let index = await result.findIndex(item => item.host === obj.host);
                    if (!res.alive && result[index].estado < 3) { //Se estiver morto, somo o estado anterior + 1 ao estado atual.
                        obj.estado = result[index].estado + 1;
                        if(obj.estado == 3){
                            await geraLog(1);
                        }
                    } else if (!res.alive && result[index].estado == 3) { //Se for igual a 3, eu mantenho assim
                        obj.estado = result[index].estado;
                    } else if (res.alive && result[index].estado > 0) { //Se voltar a vida, eu subtraio até o 0
                        if(result[index].estado === 3){
                            await geraLog(0);
                        }
                        obj.estado = result[index].estado - 1;
                    }
                    result[index] = obj;
                }
                //res = null;
            }

            //Efetuo o Ping, e depois mando o resultado para todos os hosts.
            for (ws of allSockets) {
                //Caso o hosts tenha algo e o pacote estiver integro, ou seja, apto a ser enviado, eu entro no if
                if (hosts.length > 0 && allSockets.length > 0) { //Caso tenha hosts cadastrados, eu entro no if para testar e enviar
                    //O JSON.stringify serve para enviar um objeto em formato JSON
                    ws.send(JSON.stringify(result));
                    // console.log(result);
                }
            }
        }
    }, 1000);
}

//Função para enviar a mensagem
wss.on("connection", (ws) => {
    console.log("Uma nova conexão foi estabelecida!");
    //Sempre que uma nova conexão começar ele adicionar a conexão no vetor
    //O que devo fazer quando fechar o navegador:
    ws.onclose = () => {
        console.log("Conexão desconectada");
        ws.close();
        allSockets = allSockets.filter(obj => obj !== ws);
    };
    allSockets.push(ws);
});

module.exports.findOrdenados = findOrdenados;
module.exports.pingaHosts = pingaHosts;
module.exports.getDataFormatada = getDataFormatada;
module.exports.addAdminUser = addAdminUser;