//Esse arquivo serve para eu criar meus schemas e modelos de cada pop

const mongoose = require("mongoose");

//preciso informar ao mongoose quais objetos vou armazenar no banco, 
//para isso vou criar o schema serve para mapear as coleções do mongodb para o javascript

const logCadastrosSchema = new mongoose.Schema({
    //Devo informar qual vai ser o atributo e qual o tipo do dado, posso colocar algumas restrições também:
    userName : {
        type: String,
        required: true
    },
    tipoLog : {
        type: String,
        required: true
    },
    nomePopLog : {
        type: String,
        required: true
    },
    ipLog : {
        type: String,
        required: true
    },
    dataLog : {
        type: String,
        required: true
    }
});

//Após definir o schema, prefico definir o modelo, que vai representar as informações em uma coleção do mongo
//O mongoose vai representar no mongo uma coleção chamada "Hosts", ele coloca no plural e em minusculo
//O modelo tem que ser sempre com a primeira letra em maiusculo, e no singular.
const LogCadastros = mongoose.model("LogCadastro", logCadastrosSchema);

module.exports = LogCadastros;