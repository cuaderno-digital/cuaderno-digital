const usuario_id = localStorage.getItem("usuario_id");
if (!usuario_id) {
  alert("No hay sesión iniciada. Volvé a ingresar.");
  window.location.href = "login.html";
}
import { supabase } from './supabaseClient.js';

// 🔥 LIMPIEZA AUTOMÁTICA DE TODO LO VIEJO (mayor a 15 días)
(async () => {
  const hoy = new Date();
  const limiteHora = new Date(hoy.getTime() - 15 * 24 * 60 * 60 * 1000).toISOString();
  const limiteFecha = new Date(hoy.getTime() - 15 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];

  await supabase.from("movimientos").delete().lt("hora", limiteHora);
  await supabase.from("controles").delete().lt("fecha", limiteFecha);
})();

const form = document.getElementById("registro-form");
const tabla = document.getElementById("tabla-registros").querySelector("tbody");
const fechaFiltro = document.getElementById("fechaFiltro");
const fechaHoraDiv = document.getElementById("fecha-hora");
const cartelEstado = document.getElementById("cartel-estado-turno");

const btnTurno = document.getElementById("btn-turno");

const formCampos = document.querySelectorAll("#registro-form input, #registro-form button");

let movimientos = [];
let modoResaltado = null;
let modoEliminar = false;
let turnoAbierto = false;
let modoControl = false;
let estadoControl = {};
function guardarEstadoControl() {
  localStorage.setItem("estadoControl", JSON.stringify(estadoControl));
}


// ✅ Mostrar fecha y hora en vivo
function actualizarFechaHora() {
  const ahora = new Date();
  const dias = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
  const diaNombre = dias[ahora.getDay()];
  const fecha = ahora.toLocaleDateString("es-AR", { day: "2-digit", month: "2-digit" });
  const hora = ahora.toLocaleTimeString("es-AR", {
    hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false
  });

  fechaHoraDiv.textContent = `${diaNombre.toUpperCase()} ${fecha} - ${hora} hs`;
}
setInterval(actualizarFechaHora, 1000);

// ✅ Cargar fecha de hoy en el input
function setFechaActualEnFiltro() {
  const hoy = new Date();
  const zonaLocal = new Date(hoy.getTime() - hoy.getTimezoneOffset() * 60000);
  const iso = zonaLocal.toISOString().split("T")[0];
  fechaFiltro.value = iso;
}

// ✅ Bloquear o habilitar formulario
function habilitarFormulario(habilitado) {
  formCampos.forEach(campo => campo.disabled = !habilitado);
}

// ✅ Mostrar cartel de estado
function actualizarCartelTurno() {
  cartelEstado.style.display = turnoAbierto ? "none" : "block";
}

// ✅ Agregar fila especial (turno abierto o cerrado)
async function agregarFilaTurno(texto) {
  const ahora = new Date();
  const nuevo = {
    usuario: texto,
    usuario_id,
    monto: null,
    observacion: "",
    hora: ahora.toISOString(),
    color: "turno",
    tipo: "turno"
  };

  movimientos.push(nuevo);

  const { error } = await supabase.from("movimientos").insert([nuevo]);
  if (error) {
    console.error("Error al guardar fila de turno en Supabase:", error);
  }

  mostrarMovimientosDeFecha(new Date(fechaFiltro.value));
}



// ✅ Evento para guardar movimiento normal
form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const usuario = document.getElementById("usuario").value;
  const monto = parseInt(document.getElementById("monto").value);
  const observacion = document.getElementById("observacion").value;
  const hora = new Date();

  const nuevo = {
    usuario,
    usuario_id,
    monto,
    observacion,
    hora: hora.toISOString(),
    color: null
  };
  const esBono = modoBono && pestañaActiva === "bono";

  if (esBono) {
    const bono = {
      usuario,
      usuario_id,
      monto,
      observacion,
      hora: hora.toISOString(),
      activo: true
    };
  
    await guardarBonoEnNube(bono);
    form.reset();
    return;
  }

// Además, guardar en Supabase
supabase.from("movimientos").insert([nuevo]).select().then(({ data, error }) => {
  if (error) {
    console.error("Error al guardar en Supabase:", error);
    alert("No se pudo guardar en la nube");
    return;
  }

  if (data && data.length > 0) {
    // Reemplazamos el objeto entero con el que vino de Supabase
    movimientos.push(data[0]);

    // 👇 Esta línea va acá: actualiza la vista con los movimientos REALES
    mostrarMovimientosDeFecha(new Date(fechaFiltro.value));
    // 🔽 Autoscroll automático al final
setTimeout(() => {
  const tablaContainer = document.getElementById("tabla-registros");
  tablaContainer?.scrollIntoView({ behavior: "smooth", block: "end" });
}, 200);
  }
});


  form.reset();
});

// ✅ Evento para filtrar por fecha
document.getElementById("btn-buscar-fecha").addEventListener("click", () => {
  const fecha = new Date(fechaFiltro.value + "T00:00:00");

  const inicio = new Date(fecha.setHours(0, 0, 0, 0)).toISOString();
  const fin = new Date(fecha.setHours(23, 59, 59, 999)).toISOString();

  supabase.from("movimientos")
  .select("*")
  .eq("usuario_id", usuario_id) // 👈🏽 ESTO FALTABA
  .gte("hora", inicio)
  .lte("hora", fin)
  .order("hora", { ascending: true })
    .then(({ data, error }) => {
      if (error) {
        console.error("Error al cargar desde Supabase:", error);
        return;
      }
      movimientos = data;
      mostrarMovimientosDeFecha(new Date(fechaFiltro.value));
      if (pestañaActiva === "bono") {
        cargarBonosDesdeNube();
      }
    });
});

