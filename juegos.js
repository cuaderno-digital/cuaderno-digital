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

// === Zona y helpers de fecha/hora (solo panel) ===
const TZ_AR = "America/Argentina/Buenos_Aires";

// Devuelve un Date válido o null según reglas:
// - ISO con Z u offset  -> usar directo
// - "YYYY-MM-DD HH:mm[:ss[.mmm]]" (sin TZ) -> tratar como UTC
// - Pirata/Genesis: fecha (date) + hora "HH:mm[:ss]" -> construir AR (-03:00)
function parseRegistroFecha(reg) {
  // Normalizo valores “vacíos” (—, -, null, "", etc.)
  let h = reg?.hora;
  let f = reg?.fecha; // algunas tablas lo traen como 'date'
  const isEmpty = v => v == null || (typeof v === 'string' && v.trim().match(/^(-|—)?$/));
  if (isEmpty(h)) h = null;
  if (isEmpty(f)) f = null;

  if (h instanceof Date && !isNaN(h)) return h;
    // F) Último recurso: usar created_at del registro (si existe)
  if (reg?.created_at) {
    const d = new Date(reg.created_at); // suele venir ISO (UTC)
    if (!isNaN(d)) return d;
  }
  if (h == null && f == null) return null;

  // 0) Epoch numérico (ms o s)
  if (typeof h === "number" && isFinite(h)) {
    const ms = h > 1e12 ? h : h * 1000;
    const d = new Date(ms);
    return isNaN(d) ? null : d;
  }

  // Normalizar string
  if (typeof h === "string") {
    const hs = h.trim();
  // Normaliza hora con minutos/segundos de 1 dígito a 2 dígitos
  const hsFixed = hs.replace(
    /T(\d{2}):(\d{1,2})(?::(\d{1,2}))?([+-]\d{2}:\d{2}|Z)?$/,
    (_, H, M, S, tz = '') => `T${H}:${String(M).padStart(2,'0')}:${String(S ?? '00').padStart(2,'0')}${tz}`
  );
    // A) ISO con Z u offset
    if (/^\d{4}-\d{2}-\d{2}T.*(Z|[+\-]\d{2}:\d{2})$/.test(hsFixed)) {
  const d = new Date(hsFixed);
      return isNaN(d) ? null : d;
    }

    // B) ISO sin zona: YYYY-MM-DDTHH:mm[:ss[.fff]]
    if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2}(\.\d{1,6})?)?$/.test(hsFixed)) {
  const d = new Date(hsFixed + "Z");
      return isNaN(d) ? null : d;
    }

    // C) Postgres timestamp sin zona: "YYYY-MM-DD HH:mm[:ss[.mmm]]"
if (/^\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2}(:\d{2}(\.\d{1,6})?)?$/.test(hs)) {
  const casinoTxt = (reg?.casino || "").toUpperCase();
  const juego = getJuegoInferido(casinoTxt);
  const [ymd, hmsRaw] = hs.split(/\s+/);
  const hms = /^\d{2}:\d{2}$/.test(hmsRaw) ? hmsRaw + ":00" : hmsRaw;

  let d;

  if (juego === "cartas" || juego === "ruleta") {
    // Estos ya te quedaban bien como UTC
    d = new Date(`${ymd}T${hms}Z`);
  } else {
    // Para MAYOR/MENOR, DADOS, PREGUNTADOS -> tomar UTC y SUMAR +3h
    d = new Date(`${ymd}T${hms}Z`);
    d = new Date(d.getTime() + 3 * 60 * 60 * 1000); // +3 horas
  }
// --- override puntual para CLAU712 CARTAS en cluster wpout… ---
try {
  const clusterWp = (config?.url || "").includes("wpoutjkljkrbliikazkh");
  const casinoTxt  = (reg?.casino || "").toUpperCase();
  const esClau712  = (config?.nombre || "").toUpperCase().includes("CLAU712");
  const esCartas   = casinoTxt.includes("CARTAS");

  if (clusterWp && esClau712 && esCartas) {
    // Interpretar como hora local AR (en vez de UTC)
    const [ymd, hmsRaw] = hs.split(/\s+/);
    const hms = /^\d{2}:\d{2}$/.test(hmsRaw) ? hmsRaw + ":00" : hmsRaw;
    const dAR = new Date(`${ymd}T${hms}-03:00`);
    if (!isNaN(dAR)) d = dAR;
  }
} catch (_) {}
  // Si existe 'fecha' y el día en AR no coincide, reforzamos con AR por las dudas
  if (!isNaN(d) && reg?.fecha) {
    const dayAR = new Intl.DateTimeFormat("sv-SE", {
      timeZone: "America/Argentina/Buenos_Aires",
      year: "numeric", month: "2-digit", day: "2-digit"
    }).format(d);
    if (dayAR !== String(reg.fecha)) {
      const dAR = new Date(`${reg.fecha}T${hms}-03:00`);
      if (!isNaN(dAR)) d = dAR;
    }
  }

  return isNaN(d) ? null : d;
}

    // D) Solo hora "HH:mm" o "HH:mm:ss"
