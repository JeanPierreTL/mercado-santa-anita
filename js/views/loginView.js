/* VISTA - Pantalla de ingreso: el usuario elige su rol */
(function (M) {
  var V = M.Views, U = M.U, St = M.Store, Q = M.Q;

  var ROLES = [
    ['Administrador', '🛠️', 'Puestos, tarifas, estibaje, indicadores y auditoría'],
    ['Comerciante', '🏪', 'Mis productos, pedidos, ventas y tarifas'],
    ['Comprador', '🛒', 'Catálogo, pedidos y comprobantes'],
    ['Transportista', '🚚', 'Citas de descarga con QR y estibaje'],
    ['Seguridad', '🛡️', 'Control de ingreso y andenes en la puerta']
  ];

  V.login = function () {
    var sel = M.Auth.sel, pend = St.S.comerciantes.filter(function (c) { return c.estado !== 'Validado'; }).length;
    var h = '<div class="login"><h1>Mercado Mayorista de Santa Anita</h1>' +
      '<p class="lead">Elige cómo vas a usar el sistema. Cada rol ve solo las opciones de su función.</p><div class="roles">';
    ROLES.forEach(function (r) {
      h += '<button class="role ' + (sel === r[0] ? 'on' : '') + '" data-role="' + r[0] + '"><span class="ic">' + r[1] + '</span><b>' + r[0] + '</b><small>' + r[2] + '</small></button>';
    });
    h += '</div>';
    if (sel) {
      var ps = Q.perfiles(sel);
      h += '<div class="enter"><b>Ingresar como ' + sel + '</b>';
      if (ps.length > 1) {
        h += '<label>¿Quién eres?</label><select id="lg_user">' + ps.map(function (p) { return '<option value="' + p.id + '">' + U.esc(p.name) + '</option>'; }).join('') + '</select>';
      } else {
        h += '<p class="sub" style="margin:6px 0 0">' + U.esc(ps[0].name) + '</p>';
      }
      h += '<br><button class="btn" data-a="entrar">Entrar</button></div>';
    }
    h += '<div class="alt"><span>¿Eres un comerciante nuevo?</span><button class="btn sec sm" data-a="abrirRegistro">Registrar mi negocio</button>' +
      (pend ? '<span>Solicitudes pendientes de validación: <b>' + pend + '</b></span>' : '') +
      '<span style="margin-left:auto"><button class="btn sec sm" data-a="reiniciar">Restablecer datos de ejemplo</button></span></div>' +
      '<p class="foot">Prototipo de evidencia: los datos se guardan solo en este navegador (no hay servidor).</p></div>';
    return h;
  };
})(window.MER);