// ✅ Mostrar movimientos filtrados por fecha
async function mostrarMovimientosDeFecha() {
  tabla.innerHTML = "";

  movimientos.forEach((mov, index) => {
    const h = new Date(mov.hora);

    const row = tabla.insertRow();
    row.setAttribute("data-index", index);
    row.insertCell(0).textContent = mov.usuario;
    row.insertCell(1).textContent =
      mov.tipo === "turno" || mov.monto === null || mov.monto === undefined || mov.monto === ""
        ? ""
        : `$${Number(mov.monto).toLocaleString("es-AR")}`;

    row.insertCell(2).textContent = mov.observacion || "";
    row.insertCell(3).textContent = h.toLocaleTimeString("es-AR", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false
    });

    if (mov.color === "amarillo") {
      row.classList.add("destacado-amarillo");
    } else if (mov.color === "separador") {
      row.classList.add("separador-control");
      const horaTexto = new Date(mov.hora).toLocaleTimeString("es-AR", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false
      });
      row.innerHTML = `
        <td></td>
        <td style="text-align:center; font-weight:bold;">🔵 FIN CONTROL</td>
        <td></td>
        <td style="text-align:center;">${horaTexto}</td>
    `;
    } else if (mov.color === "rojo") {
      row.classList.add("destacado-rojo");
    } else if (mov.color === "turno") {
      row.classList.add("destacado-turno");
    }

    const fechaClave = fechaFiltro.value;
const clave = `${fechaClave}-${mov.id}`;
if (estadoControl[clave]?.error) {
      row.classList.add("fila-error-control");
    }

    if (modoEliminar && !mov.tipo) {
      row.style.cursor = "url('https://cdn-icons-png.flaticon.com/512/1214/1214428.png'), auto";
      row.classList.add("modo-eliminar");
    }
  });

  if (modoEliminar) resaltarFilasEliminables();
  await cargarEstadoControlDesdeNube(fechaFiltro.value);
mostrarControlEnFilas();
}
async function verificarTurnoAbiertoDesdeNube() {
  const hoy = new Date();
  const inicio = new Date(hoy.setHours(0, 0, 0, 0)).toISOString();
  const fin = new Date(hoy.setHours(23, 59, 59, 999)).toISOString();

  const { data, error } = await supabase
    .from("movimientos")
    .select("usuario, hora")
    .eq("usuario_id", usuario_id)
    .gte("hora", inicio)
    .lte("hora", fin)
    .order("hora", { ascending: true });

  if (error) {
    console.error("❌ Error al consultar turno:", error);
    return false;
  }

  let abierto = false;
  for (const mov of data) {
    if (mov.usuario?.startsWith("TURNO ABIERTO")) abierto = true;
    if (mov.usuario === "TURNO CERRADO") abierto = false;
  }

  return abierto;
}
async function verificarEstadoControlDesdeNube() {
  const fecha = fechaFiltro.value;
  const { data, error } = await supabase
    .from("estado_control")
    .select("estado")
    .eq("usuario_id", usuario_id)
    .eq("fecha", fecha)
    .single();

  if (error || !data) return false; // Por defecto, cerrado
  return data.estado === true;
}
// ✅ Mostrar todo lo del día al cargar
function mostrarMovimientosDelDia() {
  const hoy = new Date();
const inicio = new Date(hoy.setHours(0, 0, 0, 0)).toISOString();
const fin = new Date(hoy.setHours(23, 59, 59, 999)).toISOString();

supabase.from("movimientos")
  .select("*")
  .eq("usuario_id", usuario_id) // 👈🏽 ESTE FILTRO ES CLAVE
  .gte("hora", inicio)
  .lte("hora", fin)
  .order("hora", { ascending: true })
  .then(({ data, error }) => {
    if (error) {
      console.error("Error al cargar desde Supabase:", error);
      return;
    }
    movimientos = data;
    mostrarMovimientosDeFecha(new Date());
    cargarEstadoControlDesdeNube(fechaFiltro.value);
  });

}

// ✅ Botones de monto rápido
document.querySelectorAll(".btn-monto").forEach((btn) => {
  btn.addEventListener("click", () => {
    const montoInput = document.getElementById("monto");
    if (montoInput.disabled) return;
    const actual = parseInt(montoInput.value) || 0;
    const agregar = parseInt(btn.dataset.valor);
    montoInput.value = actual + agregar;
  });
});

// ✅ Marcado por color
const btnGasto = document.getElementById("marcar-gasto");
btnGasto.addEventListener("click", () => {
  modoResaltado = modoResaltado === "amarillo" ? null : "amarillo";
  modoEliminar = false;

  btnGasto.classList.toggle("activo", modoResaltado === "amarillo");
  btnST.classList.remove("activo");
  btnEliminar.classList.remove("activo");

  mostrarMovimientosDeFecha(new Date(fechaFiltro.value));
});


const btnST = document.getElementById("marcar-st");
btnST.addEventListener("click", () => {
  modoResaltado = modoResaltado === "rojo" ? null : "rojo";
  modoEliminar = false;

  btnST.classList.toggle("activo", modoResaltado === "rojo");
  btnGasto.classList.remove("activo");
  btnEliminar.classList.remove("activo");

  mostrarMovimientosDeFecha(new Date(fechaFiltro.value));
});


const btnEliminar = document.getElementById("modo-eliminar");
btnEliminar.addEventListener("click", () => {
  modoEliminar = !modoEliminar;
  modoResaltado = null;

  btnEliminar.classList.toggle("activo", modoEliminar);
  btnGasto.classList.remove("activo");
  btnST.classList.remove("activo");

  mostrarMovimientosDeFecha(new Date(fechaFiltro.value));

  // ✅ Si está activo el modo bono, también refrescamos la tabla de bonos
  if (modoBono && pestañaActiva === "bono") {
    mostrarTablaBonos();
  }
});


// ✅ Marcar visualmente qué filas se pueden eliminar
function resaltarFilasEliminables() {
  const ahora = new Date();
  Array.from(tabla.rows).forEach((row) => {
    const index = parseInt(row.dataset.index);
    const mov = movimientos[index];
    if (!mov || ["turno", "separador", "bono"].includes(mov.tipo)) return;

    const movHora = new Date(mov.hora);
    const minutos = (ahora - movHora) / 1000 / 60;

    if (modoEliminar && minutos <= 5) {
      row.classList.add("fila-eliminable");
    } else {
      row.classList.remove("fila-eliminable");
    }
  });
}

