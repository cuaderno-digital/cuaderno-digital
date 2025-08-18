// juegos.js (versión adaptada y fusión exacta con los dos HTML)

// ⬛ Supabase config por usuario
const SUPABASES = {
  // 🔁 Ahora estos tres van con la URL/KEY de GENESIS
  2328: {
    nombre: "CASINO ORO",
    url: "https://wpoutjkljkrbliikazkh.supabase.co",
    key: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indwb3V0amtsamtyYmxpaWthemtoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI5ODAxMjAsImV4cCI6MjA2ODU1NjEyMH0.8aZys2dBiNbLis7ls7ZwiBt25eWbsSvSzjpO21Al2r8"
  },
  2329: {
    nombre: "CASINO CLAU712",
    url: "https://wpoutjkljkrbliikazkh.supabase.co",
    key: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indwb3V0amtsamtyYmxpaWthemtoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI5ODAxMjAsImV4cCI6MjA2ODU1NjEyMH0.8aZys2dBiNbLis7ls7ZwiBt25eWbsSvSzjpO21Al2r8"
  },
  2330: {
    nombre: "CASINO SHELBY",
    url: "https://wpoutjkljkrbliikazkh.supabase.co",
    key: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indwb3V0amtsamtyYmxpaWthemtoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI5ODAxMjAsImV4cCI6MjA2ODU1NjEyMH0.8aZys2dBiNbLis7ls7ZwiBt25eWbsSvSzjpO21Al2r8"
  },

  // 🔁 Ahora GENESIS va con la URL/KEY de los otros tres
  2320: {
    nombre: "CASINO GENESIS",
    url: "https://ueiiyibsnmapzygpmeza.supabase.co",
    key: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVlaWl5aWJzbm1hcHp5Z3BtZXphIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEzODc2NzMsImV4cCI6MjA2Njk2MzY3M30.8yDCfUXBhqeEyFvPL5Pz7W5WWlbK4N25UOEXx4n1hdo"
  },
  2321: {
    nombre: "CASINO PIRATA",
    url: "https://ueiiyibsnmapzygpmeza.supabase.co",
    key: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVlaWl5aWJzbm1hcHp5Z3BtZXphIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEzODc2NzMsImV4cCI6MjA2Njk2MzY3M30.8yDCfUXBhqeEyFvPL5Pz7W5WWlbK4N25UOEXx4n1hdo"
  },
  2322: {
    nombre: "PRÓXIMAMENTE",
    url: "",
    key: ""
  },
  2323: {
    nombre: "PRÓXIMAMENTE",
    url: "",
    key: ""
  },
  2324: {
    nombre: "PRÓXIMAMENTE",
    url: "",
    key: ""
  },
  2325: {
    nombre: "PRÓXIMAMENTE",
    url: "",
    key: ""
  },
  2326: {
    nombre: "CASINO GAUCHITO",
    url: "https://wpoutjkljkrbliikazkh.supabase.co",
    key: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indwb3V0amtsamtyYmxpaWthemtoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI5ODAxMjAsImV4cCI6MjA2ODU1NjEyMH0.8aZys2dBiNbLis7ls7ZwiBt25eWbsSvSzjpO21Al2r8"
  },
  2327: {
    nombre: "CASINO KIAMA",
    url: "https://wpoutjkljkrbliikazkh.supabase.co",
    key: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indwb3V0amtsamtyYmxpaWthemtoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI5ODAxMjAsImV4cCI6MjA2ODU1NjEyMH0.8aZys2dBiNbLis7ls7ZwiBt25eWbsSvSzjpO21Al2r8"
  },

};

const usuario_id = parseInt(localStorage.getItem("usuario_id"));
const config = SUPABASES[usuario_id] ?? { nombre: "PRÓXIMAMENTE", url: "", key: "" };

const client = (config.url && config.key)
  ? window.supabase.createClient(config.url, config.key)
  : null;

