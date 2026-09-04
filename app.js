const catalogoConceptosBD = [
    "FLSmidth",
    "Aplazo",
    "Nómina Quincenal",
    "Telcel / Internet",
    "Servicios (CFE, Agua)",
    "Despensa",
    "Suscripciones (Netflix, Spotify)",
    "Fondo de Emergencia",
    "Gasolina / Transporte",
    "Inversión / Cetes"
];

let transacciones = [];

const formatoMoneda = new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' });

document.addEventListener('DOMContentLoaded', () => {
    cargarConceptosSelect();
    renderizarTabla();
});

// Lógica de UX: Deshabilitar el Tipo si es Ahorro
document.getElementById('estatus').addEventListener('change', function (e) {
    const tipoSelect = document.getElementById('tipo');
    if (e.target.value === 'AHORRO') {
        tipoSelect.value = 'Ingreso';
        tipoSelect.disabled = true;
        tipoSelect.classList.add('opacity-50', 'cursor-not-allowed'); // Efecto visual de bloqueado
    } else {
        tipoSelect.disabled = false;
        tipoSelect.classList.remove('opacity-50', 'cursor-not-allowed');
    }
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

document.getElementById('presupuestoForm').addEventListener('submit', function (e) {
    e.preventDefault();

    const montoMensual = parseFloat(document.getElementById('monto_mensual').value);
    const estatusVal = document.getElementById('estatus').value;

    // Si el estatus es AHORRO, forzamos el tipo a Ingreso ignorando el select
    const tipo = estatusVal === 'AHORRO' ? 'Ingreso' : document.getElementById('tipo').value;

    const nuevaTransaccion = {
        id: Date.now(),
        nombre: document.getElementById('nombre').value,
        estatus: estatusVal,
        fecha_de_pago: document.getElementById('fecha_de_pago').value,
        monto_mensual: montoMensual,
        monto_quincenal: montoMensual / 2,
        monto_semanal: montoMensual / 4,
        restante: montoMensual,
        balance: tipo === 'Ingreso' ? 'POSITIVO' : 'NEGATIVO'
    };

    transacciones.unshift(nuevaTransaccion);
    renderizarTabla();

    // Limpiar formulario y resetear estados visuales
    this.reset();
    const tipoSelect = document.getElementById('tipo');
    tipoSelect.disabled = false;
    tipoSelect.classList.remove('opacity-50', 'cursor-not-allowed');
});

window.quitarTransaccion = function (id) {
    transacciones = transacciones.filter(t => t.id !== id);
    renderizarTabla();
};

function renderizarTabla() {
    // Referencias Tabla Principal
    const tbody = document.getElementById('tablaBody');
    const tfoot = document.getElementById('tablaFooter');
    // Referencias Tabla Ahorro
    const tbodyAh = document.getElementById('tablaAhorroBody');
    const tfootAh = document.getElementById('tablaAhorroFooter');

    tbody.innerHTML = '';
    tbodyAh.innerHTML = '';

    let sumMensual = 0, sumQuincenal = 0, sumSemanal = 0, sumRestante = 0;
    let sumAhMensual = 0, sumAhQuincenal = 0, sumAhSemanal = 0, sumAhRestante = 0;
    let hayPrincipal = false, hayAhorro = false;

    transacciones.forEach(item => {
        const tr = document.createElement('tr');
        tr.className = "hover:bg-slate-800/50 transition-colors";

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
        const valorCalculado = (valor) => formatoMoneda.format(valor * mult);

        const btnQuitar = `
                    <button onclick="quitarTransaccion(${item.id})" class="text-slate-500 hover:text-red-400 transition-colors p-1" title="Eliminar">
                        <svg class="w-5 h-5 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                    </button>`;

        tr.innerHTML = `
                    <td class="px-4 py-3">${badgeEstatus}</td>
                    <td class="px-4 py-3 font-medium text-slate-200">${item.nombre}</td>
                    <td class="px-4 py-3 text-slate-400">${item.fecha_de_pago}</td>
                    <td class="px-4 py-3 text-right text-slate-300 font-mono text-xs">${valorCalculado(item.monto_mensual)}</td>
                    <td class="px-4 py-3 text-right text-slate-300 font-mono text-xs">${valorCalculado(item.monto_quincenal)}</td>
                    <td class="px-4 py-3 text-right text-slate-300 font-mono text-xs">${valorCalculado(item.monto_semanal)}</td>
                    <td class="px-4 py-3 text-right text-slate-300 font-mono text-xs">${valorCalculado(item.restante)}</td>
                    <td class="px-4 py-3 flex justify-center">${badgeBalance}</td>
                    <td class="px-4 py-3 text-center">${btnQuitar}</td>
                `;

        if (item.estatus === 'AHORRO') {
            tbodyAh.appendChild(tr);
            sumAhMensual += (item.monto_mensual * mult);
            sumAhQuincenal += (item.monto_quincenal * mult);
            sumAhSemanal += (item.monto_semanal * mult);
            sumAhRestante += (item.restante * mult);
            hayAhorro = true;
        } else {
            tbody.appendChild(tr);
            sumMensual += (item.monto_mensual * mult);
            sumQuincenal += (item.monto_quincenal * mult);
            sumSemanal += (item.monto_semanal * mult);
            sumRestante += (item.restante * mult);
            hayPrincipal = true;
        }
    });

    if (!hayPrincipal) {
        tbody.innerHTML = `<tr><td colspan="9" class="text-center py-6 text-slate-500">Sin movimientos activos.</td></tr>`;
        tfoot.classList.add('hidden');
    } else {
        tfoot.classList.remove('hidden');
        document.getElementById('totalMensual').textContent = formatoMoneda.format(sumMensual);
        document.getElementById('totalMensual').className = `px-4 py-4 text-right font-mono text-sm ${sumMensual >= 0 ? 'text-emerald-400' : 'text-red-400'}`;

        document.getElementById('totalQuincenal').textContent = formatoMoneda.format(sumQuincenal);
        document.getElementById('totalQuincenal').className = `px-4 py-4 text-right font-mono text-sm ${sumQuincenal >= 0 ? 'text-emerald-400' : 'text-red-400'}`;

        document.getElementById('totalSemanal').textContent = formatoMoneda.format(sumSemanal);
        document.getElementById('totalSemanal').className = `px-4 py-4 text-right font-mono text-sm ${sumSemanal >= 0 ? 'text-emerald-400' : 'text-red-400'}`;

        document.getElementById('totalRestante').textContent = formatoMoneda.format(sumRestante);
        document.getElementById('totalRestante').className = `px-4 py-4 text-right font-mono text-sm ${sumRestante >= 0 ? 'text-emerald-400' : 'text-red-400'}`;
    }

    if (!hayAhorro) {
        tbodyAh.innerHTML = `<tr><td colspan="9" class="text-center py-6 text-slate-500">Aún no hay registros de ahorro.</td></tr>`;
        tfootAh.classList.add('hidden');
    } else {
        tfootAh.classList.remove('hidden');
        document.getElementById('totalAhMensual').textContent = formatoMoneda.format(sumAhMensual);
        document.getElementById('totalAhQuincenal').textContent = formatoMoneda.format(sumAhQuincenal);
        document.getElementById('totalAhSemanal').textContent = formatoMoneda.format(sumAhSemanal);
        document.getElementById('totalAhRestante').textContent = formatoMoneda.format(sumAhRestante);
    }
}