const test = require('node:test');
const assert = require('node:assert/strict');
const { nuevoEntorno } = require('./harness');

/* ---- Pruebas unitarias: utilidades ---- */
test('U.esc escapa HTML (defensa contra XSS, OWASP A03)', () => {
  const { M } = nuevoEntorno();
  assert.equal(M.U.esc('<script>alert("x")</script>'), '&lt;script&gt;alert(&quot;x&quot;)&lt;/script&gt;');
  assert.equal(M.U.esc(null), '');
});
test('U.money y U.pad formatean valores', () => {
  const { M } = nuevoEntorno();
  assert.equal(M.U.money(12.5), 'S/ 12.50');
  assert.equal(M.U.pad(7, 4), '0007');
});

/* ---- Control de acceso por rol (RBAC, OWASP A01) ---- */
test('Auth.require permite el rol correcto', () => {
  const t = nuevoEntorno(); t.entrarComo('Administrador');
  assert.equal(t.M.Auth.require(['Administrador']), true);
});
test('Auth.require responde error 403 a un rol no autorizado', () => {
  const t = nuevoEntorno(); t.entrarComo('Comprador');
  assert.equal(t.M.Auth.require(['Administrador']), false);
  assert.match(t.toasts.at(-1), /403/);
});
test('Sin sesión ninguna acción protegida se ejecuta', () => {
  const t = nuevoEntorno(); t.M.Store.me = null;
  const antes = t.M.Store.S.estibadores.length;
  t.campo({ e_n: 'Intruso', e_d: '12345678' });
  t.M.Actions.registrarEst();
  assert.equal(t.M.Store.S.estibadores.length, antes);
});
test('Un comerciante no puede registrar estibadores (HU-11)', () => {
  const t = nuevoEntorno(); t.entrarComo('Comerciante');
  const antes = t.M.Store.S.estibadores.length;
  t.campo({ e_n: 'Pedro', e_d: '12345678' });
  t.M.Actions.registrarEst();
  assert.equal(t.M.Store.S.estibadores.length, antes);
  assert.match(t.toasts.at(-1), /403/);
});

/* ---- MER-4 Estibaje ---- */
test('HU-11: el administrador registra un estibador con código único', () => {
  const t = nuevoEntorno(); t.entrarComo('Administrador');
  t.campo({ e_n: 'Luis Rojas', e_d: '87654321' });
  t.M.Actions.registrarEst();
  const e = t.M.Store.S.estibadores.at(-1);
  assert.equal(e.nombre, 'Luis Rojas'); assert.match(e.cod, /^EST-\d{3}$/);
});
test('HU-11: rechaza DNI inválido y DNI repetido', () => {
  const t = nuevoEntorno(); t.entrarComo('Administrador');
  const antes = t.M.Store.S.estibadores.length;
  t.campo({ e_n: 'Ana', e_d: '123' }); t.M.Actions.registrarEst();
  const dniExistente = t.M.Store.S.estibadores[0].dni;
  t.campo({ e_n: 'Ana', e_d: dniExistente }); t.M.Actions.registrarEst();
  assert.equal(t.M.Store.S.estibadores.length, antes);
});
test('HU-12: la tarifa oficial se calcula por tonelada y respeta el mínimo', () => {
  const t = nuevoEntorno(); t.entrarComo('Comerciante');
  t.campo({ s_t: 'Sacos', s_p: '2' }); t.M.Actions.solicitar();
  assert.equal(t.M.Store.S.servicios.at(-1).monto, 80);      // 40 x 2 t
  t.campo({ s_t: 'Granel', s_p: '0.1' }); t.M.Actions.solicitar();
  assert.equal(t.M.Store.S.servicios.at(-1).monto, t.M.TARIFA_MIN);
});
test('HU-12: nunca se asigna un estibador inhabilitado', () => {
  const t = nuevoEntorno(); t.entrarComo('Comerciante');
  for (let i = 0; i < 5; i++) { t.campo({ s_t: 'Cajas', s_p: '1' }); t.M.Actions.solicitar(); }
  const inhab = t.M.Store.S.estibadores.filter(e => e.estado === 'Inhabilitado').map(e => e.cod);
  assert.ok(t.M.Store.S.servicios.every(s => !inhab.includes(s.ec)));
});

/* ---- HU-13 Denuncia confidencial (OWASP A09 sin exponer al denunciante) ---- */
test('HU-13: la denuncia no guarda ni audita la identidad del denunciante', () => {
  const t = nuevoEntorno(); t.entrarComo('Comerciante');
  const nombre = t.M.Store.me.name;
  t.campo({ d_t: 'Me cobraron de más', d_l: 'Andén 3' });
  t.M.Actions.denunciar();
  const d = t.M.Store.S.denuncias.at(-1);
  assert.equal(JSON.stringify(d).includes(nombre), false);
  const a = t.M.Store.S.audit[0];
  assert.equal(a.quien, 'Anónimo');
  assert.equal(JSON.stringify(a).includes(nombre), false);
});
test('Auditoría: las demás acciones sí registran quién las hizo', () => {
  const t = nuevoEntorno(); t.entrarComo('Administrador');
  t.campo({ e_n: 'Sara', e_d: '11223344' }); t.M.Actions.registrarEst();
  assert.match(t.M.Store.S.audit[0].quien, /^Administrador/);
});

/* ---- MER-3 Logística ---- */
test('Q.ocupacion no cuenta citas vencidas ni canceladas', () => {
  const { M } = nuevoEntorno();
  M.Store.S.citas.forEach(c => { const n = M.Q.ocupacion(c.slot);
    assert.ok(n <= M.Store.S.citas.filter(x => x.slot === c.slot).length); });
});
test('Datos de ejemplo: existe una cita vencida (QR vencido) y una vigente', () => {
  const { M } = nuevoEntorno();
  const estados = M.Store.S.citas.map(c => c.estado);
  assert.ok(estados.includes('Vencida')); assert.ok(estados.length >= 2);
});

/* ---- Persistencia (modelo) ---- */
test('Store guarda y recupera datos', () => {
  const t = nuevoEntorno(); t.entrarComo('Administrador');
  t.campo({ e_n: 'Rosa', e_d: '55667788' }); t.M.Actions.registrarEst();
  const n = t.M.Store.S.estibadores.length;
  t.M.Store.load();
  assert.equal(t.M.Store.S.estibadores.length, n);
});