// 🔹 Insertar HTML directamente como en el panel original
const html = `
  <h1 style="color: #fff; font-size: 1rem; margin-bottom: 10px; text-align: left;">📖 Panel de Juegos</h1>
  <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap;">
    <div style="display: flex; flex-wrap: wrap; gap: 10px; align-items: center;">
    <button id="btn-recargar-juegos" style="
  width: 34px;
  height: 34px;
  font-size: 18px;
  background-color: gold;
  border: none;
  border-radius: 4px;
  font-weight: bold;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
">🔄</button>
      <input type="text" id="searchInput" placeholder="🔎 Buscar por usuario..." style="width: 220px;">
      <select id="casinoFilter" style="width: 200px;"><option value="">🎲 Todos los Casinos</option></select>
      <select id="juegoFilter" style="width: 200px;"><option value="">🎮 Todos los Juegos</option></select>
      <input type="date" id="dateFilter" style="width: 140px;">
    </div>
    <div style="flex-shrink: 0; margin-top: 5px;">
      <canvas id="graficoPremios" style="max-width: 100%; height: 200px;"></canvas>
    </div>
  </div>
  <div id="resumenGeneral" style="margin: 15px 0; font-size: 1.1rem; color: #ccc;">🔄 Cargando resumen general...</div>
  <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
    <thead><tr>
      <th>Usuario</th><th>Premio</th><th>Fecha</th><th>Hora</th><th>Casino</th>
    </tr></thead>
    <tbody id="resultTable"><tr><td colspan="5">Cargando datos...</td></tr></tbody>
  </table>
`;

const div = document.createElement("div");
div.id = "panel-juegos";
div.style.display = "none";
div.style.padding = "20px";
div.style.border = "none";
div.style.background = "transparent";
div.innerHTML = html;
document.body.appendChild(div);
// 🔄 Botón de recarga manual
document.getElementById("btn-recargar-juegos").addEventListener("click", recargarPanelJuegos);
// 🔺 Botones de solapa
const btnJuegos = document.getElementById("btn-juegos");
if (btnJuegos) {
  btnJuegos.addEventListener("click", () => {
    div.style.display = "block";
    document.getElementById("tabla-registros").style.display = "none";
    document.getElementById("tabla-bonos").style.display = "none";
  });
}
["btn-control", "btn-subir-control", "btn-turno"].forEach(id => {
  const btn = document.getElementById(id);
  if (btn) btn.addEventListener("click", () => div.style.display = "none");
});

// 🔢 Data logic
let registros = [];

async function cargarRegistros() {
  if (!client) {
    document.getElementById("resultTable").innerHTML = `
      <tr><td colspan="5" style="text-align:center; padding:20px;">
        🕹️ <b>¡Próximamente tus juegos estarán disponibles!</b><br>
        <small style="color:#888;">Estamos trabajando para activarlos lo antes posible.</small>
      </td></tr>`;
    document.getElementById("resumenGeneral").innerHTML = "";
    return;
  }

  const { data, error } = await client
    .from('giros')
    .select('*')
    .order('fecha', { ascending: false })
    .order('hora', { ascending: false });

  if (error) {
    console.error("❌ Error al cargar datos de Supabase:", error);
    return;
  }

  const nombreCasino = config.nombre.toUpperCase();
let dataFiltrada = data.filter(reg => {
  const casino = reg.casino?.toUpperCase().trim();
  return casino?.startsWith(nombreCasino); // ← ✅ esto acepta "CASINO ORO - CARTAS"
});
  const usuarioNombre = localStorage.getItem("usuario_nombre")?.toLowerCase();
  if (usuarioNombre) {
    dataFiltrada = dataFiltrada.filter(reg => reg.usuario?.toLowerCase() === usuarioNombre);
  }

  registros = dataFiltrada;

// Solo llenar opciones la primera vez (si están vacías)
if (document.getElementById('casinoFilter').options.length <= 1) {
  llenarOpcionesCasino();
  llenarOpcionesJuego();
}

renderTable();
actualizarGrafico(
  filtrarRegistros() // ⬅️ 🔥 función que vamos a agregar abajo
);
}
function filtrarRegistros() {
  const search = document.getElementById('searchInput').value.toLowerCase();
  const casinoSeleccionado = document.getElementById('casinoFilter').value;
  const juegoSeleccionado = document.getElementById('juegoFilter').value;
  const fechaSeleccionada = document.getElementById('dateFilter').value;

  return registros.filter(reg => {
    const casinoTxt = reg.casino?.toUpperCase().trim() || "";
    const [casinoBase] = casinoTxt.split(" - ");
    reg.casinoNormalizado = casinoBase;
    reg.juegoInferido = casinoTxt.includes("CARTAS") ? "cartas" : "ruleta";

    return (
      (!search || reg.usuario?.toLowerCase().includes(search)) &&
      (!casinoSeleccionado || reg.casinoNormalizado === casinoSeleccionado) &&
      (!juegoSeleccionado || reg.juegoInferido === juegoSeleccionado) &&
      (!fechaSeleccionada || convertirFechaISOArgentina(reg.hora) === fechaSeleccionada)
    );
  });
}
async function recargarPanelJuegos() {
  await cargarRegistros();
  const filtrados = filtrarRegistros();
  actualizarGrafico(filtrados);
}
function convertirAArgentina(horaUTC) {
  const date = new Date(horaUTC);
  return date.toLocaleTimeString("es-AR", {
    timeZone: "America/Argentina/Buenos_Aires",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit"
  });
}

