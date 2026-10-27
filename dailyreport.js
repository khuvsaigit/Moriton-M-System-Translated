// ============================================================
// 📋 ӨДРИЙН МЭДЭЭ (салбарын өдөр бүрийн мэдээ) — Excel «Өдрийн мэдээ» маягт
// ============================================================
// Ихэнх мөр системийн датанаас автоматаар (үзлэг, байрлагч, санхүү, цагийн
// бүртгэл); дамжин өнгөрөх адуу, гомдол, санал зэрэг нь гараар.
// Гараар бичсэн утга + автомат утгын засвар: staff/{огноо}.daily = { v:{key:value}, ov:{key:value} }
// Тохиргоо: clinic_config.dailyCfg = { branch, preparer }  (STATE.dailyCfg)
// ============================================================

const DR_ROWS = [
  { k: 'arrived',    label: 'Arrived Horses Count',                                  src: 'auto',   sum: true },
  { k: 'iabkStart',  label: 'Start IABK (Medical Card #):',                                     src: 'manual', sum: false },
  { k: 'iabkEnd',    label: 'End IABK (Medical Card #):',                                     src: 'manual', sum: false },
  { k: 'calls',      label: 'On-Call Examined Horses Count',                        src: 'auto',   sum: true },
  { k: 'examSheets', label: 'Examination Sheets Count',                              src: 'auto',   sum: true },
  { k: 'examStart',  label: 'Start Exam Sheet #:',                                   src: 'auto',   sum: false },
  { k: 'examEnd',    label: 'End Exam Sheet #:',                                  src: 'auto',   sum: false },
  { k: 'total',      label: 'Total Exam Count',                                          src: 'formula', sum: true },
  { k: 'inpCount',   label: 'Inpatient Horses Count (as of 22:00)',  src: 'auto',   sum: true },
  { k: 'morning',    label: 'Morning Treatments',                                src: 'auto',   sum: true },
  { k: 'day',        label: 'Day Treatments',                                  src: 'auto',   sum: true },
  { k: 'evening',    label: 'Evening Treatments',                                   src: 'auto',   sum: true },
  { k: 'night',      label: 'Night Treatments',                                  src: 'auto',   sum: true },
  { k: 'surgery',    label: 'Surgical Procedures Count',                        src: 'auto',   sum: true },
  { k: 'transit',    label: 'Transient / Holding Horses Count',                         src: 'manual', sum: true },
  { k: 'done',       label: 'Эмчилгээ дууссан адууны тоо ',                       src: 'auto',   sum: true },
  { k: 'left',       label: 'Явсан адууны тоо',                                   src: 'manual', sum: true },
  { k: 'severe',     label: 'Хүнд /Асаргаа их шаардлагатай/',                     src: 'auto',   sum: true },
  { k: 'medium',     label: 'Дунд /цагийн тариатай, асаргаатай/',                 src: 'auto',   sum: true },
  { k: 'light',      label: 'Хөнгөн /боолт, бага асаргаатай/',                    src: 'auto',   sum: true },
  { k: 'revenue',    label: 'Борлуулалтын орлого',                                src: 'auto',   sum: true, money: true },
  { k: 'paid',       label: 'Төлбөр төлөгдсөн ',                                  src: 'auto',   sum: true, money: true },
  { k: 'recvNew',    label: 'Авлага үүссэн /зээлээр/',                            src: 'auto',   sum: true, money: true },
  { k: 'recvPaid',   label: 'Авлагаас төлөгдсөн',                                 src: 'auto',   sum: true, money: true },
  { k: 'barter',     label: 'Бартераар',                                          src: 'auto',   sum: true, money: true },
  { k: 'staffTotal', label: 'Нийт ажилласан хүний тоо',                           src: 'formula', sum: true },
  { k: 'chief',      label: 'Chief Veterinarian',                                        src: 'auto',   sum: true },
  { k: 'manager',    label: 'Manager:',                                           src: 'auto',   sum: true },
  { k: 'dutyDoc',    label: 'Жижүүр эмч:',                                        src: 'auto',   sum: true },
  { k: 'dayDoc',     label: 'Өдрийн эмч / тоо',                                   src: 'auto',   sum: true },
  { k: 'pharm',      label: 'Pharmacist / тоо',                                   src: 'auto',   sum: true },
  { k: 'intern',     label: 'Дад.Эмч /Оюутан/',                                   src: 'auto',   sum: true },
  { k: 'horseman',   label: 'Адуучин / тоо',                                      src: 'auto',   sum: true },
  { k: 'other',      label: 'Бусад ажилтан (нярав, тогооч, үйлчлэгч г.м)',        src: 'auto',   sum: true },
  { k: 'trip',       label: 'Томилолттой гадуур ажилсан',                         src: 'auto',   sum: true },
  { k: 'fromCenter', label: 'Төвөөс ирж ажилласан хүний тоо ',                    src: 'manual', sum: true },
  { k: 'fromOut',    label: 'Гаднаас ирж ажилласан хүний тоо ',                   src: 'manual', sum: true },
  { k: 'rest',       label: 'Амарсан ажилтаны тоо ',                              src: 'auto',   sum: true },
  { k: 'sick',       label: 'Өвчтэй ажилтаны тоо ',                               src: 'auto',   sum: true },
  { k: 'leave',      label: 'Чөлөөтэй ажилтаны тоо ',                             src: 'auto',   sum: true },
  { k: 'absent',     label: 'Тасалсан ажилтаны тоо ',                             src: 'auto',   sum: true },
  { k: 'complaints', label: 'Ирсэн гомдолын тоо ',                                src: 'manual', sum: true },
  { k: 'resolved',   label: 'Шийдвэрлэсэн гомдолын тоо ',                         src: 'manual', sum: true },
  { k: 'sugStaff',   label: 'Санал хүсэлт: Ажилчидаас ',                          src: 'manual', sum: false, text: true },
  { k: 'sugCust',    label: 'Санал хүсэлт: Үйлчлүүлэгчээс ',                      src: 'manual', sum: false, text: true }
];
const DR_TOTAL_KEYS = ['inpCount', 'morning', 'day', 'evening', 'night', 'surgery', 'transit', 'done', 'severe', 'medium', 'light']; // Total Exam Count= эдгээрийн нийлбэр (Явсан орохгүй — хуучин маягтын томьёо)
const DR_STAFF_KEYS = ['chief', 'manager', 'dutyDoc', 'dayDoc', 'pharm', 'intern', 'horseman', 'other', 'trip', 'fromCenter', 'fromOut'];
const DR_SURGERY_RE = /мэс засал|хагалгаа|оёх|тайрах|хадах|имплант/i;
const INP_SEVERITY = [['', '— заагаагүй —'], ['Хүнд', '🔴 Хүнд — асаргаа их шаардлагатай'], ['Дунд', '🟠 Дунд — цагийн тариатай, асаргаатай'], ['Хөнгөн', '🟢 Хөнгөн — боолт, бага асаргаатай']];

