const express = require("express");
const expressSession = require("express-session");
const app = express();
const path = require("path");
const methodOverride = require("method-override");
const mongoose = require('mongoose');
const passport = require("passport");
const localStrategy = require("passport-local");
const Host = require("./models/pops");
const Log = require("./models/logs");
const LogCadastros = require("./models/logcadastros");
const User = require("./models/users");
// const res = require("express/lib/response");
const functions = require("./functions");

mongoose.connect('mongodb://127.0.0.1:27017/dbPops', { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => { //o then e o catch não são obrigatorios, é necessário apenas para mostrar o erro para o usuario
        console.log("Conectado no banco com sucesso.");
    }).catch(err => {
        console.log("Erro ao conectar no banco");
        console.log(err);
    });

app.use(express.static(path.join(__dirname, "public")));

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));

// Necessário para autenticação
app.use(passport.initialize());

// Isso é  necessário para fazer o expresssession funcionar
app.use(expressSession({
    secret: "meu_segredo...",
    resave: false,
    saveUninitiaded: false
}));

app.use(passport.session());
passport.use(new localStrategy(User.authenticate()));

// serializar e desserializar seria transformar o objeto usuario em texto.
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// Para definir se o usuario está logado
const isLoggedIn = (req, res, next) => {
    if (req.isAuthenticated()) {
        return next()
    }
    res.redirect("/");
}

app.get("/", (req, res) => {
    res.render("login/login");
});

app.post('/login', passport.authenticate("local", { failureRedirect: '/' }),
    (req, res) => {
        res.redirect('/home');
    });

app.get("/logout", (req, res) => {
    req.logout(() => {
        console.log("Deslogado");
    });
    res.redirect("/");
});

app.post("/register", (req, res) => {
    User.register(new User({ username: req.body.username, email: req.body.email, nivel: req.body.nivel, telefone: req.body.telefone }), req.body.password, async (err, user) => {
        if (err) {
            let textError = "Usuario já existente, escolha outro nome";
            // Necessário para lançar o erro
            let myUsers = await User.find();
            let actualUser = await User.findById(req.user.id);
            let statusErro = 1;
            // Necessário para lançar o erro
            res.render("configuracoes/configuracoes", {myUsers, actualUser, statusErro, textError});
        } else {
            res.redirect("/configuracoes");
        }
    })
});

/*Rota Index home*/
app.get("/home", isLoggedIn, async (req, res) => {
    // console.log(req.user.id);

    //Busco os elementos no banco
    const hosts = await functions.findOrdenados(req.user.id);
    const logCadastros = await LogCadastros.find();
    let quantidade = hosts.length;
    res.render("home/home", { hosts, quantidade, logCadastros });
});

/*Rota Index listHost*/
app.get("/list", isLoggedIn, async (req, res) => {
    //Busco os elementos no banco
    const hosts = await functions.findOrdenados();
    let quantidade = hosts.length;
    const logs = await Log.find();

    if(req.user.nivel >= 2){
        res.render("listHost/listHost", { hosts, quantidade, logs });
    }else{
        res.render("listHost/limitedListHost", { hosts, quantidade, logs });
    }
});

/*Rota Show listHost*/
app.get("/detalhe/:id", isLoggedIn, async (req, res) => {
    const { id } = req.params;
    let host = await Host.findById(id);

    let filhos = await Host.find({ parent: host._id })

    let logs = await Log.find({ nome: host.nome });

    res.render("listHost/detalhe", { host, filhos, logs });
});

/*Rota new listHost*/
app.get("/list/new", isLoggedIn, (req, res) => {
    let statusErro = 0;
    // let textError = "";
    // res.render("listHost/new", {statusErro, textError});
    res.render("listHost/new", {statusErro});
});

/*Rota create listHost*/
app.post("/list", isLoggedIn, async (req, res) => {
    const host = new Host(req.body);
    host.parent = null;
    host.children = [];
    host.ancestors = [];


    let hosts = await Host.find();
    let search = hosts.find(item => (item.ip === host.ip) || (item.nome === host.nome));
    
    if(typeof search === "undefined"){
        await host.save();

        let logCadastro = new LogCadastros();
        logCadastro.userName = req.user.username;
        logCadastro.tipoLog = "Cadastrou";
        logCadastro.nomePopLog = host.nome;
        logCadastro.ipLog = host.ip;
        logCadastro.dataLog = await functions.getDataFormatada();
        await logCadastro.save();
        res.redirect("/list");
    }else{
        let statusErro = 1;
        let textError = "Conexão já cadastrada, entre com outros dados."
        res.render("listHost/new", {statusErro, textError});
    }
});

/*Rota edit listHost*/
app.get("/detalhe/:id/edit", isLoggedIn, async (req, res) => {
    const { id } = req.params;
    let statusErro = 0;
    let host = await Host.findById(id);
    res.render("listHost/edit", { host, statusErro });
});

/*Rota update listHost*/
app.put("/detalhe/:id", isLoggedIn, async (req, res) => {
    const { id } = req.params;

    let dados = {ip, nome} = req.body;
    let host = await Host.findById(id);
    let hosts = await Host.find();
    let search = hosts.find(item => (((item.ip === dados.ip) || (item.nome === dados.nome)) && item.id !== host.id));
    if((typeof search === "undefined")){
        await Host.findByIdAndUpdate(id, req.body, { runValidators: true });

        res.redirect("/detalhe/" + id);
    }else{
        let statusErro = 1;
        let textError = "Conexão já cadastrada, entre com outros dados."
        res.render("listHost/edit", { host, statusErro, textError });
    }
});

