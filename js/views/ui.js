/* VISTAS - Componentes visuales reutilizables */
(function (M) {
  var U = M.U, UI = (M.UI = {});

  UI.pill = function (t, tone) { return '<span class="pill p-' + tone + '">' + U.esc(t) + '</span>'; };

  UI.card = function (title, body) { return '<div class="card"><h4>' + title + '</h4>' + body + '</div>'; };

  UI.alert = function (txt, tone) { return '<div class="alert a-' + tone + '">' + txt + '</div>'; };

  /* Tabla: heads = textos, rows = filas de celdas ya escapadas */
  UI.tbl = function (heads, rows, empty) {
    if (!rows.length) return '<div class="empty">' + (empty || 'Todavía no hay registros.') + '</div>';
    return '<div class="tw"><table><tr>' + heads.map(function (h) { return '<th>' + h + '</th>'; }).join('') + '</tr>' +
      rows.map(function (r) { return '<tr>' + r.map(function (c) { return '<td>' + c + '</td>'; }).join('') + '</tr>'; }).join('') + '</table></div>';
  };

  /* Tarjetas de indicadores: list = [[etiqueta, valor, tono?]] */
  UI.stats = function (list) {
    return '<div class="stats">' + list.map(function (s) {
      return '<div class="stat ' + (s[2] || '') + '"><span>' + s[0] + '</span><b>' + s[1] + '</b></div>';
    }).join('') + '</div>';
  };

  /* Grafico de barras horizontales: rows = [[etiqueta, valor]] */
  UI.bars = function (rows, mon) {
    if (!rows.length) return '<div class="empty">Sin datos todavía.</div>';
    var mx = Math.max.apply(null, rows.map(function (r) { return r[1]; }).concat([1]));
    return rows.map(function (r) {
      return '<div class="bar"><span class="bl" title="' + U.esc(r[0]) + '">' + U.esc(r[0]) + '</span><span class="bt"><i style="width:' +
        Math.round(r[1] / mx * 100) + '%"></i></span><span class="bv">' + (mon ? U.money(r[1]) : r[1]) + '</span></div>';
    }).join('');
  };

  UI.toast = function (msg, ok) {
    var d = document.createElement('div');
    d.className = 't ' + (ok ? 'ok' : 'err');
    d.textContent = msg;
    var box = U.$('#toast');
    box.appendChild(d);
    while (box.children.length > 3) box.removeChild(box.firstChild);   // máximo 3 avisos a la vez
    setTimeout(function () { d.remove(); }, 4500);
  };

  UI.dlg = function (html, cerrar) {
    var d = U.$('#dlg');
    d.innerHTML = html + '<form method="dialog"><button class="btn sec noprint">' + (cerrar || 'Cerrar') + '</button></form>';
    if (d.showModal) d.showModal(); else d.setAttribute('open', '');
  };
  UI.closeDlg = function () { var d = U.$('#dlg'); if (d.close) d.close(); else d.removeAttribute('open'); };

  /* QR simulado (patron determinista a partir del codigo) */
  UI.qrDraw = function (cv, txt) {
    var n = 21, sz = 8, ctx = cv.getContext('2d'), h = 0, i, j;
    for (i = 0; i < txt.length; i++) h = (h * 31 + txt.charCodeAt(i)) >>> 0;
    cv.width = cv.height = n * sz;
    ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, cv.width, cv.height); ctx.fillStyle = '#000';
    function fnd(x, y) {
      ctx.fillRect(x * sz, y * sz, 7 * sz, 7 * sz); ctx.fillStyle = '#fff'; ctx.fillRect((x + 1) * sz, (y + 1) * sz, 5 * sz, 5 * sz);
      ctx.fillStyle = '#000'; ctx.fillRect((x + 2) * sz, (y + 2) * sz, 3 * sz, 3 * sz);
    }
    fnd(0, 0); fnd(n - 7, 0); fnd(0, n - 7);
    for (i = 0; i < n; i++) for (j = 0; j < n; j++) {
      if ((i < 8 && j < 8) || (i > n - 9 && j < 8) || (i < 8 && j > n - 9)) continue;
      h = (h * 1103515245 + 12345) >>> 0;
      if ((h >>> 16) & 1) ctx.fillRect(i * sz, j * sz, sz, sz);
    }
  };
})((window.MER = window.MER || {}));
