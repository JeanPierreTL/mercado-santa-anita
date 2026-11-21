/* MODELO - Datos iniciales de ejemplo (simulan la base de datos PostgreSQL del diseno) */
(function (M) {
  M.hoy = new Date().toISOString().slice(0, 10);

  M.seed = function () {
    var hoy = M.hoy, r1 = '20512345678', r2 = '10456789012', i, pu = [];
    for (i = 1; i <= 12; i++) pu.push({ id: 'P-' + (i < 10 ? '0' : '') + i, ruc: i === 1 ? r1 : (i === 2 ? r2 : null) });
    return {
      seq: { comp: 4, den: 2, cita: 3, serv: 2, ped: 2 },
      comerciantes: [
        { ruc: r1, dni: '41234567', nombre: 'Frutas del Valle SAC', rubro: 'Frutas', estado: 'Validado' },
        { ruc: r2, dni: '45678901', nombre: 'Tubérculos Andinos', rubro: 'Tubérculos', estado: 'Validado' }
      ],
      compradores: [
        { id: 'C1', nombre: 'Restaurante El Sabor' },
        { id: 'C2', nombre: 'Bodega Lucía' }
      ],
      transportistas: [
        { id: 'T1', nombre: 'Transportes Andes SAC' },
        { id: 'T2', nombre: 'Carlos Quispe' }
      ],
      puestos: pu,
      tarifas: [
        { id: 1, ruc: r1, monto: 150, estado: 'Pagado', venc: '2026-12-31' },
        { id: 2, ruc: r2, monto: 150, estado: 'Pendiente', venc: '2026-10-31' }
      ],
      ofertas: [
        { id: 1, ruc: r1, producto: 'Mandarina', unidad: 'saco', precio: 80, stock: 115 },
        { id: 2, ruc: r2, producto: 'Papa blanca', unidad: 'saco', precio: 45, stock: 200 },
        { id: 3, ruc: r2, producto: 'Camote', unidad: 'saco', precio: 38, stock: 90 }
      ],
      pedidos: [
        { id: 1, oid: 1, ruc: r1, producto: 'Mandarina', cant: 5, pu: 80, total: 400, estado: 'Reservado', cid: 'C2', cnombre: 'Bodega Lucía' }
      ],
      ventas: [
        { num: 'B001-000001', fecha: hoy, ruc: r2, producto: 'Papa blanca', cant: 20, pu: 44, total: 880, cid: 'C1', cnombre: 'Restaurante El Sabor' },
        { num: 'B001-000002', fecha: hoy, ruc: r2, producto: 'Papa blanca', cant: 10, pu: 48, total: 480, cid: 'C2', cnombre: 'Bodega Lucía' },
        { num: 'B001-000003', fecha: hoy, ruc: r1, producto: 'Mandarina', cant: 15, pu: 82, total: 1230, cid: 'C1', cnombre: 'Restaurante El Sabor' }
      ],
      slots: [
        { id: 'S1', h: '06:00 - 08:00', cap: 2 },
        { id: 'S2', h: '08:00 - 10:00', cap: 2 },
        { id: 'S3', h: '10:00 - 12:00', cap: 1 }
      ],
      citas: [
        { cod: 'CITA-0000', placa: 'XYZ-999', tid: 'T1', slot: 'S1', estado: 'Vencida', ingreso: null, salida: null, anden: null },
        { cod: 'CITA-0001', placa: 'ABC-123', tid: 'T1', slot: 'S1', estado: 'Vigente', ingreso: null, salida: null, anden: null },
        { cod: 'CITA-0002', placa: 'DEF-456', tid: 'T2', slot: 'S1', estado: 'Completada', ingreso: '07:10', salida: '08:05', anden: 'A-2' }
      ],
      andenes: ['A-1', 'A-2', 'A-3', 'A-4', 'A-5', 'A-6'],
      bitacora: [
        { h: '08:05', cod: 'CITA-0002', placa: 'DEF-456', ev: 'Salida', det: 'Andén A-2 liberado' },
        { h: '07:10', cod: 'CITA-0002', placa: 'DEF-456', ev: 'Ingreso autorizado', det: 'Andén A-2' }
      ],
      estibadores: [
        { cod: 'EST-001', nombre: 'José Ramos', dni: '40111222', estado: 'Habilitado', libre: true },
        { cod: 'EST-002', nombre: 'Carlos Soto', dni: '40333444', estado: 'Habilitado', libre: true },
        { cod: 'EST-003', nombre: 'Luis Rojas', dni: '40555666', estado: 'Inhabilitado', libre: true }
      ],
      servicios: [
        { id: 1, tipo: 'Sacos', peso: 1.5, monto: 60, est: 'Carlos Soto (EST-002)', ec: 'EST-002', estado: 'Terminado', ownerId: r2, ownerName: 'Tubérculos Andinos' }
      ],
      denuncias: [
        { cod: 'DEN-0001', texto: 'Me pidieron S/ 20 para dejarme descargar', lugar: 'Puerta 2', estado: 'Recibida', acciones: ['Recibida'] }
      ],
      audit: [
        { h: '06:30', quien: 'Sistema', a: 'Datos de ejemplo cargados' }
      ]
    };
  };
})((window.MER = window.MER || {}));
