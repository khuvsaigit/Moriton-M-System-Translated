// ============================================================
// 🕒 ЦАГИЙН БҮРТГЭЛ — ажилтны жагсаалт, сарын хүснэгт (Ө/Ж/ҮЖ/А/Ч/...),
//    яг Excel форматаар татах (томьёотой), хэвлэх; Өдрийн мэдээний хүний тоо
// ============================================================
// Бүтэц:
//   clinic_config.employees = [{ id, name, position, order, startDate, endDate,
//                                active, docId, note, ms }]
//   staff/{YYYY-MM-DD}.codes = { empId: 'D' | 'N' | ... }   (одоо байгаа өдрийн
//        roster document дээр нэмэлт талбар — шинэ collection үүсгэхгүй)
//   staff/ts-{YYYY-MM} = { id, kind:'tsmeta', ym, plan:{empId: ажиллавал зохих өдөр},
//        notes:{empId: тайлбар}, ms }
// ============================================================

const TS_CODES = [
  { c: 'D',        label: 'Day Shift', h: 8, worked: true,  cls: 'ts-ok' },
  { c: 'N',        label: 'Night Duty',           h: 8, worked: true,  duty: true, cls: 'ts-duty' },
  { c: 'Half',    label: 'Half Day',       h: 4, worked: true,  cls: 'ts-half' },
  { c: 'Pharm',   label: 'Pharmacy Duty',        h: 8, worked: true,  cls: 'ts-ok' },
  { c: 'Office Duty',    label: 'Office Duty',            h: 8, worked: true,  cls: 'ts-ok' },
  { c: 'Breed',       label: 'Breeding Center',        h: 8, worked: true,  trip: true, cls: 'ts-trip' },
  { c: 'Business Trip', label: 'Business Trip',         h: 8, worked: true,  trip: true, cls: 'ts-trip' },
  { c: 'R',        label: 'Rest Day',          h: 0, cls: 'ts-rest' },
  { c: 'L',        label: 'Leave with Pay',         h: 0, cls: 'ts-leave' },
  { c: 'Abs',      label: 'Absent',         h: 0, cls: 'ts-abs' },
  { c: 'Sick',   label: 'Sick',           h: 0, cls: 'ts-sick' },
  { c: 'ЭА',       label: 'Ээлжийн амралт',   h: 0, cls: 'ts-leave' }
];
const TS_POSITIONS = ['Chief Veterinarian', 'Manager', 'Нярав', 'ЭҮА-ны дарга', 'ЭҮА-ны ахлах', 'Veterinarian', 'Дад / Эмч', 'Дад / Оюутан', 'Pharmacist', 'Тогооч', 'Аж ахуйн ажилтан', 'Үйлчлэгч', 'Адуучин', 'Адуучны туслах', 'Жолооч', 'Registration Clerk', 'Нягтлан бодогч'];
const TS_DOW = ['Ням', 'Да', 'Мя', 'Лха', 'Пү', 'Ба', 'Бя'];
const TS_EDIT_ROLES = ['Manager', 'Chief Veterinarian', 'Senior Veterinarian', 'Admin', 'Accountant / Finance'];

function tsCodeDef(c) { return TS_CODES.find(x => x.c.toLowerCase() === String(c || '').toLowerCase()) || null; }
function tsCanEdit() {
  if (!STATE.user) return false;
  if (typeof canEditData === 'function' && canEditData()) return true;
  const me = (typeof _meUser === 'function') ? _meUser() : null;
  if (me && me.tsEdit === true) return true;
  return TS_EDIT_ROLES.includes(STATE.user.role);
}
// ── Ажилтнууд ───────────────────────────────────────────────
function tsEmployees(all) {
  const list = (Array.isArray(STATE.employees) ? STATE.employees : []).filter(e => e && !e.deleted && (all || e.active !== false));
  return list.slice().sort((a, b) => (parseFloat(a.order) || 0) - (parseFloat(b.order) || 0) || String(a.name || '').localeCompare(String(b.name || '')));
}
function tsEmpById(id) { return (STATE.employees || []).find(e => e && String(e.id) === String(id)) || null; }
function tsIsDoctorEmp(e) { return !!(e && (e.docId || /эмч|дарга|ахлах/i.test(e.position || ''))); }
function _tsSaveEmployees(action, detail) {
  lsSet('mt_employees', STATE.employees || []);
  try { fbSaveClinicConfig(); } catch (e) { console.error('employees save', e); }
  if (action) try { writeLog(action, '', '', detail || ''); } catch (e) {}
}
function tsSaveEmployee(item) {
  if (!tsCanEdit()) { toast('Ажилтны жагсаалт засах эрх алга', 'err'); return null; }
  const name = String(item.name || '').trim(); if (!name) { toast('Нэр оруулна уу', 'err'); return null; }
  if (!Array.isArray(STATE.employees)) STATE.employees = [];
  let e = item.id ? STATE.employees.find(x => x && String(x.id) === String(item.id)) : null;
  const fields = { name, position: String(item.position || '').trim(), startDate: item.startDate || '', endDate: item.endDate || '', note: String(item.note || '').trim(), docId: item.docId || '', active: item.active !== false, ms: nowMs() };
  if (e) Object.assign(e, fields);
  else { e = Object.assign({ id: uid(), order: (STATE.employees.length ? Math.max(...STATE.employees.map(x => parseFloat(x.order) || 0)) : 0) + 1 }, fields); STATE.employees.push(e); }
  _tsSaveEmployees('Ажилтан бүртгэв', name + ' · ' + fields.position);
  return e;
}
function tsDeleteEmployee(id) {
  if (!tsCanEdit()) return;
  const e = tsEmpById(id); if (!e) return;
  if (!confirm('«' + e.name + '» ажилтныг жагсаалтаас хасах уу?\n(Өмнөх сарын бүртгэл хэвээр үлдэнэ; идэвхгүй болгох нь илүү зөв)')) return;
  e.deleted = true; e.ms = nowMs();
  _tsSaveEmployees('Ажилтан хасав', e.name);
  renderTimesheet();
}
function tsMoveEmployee(id, dir) {
  if (!tsCanEdit()) return;
  const list = tsEmployees(true); const k = list.findIndex(e => String(e.id) === String(id)); if (k < 0) return;
  const j = k + dir; if (j < 0 || j >= list.length) return;
  list.forEach((e, i) => { e.order = i + 1; });
  const t = list[k].order; list[k].order = list[j].order; list[j].order = t;
  _tsSaveEmployees();
  renderTimesheet();
}
function tsSeedFromDoctors() {
  if (!tsCanEdit()) return;
  const docs = (STATE.doctors || []).filter(d => d && d.name);
  let n = 0;
  docs.forEach(d => {
    if ((STATE.employees || []).some(e => e && !e.deleted && (String(e.docId) === String(d.id) || String(e.name).trim().toLowerCase() === String(d.name).trim().toLowerCase()))) return;
    tsSaveEmployee({ name: d.name, position: d.role || 'Veterinarian', docId: d.id }); n++;
  });
  toast(n ? '⚡ ' + n + ' эмчийг ажилтны жагсаалтад нэмлээ' : 'Бүх эмч аль хэдийн жагсаалтад байна', n ? 'ok' : 'err');
  renderTimesheet();
}

