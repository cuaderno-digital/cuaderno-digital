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

const abrirTurnoBtn = document.getElementById("btn-abrir-turno");
const cerrarTurnoBtn = document.getElementById("btn-cerrar-turno");
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
form.addEventListener("submit", (e) => {
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
    console.log("ID asignado:", data[0].id);

    // 👇 Esta línea va acá: actualiza la vista con los movimientos REALES
    mostrarMovimientosDeFecha(new Date(fechaFiltro.value));
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
  .eq("usuario_id", usuario_id)
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
    } else if (mov.color === "rojo") {
      row.classList.add("destacado-rojo");
    } else if (mov.color === "turno") {
      row.classList.add("destacado-turno");
    }

    const fechaClave = fechaFiltro.value;
const clave = `${fechaClave}-${mov.id}`;
if (!modoControl && estadoControl[clave]?.error) {
      row.classList.add("fila-error-control");
    }

    if (modoEliminar && !mov.tipo) {
      row.style.cursor = "url('https://cdn-icons-png.flaticon.com/512/1214/1214428.png'), auto";
      row.classList.add("modo-eliminar");
    }
  });

  if (modoEliminar) resaltarFilasEliminables();
  mostrarControlEnFilas();
await cargarEstadoControlDesdeNube(fechaFiltro.value);
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
// ✅ Mostrar todo lo del día al cargar
function mostrarMovimientosDelDia() {
  const hoy = new Date();
const inicio = new Date(hoy.setHours(0, 0, 0, 0)).toISOString();
const fin = new Date(hoy.setHours(23, 59, 59, 999)).toISOString();

supabase.from("movimientos")
  .select("*")
  .eq("usuario_id", usuario_id)
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
});


// ✅ Marcar visualmente qué filas se pueden eliminar
function resaltarFilasEliminables() {
  const ahora = new Date();
  Array.from(tabla.rows).forEach((row) => {
    const index = parseInt(row.dataset.index);
    const mov = movimientos[index];
    if (!mov || mov.tipo === "turno") return;

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
  if (!mov || mov.tipo === "turno") return;

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
      .eq("usuario_id", usuario_id)
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


// ✅ Botón ABRIR TURNO con modal
abrirTurnoBtn.addEventListener("click", () => {
  if (turnoAbierto) {
    alert("El turno ya está abierto.");
    return;
  }
  document.getElementById("modal-turno").style.display = "flex";
  document.getElementById("input-turno-nombre").value = "";
  setTimeout(() => document.getElementById("input-turno-nombre").focus(), 100);
});


// ✅ Botón CERRAR TURNO
cerrarTurnoBtn.addEventListener("click", () => {
  if (!turnoAbierto) {
    alert("El turno ya está cerrado.");
    return;
  }

  turnoAbierto = false;
  localStorage.setItem("turnoAbierto", false);
  habilitarFormulario(turnoAbierto);
actualizarCartelTurno();
  agregarFilaTurno("TURNO CERRADO");
  document.getElementById("btn-pendiente").disabled = true;
});


// Ejecutar al inicio correctamente
(async () => {
  actualizarFechaHora();
  setFechaActualEnFiltro();
  
  turnoAbierto = await verificarTurnoAbiertoDesdeNube();
  mostrarMovimientosDelDia();
  habilitarFormulario(turnoAbierto);
  actualizarCartelTurno();
  document.getElementById("btn-pendiente").disabled = !turnoAbierto;
})();

// 🔒 Agregamos referencias para botones de control
const btnHacerControl = document.getElementById("btn-hacer-control");
const btnTerminarControl = document.getElementById("btn-terminar-control");

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
const estado = estadoControl[clave];

    if (!modoControl && !estado) return;

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
      // ✅ Panel
      tildadoPanel.addEventListener("click", () => {
        const fechaClave = fechaFiltro.value;
        const clave = `${fechaClave}-${mov.id}`;
        estadoControl[clave] = estadoControl[clave] || {};
        estadoControl[clave].panel = !estadoControl[clave].panel;
        guardarEstadoControl();
        guardarEstadoEnNube(mov.id, fechaClave, estadoControl[clave]);
        setTimeout(() => mostrarMovimientosDeFecha(new Date(fechaFiltro.value)), 10);
      });

// 💰 Pago
tildadoPago.addEventListener("click", () => {
  const fechaClave = fechaFiltro.value;
  const clave = `${fechaClave}-${mov.id}`;
  estadoControl[clave] = estadoControl[clave] || {};
  estadoControl[clave].pago = !estadoControl[clave].pago;
  guardarEstadoControl();
  guardarEstadoEnNube(mov.id, fechaClave, estadoControl[clave]);
  setTimeout(() => mostrarMovimientosDeFecha(new Date(fechaFiltro.value)), 10);
});

// ❌ Error (solo este tiene que quedar)
cruzado.addEventListener("click", () => {
  const fechaClave = fechaFiltro.value;
  const clave = `${fechaClave}-${mov.id}`;
  estadoControl[clave] = estadoControl[clave] || {};
  estadoControl[clave].error = !estadoControl[clave].error;
  guardarEstadoControl();
  guardarEstadoEnNube(mov.id, fechaClave, estadoControl[clave]);
  setTimeout(() => mostrarMovimientosDeFecha(new Date(fechaFiltro.value)), 10);
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
btnHacerControl.addEventListener("click", () => {
  if (modoControl) {
    alert("El control ya está en curso.");
    return;
  }

  const clave = prompt("Ingresá la contraseña de control:");
  if (clave === "120212") {
    modoControl = true;
    mostrarMovimientosDeFecha(new Date(fechaFiltro.value));
    alert("Modo control activado");
  } else {
    alert("Contraseña incorrecta");
  }
});

// 🔒 Botón para finalizar control
btnTerminarControl.addEventListener("click", () => {
  if (!modoControl) {
    alert("No hay ningún control en curso para finalizar.");
    return;
  }

  modoControl = false;
  alert("Control finalizado. Todo queda guardado.");
  mostrarMovimientosDeFecha(new Date(fechaFiltro.value));
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

// Ejecutamos la función al inicio
const ultimaLimpieza = localStorage.getItem("ultimaLimpieza");
const hoyTexto = new Date().toISOString().split("T")[0];
if (ultimaLimpieza !== hoyTexto) {
  eliminarDatosViejos();
  localStorage.setItem("ultimaLimpieza", hoyTexto);
}
