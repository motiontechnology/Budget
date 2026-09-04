const catalogoConceptosBD = [
    "FLSmidth",
    "Aplazo",
    "Nómina Quincenal",
    "Telcel / Internet",
    "Servicios (CFE, Agua)",
    "Despensa",
    "Suscripciones (Netflix, Spotify)",
    "Fondo de Emergencia",
    "Gasolina / Transporte"
];

let transacciones = [];

const formatoMoneda = new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN'
});

document.addEventListener('DOMContentLoaded', () => {
    cargarConceptosSelect();
    renderizarTabla();
});

function cargarConceptosSelect() {
    const select = document.getElementById('nombre');
    select.innerHTML = '<option value="" disabled selected>Selecciona un concepto...</option>';

    catalogoConceptosBD.forEach(concepto => {
        const option = document.createElement('option');
        option.value = concepto;
        option.textContent = concepto;
        select.appendChild(option);
    });
}

// Agregar Transacción
document.getElementById('presupuestoForm').addEventListener('submit', function (e) {
    e.preventDefault();

    const montoMensual = parseFloat(document.getElementById('monto_mensual').value);
    const tipo = document.getElementById('tipo').value;

    const montoQuincenal = montoMensual / 2;
    const montoSemanal = montoMensual / 4;
    const balance = tipo === 'Ingreso' ? 'POSITIVO' : 'NEGATIVO';

    const nuevaTransaccion = {
        id: Date.now(), // Usamos la marca de tiempo como ID único temporal
        nombre: document.getElementById('nombre').value,
        estatus: document.getElementById('estatus').value,
        fecha_de_pago: document.getElementById('fecha_de_pago').value,
        monto_mensual: montoMensual,
        monto_quincenal: montoQuincenal,
        monto_semanal: montoSemanal,
        restante: montoMensual,
        balance: balance
    };

    transacciones.unshift(nuevaTransaccion);
    renderizarTabla();
    this.reset(); // Limpiamos los campos
});

// Función para Resetear / Quitar un gasto
window.quitarTransaccion = function (id) {
    // Filtramos el array para conservar todos excepto el que coincida con el ID
    transacciones = transacciones.filter(t => t.id !== id);
    renderizarTabla(); // Redibujamos la tabla
};

// Renderizar Tabla y Totales
function renderizarTabla() {
    const tbody = document.getElementById('tablaBody');
    const tfoot = document.getElementById('tablaFooter');
    tbody.innerHTML = '';

    if (transacciones.length === 0) {
        tbody.innerHTML = `<tr><td colspan="9" class="text-center py-8 text-slate-500">Sin transacciones locales. Agrega una arriba.</td></tr>`;
        tfoot.classList.add('hidden'); // Ocultar totales si está vacío
        return;
    }

    tfoot.classList.remove('hidden'); // Mostrar totales

    // Variables para acumular sumas
    let sumMensual = 0;
    let sumQuincenal = 0;
    let sumSemanal = 0;
    let sumRestante = 0;

    transacciones.forEach(item => {
        const tr = document.createElement('tr');
        tr.className = "hover:bg-slate-800/50 transition-colors";

        // Badges
        let badgeEstatus = '';
        if (item.estatus === 'PAGADO') {
            badgeEstatus = '<span class="bg-emerald-900/40 text-emerald-400 border border-emerald-800 px-2 py-0.5 rounded text-xs font-bold tracking-wide">PAGADO</span>';
        } else if (item.estatus === 'PENDIENTE') {
            badgeEstatus = '<span class="bg-red-900/40 text-red-400 border border-red-800 px-2 py-0.5 rounded text-xs font-bold tracking-wide">PENDIENTE</span>';
        } else if (item.estatus === 'AHORRO') {
            badgeEstatus = '<span class="bg-blue-900/40 text-blue-400 border border-blue-800 px-2 py-0.5 rounded text-xs font-bold tracking-wide">AHORRO</span>';
        }

        const badgeBalance = item.balance === 'POSITIVO'
            ? '<span class="bg-slate-800 text-emerald-400 px-2 py-1 rounded-md text-xs font-bold flex items-center justify-center gap-1"><span class="w-1.5 h-1.5 rounded-full bg-emerald-400"></span> POSITIVO</span>'
            : '<span class="bg-slate-800 text-red-400 px-2 py-1 rounded-md text-xs font-bold flex items-center justify-center gap-1"><span class="w-1.5 h-1.5 rounded-full bg-red-400"></span> NEGATIVO</span>';

        const mult = item.balance === 'NEGATIVO' ? -1 : 1;

        // Sumar a los totales
        sumMensual += (item.monto_mensual * mult);
        sumQuincenal += (item.monto_quincenal * mult);
        sumSemanal += (item.monto_semanal * mult);
        sumRestante += (item.restante * mult);

        // Botón Eliminar / Resetear
        const btnQuitar = `
                    <button onclick="quitarTransaccion(${item.id})" class="text-slate-500 hover:text-red-400 transition-colors p-1" title="Eliminar/Resetear">
                        <svg class="w-5 h-5 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                        </svg>
                    </button>
                `;

        tr.innerHTML = `
                    <td class="px-4 py-3">${badgeEstatus}</td>
                    <td class="px-4 py-3 font-medium text-slate-200">${item.nombre}</td>
                    <td class="px-4 py-3 text-slate-400">${item.fecha_de_pago}</td>
                    <td class="px-4 py-3 text-right text-slate-300 font-mono text-xs">${formatoMoneda.format(item.monto_mensual * mult)}</td>
                    <td class="px-4 py-3 text-right text-slate-300 font-mono text-xs">${formatoMoneda.format(item.monto_quincenal * mult)}</td>
                    <td class="px-4 py-3 text-right text-slate-300 font-mono text-xs">${formatoMoneda.format(item.monto_semanal * mult)}</td>
                    <td class="px-4 py-3 text-right text-slate-300 font-mono text-xs">${formatoMoneda.format(item.restante * mult)}</td>
                    <td class="px-4 py-3 flex justify-center">${badgeBalance}</td>
                    <td class="px-4 py-3 text-center">${btnQuitar}</td>
                `;
        tbody.appendChild(tr);
    });

    // Función interna para pintar verde/rojo según el total
    const aplicarColorTotal = (elementoId, valor) => {
        const el = document.getElementById(elementoId);
        el.textContent = formatoMoneda.format(valor);
        // Si el balance neto es negativo, se pinta rojo. Si sobra dinero, verde.
        el.className = `px-4 py-4 text-right font-mono text-sm ${valor >= 0 ? 'text-emerald-400' : 'text-red-400'}`;
    };

    aplicarColorTotal('totalMensual', sumMensual);
    aplicarColorTotal('totalQuincenal', sumQuincenal);
    aplicarColorTotal('totalSemanal', sumSemanal);
    aplicarColorTotal('totalRestante', sumRestante);
}