function convertirFechaArgentina(horaUTC) {
  const date = new Date(horaUTC);
  return date.toLocaleDateString("es-AR", {
    timeZone: "America/Argentina/Buenos_Aires",
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  });
}

function convertirFechaISOArgentina(horaUTC) {
  const date = new Date(horaUTC);
  return date.toLocaleDateString("sv-SE", {
    timeZone: "America/Argentina/Buenos_Aires"
  });
}

function renderTable() {
  const search = document.getElementById('searchInput').value.toLowerCase();
  const casinoSeleccionado = document.getElementById('casinoFilter').value;
  const juegoSeleccionado = document.getElementById('juegoFilter').value;
  const fechaSeleccionada = document.getElementById('dateFilter').value;
  const tbody = document.getElementById('resultTable');

  const filtrados = registros.filter(reg => {
    const casinoTxt = reg.casino?.toUpperCase().trim() || "";

// 🔍 Extraer nombre del casino (antes del guion si existe)
const [casinoBase] = casinoTxt.split(" - "); // separa "CASINO ORO – CARTAS"
reg.casinoNormalizado = casinoBase; // por ej: "CASINO ORO"

// 🃏 Detectar tipo de juego
reg.juegoInferido = casinoTxt.includes("CARTAS") ? "cartas" : "ruleta";

    return (
      (!search || reg.usuario?.toLowerCase().includes(search)) &&
      (!casinoSeleccionado || reg.casinoNormalizado === casinoSeleccionado) &&
      (!juegoSeleccionado || reg.juegoInferido === juegoSeleccionado) &&
      (!fechaSeleccionada || convertirFechaISOArgentina(reg.hora) === fechaSeleccionada)
    );
  });

  tbody.innerHTML = filtrados.length
  ? filtrados.map(reg => {
      const horaLocal = convertirAArgentina(reg.hora);
      return `<tr><td>${reg.usuario}</td><td>${reg.premio}</td><td>${convertirFechaArgentina(reg.hora)}</td><td>${horaLocal}</td><td>${reg.casino}</td></tr>`;
    }).join('')
    : `<tr><td colspan="5" style="text-align:center; padding:20px;">
    🕹️ <b>¡Próximamente tus juegos estarán disponibles!</b><br>
    <small style="color:#888;">Estamos trabajando para activarlos lo antes posible.</small>
  </td></tr>`;

  document.getElementById('resumenGeneral').innerHTML = ` Total: <b>${filtrados.length}</b>`;
  
  // ✅ Agregado aquí
  actualizarGrafico(filtrados);
}