if (typeof hs === "string" && /^\d{2}:\d{2}(:\d{2})?$/.test(hs)) {
  const hh = hs.length === 5 ? hs + ":00" : hs;
  const baseFecha = reg?.fecha ? String(reg.fecha) : hoyKeyAR(); // ← si no hay fecha, hoy AR
  const d = new Date(`${baseFecha}T${hh}-03:00`);
  return isNaN(d) ? null : d;
}
  }

  // E) Sin 'hora' pero con 'fecha' → medianoche AR
  if (!h && f) {
    const d = new Date(`${f}T00:00:00-03:00`);
    return isNaN(d) ? null : d;
  }

  return null;
}

// Formatea una Date en AR
function formatFechaAR(d) {
  if (!d) return "—";
  return new Intl.DateTimeFormat("es-AR", {
    timeZone: TZ_AR, year: "numeric", month: "2-digit", day: "2-digit"
  }).format(d);
}
function formatHoraAR(d) {
  if (!d) return "—";
  return new Intl.DateTimeFormat("es-AR", {
    timeZone: TZ_AR, hour: "2-digit", minute: "2-digit", second: "2-digit"
  }).format(d);
}
// Key de filtro por día en AR (YYYY-MM-DD)
function dateKeyAR(d) {
  if (!d) return null;
  return new Intl.DateTimeFormat("sv-SE", {
    timeZone: TZ_AR, year: "numeric", month: "2-digit", day: "2-digit"
  }).format(d);
}
function hoyKeyAR() {
  return new Intl.DateTimeFormat("sv-SE", {
    timeZone: "America/Argentina/Buenos_Aires",
    year: "numeric", month: "2-digit", day: "2-digit"
  }).format(new Date());
}
function ajustarDesfasePorJuego(d, reg) {
  if (!d) return d;

  // Solo estos juegos podrían necesitar ajuste
  const j = reg?.juegoInferido;
  const aplicaPorJuego = (j === "mayor_menor" || j === "dados" || j === "trivia");
  if (!aplicaPorJuego) return d; // ruleta y cartas quedan tal cual

  // 1) Si la hora viene como timestamp SIN zona: "YYYY-MM-DD HH:mm[:ss]"
  const h = reg?.hora;
const esTimestampSinZona =
  typeof h === "string" &&
  /^\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2}(:\d{2}(\.\d{1,6})?)?$/.test(h);

const esClusterWp = (config?.url || "").includes("wpoutjkljkrbliikazkh");

// Ajusto +3 h si:
//  - la hora es timestamp sin zona, o
//  - estamos en wpout… PERO el string de hora no trae ya Z/offset
if (esTimestampSinZona || (esClusterWp && !/[TZ][\d:+-]*$/.test(String(h||'')))) {
  return new Date(d.getTime() + 3 * 60 * 60 * 1000);
}

  // En Genesis/Pirata (ueiiyib…) o cuando venga ISO con Z/offset, no tocar
  return d;
}

// 🔢 Data logic
let registros = [];
window.registros = registros;
// === Inferencia de juego (global) ===
function getJuegoInferido(casinoTxt) {
  const txt = (casinoTxt || "").toUpperCase();
  if (txt.includes("CARTAS")) return "cartas";
  if (txt.includes("PREGUNTADOS")) return "trivia";
  if (txt.includes("MAYOR") || txt.includes("MENOR")) return "mayor_menor";
  if (txt.includes("DADOS")) return "dados";
  if (txt.includes("GLOBO") || txt.includes("BALLOON") || txt.includes("BALON")) return "globo";
  if (txt.includes("MINAS") || txt.includes("MINES") || txt.includes("MINE")) return "minas";
  return "ruleta"; // default
}
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

  const nombreCasino = config.nombre.toUpperCase().trim();
let dataFiltrada = data.filter(reg => {
  let casino = reg.casino?.toUpperCase().trim();

  // 🩹 Parche 1: corregir SHLEBY → SHELBY
  if (casino.includes("SHLEBY")) {
    casino = casino.replace("SHLEBY", "SHELBY");
    reg.casino = casino;
  }

  // 🩹 Parche 2: permitir CLAU712 sin "CASINO" adelante
  if (casino.startsWith("CLAU712")) {
    casino = casino.replace(/^CLAU712/, "CASINO CLAU712");
    reg.casino = casino;
  }

  return casino.startsWith(nombreCasino);
});
  const normalize = (s) =>
  (s ?? "")
    .toString()
    .trim()
    .toLowerCase()
    .normalize("NFD")                // saca tildes
    .replace(/\p{Diacritic}/gu, "")
    .replace(/\s+/g, " ");           // comprime espacios

const usuarioNombreRaw = localStorage.getItem("usuario_nombre");
const usuarioNombre = normalize(usuarioNombreRaw);

if (usuarioNombre) {
  dataFiltrada = dataFiltrada.filter(reg => normalize(reg.usuario) === usuarioNombre);
}

  registros = dataFiltrada;
