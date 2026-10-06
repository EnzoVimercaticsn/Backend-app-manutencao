import { api } from '../services/api.js';

const inpmatric = document.getElementById('Login');
const password = document.getElementById('Senha');
const BtnLogin = document.getElementById('BtnLogin');

async function getFornecedorCodfor(usu_matricula) {
    try {
        const response = await api.post('/usuarios/login', {
            matricula: usu_matricula,
            senha: password.value
        });
        if (response.data) {
            Swal.fire({
                title: "Login bem-sucedido!",
                icon: "success",
                draggable: true
            });
            localStorage.setItem("login", JSON.stringify(response.data));
            window.location.href = "/src/html/home.html";
        }
    } catch (error) {
        swalCustom.fire({
            icon: "question",
            title: "Oops...",
            text: error.response?.data?.error || "Matrícula ou senha inválida!",
        });
    }
}

BtnLogin.addEventListener('click', async (event) => {
    event.preventDefault();

    const cod = inpmatric.value.trim().toLowerCase();
    const senha = password.value;

    console.log('Matrícula enviada:', cod);
    console.log('Senha digitada:', senha);

    await getFornecedorCodfor(cod);
});

document.querySelectorAll("a").forEach(link => {

    link.addEventListener("click", function (e) {

        const destino = this.href;

        if (!destino || destino.includes("#")) return;

        e.preventDefault();

        document.body.classList.add("fade-out");

        setTimeout(() => {
            window.location.href = destino;
        }, 400);
    });

});