function drCfg() { return Object.assign({ branch: 'Хүй 7 (төв эмнэлэг)', preparer: '' }, STATE.dailyCfg || {}); }
function drSaveCfg(patch) { STATE.dailyCfg = Object.assign({}, drCfg(), patch || {}); lsSet('mt_daily_cfg', STATE.dailyCfg); try { fbSaveClinicConfig(); } catch (e) {} }
function drCanEdit() { return typeof tsCanEdit === 'function' ? tsCanEdit() : (typeof canEditData === 'function' && canEditData()); }
function drDay(date, create) { return (typeof tsDayDoc === 'function') ? tsDayDoc(date, create) : null; }
function drManual(date, k) { const d = drDay(date); return (d && d.daily && d.daily.v && d.daily.v[k] != null) ? d.daily.v[k] : ''; }
function drOverride(date, k) { const d = drDay(date); return (d && d.daily && d.daily.ov && d.daily.ov[k] != null) ? d.daily.ov[k] : null; }
function drSet(date, kind, k, val) {
  if (!drCanEdit()) { toast('Өдрийн мэдээ засах эрх алга', 'err'); return; }
  const d = drDay(date, true); if (!d.daily || typeof d.daily !== 'object') d.daily = { v: {}, ov: {} };
  if (!d.daily[kind]) d.daily[kind] = {};
  if (val === '' || val == null) delete d.daily[kind][k]; else d.daily[kind][k] = val;
  d.ms = nowMs(); saveAll(); fbSaveRecord('staff', d);
}
// Төлбөрийн бодит өдөр (ms-ээс), байхгүй бол бичсэн огноо
function _payDay(p) { if (p && p.ms) { try { return localDateStr(new Date(p.ms)); } catch (e) {} } return (p && p.date) || ''; }
function _isPlannedEx(e) { return typeof isPlanned === 'function' ? isPlanned(e) : (e && e.kind === 'planned'); }