// ── Өдрийн код ──────────────────────────────────────────────
function tsDayDoc(date, create) {
  if (!Array.isArray(STATE.staff)) STATE.staff = [];
  let d = STATE.staff.find(s => s && String(s.id) === date);
  if (!d && create) { d = { id: date, date, active: [], duty: [], codes: {}, ms: nowMs() }; STATE.staff.push(d); }
  return d || null;
}
function tsCode(empId, date) { const d = tsDayDoc(date); return (d && d.codes && d.codes[String(empId)]) || ''; }
function tsSetCode(empId, date, code) {
  if (!tsCanEdit()) { toast('Цагийн бүртгэл засах эрх алга', 'err'); return; }
  const d = tsDayDoc(date, true);
  if (!d.codes || typeof d.codes !== 'object') d.codes = {};
  if (code) d.codes[String(empId)] = code; else delete d.codes[String(empId)];
  d.ms = nowMs();
  // 👨‍⚕️ Эмчтэй холбоотой ажилтны кодоос хяналтын самбарын ажиллаж буй/жижүүр эмчийг шинэчилнэ
  const e = tsEmpById(empId);
  if (e && e.docId) {
    const def = tsCodeDef(code);
    const act = new Set((d.active || []).map(String)), duty = new Set((d.duty || []).map(String));
    if (def && def.worked && !def.trip) act.add(String(e.docId)); else act.delete(String(e.docId));
    if (def && def.duty) duty.add(String(e.docId)); else duty.delete(String(e.docId));
    d.active = [...act]; d.duty = [...duty];
  }
  saveAll(); fbSaveRecord('staff', d);
  try { if (date === todayStr() && typeof renderStaffSection === 'function' && STATE.activePage === 'dashboard') renderStaffSection(); } catch (err) {}
}
// Хяналтын самбар: тухайн өдрийн кодоос эмч нарын ажиллаж буй / жижүүр жагсаалт (байхгүй бол null)
function tsDayStaffFromCodes(date) {
  const d = tsDayDoc(date); if (!d || !d.codes) return null;
  const active = [], duty = []; let any = false;
  tsEmployees(true).forEach(e => {
    if (!e.docId) return; const c = d.codes[String(e.id)]; if (!c) return; any = true;
    const def = tsCodeDef(c); if (def && def.worked && !def.trip) active.push(String(e.docId)); if (def && def.duty) duty.push(String(e.docId));
  });
  return any ? { date, active, duty } : null;
}
// Сарын мета (ажиллавал зохих өдөр, тайлбар)
function tsMeta(ym, create) {
  if (!Array.isArray(STATE.staff)) STATE.staff = [];
  const id = 'ts-' + ym;
  let m = STATE.staff.find(s => s && String(s.id) === id);
  if (!m && create) { m = { id, kind: 'tsmeta', ym, plan: {}, notes: {}, ms: nowMs() }; STATE.staff.push(m); }
  return m || null;
}
function tsPlanDays(empId, ym) { const m = tsMeta(ym); const v = m && m.plan ? m.plan[String(empId)] : ''; return v == null ? '' : v; }
function tsNote(empId, ym) { const m = tsMeta(ym); return (m && m.notes && m.notes[String(empId)]) || ''; }
function tsSetMeta(empId, ym, field, value) {
  if (!tsCanEdit()) return;
  const m = tsMeta(ym, true); if (!m[field] || typeof m[field] !== 'object') m[field] = {};
  if (value === '' || value == null) delete m[field][String(empId)]; else m[field][String(empId)] = value;
  m.ms = nowMs(); saveAll(); fbSaveRecord('staff', m);
}

// ── Сар / хугацаа ───────────────────────────────────────────
let TS_MONTH = todayStr().slice(0, 7), TS_RANGE = 'full', TS_TAB = 'grid';
function tsDaysInMonth(ym) { const [y, m] = ym.split('-').map(Number); return new Date(y, m, 0).getDate(); }
function tsRangeDays(ym, range) {
  const n = tsDaysInMonth(ym); let from = 1, to = n;
  if (range === 'h1') to = 15; else if (range === 'h2') from = 16;
  const out = []; for (let d = from; d <= to; d++) out.push(d); return out;
}
function tsDate(ym, d) { return ym + '-' + String(d).padStart(2, '0'); }
function tsDow(ym, d) { const [y, m] = ym.split('-').map(Number); return new Date(y, m - 1, d).getDay(); }
function tsRangeLabel(ym, range) {
  const n = tsDaysInMonth(ym), yy = ym.slice(2, 4), mm = ym.slice(5, 7);
  if (range === 'h1') return yy + '.' + mm + '.01-' + yy + '.' + mm + '.15';
  if (range === 'h2') return yy + '.' + mm + '.16-' + yy + '.' + mm + '.' + String(n).padStart(2, '0');
  return ym.replace('-', '.');
}
// Нэг ажилтны хугацааны дүн
function tsRowStats(empId, ym, days) {
  const by = {}; let workedDays = 0, hours = 0, clinicH = 0, tripH = 0;
  days.forEach(d => {
    const c = tsCode(empId, tsDate(ym, d)); if (!c) return;
    const def = tsCodeDef(c); const key = def ? def.c : c; by[key] = (by[key] || 0) + 1;
    if (def && def.worked) { workedDays += def.h >= 8 ? 1 : (def.h > 0 ? 0.5 : 0); hours += def.h; if (def.trip) tripH += def.h; else clinicH += def.h; }
  });
  return { by, workedDays, hours, clinicH, tripH };
}
// Нэг өдрийн дүн (Excel-ийн доод мөрүүд + Өдрийн мэдээ)
function tsDayStats(date, emps) {
  emps = emps || tsEmployees();
  const S = { came: 0, rest: 0, abs: 0, leave: 0, trip: 0, sick: 0, vac: 0, doctors: 0, byPos: {}, total: 0 };
  emps.forEach(e => {
    const c = tsCode(e.id, date); if (!c) return; const def = tsCodeDef(c); const k = def ? def.c : c;
    if (def && def.worked && !def.trip) { S.came++; S.total++; const p = e.position || '—'; S.byPos[p] = (S.byPos[p] || 0) + 1; if (tsIsDoctorEmp(e)) S.doctors++; }
    if (def && def.trip) { S.trip++; S.total++; }
    if (k === 'R') S.rest++; if (k === 'Abs') S.abs++; if (k === 'L') S.leave++; if (k === 'Sick') S.sick++; if (k === 'ЭА') S.vac++;
  });
  return S;
}

