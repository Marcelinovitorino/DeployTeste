const express = require("express");
const bcrypt = require("bcrypt")
const UserModel = require("../models/User")
const router = express.Router();

//
const isAuth = (req,res,next)=>{
    if(req.session.isAuth){
        next()

    }else{
        res.redirect("admin/login")
    }
}
// Rota principal do painel administrativo
router.get("/", (req, res) => {
    res.render("admin/index")
});

// Rota do dashboard
router.get("/dashboard",isAuth, (req, res) => {
    res.render("admin/dashboard")
});


//
router.get("/registrar", (req, res) => res.render("admin/registrar"));
router.get("/login", (req, res) => res.render("admin/login"));

router.post("/registrar", async (req, res) => {
    try {
        const { username, email, password } = req.body;

        // Verificar se o usuário já existe
        let user = await UserModel.findOne({ email });
        if (user) {
            return res.redirect("admin/registrar"); 
        }

        // Hash da senha
        const hashpw = await bcrypt.hash(password, 12);

        // Criar novo usuário
        user = new UserModel({
            username,
            email,
            password: hashpw, 
        });

        await user.save(); 
        console.log("Usuário criado com sucesso!");
        res.redirect("/admin/login"); 
    } catch (err) {
        console.error("Erro ao registrar usuário:", err);
        res.status(500).send("Erro no servidor");
    }
});

router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        // Verifica se o usuário existe
        const user = await UserModel.findOne({ email });

        if (!user) {
            console.log("Usuário não encontrado!");
            return res.redirect("admin/login"); // Mantive a barra para garantir o caminho correto
        }

        // Verifica se a senha está correta
        const isMatch = await bcrypt.compare(password, user.password);
        
        if (!isMatch) {
            console.log("Senha incorreta!");
            return res.redirect("admin/login");
        }

        // Login bem-sucedido, pode criar uma sessão/cookie
        req.session.isAuth = true; // Armazena o usuário na sessão (caso esteja usando express-session)
        console.log("Login bem-sucedido!");
        req.session.isAuth = true;
        return res.redirect("dashboard");

    } catch (err) {
        console.error("Erro no login:", err);
        res.status(500).send("Erro interno do servidor!");
    }
});

router.post("/logOut", (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error("Erro ao encerrar sessão:", err);
            return res.status(500).send("Erro ao sair!");
        }
        res.redirect("/admin/login"); // Corrigido o caminho
    });
});




module.exports = router;