// Тухайн өдрийн автомат утгууд
function drAuto(date) {
  const A = {};
  const exams = (STATE.exams || []).filter(e => e && (e.date || '').slice(0, 10) === date && !_isPlannedEx(e));
  const horses = new Set(exams.map(e => String(e.horseId || e.horse || '')));
  A.arrived = horses.size;
  A.examSheets = exams.length;
  const nums = exams.map(e => e.examNum).filter(Boolean).sort((a, b) => String(a).localeCompare(String(b), undefined, { numeric: true }));
  A.examStart = nums.length ? nums[0] : ''; A.examEnd = nums.length ? nums[nums.length - 1] : '';
  A.calls = exams.filter(e => { try { const c = typeof bonusCategoryOf === 'function' ? bonusCategoryOf(e) : ''; return c === 'On-Call Service' || c === 'Clinical On-Call'; } catch (err) { return false; } }).length;
  // Байрлагчид
  const inps = STATE.inps || [];
  const inOn = i => typeof inpInHospitalOn === 'function' ? inpInHospitalOn(i, date) : (i.admittedDate <= date && (!i.discharged || i.dischargedDate >= date));
  const active = inps.filter(i => i && inOn(i) && !(i.discharged && i.dischargedDate === date));
  A.inpCount = active.length;
  const slots = { 'Өглөө': 0, 'Өдөр': 0, 'Орой': 0, 'Шөнө': 0 };
  let surgeryHorses = new Set();
  inps.forEach(i => (i.log || []).forEach(l => {
    if ((l.date || '').slice(0, 10) !== date) return;
    const s = slots.hasOwnProperty(l.slot) ? l.slot : 'Өдөр'; slots[s]++;
    if ((l.services || []).some(x => DR_SURGERY_RE.test(x && (x.name || x)))) surgeryHorses.add(String(i.id));
  }));
  A.morning = slots['Өглөө']; A.day = slots['Өдөр']; A.evening = slots['Орой']; A.night = slots['Шөнө'];
  exams.forEach(e => { if ((e.services || []).some(x => DR_SURGERY_RE.test(x && (x.name || x)))) surgeryHorses.add('ex' + e.id); });
  A.surgery = surgeryHorses.size;
  A.done = inps.filter(i => i && i.discharged && i.dischargedDate === date).length;
  A.severe = active.filter(i => i.severity === 'Хүнд').length; A.medium = active.filter(i => i.severity === 'Дунд').length; A.light = active.filter(i => i.severity === 'Хөнгөн').length;
  // Accountant / Finance
  const fins = STATE.fins || [];
  const dayFins = fins.filter(f => f && (f.date || '').slice(0, 10) === date);
  A.revenue = dayFins.reduce((a, f) => a + (parseFloat(f.amount) || 0), 0);
  let paid = 0, recvPaid = 0, barter = 0, paidOnDayFins = 0;
  fins.forEach(f => (Array.isArray(f.payments) ? f.payments : []).forEach(p => {
    if (!p || p.method === 'зээл' || _payDay(p) !== date) return;
    const amt = parseFloat(p.amount) || 0;
    if (/бартер/i.test(p.method || '')) barter += amt;
    paid += amt;
    if ((f.date || '').slice(0, 10) === date) paidOnDayFins += amt; else recvPaid += amt;
  }));
  A.paid = paid; A.recvPaid = recvPaid; A.barter = barter;
  A.recvNew = Math.max(0, A.revenue - paidOnDayFins);
  // Ажилтнууд (цагийн бүртгэл)
  const S = { chief: 0, manager: 0, dutyDoc: 0, dayDoc: 0, pharm: 0, intern: 0, horseman: 0, other: 0, trip: 0, rest: 0, sick: 0, leave: 0, absent: 0 };
  if (typeof tsEmployees === 'function') tsEmployees().forEach(e => {
    const c = tsCode(e.id, date); if (!c) return; const def = tsCodeDef(c); const k = def ? def.c : c; const pos = e.position || '';
    if (k === 'R') S.rest++; else if (k === 'Sick') S.sick++; else if (k === 'L') S.leave++; else if (k === 'Abs') S.absent++;
    if (!def || !def.worked) return;
    if (def.trip) { S.trip++; return; }
    if (k === 'Pharm' || /эмийн санч/i.test(pos)) S.pharm++;
    else if (/ерөнхий эмч/i.test(pos)) S.chief++;
    else if (/менежер/i.test(pos)) S.manager++;
    else if (/дад|оюутан/i.test(pos)) S.intern++;
    else if (/адууч/i.test(pos)) S.horseman++;
    else if (/эмч|дарга|ахлах/i.test(pos) || e.docId) { if (def.duty) S.dutyDoc++; else S.dayDoc++; }
    else S.other++;
  });
  Object.assign(A, S);
  return A;
}
// Эцсийн утга: автомат → гараар засвар (ov) → гараар бичсэн (v)
function drValue(date, k, A) {
  const row = DR_ROWS.find(r => r.k === k); if (!row) return '';
  if (row.src === 'manual') return drManual(date, k);
  if (row.src === 'formula') {
    const keys = k === 'total' ? DR_TOTAL_KEYS : DR_STAFF_KEYS;
    return keys.reduce((a, kk) => a + (parseFloat(drValue(date, kk, A)) || 0), 0);
  }
  const ov = drOverride(date, k); if (ov != null) return ov;
  A = A || drAuto(date); return A[k] == null ? '' : A[k];
}

