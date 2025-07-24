const form = document.querySelector("form");
const inputUsuario = document.getElementById("usuario");
const inputClave = document.getElementById("clave");

const usuariosValidos = {
  "2320": "23200",
  "2321": "23211",
  "2322": "23222",
  "2323": "23233",
  "2324": "23244",
  "2325": "23255",
  "2326": "23266",
  "2327": "23277",
  "2328": "23288",
  "2329": "23299",
  "2330": "23300"
};

form.addEventListener("submit", (e) => {
  e.preventDefault();

  const usuario = inputUsuario.value.trim();
  const clave = inputClave.value.trim();

  if (usuariosValidos[usuario] === clave) {
    localStorage.setItem("usuario_id", usuario);
    window.location.href = "index.html";
  } else {
    alert("Usuario o contraseña incorrectos.");
  }
});