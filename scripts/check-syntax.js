/* Verifica que todos los .js compilen (etapa Build) */
const fs = require('node:fs'), path = require('node:path'), vm = require('node:vm');
let n = 0, err = 0;
(function walk(d) {
  for (const f of fs.readdirSync(d, { withFileTypes: true })) {
    const p = path.join(d, f.name);
    if (f.isDirectory() && !['node_modules', '.git'].includes(f.name)) walk(p);
    else if (f.name.endsWith('.js') && /js[\\/]/.test(p)) {
      n++; try { new vm.Script(fs.readFileSync(p, 'utf8'), { filename: p }); }
      catch (e) { err++; console.error('ERROR en', p, e.message); }
    }
  }
})(path.join(__dirname, '..', 'js'));
console.log(n + ' archivos revisados, ' + err + ' con errores');
process.exit(err ? 1 : 0);