// ✅ Guardar color o eliminar fila
tabla.addEventListener("click", async (e) => {
  const fila = e.target.closest("tr");
  if (!fila || fila.parentElement.tagName !== "TBODY") return;

  const index = parseInt(fila.dataset.index);
  const mov = movimientos[index];
  if (!mov || ["turno", "separador", "bono"].includes(mov.tipo)) return;

  if (modoEliminar) {
    const ahora = new Date();
    const horaMov = new Date(mov.hora);
    const diferenciaMin = (ahora - horaMov) / (1000 * 60);
  
    if (diferenciaMin > 5) {
      alert("Solo podés eliminar movimientos dentro de los primeros 5 minutos.");
      return;
    }
  
    if (!mov.id) {
      console.warn("El movimiento no tiene ID, no se puede eliminar");
      alert("Este movimiento no tiene ID, no se puede eliminar");
      return;
    }
  
    console.log("🗑️ Intentando borrar ID:", mov.id);
    const { error: deleteError } = await supabase
      .from("movimientos")
      .delete()
      .match({ id: mov.id });
  
    if (deleteError) {
      console.error("❌ Supabase no eliminó:", deleteError);
      alert("Error al eliminar desde Supabase.");
      return;
    }
  
    console.log("✅ Eliminado correctamente:", mov.id);
  
    // 🔥 Recargar desde Supabase directamente
    const fecha = new Date(fechaFiltro.value + "T00:00:00");
    const inicio = new Date(fecha.setHours(0, 0, 0, 0)).toISOString();
    const fin = new Date(fecha.setHours(23, 59, 59, 999)).toISOString();
  
    const { data: nuevos, error: recargaError } = await supabase
  .from("movimientos")
  .select("*")
  .eq("usuario_id", usuario_id) // ✅ este filtro faltaba
  .gte("hora", inicio)
  .lte("hora", fin)
  .order("hora", { ascending: true });
  
    if (recargaError) {
      console.error("❌ Error al recargar desde Supabase:", recargaError);
      alert("Error al actualizar los datos.");
      return;
    }
  
    movimientos = nuevos;
    mostrarMovimientosDeFecha(new Date(fechaFiltro.value));
    return;
  }


  const filaClass = fila.classList;

  // ✅ Aplicar o quitar resaltado SOLO si el modo está activo
  if (modoResaltado === "amarillo") {
    // Alternar amarillo
    if (filaClass.contains("destacado-amarillo")) {
      filaClass.remove("destacado-amarillo");
      mov.color = null;
    } else {
      filaClass.add("destacado-amarillo");
      filaClass.remove("destacado-rojo");
      mov.color = "amarillo";
    }
  } else if (modoResaltado === "rojo") {
    // Alternar rojo
    if (filaClass.contains("destacado-rojo")) {
      filaClass.remove("destacado-rojo");
      mov.color = null;
    } else {
      filaClass.add("destacado-rojo");
      filaClass.remove("destacado-amarillo");
      mov.color = "rojo";
    }
  }
  if (mov.id) {
    await supabase.from("movimientos").update({ color: mov.color }).eq("id", mov.id);
  }
  // ✅ Si no hay modo activo, ignorar clics sobre filas para color
});


btnTurno.addEventListener("click", async () => {
  if (turnoAbierto) {
    const yaAbierto = await verificarTurnoAbiertoDesdeNube();
    if (!yaAbierto) {
      alert("⚠️ El turno ya está cerrado.");
      return;
    }

    turnoAbierto = false;
    localStorage.setItem("turnoAbierto", false);
    habilitarFormulario(false);
    actualizarCartelTurno();
    agregarFilaTurno("TURNO CERRADO");
    document.getElementById("btn-pendiente").disabled = true;
    btnTurno.textContent = "Abrir Turno";
  } else {
    verificarTurnoAbiertoDesdeNube().then((yaAbierto) => {
      if (yaAbierto) {
        alert("⚠️ Ya hay un turno abierto hoy.");
        return;
      }

      document.getElementById("modal-turno").style.display = "flex";
      document.getElementById("input-turno-nombre").value = "";
      setTimeout(() => document.getElementById("input-turno-nombre").focus(), 100);
    });
  }
});

const btnModoBono = document.getElementById("btn-bono");

// ✅ Ejecutar todo al iniciar
(async () => {
  actualizarFechaHora();
  setFechaActualEnFiltro();

  // 🔁 Cargar el estado desde la nube
  modoControl = await verificarEstadoControlDesdeNube();
  console.log("🧪 Estado inicial de modoControl:", modoControl);
  // 🔁 Cargar los movimientos del día Y estado del control
  await mostrarMovimientosDelDia();

  // 🔁 Refrescar visual el botón de control según estado
  btnControl.textContent = modoControl ? "Cerrar Control" : "Hacer Control";
  btnControl.classList.toggle("amarillo", modoControl);

  if (modoControl) await cargarEstadoControlDesdeNube(fechaFiltro.value);

  // ✅ Restaurar modo BONO si quedó activo en la nube
  const { data: estadoBono, error: errorBono } = await supabase
  .from("estado_bono")
  .select("*")
  .eq("usuario_id", usuario_id)
  .single();

if (!errorBono && estadoBono?.activo) {
  console.log("✅ BONO ACTIVO DETECTADO, restaurando visualmente...");
  modoBono = true;
  pestañaActiva = "bono";
  localStorage.setItem("titulo_bono", estadoBono.titulo || "SIN TÍTULO"); // 👈 esto agrega el título en todas las compus
    btnModoBono.textContent = "Terminar Bono";
    document.getElementById("registro-form").dataset.tab = "bono";
    document.getElementById("tab-bono").classList.add("activo-tab");
    document.getElementById("tab-normal").classList.remove("activo-tab");
    tabsBonos.style.display = "flex";
    document.getElementById("tabla-registros").style.display = "none";
    document.getElementById("tabla-bonos").style.display = "table";
    await cargarBonosDesdeNube();
  } else {
    console.log("🚫 BONO NO ACTIVO o error al cargar:", errorBono);
  }

  turnoAbierto = await verificarTurnoAbiertoDesdeNube();
  btnTurno.textContent = turnoAbierto ? "Cerrar Turno" : "Abrir Turno";
  habilitarFormulario(turnoAbierto);
  actualizarCartelTurno();
  document.getElementById("btn-pendiente").disabled = !turnoAbierto;
})();
const btnControl = document.getElementById("btn-control");

// 🔶 Pendientes (desde Supabase)
let pendientes = [];

const btnPendiente = document.getElementById("btn-pendiente");
const formPendiente = document.getElementById("form-pendiente");
const tablaPendientes = document.getElementById("tabla-pendientes");
const cuerpoPendientes = document.getElementById("pendientes-body");

btnPendiente.addEventListener("click", () => {
  if (!turnoAbierto) {
    alert("Debés abrir un turno para cargar premios pendientes.");
    return;
  }
  formPendiente.style.display = formPendiente.style.display === "none" ? "flex" : "none";
});

document.getElementById("guardar-pendiente").addEventListener("click", async () => {
  const usuario = document.getElementById("pendiente-usuario").value;
  const total = document.getElementById("pendiente-total").value;
  const falta = document.getElementById("pendiente-restante").value;

  if (!usuario || !total || !falta) return alert("Completá todos los campos");

  const nuevo = { usuario, total, falta, usuario_id };

  const { error } = await supabase.from("pendientes").insert([nuevo]);

  if (error) {
    console.error("Error al guardar pendiente:", error);
    alert("No se pudo guardar en la nube.");
    return;
  }

  document.getElementById("pendiente-usuario").value = "";
  document.getElementById("pendiente-total").value = "";
  document.getElementById("pendiente-restante").value = "";
  formPendiente.style.display = "none";
  cargarPendientesDesdeNube();
});