// ── Хуудас ──────────────────────────────────────────────────
function ensureTsStyles() {
  if (document.getElementById('ts-styles')) return;
  const st = document.createElement('style'); st.id = 'ts-styles';
  st.textContent = `
  .ts-wrap{overflow:auto;max-height:70vh;border:1px solid var(--border);border-radius:10px;background:#fff}
  .ts-tbl{border-collapse:separate;border-spacing:0;font-size:11.5px;min-width:100%}
  .ts-tbl th,.ts-tbl td{border-right:1px solid var(--border);border-bottom:1px solid var(--border);padding:3px 4px;text-align:center;white-space:nowrap}
  .ts-tbl th{background:var(--input);font-weight:800;font-size:10.5px;position:sticky;top:0;z-index:2}
  .ts-tbl th.ts-we{background:#fde9e3;color:var(--red)}
  .ts-tbl td.ts-name,.ts-tbl th.ts-name{position:sticky;left:0;background:#fff;text-align:left;z-index:1;font-weight:700;min-width:120px;max-width:160px;overflow:hidden;text-overflow:ellipsis}
  .ts-tbl th.ts-name{z-index:3;background:var(--input)}
  .ts-tbl td.ts-pos{text-align:left;color:var(--muted);font-size:10.5px;max-width:110px;overflow:hidden;text-overflow:ellipsis}
  .ts-cell{cursor:pointer;min-width:34px;font-weight:800;user-select:none}
  .ts-cell:hover{outline:2px solid var(--orange);outline-offset:-2px}
  .ts-cell.ts-we{background:#fff7f5}
  .ts-cell.ts-today{box-shadow:inset 0 0 0 2px var(--navy)}
  .ts-ok{background:#e6f6ee;color:#1f7a4d}.ts-duty{background:#e8e4f7;color:#5b3fb0}.ts-half{background:#f0f7e6;color:#4a7a1f}
  .ts-trip{background:#e3f0fb;color:#1f5e9a}.ts-rest{background:#f3f3f3;color:#666}.ts-leave{background:#fff4d6;color:#8a6200}
  .ts-abs{background:#fbe3e0;color:#b03a2e}.ts-sick{background:#ffe4ec;color:#b0305e}
  .ts-sum{background:#fbf7ee;font-weight:800}
  .ts-foot td{background:var(--input);font-weight:700;font-size:10.5px}
  .ts-pop{position:fixed;z-index:9999;background:#fff;border:1px solid var(--border);border-radius:12px;box-shadow:var(--shadow-lg,0 8px 30px rgba(0,0,0,.18));padding:8px;display:none;max-width:280px}
  .ts-pop.show{display:block}
  .ts-pop .ts-pop-t{font-size:11px;color:var(--muted);font-weight:700;margin-bottom:6px}
  .ts-pop .ts-pop-g{display:grid;grid-template-columns:repeat(3,1fr);gap:4px}
  .ts-pop button{border:1px solid var(--border);border-radius:8px;padding:6px 4px;font-size:11px;font-weight:800;cursor:pointer;font-family:inherit;background:#fff}
  .ts-pop button:hover{outline:2px solid var(--orange)}
  .ts-legend{display:flex;gap:6px;flex-wrap:wrap;font-size:11px;margin:6px 0 10px}
  .ts-legend span{padding:2px 8px;border-radius:6px;font-weight:700}
  .ts-emp-row{display:flex;gap:8px;align-items:center;flex-wrap:wrap;background:var(--input);border-radius:8px;padding:6px 10px;margin-bottom:4px;font-size:12.5px}
  @media print{.ts-wrap{max-height:none;overflow:visible}}`;
  document.head.appendChild(st);
}
function setTsTab(t) { TS_TAB = t; renderTimesheet(); }
function tsOnMonth(v) { if (v) TS_MONTH = v; renderTimesheet(); }
function tsOnRange(v) { TS_RANGE = v || 'full'; renderTimesheet(); }