function llenarOpcionesCasino() {
  const select = document.getElementById('casinoFilter');
  const valores = [config.nombre]; // 👈 Solo el casino asignado a este usuario
  select.options.length = 1;
  valores.forEach(c => {
    const opt = document.createElement('option');
    opt.value = c;
    opt.textContent = c;
    select.appendChild(opt);
  });
}

function llenarOpcionesJuego() {
  const select = document.getElementById('juegoFilter');
  const juegos = ["cartas", "ruleta"];
  select.options.length = 1;
  juegos.forEach(j => {
    const opt = document.createElement('option');
    opt.value = j;
    opt.textContent = j === 'cartas' ? '🃏 Cartas' : '🌡 Ruleta';
    select.appendChild(opt);
  });
}

function actualizarGrafico(data) {
  const ctx = document.getElementById("graficoPremios").getContext("2d");
  const resumen = {};
  data.forEach(r => {
    const p = r.premio?.toUpperCase().replace(/[^\w\s%]/g, '').trim();
    if (!p) return;
    resumen[p] = (resumen[p] || 0) + 1;
  });
  const chartData = {
    labels: Object.keys(resumen),
    datasets: [{
      label: "Premios",
      data: Object.values(resumen),
      backgroundColor: ["#f39c12", "#e67e22", "#2ecc71", "#9b59b6", "#3498db"]
    }]
  };
  if (window.chartPremios) window.chartPremios.destroy();
  window.chartPremios = new Chart(ctx, {
    type: "bar",
    data: chartData,
    options: {
      plugins: {
        legend: {
          display: false
        }
      }
    }
  });
}

// Eventos
["searchInput", "casinoFilter", "juegoFilter", "dateFilter"].forEach(id => {
  document.getElementById(id).addEventListener("input", renderTable);
});

const hoyArgentina = new Date().toLocaleDateString("sv-SE", {
  timeZone: "America/Argentina/Buenos_Aires"
});
document.getElementById("dateFilter").value = hoyArgentina;
cargarRegistros().then(() => {
  actualizarGrafico(registros); // 👈 Esto lo fuerza apenas carga
});
const mostrarSeccion = (seccion) => {
  const panelJuegos = document.getElementById("panel-juegos");
  const tablaRegistros = document.getElementById("tabla-registros");
  const tablaBonos = document.getElementById("tabla-bonos");

  panelJuegos.style.display = seccion === "juegos" ? "block" : "none";
  tablaRegistros.style.display = seccion === "registros" ? "table" : "none";
  tablaBonos.style.display = seccion === "bonos" ? "table" : "none";
};

document.getElementById("btn-juegos").addEventListener("click", () => mostrarSeccion("juegos"));
document.getElementById("btn-turno").addEventListener("click", () => mostrarSeccion("registros"));
document.getElementById("btn-control").addEventListener("click", () => mostrarSeccion("registros"));
document.getElementById("btn-subir-control").addEventListener("click", () => mostrarSeccion("registros"));
document.getElementById("btn-bono").addEventListener("click", () => mostrarSeccion("bonos"));
// 🔁 Ocultar panel-juegos si se tocan las otras solapas
["btn-control", "btn-subir-control", "btn-turno", "btn-bono", "consultar", "cerrar-sesion"].forEach(id => {
  const boton = document.getElementById(id);
  if (boton) {
    boton.addEventListener("click", () => {
      const panel = document.getElementById("panel-juegos");
      if (panel) panel.style.display = "none";
    });
  }
});

// También aseguramos que al tocar el botón 1 o 2, se oculte el panel-juegos
document.querySelectorAll("#btn-buscar-fecha, #btn-bono, #btn-pendiente, #marcar-gasto, #marcar-st, #modo-eliminar")
  .forEach(el => {
    el?.addEventListener("click", () => {
      const panel = document.getElementById("panel-juegos");
      if (panel) panel.style.display = "none";
    });
  });
  // Hacer disponible la función globalmente para el botón 🔄
window.recargarPanelJuegos = recargarPanelJuegos;
