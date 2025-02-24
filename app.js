const express = require("express");
const { engine } = require("express-handlebars");
const mongoose = require("mongoose")
const session = require("express-session")
const mongodbSession = require("connect-mongodb-session")(session)
const admin = require("./routes/admin");
const UserModel = require("./models/User")

const app = express();

// Configurações
// Handlebars
app.engine("handlebars", engine());
app.set("view engine", "handlebars");
app.set("views", "./views");

const mongoUri ="mongodb://localhost:27017/autenticacao"

//conexao com o banco
mongoose.connect(mongoUri).then(()=>{
    console.log("Conexao realizada com sucesso!")
}).catch((err)=>{
    console.log("Falha ao se conectar ao mongo!")
})

//conexao mongodb session
const store = new mongodbSession({
    uri: mongoUri,
    collection: "mysessions"
});

store.on("error", (error) => {
    console.error("Erro no armazenamento de sessões:", error);
});


//Configuracao de midlewere de sessao
app.use(session({
    secret: "meu segredo",
    resave: false,
    saveUninitialized: false,
    store: store, // Verifique que a store está corretamente definida
    cookie: {
        maxAge: 1000 * 60 * 60 * 24, // 1 dia
        httpOnly: true,
        secure: false // Mude para true em produção com HTTPS
    }
}));
//


//
app.use(express.json()); // Para interpretar JSON no corpo da requisição
app.use(express.urlencoded({ extended: true })); // Para interpretar dados de formulários





// Rotas
app.get("/", (req, res) => {
    res.render("home");
});

// Rotas de Admin
app.use("/admin", admin);

// Outros
const PORT = 9000;
app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});