function renderTimesheet() {
  const page = document.getElementById('page-timesheet'); if (!page) return;
  ensureTsStyles();
  const mEl = document.getElementById('ts-month'); if (mEl && mEl.value !== TS_MONTH) mEl.value = TS_MONTH;
  const rEl = document.getElementById('ts-range'); if (rEl && rEl.value !== TS_RANGE) rEl.value = TS_RANGE;
  document.querySelectorAll('.tab[data-tstab]').forEach(t => { t.classList.toggle('active', t.dataset.tstab === TS_TAB); t.onclick = () => setTsTab(t.dataset.tstab); });
  document.querySelectorAll('.tstab').forEach(x => x.classList.toggle('hidden', x.dataset.tstab !== TS_TAB));
  const sub = document.getElementById('ts-sub');
  const emps = tsEmployees();
  if (sub) sub.textContent = tsRangeLabel(TS_MONTH, TS_RANGE) + ' · ' + emps.length + ' ажилтан' + (tsCanEdit() ? '' : ' · зөвхөн үзэх');
  if (TS_TAB === 'grid') renderTsGrid(emps);
  else renderTsEmployees();
}
function renderTsGrid(emps) {
  const box = document.getElementById('ts-grid'); if (!box) return;
  const ym = TS_MONTH, days = tsRangeDays(ym, TS_RANGE), today = todayStr(), canEdit = tsCanEdit();
  if (!emps.length) {
    box.innerHTML = `<div class="empty"><div class="empty-em">👥</div>Ажилтны жагсаалт хоосон<br><span class="muted" style="font-size:12px">«👥 Ажилтнууд» таб дээр нэмнэ үү${canEdit ? ', эсвэл ' : ''}</span>${canEdit ? '<br><button class="btn btn-sm btn-p" style="margin-top:8px" onclick="tsSeedFromDoctors()">⚡ Эмч нараас үүсгэх</button>' : ''}</div>`;
    return;
  }
  const legend = TS_CODES.map(c => `<span class="${c.cls}">${escHTML(c.c)} — ${escHTML(c.label)}${c.h ? ' (' + c.h + 'ц)' : ''}</span>`).join('');
  const head = `<tr><th style="min-width:26px">№</th><th class="ts-name">Нэрс</th><th>Албан тушаал</th><th title="Ажиллавал зохих өдөр">Зохих өдөр</th>` +
    days.map(d => { const dow = tsDow(ym, d); const we = dow === 0 || dow === 6; return `<th class="${we ? 'ts-we' : ''}" title="${tsDate(ym, d)}">${TS_DOW[dow]}<br>${d}</th>`; }).join('') +
    `<th title="Ажилласан өдөр">Өдөр</th><th title="Ажилласан цаг">Цаг</th><th>Өдрөөр</th><th>Жижүүр</th><th>Томилолт</th><th>Өвчтэй</th><th>Чөлөө</th><th>Тас</th><th>Амарсан</th><th style="min-width:120px">Тайлбар</th>${canEdit ? '<th></th>' : ''}</tr>`;
  const rows = emps.map((e, k) => {
    const st = tsRowStats(e.id, ym, days);
    const cells = days.map(d => {
      const date = tsDate(ym, d), c = tsCode(e.id, date), def = tsCodeDef(c); const dow = tsDow(ym, d); const we = dow === 0 || dow === 6;
      return `<td class="ts-cell ${def ? def.cls : ''} ${we ? 'ts-we' : ''} ${date === today ? 'ts-today' : ''}" ${canEdit ? `onclick="tsCellClick(event,'${escHTML(e.id)}','${date}')"` : ''} title="${escHTML(e.name)} · ${date}${def ? ' · ' + def.label : ''}">${escHTML(c)}</td>`;
    }).join('');
    const planV = tsPlanDays(e.id, ym);
    return `<tr><td>${k + 1}</td><td class="ts-name" title="${escHTML(e.name)}">${escHTML(e.name)}</td><td class="ts-pos" title="${escHTML(e.position || '')}">${escHTML(e.position || '')}</td>
      <td>${canEdit ? `<input type="number" min="0" max="31" value="${escHTML(String(planV))}" style="width:46px;border:1px solid var(--border);border-radius:6px;padding:2px 4px;font-size:11px;text-align:center" onchange="tsSetMeta('${escHTML(e.id)}','${ym}','plan',this.value===''?'':parseFloat(this.value))">` : escHTML(String(planV))}</td>
      ${cells}
      <td class="ts-sum">${st.workedDays}</td><td class="ts-sum">${st.hours}</td><td>${(st.by['D'] || 0) * 8 || ''}</td><td>${(st.by['N'] || 0) * 8 || ''}</td><td>${((st.by['Business Trip'] || 0) + (st.by['Breed'] || 0)) * 8 || ''}</td><td>${(st.by['Sick'] || 0) * 8 || ''}</td><td>${(st.by['L'] || 0) * 8 || ''}</td><td>${(st.by['Abs'] || 0) * 8 || ''}</td><td>${(st.by['R'] || 0) * 8 || ''}</td>
      <td style="text-align:left">${canEdit ? `<input value="${escHTML(tsNote(e.id, ym))}" placeholder="…" style="width:120px;border:1px solid var(--border);border-radius:6px;padding:2px 4px;font-size:11px" onchange="tsSetMeta('${escHTML(e.id)}','${ym}','notes',this.value.trim())">` : escHTML(tsNote(e.id, ym))}</td>
      ${canEdit ? `<td><button class="btn btn-xs" type="button" title="Хоосон өдрүүдийг Ө болгоно (амралтын өдөр оролцуулаад)" onclick="tsFillRow('${escHTML(e.id)}')">Ө бүгд</button></td>` : ''}</tr>`;
  }).join('');
  const footDefs = [['ирсэн', 'came'], ['амарсан', 'rest'], ['тасалсан', 'abs'], ['чөлөө', 'leave'], ['томилолт', 'trip'], ['өвчтэй', 'sick'], ['ээлжийн амралт', 'vac'], ['эмч (ажиллаж буй)', 'doctors']];
  const dayS = days.map(d => tsDayStats(tsDate(ym, d), emps));
  const foot = footDefs.map(f => `<tr class="ts-foot"><td></td><td class="ts-name" style="font-weight:700">${escHTML(f[0])}</td><td></td><td></td>${dayS.map(s => `<td>${s[f[1]] || ''}</td>`).join('')}<td colspan="${10 + (canEdit ? 1 : 0)}"></td></tr>`).join('');
  box.innerHTML = `<div class="ts-legend">${legend}</div>
    <div class="row" style="gap:6px;flex-wrap:wrap;margin-bottom:8px">
      <button class="btn btn-sm btn-p" type="button" onclick="tsExportExcel()">⬇ Excel (${escHTML(tsRangeLabel(ym, TS_RANGE))})</button>
      <button class="btn btn-sm" type="button" onclick="tsPrint()">🖨 Хэвлэх</button>
      <span class="muted" style="font-size:11.5px">Нүд дарж код сонгоно · ажлын цаг: 8ц/өдөр, хагас 4ц · Excel-д яг хуучин маягт, томьёотой</span>
    </div>
    <div class="ts-wrap"><table class="ts-tbl"><thead>${head}</thead><tbody>${rows}${foot}</tbody></table></div>`;
}
// Нүд дарахад код сонгох цонх
let _tsPopCtx = null;
function tsCellClick(ev, empId, date) {
  if (!tsCanEdit()) return;
  let pop = document.getElementById('ts-pop');
  if (!pop) { pop = document.createElement('div'); pop.id = 'ts-pop'; pop.className = 'ts-pop'; document.body.appendChild(pop); document.addEventListener('mousedown', (e) => { if (!pop.contains(e.target) && !(e.target.classList && e.target.classList.contains('ts-cell'))) pop.classList.remove('show'); }); }
  _tsPopCtx = { empId, date };
  const e = tsEmpById(empId); const cur = tsCode(empId, date);
  pop.innerHTML = `<div class="ts-pop-t">${escHTML(e ? e.name : '')} · ${date}${cur ? ' · одоо: <b>' + escHTML(cur) + '</b>' : ''}</div>
    <div class="ts-pop-g">${TS_CODES.map(c => `<button type="button" class="${c.cls}" onclick="tsPickCode('${escHTML(c.c)}')" title="${escHTML(c.label)}">${escHTML(c.c)}</button>`).join('')}
    <button type="button" onclick="tsPickCode('')" style="grid-column:1/-1;color:var(--red)">✕ Арилгах</button></div>`;
  pop.classList.add('show');
  const r = ev.target.getBoundingClientRect();
  let x = r.left, y = r.bottom + 4; const w = 280, h = 230;
  if (x + w > window.innerWidth - 8) x = window.innerWidth - w - 8; if (y + h > window.innerHeight - 8) y = r.top - h - 4;
  pop.style.left = Math.max(4, x) + 'px'; pop.style.top = Math.max(4, y) + 'px';
}
function tsPickCode(code) {
  const pop = document.getElementById('ts-pop'); if (pop) pop.classList.remove('show');
  if (!_tsPopCtx) return;
  tsSetCode(_tsPopCtx.empId, _tsPopCtx.date, code);
  renderTsGrid(tsEmployees());
}
function tsFillRow(empId) {
  const e = tsEmpById(empId); if (!e) return;
  const days = tsRangeDays(TS_MONTH, TS_RANGE);
  const empty = days.filter(d => !tsCode(empId, tsDate(TS_MONTH, d)));
  if (!empty.length) { toast('Хоосон өдөр алга', 'err'); return; }
  if (!confirm('«' + e.name + '» — ' + empty.length + ' хоосон өдрийг «Ө» болгох уу? (дараа нь амралт, чөлөөг засна)')) return;
  empty.forEach(d => tsSetCode(empId, tsDate(TS_MONTH, d), 'D'));
  renderTsGrid(tsEmployees());
}
// ── Ажилтнууд таб ───────────────────────────────────────────
function renderTsEmployees() {
  const box = document.getElementById('ts-emps'); if (!box) return;
  const canEdit = tsCanEdit(); const list = tsEmployees(true);
  const docOpts = '<option value="">— эмчтэй холбохгүй —</option>' + (STATE.doctors || []).map(d => `<option value="${escHTML(d.id)}">${escHTML(d.name)}</option>`).join('');
  box.innerHTML = `
    ${canEdit ? `<div class="card" style="padding:12px" id="ts-emp-form"><div class="ch">➕ Ажилтан нэмэх / засах</div>
      <div style="display:flex;flex-wrap:wrap;gap:6px;align-items:flex-end">
        <input type="hidden" id="ts-e-id">
        <div class="fld" style="flex:2 1 180px"><label>Нэр</label><input class="inp" id="ts-e-name" placeholder="Э.Гантуяа"></div>
        <div class="fld" style="flex:1 1 160px"><label>Албан тушаал</label><input class="inp" id="ts-e-pos" list="ts-pos-dl" placeholder="Manager"><datalist id="ts-pos-dl">${TS_POSITIONS.map(p => '<option value="' + escHTML(p) + '">').join('')}</datalist></div>
        <div class="fld" style="flex:0 1 150px"><label>Ажилд орсон</label><input class="inp" type="date" id="ts-e-start"></div>
        <div class="fld" style="flex:1 1 170px"><label>Эмчийн бүртгэлтэй холбох</label><select class="inp" id="ts-e-doc">${docOpts}</select></div>
        <div class="fld" style="flex:1 1 160px"><label>Тайлбар</label><input class="inp" id="ts-e-note" placeholder="ж: 08.07-с ажиллаж эхэлсэн"></div>
        <div class="fld" style="flex:0 0 auto"><label>&nbsp;</label><button class="btn btn-p btn-sm" type="button" onclick="tsSaveEmpForm()">💾 Хадгалах</button></div>
        <div class="fld" style="flex:0 0 auto"><label>&nbsp;</label><button class="btn btn-sm" type="button" onclick="tsSeedFromDoctors()" title="Системд бүртгэлтэй эмч нарыг жагсаалтад нэмнэ">⚡ Эмч нараас</button></div>
      </div></div>` : ''}
    <div class="card" style="padding:12px"><div class="ch">👥 Ажилтнууд <span class="ch-r">${list.length}</span></div>
      ${list.length ? list.map((e, k) => `<div class="ts-emp-row" style="${e.active === false ? 'opacity:.55' : ''}">
        <span class="muted" style="min-width:22px">${k + 1}</span>
        <span style="flex:1 1 160px"><b>${escHTML(e.name)}</b> <span class="muted">· ${escHTML(e.position || '—')}</span>${e.docId ? ' <span class="badge b-p" style="font-size:10px">эмч</span>' : ''}${e.active === false ? ' <span class="badge" style="font-size:10px">идэвхгүй</span>' : ''}</span>
        <span class="muted" style="font-size:11px">${e.startDate ? 'орсон ' + escHTML(e.startDate) : ''}${e.note ? ' · ' + escHTML(e.note) : ''}</span>
        ${canEdit ? `<span class="row" style="gap:4px">
          <button class="btn btn-xs" type="button" onclick="tsMoveEmployee('${escHTML(e.id)}',-1)" title="Дээш">↑</button><button class="btn btn-xs" type="button" onclick="tsMoveEmployee('${escHTML(e.id)}',1)" title="Доош">↓</button>
          <button class="btn btn-xs" type="button" onclick="tsToggleEmp('${escHTML(e.id)}')">${e.active === false ? '✔ Идэвхжүүлэх' : '⏸ Идэвхгүй'}</button>
          <button class="btn btn-xs" type="button" onclick="tsEditEmp('${escHTML(e.id)}')">✎</button>
          <button class="btn btn-r btn-xs" type="button" onclick="tsDeleteEmployee('${escHTML(e.id)}')">✕</button></span>` : ''}
      </div>`).join('') : '<div class="empty" style="padding:16px;font-size:12px">Ажилтан бүртгээгүй</div>'}
    </div>`;
}
function tsSaveEmpForm() {
  const v = id => { const el = document.getElementById(id); return el ? el.value : ''; };
  const e = tsSaveEmployee({ id: v('ts-e-id'), name: v('ts-e-name'), position: v('ts-e-pos'), startDate: v('ts-e-start'), docId: v('ts-e-doc'), note: v('ts-e-note') });
  if (!e) return;
  toast('💾 ' + e.name + ' хадгалагдлаа', 'ok');
  ['ts-e-id', 'ts-e-name', 'ts-e-pos', 'ts-e-start', 'ts-e-doc', 'ts-e-note'].forEach(id => { const el = document.getElementById(id); if (el) el.value = ''; });
  renderTimesheet();
}
function tsEditEmp(id) {
  const e = tsEmpById(id); if (!e) return;
  const set = (k, val) => { const el = document.getElementById(k); if (el) el.value = val == null ? '' : val; };
  set('ts-e-id', e.id); set('ts-e-name', e.name); set('ts-e-pos', e.position); set('ts-e-start', e.startDate); set('ts-e-doc', e.docId); set('ts-e-note', e.note);
  const f = document.getElementById('ts-emp-form'); if (f && f.scrollIntoView) f.scrollIntoView({ behavior: 'smooth', block: 'start' });
}
function tsToggleEmp(id) { const e = tsEmpById(id); if (!e || !tsCanEdit()) return; e.active = e.active === false; e.ms = nowMs(); _tsSaveEmployees(); renderTimesheet(); }

