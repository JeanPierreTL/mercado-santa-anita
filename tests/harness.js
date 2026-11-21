/* Carga los scripts del prototipo en un entorno simulado (sin navegador) */
const vm = require('node:vm');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.join(__dirname, '..');
const FILES = ['js/utils.js', 'js/model/seed.js', 'js/model/store.js', 'js/views/ui.js',
  'js/controllers/authController.js', 'js/controllers/formalizacionController.js',
  'js/controllers/comercioController.js', 'js/controllers/logisticaController.js',
  'js/controllers/estibajeController.js'];

function nuevoEntorno() {
  const campos = {};            // simula los <input> de la pantalla
  const toasts = [];
  const el = () => ({ appendChild() {}, children: [], innerHTML: '', getContext: () => new Proxy({}, { get: () => () => {}, set: () => true }) });
  const win = {};
  const ctx = {
    window: win, console, Date, Math, JSON, String, Number, parseFloat,
    localStorage: { _d: {}, getItem(k) { return this._d[k] || null; }, setItem(k, v) { this._d[k] = String(v); }, removeItem(k) { delete this._d[k]; } },
    document: {
      getElementById: (id) => (id in campos ? { value: campos[id] } : null),
      querySelector: () => el(), createElement: () => ({ remove() {}, set className(v) {}, set textContent(v) { toasts.push(v); } }),
    },
    setTimeout: () => 0,
  };
  ctx.window = ctx; vm.createContext(ctx);
  for (const f of FILES) vm.runInContext(fs.readFileSync(path.join(ROOT, f), 'utf8'), ctx, { filename: f });
  const M = ctx.MER;
  M.Router = { render() {}, go() {}, home() { return 'inicio'; } };
  M.Dialogos = [];
  M.UI.dlg = (h) => M.Dialogos.push(h);
  M.Store.reset();
  const campo = (o) => { for (const k in campos) delete campos[k]; Object.assign(campos, o); };
  return { M, campo, toasts, entrarComo(role) { const p = M.Q.perfiles(role)[0]; M.Store.me = { role, id: p.id, name: p.name }; } };
}
module.exports = { nuevoEntorno };