async function cargarPendientesDesdeNube() {
  const { data, error } = await supabase.from("pendientes").select("*").eq("usuario_id", usuario_id);
  if (error) {
    console.error("Error al cargar pendientes:", error);
    return;
  }
  pendientes = data;
  mostrarPendientes();
}

async function borrarPendiente(index) {
  const pendiente = pendientes[index];
  if (!pendiente || !pendiente.id) return;

  const { error } = await supabase.from("pendientes").delete().eq("id", pendiente.id);
  if (error) {
    console.error("Error al eliminar pendiente:", error);
    return;
  }
  cargarPendientesDesdeNube();
}

function mostrarPendientes() {
  cuerpoPendientes.innerHTML = "";
  if (pendientes.length === 0) {
    tablaPendientes.style.display = "none";
    return;
  }

  tablaPendientes.style.display = "block";
  pendientes.forEach((pend, index) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${pend.usuario}</td>
      <td>$${Number(pend.total).toLocaleString("es-AR")}</td>
      <td>$${Number(pend.falta).toLocaleString("es-AR")}</td>
      <td style="text-align: center;">
        <button onclick="borrarPendiente(${index})" style="background: none; border: none; font-size: 1.2rem; cursor: pointer;">✅</button>
      </td>
    `;
    cuerpoPendientes.appendChild(row);
  });
}

// 🔶 Mostrar pendientes al iniciar
cargarPendientesDesdeNube();


async function cargarEstadoControlDesdeNube(fecha) {
  const { data, error } = await supabase
  .from("controles")
  .select("*")
  .eq("fecha", fecha)
  .eq("usuario_id", usuario_id);

  if (error) {
    console.error("❌ Error al traer controles desde la nube:", error);
    return;
  }

  estadoControl = {};
  data.forEach(ctrl => {
    const clave = `${ctrl.fecha}-${ctrl.movimiento_id}`;
    estadoControl[clave] = {
      panel: ctrl.panel,
      pago: ctrl.pago,
      error: ctrl.error
    };
  });

  localStorage.setItem("estadoControl", JSON.stringify(estadoControl));
}
// 🔒 Función para guardar el estado del control
function mostrarControlEnFilas() {
  Array.from(tabla.rows).forEach((row) => {
    const index = row.dataset.index;
    const mov = movimientos[index];
    if (!index || mov?.tipo === "turno") return;

    const fechaClave = fechaFiltro.value;
const clave = `${fechaClave}-${mov.id}`;
let estado = estadoControl[clave];

if (!estado && modoControl) {
  estado = { panel: false, pago: false, error: false };
  estadoControl[clave] = estado;
}

// ⚠️ NO mostrar nada si no hay estado o todo está en falso y no estamos en modo control
if (
  !estado ||
  (!modoControl && !estado.panel && !estado.pago && !estado.error)
) {
  return;
}
if (estado.error) row.classList.add("fila-error-control");

    const celdaMonto = row.cells[1];
    const contenedor = document.createElement("div");
    contenedor.style.display = "flex";
    contenedor.style.alignItems = "center";
    contenedor.style.justifyContent = "center";
    contenedor.style.gap = "8px";

    const textoMonto = document.createElement("span");
    textoMonto.textContent = celdaMonto.textContent;

    const tildadoPanel = document.createElement("span");
    const tildadoPago = document.createElement("span");
    const cruzado = document.createElement("span");

    [tildadoPanel, tildadoPago, cruzado].forEach((el) => {
      el.style.cursor = modoControl ? "pointer" : "default";
      el.style.fontSize = "1rem";
    });

    tildadoPanel.textContent = estado?.panel ? "✅" : "⚪";
    tildadoPago.textContent = estado?.pago ? "💰" : "⚪";
    cruzado.textContent = estado?.error ? "❌" : "⚪";

    if (modoControl) {
      // PANEL
tildadoPanel.addEventListener("click", async () => {
  const fechaClave = fechaFiltro.value;
  const clave = `${fechaClave}-${mov.id}`;
  estadoControl[clave] = estadoControl[clave] || {};
  const nuevo = !estadoControl[clave].panel;
  estadoControl[clave].panel = nuevo;
  guardarEstadoControl();
  await guardarEstadoEnNube(mov.id, fechaClave, estadoControl[clave]);
  tildadoPanel.textContent = nuevo ? "✅" : "⚪";
});

// PAGO
tildadoPago.addEventListener("click", async () => {
  const fechaClave = fechaFiltro.value;
  const clave = `${fechaClave}-${mov.id}`;
  estadoControl[clave] = estadoControl[clave] || {};
  const nuevo = !estadoControl[clave].pago;
  estadoControl[clave].pago = nuevo;
  guardarEstadoControl();
  await guardarEstadoEnNube(mov.id, fechaClave, estadoControl[clave]);
  tildadoPago.textContent = nuevo ? "💰" : "⚪";
});


// ERROR
cruzado.addEventListener("click", async () => {
  const fechaClave = fechaFiltro.value;
  const clave = `${fechaClave}-${mov.id}`;
  estadoControl[clave] = estadoControl[clave] || {};
  const nuevo = !estadoControl[clave].error;
  estadoControl[clave].error = nuevo;
  guardarEstadoControl();
  await guardarEstadoEnNube(mov.id, fechaClave, estadoControl[clave]);
  cruzado.textContent = nuevo ? "❌" : "⚪";
});

    }

    contenedor.appendChild(textoMonto);
    contenedor.appendChild(tildadoPanel);
    contenedor.appendChild(tildadoPago);
    contenedor.appendChild(cruzado);

    celdaMonto.innerHTML = "";
    celdaMonto.appendChild(contenedor);
  });
}



// 🔒 Botón para activar control
btnControl.addEventListener("click", async () => {
  if (modoControl) {
    // 🔴 Cerrar control
    modoControl = false;
    await guardarEstadoControlEnNube(false);
    await agregarFilaSeparador();
    mostrarMovimientosDeFecha(new Date(fechaFiltro.value));
    btnControl.textContent = "Hacer Control";
    btnControl.classList.remove("amarillo");
    return;
  }

  // 🟢 Abrir control
  const clave = prompt("Ingresá la contraseña de control:");
  if (!clave) return; // si tocás cancelar, no hace nada
  if (clave !== "120212") {
    alert("Clave incorrecta");
    return;
  }

  modoControl = true;
  await guardarEstadoControlEnNube(true);
  mostrarMovimientosDeFecha(new Date(fechaFiltro.value));
  btnControl.textContent = "Cerrar Control";
  btnControl.classList.add("amarillo");
});

// 🔒 Función para guardar en la nube
async function guardarEstadoEnNube(movId, fecha, estado) {
  const { data, error } = await supabase
    .from("controles")
    .upsert(
      [
        {
          movimiento_id: movId,
          fecha,
          usuario_id,
          panel: estado.panel || false,
          pago: estado.pago || false,
          error: estado.error || false
        }
      ],
      { onConflict: ["movimiento_id", "fecha"] }
    );

  if (error) console.error("❌ Error al guardar control en Supabase:", error);
}

// 🔒 Asegurar que se muestre si está en modo control al cargar
(async () => {
  if (modoControl) {
    await cargarEstadoControlDesdeNube(fechaFiltro.value);
    mostrarControlEnFilas();
  }
})();

// ✅ Hacer funciones globales
window.borrarPendiente = borrarPendiente;
window.guardarEstadoControl = guardarEstadoControl;
document.getElementById("cerrar-sesion").addEventListener("click", () => {
  const turnoActual = localStorage.getItem("turnoAbierto");
  localStorage.removeItem("usuario_id");
  localStorage.setItem("turnoAbierto", turnoActual);
  window.location.href = "login.html";
});
const btnConsultar = document.getElementById("consultar");
let modoConsulta = false;

btnConsultar.addEventListener("click", () => {
  if (modoConsulta) return; // Evita doble entrada

  const clave = prompt("Ingresá la clave de consulta:");
  if (clave === null || clave.trim() === "") return; // no hace nada si se cancela o deja vacío
  if (clave !== "1709") {
    alert("Clave incorrecta");
    return;
  }

  modoConsulta = true;
  btnConsultar.textContent = "Cerrar consulta";

  const fechaSeleccionada = fechaFiltro.value;
  const movimientosDelDia = movimientos.filter((mov) => {
    const fechaMov = new Date(mov.hora).toISOString().split("T")[0];
    return fechaMov === fechaSeleccionada;
  });

  let totalPremios = 0;
  let totalGastos = 0;
  let totalST = 0;

  movimientosDelDia.forEach((mov) => {
    if (mov.tipo === "turno" || mov.monto == null) return;
    if (mov.color === "amarillo") {
      totalGastos += Number(mov.monto);
    } else if (mov.color === "rojo") {
      totalST += Number(mov.monto);
    } else {
      totalPremios += Number(mov.monto);
    }
  });

  const resumen = `
  <div><b>Fecha:</b> ${fechaSeleccionada}</div>
  <div style="margin-top:10px;"><span style="color:#90ee90;">💰 Premios Pagados:</span> <b>$${totalPremios.toLocaleString("es-AR")}</b></div>
  <div><span style="color:gold;">⚠️ Gastos:</span> <b>$${totalGastos.toLocaleString("es-AR")}</b></div>
  <div><span style="color:#ff6666;">🛑 ST:</span> <b>$${totalST.toLocaleString("es-AR")}</b></div>
`;

mostrarModalConsulta(resumen);

  // ✅ Activamos modo para poder salir luego
  btnConsultar.addEventListener("click", () => {
    modoConsulta = false;
    btnConsultar.textContent = "Consultar";
  }, { once: true });
});
function mostrarModalConsulta(contenido) {
  document.getElementById("contenido-consulta").innerHTML = contenido;
  document.getElementById("modal-consulta").style.display = "flex";
}

function cerrarModalConsulta() {
  document.getElementById("modal-consulta").style.display = "none";
}
// ⬇️ Al final del script.js

// ✅ Botón "Aceptar" del modal de consulta
document.getElementById("btn-cerrar-consulta").addEventListener("click", () => {
  cerrarModalConsulta();
  modoConsulta = false;
  btnConsultar.textContent = "Consultar";
});
function cerrarModalTurno() {
  document.getElementById("modal-turno").style.display = "none";
}
document.getElementById("input-turno-nombre").addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    e.preventDefault();
    confirmarAbrirTurno();
  }
});
function confirmarAbrirTurno() {
  const nombre = document.getElementById("input-turno-nombre").value.trim();
  if (!nombre) return;

  turnoAbierto = true;
  localStorage.setItem("turnoAbierto", true);
  habilitarFormulario(true);
  actualizarCartelTurno();
  agregarFilaTurno(`TURNO ABIERTO POR: ${nombre.toUpperCase()}`);
  document.getElementById("btn-pendiente").disabled = false;
  cerrarModalTurno();
  btnTurno.textContent = "Cerrar Turno";
}
// 🟨 Exponer funciones del modal de apertura
window.cerrarModalTurno = cerrarModalTurno;
window.confirmarAbrirTurno = confirmarAbrirTurno;
async function eliminarDatosViejos() {
  const hoy = new Date();
  const fechaLimite = new Date(hoy.setDate(hoy.getDate() - 15)).toISOString();
  const fechaTexto = fechaLimite.split("T")[0];

  // 🧹 Eliminar movimientos del usuario
  const { error: errorMov } = await supabase
    .from("movimientos")
    .delete()
    .lt("hora", fechaLimite)
    .eq("usuario_id", usuario_id);

  if (errorMov) console.error("❌ Error al eliminar movimientos viejos:", errorMov);

  // 🧹 Eliminar controles del usuario
  const { error: errorCtrl } = await supabase
    .from("controles")
    .delete()
    .lt("fecha", fechaTexto)
    .eq("usuario_id", usuario_id);

  if (errorCtrl) console.error("❌ Error al eliminar controles viejos:", errorCtrl);

  console.log("✅ Limpieza de datos antiguos completa.");
}
// ✅ Agrega separador visual al cerrar control
async function agregarFilaSeparador() {
  const ahora = new Date();
  const separador = {
    usuario: "SEPARADOR CONTROL",
    usuario_id,
    monto: null,
    observacion: "",
    hora: ahora.toISOString(),
    color: "separador",
    tipo: "separador"
  };

  movimientos.push(separador);

  const { error } = await supabase.from("movimientos").insert([separador]);
  if (error) console.error("Error al guardar separador:", error);
}

// Ejecutamos la función al inicio
const ultimaLimpieza = localStorage.getItem("ultimaLimpieza");
const hoyTexto = new Date().toISOString().split("T")[0];
if (ultimaLimpieza !== hoyTexto) {
  eliminarDatosViejos();
  localStorage.setItem("ultimaLimpieza", hoyTexto);
}
// 🔼 Mostrar botón para volver arriba si se scrollea
const btnVolverArriba = document.getElementById("btn-volver-arriba");
window.addEventListener("scroll", () => {
  btnVolverArriba.style.display = window.scrollY > 100 ? "block" : "none";
});
btnVolverArriba.addEventListener("click", () => {
  window.scrollTo({ top: 0, behavior: "smooth" });
});
let modoBono = false;


// 👉 Crear solapas dinámicamente (inicialmente ocultas)
const tabsBonos = document.createElement("div");
tabsBonos.id = "tabs-bonos";
tabsBonos.style.display = "flex";
tabsBonos.style.marginLeft = "10px";
tabsBonos.style.gap = "8px";

tabsBonos.innerHTML = `
  <button id="tab-normal" class="tab-bono activo-tab">1</button>
  <button id="tab-bono" class="tab-bono">2</button>
  <button id="tab-tres" class="tab-bono">3</button>
`;

document.querySelector(".filtro-fecha").appendChild(tabsBonos);

// 👉 Eventos para alternar pestañas
// 👉 Eventos para alternar pestañas
let pestañaActiva = "normal";

document.addEventListener("click", (e) => {
  if (e.target.id === "tab-normal") {
    pestañaActiva = "normal";
    document.getElementById("panel-juegos").style.display = "none";
    document.getElementById("registro-form").dataset.tab = "normal";
    document.getElementById("tab-normal").classList.add("activo-tab");
    document.getElementById("tab-bono").classList.remove("activo-tab");
    document.getElementById("tab-tres").classList.remove("activo-tab");

    // Mostrar tabla normal, ocultar bono
    document.getElementById("tabla-registros").style.display = "table";
    document.getElementById("tabla-bonos").style.display = "none";

    // ✅ Solapa 1: habilitar si turno abierto
    if (turnoAbierto) {
      habilitarFormulario(true);
    } else {
      habilitarFormulario(false);
    }
  }

  if (e.target.id === "tab-bono") {
    pestañaActiva = "bono";
    document.getElementById("panel-juegos").style.display = "none";
    document.getElementById("registro-form").dataset.tab = "bono";
    document.getElementById("tab-bono").classList.add("activo-tab");
    document.getElementById("tab-normal").classList.remove("activo-tab");
    document.getElementById("tab-tres").classList.remove("activo-tab");
  
    // Mostrar tabla bono, ocultar la normal
    document.getElementById("tabla-registros").style.display = "none";
    document.getElementById("tabla-bonos").style.display = "table";
  
    mostrarTablaBonos();
  
    // ✅ Solapa 2: bloquear si el bono no está activo
    habilitarFormulario(modoBono);
  }
});

// 👉 Evento botón Modo Bono
btnModoBono.addEventListener("click", async () => {
  if (!modoBono) {
    const clave = prompt("Clave para activar BONO:");
    if (clave === null || clave.trim() === "") return;
    if (clave !== "120212") {
      alert("Clave incorrecta.");
      return;
    }

    const titulo = prompt("📌 Ingresá un nombre para este bono (ej: 100% Bonificación):");
    if (titulo === null || titulo.trim().length === 0) return;
    localStorage.setItem("titulo_bono", titulo.trim());

    // 👉 Mostrar el título en el campo de 'usuario' como marcador
    const inputUsuario = document.getElementById("usuario");
// ✅ Mostrar el título como pista, sin bloquear el input
inputUsuario.placeholder = "Usuario o Gasto";
inputUsuario.value = "";
inputUsuario.disabled = false;

    modoBono = true;
    await guardarEstadoBonoEnNube(true);
    
await cargarBonosDesdeNube(); // 🔄 Mostrar la tabla con el título apenas se activa
    btnModoBono.textContent = "Terminar Bono";
    document.getElementById("registro-form").dataset.tab = "bono";
    pestañaActiva = "bono";
    document.getElementById("tab-bono").classList.add("activo-tab");
    document.getElementById("tab-normal").classList.remove("activo-tab");
    tabsBonos.style.display = "flex";
    document.getElementById("tabla-registros").style.display = "none";
    document.getElementById("tabla-bonos").style.display = "table";
    mostrarTablaBonos();
  } else {
    // 👇 TERMINAR BONO
    if (listaBonos.length === 0) {
      alert("No hay bonos cargados. No se registrará nada.");
    } else {
      const total = listaBonos.reduce((acc, b) => acc + Number(b.monto || 0), 0);
      const bonoFinal = {
        usuario: "BONO",
        usuario_id,
        monto: total,
        observacion: localStorage.getItem("titulo_bono") || "desde modo bono",
        hora: new Date().toISOString(),
        color: "amarillo",
        tipo: "bono"
      };

      const { error } = await supabase.from("movimientos").insert([bonoFinal]);
      // 🔒 Desactivar bonos anteriores
const { error: errorDesactivar } = await supabase
.from("bonos_temp")
.update({ activo: false })
.eq("usuario_id", usuario_id)
.eq("activo", true);

if (errorDesactivar) {
console.error("❌ Error al desactivar bonos anteriores:", errorDesactivar);
}
      if (error) {
        alert("❌ Error al guardar el bono en la nube.");
        console.error("Error Supabase:", error);
        return;
      }

      alert(`✅ Bono registrado por $${total.toLocaleString("es-AR")}`);
    }
    localStorage.removeItem("titulo_bono");
    document.getElementById("usuario").disabled = false;
    document.getElementById("usuario").placeholder = "Usuario o Gasto";
    document.getElementById("usuario").value = "";
    // 🔄 Resetear todo
    modoBono = false;
    await guardarEstadoBonoEnNube(false);
    listaBonos = [];
    btnModoBono.textContent = "Modo Bono";
    pestañaActiva = "normal";
    tabsBonos.style.display = "flex";
    document.getElementById("registro-form").dataset.tab = "normal";
    document.getElementById("tab-normal").classList.add("activo-tab");
    document.getElementById("tab-bono").classList.remove("activo-tab");
    document.getElementById("tabla-bonos").style.display = "none";
    document.getElementById("tabla-registros").style.display = "table";
    form.reset();
    mostrarMovimientosDelDia(); // actualizar tabla original
  }
});

function mostrarTablaBonos() {
  const tablaBono = document.getElementById("tabla-bonos");
  if (!tablaBono) return;

  const cuerpo = tablaBono.querySelector("tbody");
  cuerpo.innerHTML = "";

  if (listaBonos.length === 0) {
    if (modoBono) {
      const tituloBono = localStorage.getItem("titulo_bono") || "BONO ACTIVO";
      const filaTitulo = document.createElement("tr");
      filaTitulo.innerHTML = `
        <td colspan="4" style="
          text-align: center;
          font-weight: bold;
          font-size: 1.1rem;
          color: gold;
          background: #111;
          padding: 8px 12px;
          border: 2px solid red;
        ">🎁 ${tituloBono.toUpperCase()}</td>
      `;
      cuerpo.appendChild(filaTitulo);
    } else {
      cuerpo.innerHTML = `<tr><td colspan="4" style="text-align:center; color:#aaa;">(No hay bonos activos ni anteriores en esta fecha)</td></tr>`;
    }
    return;
  }

  // ✅ Agrupar bonos por título
  const bonosAgrupados = {};
  listaBonos.forEach(b => {
    const titulo = (b.titulo || "SIN TÍTULO").toUpperCase();
    if (!bonosAgrupados[titulo]) bonosAgrupados[titulo] = [];
    bonosAgrupados[titulo].push(b);
  });

  // 🔁 Mostrar cada grupo
  Object.entries(bonosAgrupados).forEach(([titulo, grupo]) => {
    // 🟨 Fila de título del bono
    const filaTitulo = document.createElement("tr");
    filaTitulo.innerHTML = `
      <td colspan="4" style="
        text-align: center;
        font-weight: bold;
        font-size: 1.1rem;
        color: gold;
        background: #111;
        padding: 8px 12px;
        border: 2px solid red;
      ">🎁 ${titulo}</td>
    `;
    cuerpo.appendChild(filaTitulo);

    grupo.forEach((bono, index) => {
      const horaBono = new Date(bono.hora);
      const minutos = (new Date() - horaBono) / 60000;
      const puedeBorrar = minutos <= 5;

      const row = document.createElement("tr");
      row.dataset.index = index;

      row.innerHTML = `
        <td>${bono.usuario}</td>
        <td>$${Number(bono.monto).toLocaleString("es-AR")}</td>
        <td>${bono.observacion || ""}</td>
        <td>${horaBono.toLocaleTimeString("es-AR", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false
        })}</td>
      `;

      if (modoEliminar && puedeBorrar && modoBono) {
        row.classList.add("fila-eliminable");
        row.style.cursor = "pointer";
      }

      cuerpo.appendChild(row);
    });
  });
}
let listaBonos = [];

async function guardarBonoEnNube(bono) {
  bono.titulo = localStorage.getItem("titulo_bono") || "SIN TÍTULO";
  const { error } = await supabase.from("bonos_temp").insert([bono]);
  if (error) {
    console.error("❌ ERROR al guardar bono temporal:", JSON.stringify(error, null, 2));
    alert("Error al guardar bono. Revisá la consola.");
  }
  else await cargarBonosDesdeNube(); // refrescar
}

async function cargarBonosDesdeNube() {
  // Si hay bono activo, solo mostramos lo actual
  if (modoBono) {
    const { data, error } = await supabase
      .from("bonos_temp")
      .select("*")
      .eq("usuario_id", usuario_id)
      .eq("activo", true)
      .order("hora", { ascending: true });

    if (error) {
      console.error("Error al cargar bonos activos:", error);
      return;
    }

    listaBonos = data;
    mostrarTablaBonos();
    // Forzar scroll hacia tabla bono si se acaba de activar
setTimeout(() => {
  document.getElementById("tabla-bonos")?.scrollIntoView({ behavior: "smooth" });
}, 200);
    return;
  }

  // Si no hay bono activo, mostrar bonos anteriores según la fecha seleccionada
  const fechaSeleccionada = fechaFiltro.value;
  const inicio = new Date(`${fechaSeleccionada}T00:00:00`).toISOString();
  const fin = new Date(`${fechaSeleccionada}T23:59:59`).toISOString();

  const { data, error } = await supabase
    .from("bonos_temp")
    .select("*")
    .eq("usuario_id", usuario_id)
    .eq("activo", false)
    .gte("hora", inicio)
    .lte("hora", fin)
    .order("hora", { ascending: true });

  if (error) {
    console.error("Error al cargar bonos finalizados:", error);
    return;
  }

  listaBonos = data;
  mostrarTablaBonos();
}

async function eliminarBono(index) {
  const bono = listaBonos[index];
  if (!bono) return;

  const ahora = new Date();
  const horaBono = new Date(bono.hora);
  const minutos = (ahora - horaBono) / 60000;

  if (minutos > 5) {
    alert("Solo podés eliminar un bono en los primeros 5 minutos.");
    return;
  }

  const { error } = await supabase
    .from("bonos_temp")
    .update({ activo: false })
    .eq("id", bono.id);

  if (error) console.error("Error al eliminar bono:", error);
  else await cargarBonosDesdeNube();
}
async function guardarEstadoBonoEnNube(activo) {
  const ahora = new Date().toISOString();
  const titulo = localStorage.getItem("titulo_bono") || "SIN TÍTULO";

  await supabase
    .from("estado_bono")
    .upsert([{ usuario_id, activo, hora_inicio: ahora, titulo }], {
      onConflict: ["usuario_id"]
    });
}
async function guardarEstadoControlEnNube(abierto) {
  const fecha = fechaFiltro.value;
  await supabase
    .from("estado_control")
    .upsert([{ usuario_id, fecha, estado: abierto }], {
      onConflict: ["usuario_id", "fecha"]
    });
}
// ✅ Manejar clic en tabla de bonos para eliminar si está en modoEliminar
document.getElementById("tabla-bonos").addEventListener("click", async (e) => {
  if (!modoEliminar) return;

  const fila = e.target.closest("tr");
  if (!fila) return;

  const index = parseInt(fila.dataset.index);
  const bono = listaBonos[index];
  if (!bono) return;

  const ahora = new Date();
  const horaBono = new Date(bono.hora);
  const minutos = (ahora - horaBono) / 60000;

  if (minutos > 5) {
    alert("Solo podés eliminar un bono en los primeros 5 minutos.");
    return;
  }

  const { error } = await supabase
    .from("bonos_temp")
    .update({ activo: false })
    .eq("id", bono.id);

  if (error) {
    console.error("Error al eliminar bono:", error);
    alert("No se pudo borrar el bono");
    return;
  }

  await cargarBonosDesdeNube();
});
const btnIrAbajo = document.getElementById("btn-ir-abajo");

window.addEventListener("scroll", () => {
  const scrollY = window.scrollY;
  const altura = document.documentElement.scrollHeight - window.innerHeight;

  btnVolverArriba.style.display = scrollY > 100 ? "block" : "none";
  btnIrAbajo.style.display = scrollY < altura - 100 ? "block" : "none"; // 👈 AGREGADO
});

// mostrar el de abajo siempre desde el inicio
btnIrAbajo.style.display = "block";

btnIrAbajo.addEventListener("click", () => {
  window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
});
document.getElementById("btn-subir-control").addEventListener("click", () => {
  const clave = prompt("Ingresá la contraseña para subir control:");
  
  if (clave === null || clave.trim() === "") {
    // Si cancela o no escribe nada, no muestra error
    return;
  }

  if (clave !== "120212") {
    alert("❌ Clave incorrecta");
    return;
  }

  document.getElementById("modal-subir-control").style.display = "flex";
});

function cerrarModalSubirControl() {
  const form = document.getElementById("form-subir-control");
  const listaGastos = document.getElementById("lista-gastos");

  if (form) form.reset();
  if (listaGastos) {
    listaGastos.innerHTML = "";

    const wrapper = document.createElement("div");
    wrapper.style.position = "relative";
    wrapper.style.width = "fit-content";

    const input = document.createElement("input");
    input.type = "text";
    input.name = "gasto";
    input.placeholder = "Gasto adicional";
    input.style.paddingLeft = "20px";
    input.style.width = "270px";

    const peso = document.createElement("span");
    peso.textContent = "$";
    peso.style.position = "absolute";
    peso.style.left = "8px";
    peso.style.top = "50%";
    peso.style.transform = "translateY(-50%)";
    peso.style.color = "#555";
    peso.style.fontWeight = "bold";

    wrapper.appendChild(peso);
    wrapper.appendChild(input);
    listaGastos.appendChild(wrapper);
  }

  document.getElementById("modal-subir-control").style.display = "none";
}

// 👉 SUBIR CONTROL A LA NUBE
document.getElementById("form-subir-control").addEventListener("submit", async (e) => {
  e.preventDefault();

  const formData = new FormData(e.target);
  const cuentas = {};
  const fichas = {};
  const gastos = [];

  for (let [key, value] of formData.entries()) {
    if (key.startsWith("cuenta")) {
      cuentas[key] = Number(value);
    } else if (key.startsWith("fichas")) {
      fichas[key] = Number(value);
    } else if (key === "gasto") {
      const partes = value.trim().split(" ");
      const numero = parseInt(partes[0].replace(/\D/g, ""), 10);
      const descripcion = partes.slice(1).join(" ");
      const textoFormateado = isNaN(numero)
  ? value.trim().replace(/^•\s*/, "")
  : `$${numero.toLocaleString("es-AR")}` + (descripcion ? ` ${descripcion}` : "");
      gastos.push(textoFormateado);
    }
  }

  const fecha = new Date().toLocaleDateString("es-AR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).split("/").reverse().join("-");
const hora_envio = new Date().toLocaleTimeString("es-AR", {
  hour: "2-digit",
  minute: "2-digit",
  hour12: false
});

console.log("🟡 Enviando a Supabase:", {
  usuario_id,
  fecha,
  hora_envio,
  cuentas,
  fichas,
  gastos
});

const { error } = await supabase.from("controles_subidos").insert([{
  usuario_id,
  fecha,
  hora_envio,
  cuentas,
  fichas,
  gastos
}]);

  if (error) {
    console.error("❌ Error al subir control:", error);
    alert("Hubo un error al guardar el control.");
    return;
  }

  alert("✅ Control enviado correctamente.");
  document.getElementById("form-subir-control").reset();
  cerrarModalSubirControl();
});
document.getElementById("agregar-gasto").addEventListener("click", () => {
  const container = document.getElementById("gastos-container");

  const wrapper = document.createElement("div");
  wrapper.className = "gasto-wrapper";

  const div = document.createElement("div");
  div.className = "input-con-signo-largo";

  const span = document.createElement("span");
  span.textContent = "$";

  const input = document.createElement("input");
  input.type = "text";
  input.name = "gasto";

  div.appendChild(span);
  div.appendChild(input);
  wrapper.appendChild(div);
  container.appendChild(wrapper);
});
document.querySelectorAll("input[type='number'], input[type='text']").forEach((input, i, all) => {
  input.addEventListener("keydown", (e) => {
    const inputs = Array.from(document.querySelectorAll("input[type='number'], input[type='text']"));
    const index = inputs.indexOf(e.target);
    if (["Enter", "ArrowDown"].includes(e.key)) {
      e.preventDefault();
      if (inputs[index + 1]) inputs[index + 1].focus();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (inputs[index - 1]) inputs[index - 1].focus();
    }
  });
});
document.getElementById("fechaFiltro")?.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    document.getElementById("btn-buscar-fecha").click();
  }
});
// 🔍 Filtrar resultados por usuario en vivo
document.getElementById("input-buscar-usuario").addEventListener("input", () => {
  const texto = document.getElementById("input-buscar-usuario").value.toLowerCase();

  if (pestañaActiva === "normal") {
    Array.from(document.querySelectorAll("#tabla-registros tbody tr")).forEach((fila) => {
      const usuario = fila.children[0]?.textContent?.toLowerCase() || "";
      fila.style.display = usuario.includes(texto) ? "" : "none";
    });
  }

  if (pestañaActiva === "bono") {
    Array.from(document.querySelectorAll("#tabla-bonos tbody tr")).forEach((fila) => {
      const columnas = fila.querySelectorAll("td");
      const textoFila = Array.from(columnas).map(td => td.textContent.toLowerCase()).join(" ");
      const esSeparador = columnas.length === 1 || fila.innerText.includes("🎁");

      // Siempre mostrar separadores con título
      if (esSeparador) {
        fila.style.display = "";
        return;
      }

      fila.style.display = textoFila.includes(texto) ? "" : "none";
    });
  }
});
document.getElementById("tab-tres").addEventListener("click", () => {
  pestañaActiva = "tres";

  // Activar visual el botón 3
  document.getElementById("tab-tres").classList.add("activo-tab");
  document.getElementById("tab-normal").classList.remove("activo-tab");
  document.getElementById("tab-bono").classList.remove("activo-tab");

  // Mostrar el panel de juegos si existe
  const panel = document.getElementById("panel-juegos");
  if (panel) panel.style.display = "block";

  // Ocultar tablas normales
  document.getElementById("tabla-registros").style.display = "none";
  document.getElementById("tabla-bonos").style.display = "none";

  // Bloquear el form
  habilitarFormulario(false);
});