// ── Excel (SheetJS) ─────────────────────────────────────────
async function ensureXLSX() {
  if (typeof XLSX !== 'undefined') return true;
  const CDNS = ['xlsx.full.min.js', 'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js', 'https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js'];
  for (const url of CDNS) {
    try { await new Promise((res, rej) => { const el = document.createElement('script'); el.src = url; el.onload = res; el.onerror = () => rej(new Error('load')); document.head.appendChild(el); }); if (typeof XLSX !== 'undefined') return true; } catch (_) {}
  }
  toast('Excel сан ачаалж чадсангүй — интернэт холболтоо шалгана уу', 'err'); return false;
}
// Яг хуучин маягт: А №, B албан тушаал, C нэрс, D зохих өдөр, E цаг (=D*8), F.. өдрүүд, дараа нь
// Ажилласан (өдөр, цаг), Задаргаа /цагаар/ (Өдрөөр, Жижүүр, Үржүүлэг, Өвчтэй, Чөлөөтэй, Тасалсан, Амарсан),
// Тайлбар, Нийт ажилласан цаг (Эмнэлэг, Томилолт, Нийт). Доор өдөр бүрийн дүн + Өдөрт ажиллах эмчийн тоо + гарын үсэг.
async function tsExportExcel() {
  if (!(await ensureXLSX())) return;
  const ym = TS_MONTH, days = tsRangeDays(ym, TS_RANGE), emps = tsEmployees();
  if (!emps.length) { toast('Ажилтан алга', 'err'); return; }
  const ws = {}; const merges = [];
  const col = i => XLSX.utils.encode_col(i);
  const set = (r, c, v, f) => { const ref = col(c) + (r + 1); const cell = f ? { t: 'n', f } : (typeof v === 'number' ? { t: 'n', v } : { t: 's', v: String(v == null ? '' : v) }); ws[ref] = cell; };
  const D0 = 5; // эхний өдрийн багана (F)
  const nD = days.length;
  const cWorkD = D0 + nD, cWorkH = cWorkD + 1, cB = cWorkH + 1; // задаргаа 7 багана
  const cNote = cB + 7, cTot = cNote + 1; // нийт 3 багана
  const lastCol = cTot + 2;
  const dayL = i => col(D0 + i);
  const rng = r => dayL(0) + (r + 1) + ':' + dayL(nD - 1) + (r + 1);
  const cnt = (r, code, mul) => 'COUNTIF(' + rng(r) + ',"' + code + '")' + (mul ? '*' + mul : '');
  // Толгой
  set(0, D0, 'БАТАЛСАН: ЕРӨНХИЙ ЗАХИРАЛ ..................................................А.НАРАНБААТАР'); merges.push({ s: { r: 0, c: D0 }, e: { r: 0, c: Math.min(D0 + 22, lastCol) } });
  set(1, D0, 'МОРЬТОН АДУУНЫ ЭМНЭЛЭГ - ЦАГ ТӨЛӨВЛӨЛТ /' + ym.replace('-', '.') + ' сар/'); merges.push({ s: { r: 1, c: D0 }, e: { r: 1, c: Math.min(D0 + 29, lastCol) } });
  set(2, cNote, todayStr().replace(/-/g, '.'));
  set(3, 0, '№'); merges.push({ s: { r: 3, c: 0 }, e: { r: 4, c: 0 } });
  set(3, 1, 'Албан тушаал'); merges.push({ s: { r: 3, c: 1 }, e: { r: 4, c: 1 } });
  set(3, 2, 'Нэрс'); merges.push({ s: { r: 3, c: 2 }, e: { r: 4, c: 2 } });
  set(3, 3, 'Ажиллавал зохих'); merges.push({ s: { r: 3, c: 3 }, e: { r: 3, c: 4 } }); set(4, 3, 'өдөр'); set(4, 4, 'цаг');
  set(3, D0, ym.replace('-', '.') + ' сар'); merges.push({ s: { r: 3, c: D0 }, e: { r: 3, c: D0 + nD - 1 } });
  days.forEach((d, i) => set(4, D0 + i, TS_DOW[tsDow(ym, d)] + ' ' + ym.slice(5, 7) + '/' + d));
  set(3, cWorkD, 'Ажилласан '); merges.push({ s: { r: 3, c: cWorkD }, e: { r: 3, c: cWorkH } }); set(4, cWorkD, 'өдөр'); set(4, cWorkH, 'цаг');
  set(3, cB, 'Задаргаа /цагаар/'); merges.push({ s: { r: 3, c: cB }, e: { r: 3, c: cB + 6 } });
  ['Өдрөөр', 'Night Duty', 'Үржүүлэг', 'Sick', 'Leave with Pay', 'Absent', 'Rest Day'].forEach((h, i) => set(4, cB + i, h));
  set(3, cNote, 'Тайлбар '); merges.push({ s: { r: 3, c: cNote }, e: { r: 4, c: cNote } });
  set(3, cTot, 'Нийт ажилласан цаг'); merges.push({ s: { r: 3, c: cTot }, e: { r: 3, c: cTot + 2 } }); set(4, cTot, 'Эмнэлэг'); set(4, cTot + 1, 'Business Trip'); set(4, cTot + 2, 'Нийт ');
  // Ажилтнууд
  const R0 = 5; let docMin = -1, docMax = -1, docContig = true, lastDocRow = -1;
  emps.forEach((e, k) => {
    const r = R0 + k;
    set(r, 0, k + 1); set(r, 1, e.position || ''); set(r, 2, e.name || '');
    const plan = tsPlanDays(e.id, ym); if (plan !== '') set(r, 3, parseFloat(plan) || 0); else set(r, 3, '');
    set(r, 4, null, 'SUM(D' + (r + 1) + '*8)');
    days.forEach((d, i) => { const c = tsCode(e.id, tsDate(ym, d)); set(r, D0 + i, c || ''); });
    set(r, cWorkD, null, [cnt(r, 'D', 1), cnt(r, 'N', 1), cnt(r, 'Business Trip', 1), cnt(r, 'Breed', 1), cnt(r, 'Half', 1), cnt(r, 'Pharm', 1), cnt(r, 'Office Duty', 1)].join('+'));
    set(r, cWorkH, null, [cnt(r, 'D', 8), cnt(r, 'N', 8), cnt(r, 'Business Trip', 8), cnt(r, 'Breed', 8), cnt(r, 'Half', 4), cnt(r, 'Pharm', 8), cnt(r, 'Office Duty', 8)].join('+'));
    [['D', 8], ['N', 8], ['Breed', 8], ['өвчтэй', 8], ['L', 8], ['Abs', 8], ['R', 8]].forEach((p, i) => set(r, cB + i, null, cnt(r, p[0], p[1])));
    set(r, cNote, tsNote(e.id, ym) || (e.startDate && e.startDate.slice(0, 7) === ym ? e.startDate.slice(5).replace('-', '.') + '-с ажиллаж эхэлсэн.' : ''));
    set(r, cTot, null, [cnt(r, 'D', 8), cnt(r, 'N', 8), cnt(r, 'Half', 4), cnt(r, 'Pharm', 8), cnt(r, 'Office Duty', 8)].join('+'));
    set(r, cTot + 1, null, [cnt(r, 'Business Trip', 8), cnt(r, 'Breed', 8)].join('+'));
    set(r, cTot + 2, null, col(cTot) + (r + 1) + '+' + col(cTot + 1) + (r + 1));
    if (tsIsDoctorEmp(e)) { if (docMin < 0) docMin = r; if (lastDocRow >= 0 && r !== lastDocRow + 1) docContig = false; docMax = r; lastDocRow = r; }
  });
  const rEnd = R0 + emps.length - 1;
  // Өдөр бүрийн дүн
  const sums = [['ирсэн', c => 'COUNTIF(' + c + ',"Ө")*1+COUNTIF(' + c + ',"Ж")*1+COUNTIF(' + c + ',"хагас")*1+COUNTIF(' + c + ',"эм.сан")*1+COUNTIF(' + c + ',"Оффис")*1'],
    ['амарсан', c => 'COUNTIF(' + c + ',"А")*1'], ['тасалсан', c => 'COUNTIF(' + c + ',"Тас")*1'], ['Чөлөө', c => 'COUNTIF(' + c + ',"Ч")*1'],
    ['Business Trip', c => 'COUNTIF(' + c + ',"ҮЖ")*1+COUNTIF(' + c + ',"Томилолт")*1'], ['Sick', c => 'COUNTIF(' + c + ',"Өвчтэй")*1'], ['Ээлжийн амралт', c => 'COUNTIF(' + c + ',"ЭА")*1']];
  let r = rEnd + 1; const sumStart = r;
  sums.forEach((s, k) => { set(r, 0, emps.length + k + 1); set(r, 2, s[0]); days.forEach((d, i) => { const L = dayL(i); set(r, D0 + i, null, s[1](L + (R0 + 1) + ':' + L + (rEnd + 1))); }); r++; });
  set(r, 0, emps.length + sums.length + 1); set(r, 2, 'Нийт'); days.forEach((d, i) => { const L = dayL(i); set(r, D0 + i, null, 'SUM(' + L + (sumStart + 1) + ':' + L + r + ')'); }); r++;
  set(r, 1, 'Өдөрт ажиллах эмчийн тоо'); merges.push({ s: { r, c: 1 }, e: { r, c: 2 } });
  days.forEach((d, i) => {
    const L = dayL(i);
    if (docMin >= 0 && docContig) set(r, D0 + i, null, 'COUNTIF(' + L + (docMin + 1) + ':' + L + (docMax + 1) + ',"Ө")*1+COUNTIF(' + L + (docMin + 1) + ':' + L + (docMax + 1) + ',"Ж")*1');
    else set(r, D0 + i, tsDayStats(tsDate(ym, d), emps).doctors);
  });
  r += 2;
  set(r, 1, 'Цагийн бүртгэлийг хөтөлсөн: '); merges.push({ s: { r, c: 1 }, e: { r, c: 2 } }); r++;
  set(r, 2, 'Үйл ажиллагааны менежер:......................................'); merges.push({ s: { r, c: 2 }, e: { r, c: 10 } }); r += 2;
  set(r, 1, 'Цагийн бүртгэлийг хянасан:'); merges.push({ s: { r, c: 1 }, e: { r, c: 2 } }); r++;
  set(r, 2, 'Ерөнхий менежер: .......................................'); merges.push({ s: { r, c: 2 }, e: { r, c: 10 } });
  ws['!ref'] = 'A1:' + col(lastCol) + (r + 1);
  ws['!merges'] = merges;
  const cols = [{ wch: 5 }, { wch: 18 }, { wch: 17 }, { wch: 7 }, { wch: 7 }]; days.forEach(() => cols.push({ wch: 6 })); cols.push({ wch: 7 }, { wch: 7 }); for (let i = 0; i < 7; i++) cols.push({ wch: 8 }); cols.push({ wch: 26 }, { wch: 9 }, { wch: 9 }, { wch: 8 });
  ws['!cols'] = cols;
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, tsRangeLabel(ym, TS_RANGE).slice(0, 31));
  XLSX.writeFile(wb, 'Цагийн_бүртгэл_' + tsRangeLabel(ym, TS_RANGE) + '.xlsx');
  try { writeLog('Цагийн бүртгэл Excel татав', '', '', tsRangeLabel(ym, TS_RANGE)); } catch (e) {}
}
// 🖨 Хэвлэх (гарын үсгийн хуудас)
function tsPrint() {
  const ym = TS_MONTH, days = tsRangeDays(ym, TS_RANGE), emps = tsEmployees();
  if (!emps.length) { toast('Ажилтан алга', 'err'); return; }
  const dayS = days.map(d => tsDayStats(tsDate(ym, d), emps));
  const html = `<!doctype html><html><head><meta charset="utf-8"><title>Цагийн бүртгэл ${tsRangeLabel(ym, TS_RANGE)}</title>
  <style>@page{size:A4 landscape;margin:8mm}body{font-family:Arial,sans-serif;font-size:9px;margin:0}h2{font-size:12px;text-align:center;margin:2px 0}.top{text-align:center;font-size:10px;margin-bottom:4px}
  table{border-collapse:collapse;width:100%}th,td{border:1px solid #777;padding:1px 2px;text-align:center}th{background:#eee;font-size:8px}td.l{text-align:left;white-space:nowrap}.we{background:#fbeaea}.sum{background:#f3efe4;font-weight:700}
  .ft{display:flex;justify-content:space-between;margin-top:10px;font-size:10px}</style></head><body>
  <div class="top">БАТАЛСАН: ЕРӨНХИЙ ЗАХИРАЛ .................................................. А.НАРАНБААТАР</div>
  <h2>МОРЬТОН АДУУНЫ ЭМНЭЛЭГ - ЦАГ ТӨЛӨВЛӨЛТ /${escHTML(tsRangeLabel(ym, TS_RANGE))}/</h2>
  <table><thead><tr><th rowspan="2">№</th><th rowspan="2">Албан тушаал</th><th rowspan="2">Нэрс</th><th colspan="2">Ажиллавал зохих</th><th colspan="${days.length}">${escHTML(ym.replace('-', '.'))} сар</th><th colspan="2">Ажилласан</th><th colspan="7">Задаргаа /цагаар/</th><th rowspan="2">Тайлбар</th></tr>
  <tr><th>өдөр</th><th>цаг</th>${days.map(d => `<th class="${[0, 6].includes(tsDow(ym, d)) ? 'we' : ''}">${TS_DOW[tsDow(ym, d)]}<br>${d}</th>`).join('')}<th>өдөр</th><th>цаг</th><th>Өдрөөр</th><th>Жижүүр</th><th>Үржүүлэг</th><th>Өвчтэй</th><th>Чөлөөтэй</th><th>Тасалсан</th><th>Амарсан</th></tr></thead><tbody>
  ${emps.map((e, k) => { const st = tsRowStats(e.id, ym, days); const plan = tsPlanDays(e.id, ym); return `<tr><td>${k + 1}</td><td class="l">${escHTML(e.position || '')}</td><td class="l">${escHTML(e.name)}</td><td>${escHTML(String(plan))}</td><td>${plan !== '' ? (parseFloat(plan) || 0) * 8 : ''}</td>${days.map(d => `<td class="${[0, 6].includes(tsDow(ym, d)) ? 'we' : ''}">${escHTML(tsCode(e.id, tsDate(ym, d)))}</td>`).join('')}<td class="sum">${st.workedDays}</td><td class="sum">${st.hours}</td><td>${(st.by['D'] || 0) * 8 || ''}</td><td>${(st.by['N'] || 0) * 8 || ''}</td><td>${(st.by['Breed'] || 0) * 8 || ''}</td><td>${(st.by['Sick'] || 0) * 8 || ''}</td><td>${(st.by['L'] || 0) * 8 || ''}</td><td>${(st.by['Abs'] || 0) * 8 || ''}</td><td>${(st.by['R'] || 0) * 8 || ''}</td><td class="l">${escHTML(tsNote(e.id, ym))}</td></tr>`; }).join('')}
  ${[['ирсэн', 'came'], ['амарсан', 'rest'], ['тасалсан', 'abs'], ['Чөлөө', 'leave'], ['Business Trip', 'trip'], ['Sick', 'sick'], ['Ээлжийн амралт', 'vac'], ['Өдөрт ажиллах эмчийн тоо', 'doctors']].map(f => `<tr class="sum"><td></td><td colspan="2" class="l">${f[0]}</td><td></td><td></td>${dayS.map(s => `<td>${s[f[1]] || ''}</td>`).join('')}<td colspan="10"></td></tr>`).join('')}
  </tbody></table>
  <div class="ft"><span>Цагийн бүртгэлийг хөтөлсөн: Үйл ажиллагааны менежер ............................</span><span>Цагийн бүртгэлийг хянасан: Ерөнхий менежер ............................</span></div>
  <script>window.onload=function(){window.print();}<\/script></body></html>`;
  const w = window.open('', '_blank'); if (!w) { toast('Popup хаалттай байна', 'err'); return; }
  w.document.write(html); w.document.close();
}