// 🔍 Debug: exponer en window
window.__ULTIMOS_DATOS = dataFiltrada;
console.log("🔍 Datos crudos:", dataFiltrada.map(r => ({
  usuario: r.usuario,
  casino: r.casino,
  premio: r.premio,
  fecha: r.fecha,
  hora: r.hora
})));
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
  const fechaSeleccionada = document.getElementById('dateFilter').value; // YYYY-MM-DD

  return registros.filter(reg => {
    const casinoTxt = reg.casino?.toUpperCase().trim() || "";
    const [casinoBase] = casinoTxt.split(" - ");
    reg.casinoNormalizado = casinoBase;
    reg.juegoInferido = getJuegoInferido(casinoTxt);

    // Fecha normalizada (Date) según reglas
const d = parseRegistroFecha(reg);                 // ← esta línea es necesaria
const dAjustada = ajustarDesfasePorJuego(d, reg);
const key = dAjustada ? dateKeyAR(dAjustada) : null;

    // FILTROS
    if (search && !(reg.usuario?.toLowerCase().includes(search))) return false;
    if (casinoSeleccionado && reg.casinoNormalizado !== casinoSeleccionado) return false;
    if (juegoSeleccionado && reg.juegoInferido !== juegoSeleccionado) return false;

    if (fechaSeleccionada) {
      // Si pude parsear, comparo con la key AR
      if (key) return key === fechaSeleccionada;
      // Si no pude parsear y existe 'fecha' (Pirata/Genesis), comparo contra eso
      if (reg.fecha) return String(reg.fecha) === fechaSeleccionada;
      return false;
    }

    return true;
  });
}
async function recargarPanelJuegos() {
  await cargarRegistros();
  const filtrados = filtrarRegistros();
  actualizarGrafico(filtrados);
}

function renderTable() {
  const search = document.getElementById('searchInput').value.toLowerCase();
  const casinoSeleccionado = document.getElementById('casinoFilter').value;
  const juegoSeleccionado = document.getElementById('juegoFilter').value;
  const fechaSeleccionada = document.getElementById('dateFilter').value;
  const tbody = document.getElementById('resultTable');

  const filtrados = registros.filter(reg => {
  const casinoTxt = reg.casino?.toUpperCase().trim() || "";
  const [casinoBase] = casinoTxt.split(" - ");
  reg.casinoNormalizado = casinoBase;
  reg.juegoInferido = getJuegoInferido(casinoTxt);

 const d = parseRegistroFecha(reg);
const dAjustada = ajustarDesfasePorJuego(d, reg);
const key = dAjustada ? dateKeyAR(dAjustada) : null;

  if (search && !(reg.usuario?.toLowerCase().includes(search))) return false;
  if (casinoSeleccionado && reg.casinoNormalizado !== casinoSeleccionado) return false;
  if (juegoSeleccionado && reg.juegoInferido !== juegoSeleccionado) return false;

  if (fechaSeleccionada) {
    if (key) return key === fechaSeleccionada;
    if (reg.fecha) return String(reg.fecha) === fechaSeleccionada;
    return false;
  }

  // Guardar la date normalizada para no recalcular en el map
  reg.__dt = dAjustada;
  return true;
});

tbody.innerHTML = filtrados.length
  ? filtrados.map(reg => {
      const d = reg.__dt ?? ajustarDesfasePorJuego(parseRegistroFecha(reg), reg);
      const fechaVis = formatFechaAR(d);
      const horaVis  = formatHoraAR(d);
      return `<tr>
        <td>${reg.usuario ?? '—'}</td>
        <td>${reg.premio  ?? '—'}</td>
        <td>${fechaVis}</td>
        <td>${horaVis}</td>
        <td>${reg.casino ?? '—'}</td>
      </tr>`;
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
  const juegos = ["ruleta", "cartas", "trivia", "mayor_menor", "dados", "globo", "minas"];
  const labels = {
    ruleta: "🎯 Ruleta",
    cartas: "🃏 Cartas",
    trivia: "❓ Preguntados",
    mayor_menor: "⬆️⬇️ Mayor o Menor",
    dados: "🎲 Dados",
    globo: "🎈 Globo",
    minas: "💣 Minas"
  };
  select.options.length = 1; // deja "Todos los Juegos"
  juegos.forEach(j => {
    const opt = document.createElement('option');
    opt.value = j;
    opt.textContent = labels[j];
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

const bind = (id, fn) => document.getElementById(id)?.addEventListener("click", fn);

bind("btn-juegos",        () => mostrarSeccion("juegos"));
bind("btn-turno",         () => mostrarSeccion("registros"));
bind("btn-control",       () => mostrarSeccion("registros"));
bind("btn-subir-control", () => mostrarSeccion("registros"));
bind("btn-bono",          () => mostrarSeccion("bonos"));
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
document.querySelectorAll(
  "#btn-bono, #btn-pendiente, #marcar-gasto, #marcar-st, #modo-eliminar"
).forEach(el => {
  el?.addEventListener("click", () => {
    const panel = document.getElementById("panel-juegos");
    if (panel) panel.style.display = "none";
  });
});
  // Hacer disponible la función globalmente para el botón 🔄
window.recargarPanelJuegos = recargarPanelJuegos;