// ── Хуудас (Тайлан → 📋 Өдрийн мэдээ карт) ──────────────────
let DR_DATE = todayStr(), DR_OPEN = false;
function drToggle() { DR_OPEN = !DR_OPEN; renderDailyReport(); if (DR_OPEN) { const c = document.getElementById('dr-body'); if (c && c.scrollIntoView) c.scrollIntoView({ behavior: 'smooth', block: 'start' }); } }
function drOnDate(v) { if (v) DR_DATE = v; renderDailyReport(); }
function renderDailyReport() {
  const box = document.getElementById('dr-card'); if (!box) return;
  const canEdit = drCanEdit(), cfg = drCfg(), date = DR_DATE;
  if (!DR_OPEN) { box.innerHTML = `<div class="row" style="justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px"><div class="ch" style="margin:0">📋 Өдрийн мэдээ (салбарын өдөр бүрийн мэдээ) <span class="muted" style="font-weight:600;text-transform:none;font-size:11px">— ирсэн адуу, үзлэгийн №, байрлагч, эмчилгээ, орлого, ажилтны тоо системээс автоматаар; Excel маягтаар татна</span></div><button class="btn btn-sm btn-p" type="button" onclick="drToggle()">📋 Өдрийн мэдээ нээх</button></div>`; return; }
  const A = drAuto(date);
  const rowHTML = r => {
    const v = drValue(date, r.k, A);
    const disp = r.money ? fmt(parseFloat(v) || 0) : escHTML(String(v === '' || v == null ? '' : v));
    let cell;
    if (r.src === 'manual') {
      cell = canEdit ? (r.text ? `<input class="inp" value="${escHTML(String(v))}" placeholder="…" style="padding:4px 8px;font-size:12px" onchange="drSet('${date}','v','${r.k}',this.value.trim())">` : `<input class="inp" type="number" value="${escHTML(String(v))}" placeholder="0" style="width:110px;padding:4px 8px;font-size:12px;text-align:right" onchange="drSet('${date}','v','${r.k}',this.value===''?'':parseFloat(this.value))">`) : disp;
    } else if (r.src === 'formula') cell = `<b>${disp}</b>`;
    else {
      const ov = drOverride(date, r.k);
      cell = `<span ${ov != null ? 'style="color:var(--orange-dark)" title="Гараар зассан (автомат: ' + escHTML(String(A[r.k])) + ')"' : ''}>${disp}${ov != null ? ' ✎' : ''}</span>` + (canEdit ? ` <button class="btn btn-xs" type="button" style="padding:1px 6px" title="Автомат утгыг гараар засах" onclick="drEditOverride('${date}','${r.k}')">✎</button>` : '');
    }
    return `<tr><td style="text-align:left;white-space:normal;line-height:1.3">${escHTML(r.label.trim())}${r.src === 'manual' ? ' <span class="muted" style="font-size:10px">гараар</span>' : ''}</td><td style="text-align:right;white-space:nowrap;width:150px">${cell}</td></tr>`;
  };
  const groups = [['🐴 Адуу, үзлэг', DR_ROWS.slice(0, 7)], ['🏥 Байрлан эмчилгээ', DR_ROWS.slice(7, 20)], ['💰 Accountant / Finance', DR_ROWS.slice(20, 25)], ['👥 Ажилтан', DR_ROWS.slice(25, 41)], ['📣 Complaints & Client Feedback', DR_ROWS.slice(41)]];
  box.innerHTML = `
    <div class="row" style="justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px"><div class="ch" style="margin:0">📋 Өдрийн мэдээ</div><button class="btn btn-sm" type="button" onclick="drToggle()">✕ Хаах</button></div>
    <div id="dr-body" style="display:flex;flex-wrap:wrap;gap:8px;align-items:flex-end;margin:10px 0">
      <div class="fld" style="flex:0 1 160px"><label>Огноо</label><input class="inp" type="date" value="${date}" onchange="drOnDate(this.value)"></div>
      <div class="fld" style="flex:1 1 180px"><label>Салбар</label><input class="inp" value="${escHTML(cfg.branch)}" ${canEdit ? `onchange="drSaveCfg({branch:this.value.trim()})"` : 'readonly'}></div>
      <div class="fld" style="flex:1 1 180px"><label>Боловсруулсан (ЕМ)</label><input class="inp" value="${escHTML(cfg.preparer || (STATE.user && STATE.user.name) || '')}" ${canEdit ? `onchange="drSaveCfg({preparer:this.value.trim()})"` : 'readonly'}></div>
      <div class="fld" style="flex:0 0 auto"><label>&nbsp;</label><span class="row" style="gap:6px"><button class="btn btn-sm btn-p" type="button" onclick="drExportExcel()">⬇ Excel (${escHTML(date.slice(0, 7).replace('-', '.'))} сар)</button><button class="btn btn-sm" type="button" onclick="drPrint()">🖨 Хэвлэх (${escHTML(date)})</button></span></div>
    </div>
    <div class="muted" style="font-size:11.5px;margin-bottom:8px">Автомат мөрийг ✎-ээр гараар засаж болно (засвар тухайн өдөрт хадгалагдана). Өглөө/өдөр/орой/шөнийн эмчилгээ — байрлагчийн өдрийн бичлэгийн ⏰ цагаар; цаг заагаагүй бичлэг «Өдрийн»-д орно. Хүнд/дунд/хөнгөн — байрлагчийн картын зэрэглэлээр. Ажилтны тоо — Цагийн бүртгэлээс.</div>
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(320px,1fr));gap:10px">
      ${groups.map(g => `<div class="tbl-wrap" style="border:1px solid var(--border);border-radius:10px;padding:6px"><table style="font-size:12.5px;width:100%;table-layout:fixed"><colgroup><col><col style="width:160px"></colgroup><thead><tr><th colspan="2" style="text-align:left">${g[0]}</th></tr></thead><tbody>${g[1].map(rowHTML).join('')}</tbody></table></div>`).join('')}
    </div>`;
}
function drEditOverride(date, k) {
  const row = DR_ROWS.find(r => r.k === k); if (!row) return;
  const A = drAuto(date); const cur = drOverride(date, k);
  const v = prompt(row.label.trim() + '\nАвтомат утга: ' + A[k] + (cur != null ? '\nОдоогийн засвар: ' + cur : '') + '\n\nШинэ утга (хоосон = автоматаар):', cur != null ? String(cur) : '');
  if (v === null) return;
  drSet(date, 'ov', k, v.trim() === '' ? '' : (isNaN(parseFloat(v)) ? v.trim() : parseFloat(v)));
  renderDailyReport();
}
// ── Excel: сарын бүх өдөр баганаар, C = сарын дүн (SUM), яг хуучин маягтын мөрүүд ──
async function drExportExcel() {
  if (typeof ensureXLSX === 'function' && !(await ensureXLSX())) return;
  const ym = DR_DATE.slice(0, 7); const n = tsDaysInMonth(ym); const cfg = drCfg();
  const ws = {}; const merges = [];
  const col = i => XLSX.utils.encode_col(i);
  const set = (r, c, v, f) => { const ref = col(c) + (r + 1); ws[ref] = f ? { t: 'n', f } : (typeof v === 'number' ? { t: 'n', v } : { t: 's', v: String(v == null ? '' : v) }); };
  set(1, 1, '                             МОРЬТОН АДУУНЫ ЭМНЭЛЭГ'); merges.push({ s: { r: 1, c: 1 }, e: { r: 2, c: 6 } });
  set(4, 1, 'ӨДӨР БҮРИЙН МЭДЭЭ'); set(4, 5, 'Салбар: ' + cfg.branch);
  set(6, 1, 'Огноо:'); set(6, 2, parseInt(ym.slice(5, 7)) + ' сарын дүн');
  const days = []; for (let d = 1; d <= n; d++) days.push(d);
  days.forEach((d, i) => set(6, 3 + i, ym.replace('-', '.') + '.' + String(d).padStart(2, '0')));
  const autos = {}; days.forEach(d => { const date = tsDate(ym, d); autos[date] = drAuto(date); });
  const R0 = 7; const rowIdx = {}; DR_ROWS.forEach((r, i) => rowIdx[r.k] = R0 + i);
  DR_ROWS.forEach((r, i) => {
    const rr = R0 + i; set(rr, 1, r.label);
    days.forEach((d, j) => {
      const date = tsDate(ym, d); const c = 3 + j;
      if (r.src === 'formula') {
        const keys = r.k === 'total' ? DR_TOTAL_KEYS : DR_STAFF_KEYS;
        set(rr, c, null, keys.map(k => col(c) + (rowIdx[k] + 1)).join('+'));
      } else { const v = drValue(date, r.k, autos[date]); if (v === '' || v == null) return; set(rr, c, typeof v === 'number' ? v : (isNaN(parseFloat(v)) || r.text ? v : parseFloat(v))); }
    });
    if (r.sum) set(rr, 2, null, 'SUM(' + col(3) + (rr + 1) + ':' + col(3 + n - 1) + (rr + 1) + ')');
  });
  const rEnd = R0 + DR_ROWS.length + 1;
  set(rEnd, 1, 'Боловсруулсан: ЕМ '); set(rEnd, 2, cfg.preparer || (STATE.user && STATE.user.name) || '');
  ws['!ref'] = 'A1:' + col(3 + n - 1) + (rEnd + 1); ws['!merges'] = merges;
  const cols = [{ wch: 2.5 }, { wch: 46.5 }, { wch: 13 }]; days.forEach(() => cols.push({ wch: 11 })); ws['!cols'] = cols;
  const wb = XLSX.utils.book_new(); XLSX.utils.book_append_sheet(wb, ws, 'Өдрийн мэдээ ');
  XLSX.writeFile(wb, 'Өдрийн_мэдээ_' + ym + '.xlsx');
  try { writeLog('Өдрийн мэдээ Excel татав', '', '', ym); } catch (e) {}
}
function drPrint() {
  const date = DR_DATE, cfg = drCfg(), A = drAuto(date);
  const html = `<!doctype html><html><head><meta charset="utf-8"><title>Өдрийн мэдээ ${date}</title>
  <style>body{font-family:Arial,sans-serif;font-size:12px;margin:14mm}h1{font-size:15px;text-align:center;margin:0}h2{font-size:13px;text-align:center;margin:4px 0 10px}table{border-collapse:collapse;width:100%}td{border:1px solid #888;padding:4px 8px}td.v{text-align:right;width:34%;font-weight:700}td.g{background:#eee;font-weight:800}.ft{margin-top:14px}</style></head><body>
  <h1>МОРЬТОН АДУУНЫ ЭМНЭЛЭГ</h1><h2>ӨДӨР БҮРИЙН МЭДЭЭ — ${escHTML(date)} · Салбар: ${escHTML(cfg.branch)}</h2>
  <table>${[['Адуу, үзлэг', 0, 7], ['Байрлан эмчилгээ', 7, 20], ['Accountant / Finance', 20, 25], ['Ажилтан', 25, 41], ['Complaints & Client Feedback', 41, DR_ROWS.length]].map(g => `<tr><td colspan="2" class="g">${g[0]}</td></tr>` + DR_ROWS.slice(g[1], g[2]).map(r => { const v = drValue(date, r.k, A); return `<tr><td>${escHTML(r.label.trim())}</td><td class="v">${r.money ? fmt(parseFloat(v) || 0) : escHTML(String(v === '' || v == null ? '' : v))}</td></tr>`; }).join('')).join('')}</table>
  <div class="ft">Боловсруулсан: ЕМ ${escHTML(cfg.preparer || (STATE.user && STATE.user.name) || '')} ______________ &nbsp;&nbsp; Хэвлэсэн: ${escHTML(todayStr())}</div>
  <script>window.onload=function(){window.print();}<\/script></body></html>`;
  const w = window.open('', '_blank'); if (!w) { toast('Popup хаалттай байна', 'err'); return; }
  w.document.write(html); w.document.close();
}