/*Rota Destroy listHost*/
app.delete("/detalhe/:id", isLoggedIn, async (req, res) => {
    const { id } = req.params;

    let deletado = await Host.findById(id); //busco o elemento
    if (deletado.parent != null) {
        let pai = await Host.findById(deletado.parent); //Busco o pai dele
        pai.children = pai.children.filter(item => item != id); //Filtro os filhos do pai
        await Host.findByIdAndUpdate(pai.id, pai); //Atualizo o pai no banco
    }
    await Host.findByIdAndDelete(id); //Deleto o item
    await Host.deleteMany({ ancestors: id }); //Deleto todos os seus filhos

    let logCadastro = new LogCadastros();
    logCadastro.userName = req.user.username;
    logCadastro.tipoLog = "Deletou";
    logCadastro.nomePopLog = host.nome;
    logCadastro.ipLog = host.ip;
    logCadastro.dataLog = await functions.getDataFormatada();
    await logCadastro.save();

    res.redirect("/list");
});

/*Rota Destroy Logs listHost (Limpar todos os logs da lista)*/
app.delete("/list/clear", isLoggedIn, async (req, res) => {

    await Log.deleteMany(); //Deleto todos os logs

    res.redirect("/list");

});

/*Rota Destroy Logs Detalhe (Limpar apenas os Logs do item selecionado)*/
app.delete("/detalhe/:id/clear", isLoggedIn, async (req, res) => {
    const { id } = req.params;
    let pop = Host.findById(id);
    await Log.deleteMany({ parent: id }); //Deleto todos os logs

    res.redirect("/detalhe/" + id);
});

/*Rota new listHost (adiciona filho)
OBS: Nessa rota eu precisei adicionar o :idPai pois para adicionar um filho eu preciso saber quem é o pai*/
app.get("/list/add/:idPai", isLoggedIn, async (req, res) => {
    const { idPai } = req.params;
    let statusErro = 0;
    const pai = await Host.findById(idPai);

    res.render("listHost/add", { pai, statusErro });
});

/*Rota create listHost (adiciona filho)
OBS: Nessa rota precisei adicionar o /add para diferenciar da rota create do pai*/
app.post("/list/add", isLoggedIn, async (req, res) => {
    const { idPai } = req.body;
    const host = new Host({ nome, ip } = req.body);
    host.parent = idPai; //Informo quem é seu pai
    let pai = await Host.findById(idPai); //Localizo o seu pai
    host.ancestors = pai.ancestors.concat(pai.id); //Digo que os ancestrais são os ancestrais do pai + o pai
    let hosts = await Host.find();
    let search = hosts.find(item => (item.ip === host.ip) || (item.nome === host.nome));

    // Validação
    if(typeof search === "undefined"){
        await host.save(); //Salvo no banco
        await Host.findByIdAndUpdate(idPai, { $push: { children: host.id } }); //Altero os filhos do pai

        let logCadastro = new LogCadastros();
        logCadastro.userName = req.user.username;
        logCadastro.tipoLog = "Cadastrou";
        logCadastro.nomePopLog = host.nome;
        logCadastro.ipLog = host.ip;
        logCadastro.dataLog = await functions.getDataFormatada();
        await logCadastro.save();
        res.redirect("/detalhe/" + idPai);
    }else{
        let statusErro = 1;
        let textError = "Conexão já cadastrada, entre com outros dados."
        res.render("listHost/add", {pai, statusErro, textError});
    }
});

/*Rota Index configurações*/
app.get("/configuracoes", isLoggedIn, async (req, res) => {
    let myUsers = await User.find();
    // let textError = ""
    let actualUser = await User.findById(req.user.id);
    let statusErro = 0;
    // console.log(actualUser)
    if(req.user.nivel === 3){
        // res.render("configuracoes/configuracoes", {myUsers, actualUser, statusErro, textError});
        res.render("configuracoes/configuracoes", {myUsers, actualUser, statusErro});
    }else{
        // res.render("configuracoes/limitedConfiguracoes", {myUsers, actualUser, statusErro, textError});
        res.render("configuracoes/limitedConfiguracoes", {myUsers, actualUser, statusErro});
    }
})

/*Rota update user*/
app.put("/configuracoes/:id", async (req, res) => {
    let {id} = req.params;
    let user = await User.findById(id);
    let textError = "Senha antiga incorreta, tente novamente";

    // Necessário para lançar o erro
    let myUsers = await User.find();
    let actualUser = await User.findById(req.user.id);
    let statusErro = 1;
    // Necessário para lançar o erro

    if(req.body.novoEmail.length > 0){
        user.email = req.body.novoEmail;
    }

    if(req.body.novoTelefone.length > 0){
        user.telefone = req.body.novoTelefone;
    }

    if(req.body.newPassword.length > 0){
        user.changePassword(req.body.oldPassword, req.body.newPassword, async (err) => {
            if(err){
                res.render("configuracoes/configuracoes", {myUsers, actualUser, statusErro, textError});
            }else{
                user.save();
                res.redirect("/configuracoes");
            }
        });
    }else{
        user.save();
        res.redirect("/configuracoes");
    }
})

/*Rota Destroy Users (Acessado apenas pelo master)*/
app.delete("/user/:id", isLoggedIn, async (req, res) => {
    const { id } = req.params;

    await User.findByIdAndDelete( id ); 

    res.redirect("/configuracoes")
});

app.listen(3000, () => {
    console.log("Escutando na porta 3000");
});

functions.addAdminUser();

functions.pingaHosts();