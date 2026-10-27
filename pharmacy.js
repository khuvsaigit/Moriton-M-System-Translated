// ============================================================
// 💊 ЭМИЙН САН — эмийн каталог (нэр · нэгж · нэгжийн үнэ),
//    байрлагчийн эмчилгээний КУРС, эмийн санчийн өдрийн картууд
// ============================================================
// Бүтэц:
//   clinic_config.medCatalog = [{ id, name, unit, price, note, ms, deleted }]
//       — нэгжийн үнэ (ж: 1 мл = 500₮). Шинэ collection үүсгэхгүй.
//   inps.course[] = [{ id, med, dose, unit, perDay, days, start, note,
//                      unitPrice, by, ms, stopped, deleted }]
//       — «Антибиотик · 50 мл · өдөрт 1 · 5 хоног · 2026-10-23-аас»
//   inps.log[].meds[] = { name, note, price, qty, unit, unitPrice, courseId, dose, perDay }
//       — өдрийн бичлэгийн эм (хуучин {name, note, price} хэвээр ажиллана)
//   inps.disp = { '<огноо>|<courseId|logId:idx>': { by, ms } }
//       — эмийн санч «өгсөн» гэж тэмдэглэсэн
// ============================================================

const MED_UNITS = ['ml', 'pcs', 'fl', 'amp', 'tube', 'g', 'mg', 'L', 'kg', 'pack', 'dose'];
const PH_EDIT_ROLES = ['Pharmacist', 'Chief Veterinarian', 'Senior Veterinarian', 'Admin', 'Manager'];

// ── Каталог ──────────────────────────────────────────────────
function medCatalog() { return (Array.isArray(STATE.medCatalog) ? STATE.medCatalog : []).filter(m => m && !m.deleted); }
function medKey(n) { return String(n == null ? '' : n).trim().toLowerCase().replace(/\s+/g, ' '); }
function medCatFind(name) { const k = medKey(name); if (!k) return null; return medCatalog().find(m => medKey(m.name) === k) || null; }
function medUnitPrice(name) { const m = medCatFind(name); return m ? (parseFloat(m.price) || 0) : 0; }
function medUnitOf(name) { const m = medCatFind(name); return (m && m.unit) ? m.unit : ''; }
function canEditMedCatalog() {
  if (!STATE.user) return false;
  if (typeof canEditData === 'function' && canEditData()) return true;
  const me = (typeof _meUser === 'function') ? _meUser() : null;
  if (me && me.pharmEdit === true) return true;
  return PH_EDIT_ROLES.includes(STATE.user.role);
}
function _medSaveCatalog(logAction, logDetail) {
  lsSet('mt_med_catalog', STATE.medCatalog || []);
  try { fbSaveClinicConfig(); } catch (e) { console.error('medCatalog save', e); }
  if (logAction) try { writeLog(logAction, '', '', logDetail || ''); } catch (e) {}
}
// Каталогт нэмэх / засах. Ижил нэртэй мөр байвал түүнийг шинэчилнэ.
function saveMedCatalogItem(item) {
  if (!canEditMedCatalog()) { toast('Каталог засах эрх алга', 'err'); return null; }
  const name = String(item.name || '').trim();
  if (!name) { toast('Эмийн нэр оруулна уу', 'err'); return null; }
  if (!Array.isArray(STATE.medCatalog)) STATE.medCatalog = [];
  const price = Math.max(0, parseFloat(item.price) || 0);
  const unit = String(item.unit || '').trim();
  let m = item.id ? STATE.medCatalog.find(x => x && String(x.id) === String(item.id)) : null;
  if (!m) m = STATE.medCatalog.find(x => x && !x.deleted && medKey(x.name) === medKey(name));
  const me = (STATE.user && STATE.user.name) || '';
  if (m) { Object.assign(m, { name, unit, price, note: String(item.note || '').trim(), by: me, ms: nowMs(), deleted: false }); }
  else { m = { id: uid(), name, unit, price, note: String(item.note || '').trim(), by: me, ms: nowMs() }; STATE.medCatalog.push(m); }
  _medSaveCatalog('Эмийн каталог', name + ' · ' + (unit || '—') + ' · ' + fmt(price));
  return m;
}
function deleteMedCatalogItem(id) {
  if (!canEditMedCatalog()) { toast('Каталог засах эрх алга', 'err'); return; }
  const m = (STATE.medCatalog || []).find(x => x && String(x.id) === String(id));
  if (!m) return;
  if (!confirm('«' + m.name + '» эмийг каталогоос хасах уу?\n(Өмнөх бичлэгүүд дэх үнэ хэвээр үлдэнэ)')) return;
  m.deleted = true; m.ms = nowMs();
  _medSaveCatalog('Эмийн каталогоос хасав', m.name);
  renderPharmacy();
}
// Каталог + MED_LIST-ээс хайх (каталогт байгаа нь эхэнд, үнэтэй нь тэмдэгтэй)
function medSearchAll(q, limit) {
  q = medKey(q); if (!q) return [];
  const seen = new Set(), out = [];
  medCatalog().forEach(m => { if (medKey(m.name).includes(q) && !seen.has(medKey(m.name))) { seen.add(medKey(m.name)); out.push({ name: m.name, unit: m.unit || '', price: parseFloat(m.price) || 0, inCat: true }); } });
  (typeof MED_LIST !== 'undefined' ? MED_LIST : []).forEach(n => { if (medKey(n).includes(q) && !seen.has(medKey(n))) { seen.add(medKey(n)); out.push({ name: n, unit: '', price: 0, inCat: false }); } });
  return out.slice(0, limit || 12);
}
function fmtQty(n) { n = parseFloat(n) || 0; return (Math.round(n * 100) / 100).toLocaleString('en-US'); }

// ── Өдрийн маягтын эмийн мөр ─────────────────────────────────
// Эм нэмэхэд каталогоос нэгж, нэгжийн үнийг автоматаар авна; үнэ = тоо × нэгжийн үнэ.
function inpDraftAddMed(name, qty) {
  name = String(name || '').trim(); if (!name) return;
  if (INP_DRAFT.meds.find(x => medKey(x.name) === medKey(name))) { toast(name + ' аль хэдийн нэмэгдсэн', 'err'); return; }
  const up = medUnitPrice(name), unit = medUnitOf(name);
  const q = parseFloat(qty) || 1;
  INP_DRAFT.meds.push({ name, note: '', qty: q, unit, unitPrice: up, price: Math.round(q * up) });
  if (typeof renderInpDraftMeds === 'function') renderInpDraftMeds();
  if (typeof recomputeInpDayAmt === 'function') recomputeInpDayAmt();
}
function inpDraftMedQty(idx, val) {
  const m = INP_DRAFT.meds[idx]; if (!m) return;
  m.qty = Math.max(0, parseFloat(val) || 0);
  if (!m.manualPrice) { m.price = Math.round(m.qty * (parseFloat(m.unitPrice) || 0)); const el = document.getElementById('inp-med-price-' + idx); if (el) el.value = m.price; }
  if (typeof recomputeInpDayAmt === 'function') recomputeInpDayAmt();
}
function inpDraftMedPrice(idx, val) {
  const m = INP_DRAFT.meds[idx]; if (!m) return;
  m.price = Math.max(0, parseFloat(val) || 0); m.manualPrice = true;
  if (typeof recomputeInpDayAmt === 'function') recomputeInpDayAmt();
}
// Эмийн мөрийн HTML (app.js-ийн renderInpDraftMeds энэ функцийг дуудна)
function inpDraftMedRowHTML(m, idx) {
  const cat = medCatFind(m.name);
  const noPrice = !cat || !(parseFloat(cat.price) > 0);
  const unit = m.unit || (cat && cat.unit) || '';
  return `
    <div style="display:flex;align-items:center;gap:6px;background:var(--input);border-radius:8px;padding:6px 10px;margin-bottom:4px;flex-wrap:wrap;${m.fromCourse ? 'border-left:3px solid var(--purple)' : ''}">
      <span style="font-size:13px;font-weight:600;min-width:120px;flex:1 1 140px">${m.fromCourse ? '<span title="Эмчилгээний курсээс автоматаар">📅</span> ' : ''}${escHTML(m.name)}
        ${noPrice ? `<span class="muted" style="font-size:10.5px;font-weight:600" title="Каталогт нэгжийн үнэ оруулаагүй — Эмийн сан хуудаснаас оруулна">⚠ үнэгүй</span>` : `<span class="muted" style="font-size:10.5px;font-weight:600">${fmt(parseFloat(m.unitPrice) || parseFloat(cat.price) || 0)}/${escHTML(unit || 'нэгж')}</span>`}</span>
      <span class="row" style="gap:4px;align-items:center;flex:0 0 auto">
        <input class="inp" type="number" step="0.5" min="0" value="${m.qty == null ? '' : m.qty}" placeholder="тоо" title="Тоо хэмжээ (${escHTML(unit || 'нэгж')})" style="width:74px;padding:4px 6px;font-size:12px" oninput="inpDraftMedQty(${idx}, this.value)">
        <span class="muted" style="font-size:11px;min-width:22px">${escHTML(unit || '')}</span>
      </span>
      <input class="inp" type="text" value="${escHTML(m.note || '')}" placeholder="Тайлбар: өдрийн 2 удаа..." style="flex:2 1 160px;min-width:120px;padding:4px 8px;font-size:12px" oninput="INP_DRAFT.meds[${idx}].note=this.value">
      <input class="inp" type="number" id="inp-med-price-${idx}" value="${m.price || 0}" placeholder="Үнэ ₮" title="Үнэ = тоо × нэгжийн үнэ; гараар засаж болно" style="width:96px;padding:4px 8px;font-size:12px;font-weight:700" oninput="inpDraftMedPrice(${idx}, this.value)">
      <button class="btn btn-r btn-xs" type="button" onclick="removeInpDraftMed(${idx})">✕</button>
    </div>`;
}

// ── Курс ─────────────────────────────────────────────────────
function inpCourses(i) { return (Array.isArray(i && i.course) ? i.course : []).filter(c => c && !c.deleted); }
function courseDays(c) { return Math.max(1, parseInt(c.days) || 1); }
function courseEnd(c) { return addDaysStr(c.start, courseDays(c) - 1); } // төгсгөлийн огноо (оролцуулан)
function courseLastDay(c) { const e = courseEnd(c); return (c.stopped && c.stopped < e) ? c.stopped : e; }
function courseActiveOn(c, date) { return !!c.start && date >= c.start && date <= courseLastDay(c); }
function courseDayIndex(c, date) { return Math.round((new Date(date + 'T12:00:00') - new Date(c.start + 'T12:00:00')) / 86400000) + 1; }
function courseStatus(c, date) {
  date = date || todayStr();
  if (c.stopped && c.stopped < courseEnd(c)) return date > c.stopped ? 'stopped' : 'active';
  if (date < c.start) return 'future';
  if (date > courseEnd(c)) return 'done';
  return 'active';
}
function courseLineNote(c, date) {
  const unit = c.unit || medUnitOf(c.med);
  const n = Math.min(courseDayIndex(c, date), courseDays(c));
  return fmtQty(c.dose) + ' ' + unit + ' × ' + (Math.max(1, parseInt(c.perDay) || 1)) + '/өдөр · ' + n + '/' + courseDays(c) + ' хоног' + (c.note ? ' · ' + c.note : '');
}
// Курсийн нэг өдрийн эмийн мөр (өдрийн маягтад орох хэлбэрээр)
function courseToMedLine(c, date) {
  const perDay = Math.max(1, parseInt(c.perDay) || 1), dose = parseFloat(c.dose) || 0;
  const unit = c.unit || medUnitOf(c.med);
  const up = (c.unitPrice != null && c.unitPrice !== '') ? (parseFloat(c.unitPrice) || 0) : medUnitPrice(c.med);
  const qty = Math.round(dose * perDay * 100) / 100;
  return { name: c.med, note: courseLineNote(c, date), qty, unit, unitPrice: up, price: Math.round(qty * up), courseId: c.id, fromCourse: true, dose, perDay };
}
function courseItemsFor(i, date) { return inpCourses(i).filter(c => courseActiveOn(c, date)).map(c => courseToMedLine(c, date)); }
// Тухайн өдөр энэ курсийн эм аль хэдийн бичигдсэн үү (log.meds.courseId)
function courseLoggedOn(i, date, courseId) {
  return (typeof inpLogsOn === 'function' ? inpLogsOn(i, date) : []).some(l => (l.meds || []).some(m => m && String(m.courseId) === String(courseId)));
}
// Өдрийн маягтад курсийн эмийг автоматаар бэлтгэнэ.
// Зөвхөн маягт хоосон эсвэл бүх мөр нь курсээс ирсэн үед л солино (эмчийн гараар нэмснийг дардаггүй).
function inpPrefillDraftFromCourse(i, date, force) {
  if (!i || i.discharged) return false;
  date = date || todayStr();
  const draftFree = INP_DRAFT.meds.length === 0 || INP_DRAFT.meds.every(m => m.fromCourse);
  if (!draftFree && !force) return false;
  const items = courseItemsFor(i, date).filter(it => !courseLoggedOn(i, date, it.courseId));
  INP_DRAFT.meds = items;
  INP_DRAFT._courseDate = date;
  if (typeof renderInpDraftMeds === 'function') renderInpDraftMeds();
  if (typeof recomputeInpDayAmt === 'function') recomputeInpDayAmt();
  return items.length > 0;
}

// Курсийн блок — Эмчилгээний таб дээр, өдрийн маягтын дээр
function renderInpCourseBlock(i) {
  const box = document.getElementById('inp-course-card'); if (!box || !i) return;
  const today = todayStr();
  const list = inpCourses(i).slice().sort((a, b) => (a.start || '').localeCompare(b.start || '') || (a.ms || 0) - (b.ms || 0));
  const canEdit = !i.discharged;
  const st = { active: ['b-g', '▶ явагдаж байна'], future: ['b-p', '⏳ эхлээгүй'], done: ['', '✔ дууссан'], stopped: ['b-o', '■ зогсоосон'] };
  const rows = list.map(c => {
    const s = courseStatus(c, today), b = st[s];
    const unit = c.unit || medUnitOf(c.med);
    const up = (c.unitPrice != null && c.unitPrice !== '') ? (parseFloat(c.unitPrice) || 0) : medUnitPrice(c.med);
    const perDayAmt = Math.round((parseFloat(c.dose) || 0) * Math.max(1, parseInt(c.perDay) || 1) * up);
    const last = courseLastDay(c);
    const dayN = s === 'active' ? Math.min(courseDayIndex(c, today), courseDays(c)) : null;
    return `<div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;background:var(--input);border-radius:8px;padding:7px 10px;margin-bottom:4px;font-size:12.5px;opacity:${s === 'done' || s === 'stopped' ? '.7' : '1'}">
      <span style="flex:1 1 220px"><b>${escHTML(c.med)}</b> · ${fmtQty(c.dose)} ${escHTML(unit)} × ${Math.max(1, parseInt(c.perDay) || 1)}/өдөр · <b>${courseDays(c)} хоног</b>
        <span class="muted">(${escHTML(c.start)} → ${escHTML(last)})</span>${c.note ? ' · ' + escHTML(c.note) : ''}
        <span class="badge ${b[0]}" style="font-size:10.5px;margin-left:4px">${b[1]}${dayN ? ' · ' + dayN + '/' + courseDays(c) : ''}</span></span>
      <span class="muted" style="font-size:11px">${up ? fmt(perDayAmt) + '/өдөр' : '⚠ үнэгүй'}</span>
      ${canEdit ? `<span class="row" style="gap:4px">
        ${s === 'active' ? `<button class="btn btn-xs" type="button" onclick="stopInpCourse('${escHTML(c.id)}')" title="Өнөөдрөөр зогсооно (өнөөдөр хүртэл тооцогдоно)">■ Зогсоох</button>` : ''}
        <button class="btn btn-r btn-xs" type="button" onclick="deleteInpCourse('${escHTML(c.id)}')" title="Курсийг устгана (бичигдсэн өдрийн бичлэгүүд хэвээр)">✕</button></span>` : ''}
    </div>`;
  }).join('');
  const todayItems = i.discharged ? [] : courseItemsFor(i, today);
  box.innerHTML = `
    <div style="background:var(--purple-soft);border-radius:12px;padding:10px 12px;margin-bottom:12px">
      <div class="ch" style="margin-bottom:6px;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:6px">
        <span>💊 Эмчилгээний курс <span class="muted" style="font-weight:600;text-transform:none;font-size:11px">— хоног бүрийн эмчилгээний маягтад автоматаар орно, эмийн санч картаар харна</span></span>
        ${todayItems.length ? `<span class="badge b-p" style="font-size:11px">өнөөдөр ${todayItems.length} эм</span>` : ''}
      </div>
      ${rows || '<div class="muted" style="font-size:12px;margin-bottom:6px">Курс бичээгүй</div>'}
      ${canEdit ? `
      <div style="display:flex;flex-wrap:wrap;gap:6px;align-items:flex-end;margin-top:8px;background:rgba(255,255,255,.55);border-radius:10px;padding:8px">
        <div class="fld" style="flex:2 1 200px;min-width:160px;position:relative"><label>Эм</label>
          <div class="dd"><input class="inp" id="inp-crs-med" placeholder="Эм хайх..." autocomplete="off" oninput="onCourseMedInput(this.value)" onblur="setTimeout(()=>{const l=document.getElementById('inp-crs-med-list'); if(l) l.classList.remove('show');},150)">
          <div class="dd-list" id="inp-crs-med-list"></div></div></div>
        <div class="fld" style="flex:0 1 90px"><label>Тун</label><input class="inp" type="number" step="0.5" min="0" id="inp-crs-dose" placeholder="50"></div>
        <div class="fld" style="flex:0 1 90px"><label>Нэгж</label><select class="inp" id="inp-crs-unit">${MED_UNITS.map(u => '<option>' + u + '</option>').join('')}</select></div>
        <div class="fld" style="flex:0 1 90px"><label>Өдөрт</label><select class="inp" id="inp-crs-perday">${[1, 2, 3, 4, 6].map(n => '<option value="' + n + '">' + n + ' удаа</option>').join('')}</select></div>
        <div class="fld" style="flex:0 1 90px"><label>Хоног</label><input class="inp" type="number" min="1" max="120" id="inp-crs-days" placeholder="5" value="5"></div>
        <div class="fld" style="flex:0 1 150px"><label>Эхлэх огноо</label><input class="inp" type="date" id="inp-crs-start" value="${escHTML(today)}" min="${escHTML(i.admittedDate || '')}"></div>
        <div class="fld" style="flex:2 1 160px"><label>Тайлбар</label><input class="inp" id="inp-crs-note" placeholder="ж: булчинд, хоолны дараа..."></div>
        <div class="fld" style="flex:0 0 auto"><label>&nbsp;</label><button class="btn btn-p btn-sm" type="button" onclick="addInpCourse()">➕ Курс нэмэх</button></div>
      </div>
      <div class="muted" style="font-size:11px;margin-top:4px" id="inp-crs-hint">Нэгжийн үнэ каталогоос автоматаар: эм сонгоход доор харагдана.</div>` : ''}
    </div>`;
}
function onCourseMedInput(v) {
  const list = document.getElementById('inp-crs-med-list'); if (!list) return;
  const res = medSearchAll(v, 12);
  if (!res.length) { list.classList.remove('show'); list.innerHTML = ''; return; }
  list.innerHTML = res.map(r => `<div class="dd-i" data-m="${escHTML(r.name)}">${escHTML(r.name)} ${r.inCat ? '<span class="muted" style="font-size:10.5px">· ' + fmt(r.price) + '/' + escHTML(r.unit || 'нэгж') + '</span>' : '<span class="muted" style="font-size:10.5px">· каталогт үнэгүй</span>'}</div>`).join('');
  list.classList.add('show');
  list.querySelectorAll('.dd-i').forEach(el => el.onmousedown = (ev) => { ev.preventDefault(); pickCourseMed(el.dataset.m); });
}
function pickCourseMed(name) {
  const inp = document.getElementById('inp-crs-med'), list = document.getElementById('inp-crs-med-list');
  if (inp) inp.value = name;
  if (list) { list.classList.remove('show'); list.innerHTML = ''; }
  const cat = medCatFind(name);
  const u = document.getElementById('inp-crs-unit');
  if (u && cat && cat.unit) { if (![...u.options].some(o => o.value === cat.unit)) u.insertAdjacentHTML('afterbegin', '<option>' + escHTML(cat.unit) + '</option>'); u.value = cat.unit; }
  const hint = document.getElementById('inp-crs-hint');
  if (hint) hint.innerHTML = cat && parseFloat(cat.price) > 0 ? `💰 <b>${escHTML(name)}</b>: ${fmt(parseFloat(cat.price))}/${escHTML(cat.unit || 'нэгж')} — үнэ автоматаар бодогдоно` : `⚠ <b>${escHTML(name)}</b> каталогт үнэгүй — Эмийн сан хуудаснаас нэгжийн үнэ оруулбал автоматаар бодогдоно (одоо 0₮-өөр орж, өдрийн маягтад гараар засна)`;
}
function addInpCourse() {
  const i = STATE.inps.find(x => String(x.id) === String(STATE.selectedI)); if (!i) return;
  if (i.discharged) { toast('Гарсан адуунд курс нэмэх боломжгүй', 'err'); return; }
  const v = id => { const el = document.getElementById(id); return el ? el.value : ''; };
  const med = String(v('inp-crs-med') || '').trim();
  const dose = parseFloat(v('inp-crs-dose')), days = parseInt(v('inp-crs-days')), perDay = parseInt(v('inp-crs-perday')) || 1;
  const start = v('inp-crs-start') || todayStr();
  if (!med) { toast('Эм сонгоно уу', 'err'); return; }
  if (!(dose > 0)) { toast('Тун оруулна уу', 'err'); return; }
  if (!(days >= 1)) { toast('Хоногийн тоо оруулна уу', 'err'); return; }
  if (i.admittedDate && start < i.admittedDate) { toast('Эхлэх огноо орсон огнооноос өмнө байж болохгүй', 'err'); return; }
  if (!Array.isArray(i.course)) i.course = [];
  const c = { id: uid(), med, dose, unit: v('inp-crs-unit') || medUnitOf(med), perDay, days, start, note: String(v('inp-crs-note') || '').trim(), unitPrice: medUnitPrice(med), by: (STATE.user && STATE.user.name) || '', ms: nowMs() };
  i.course.push(c); i.ms = nowMs();
  saveAll(); fbSaveRecord('inps', i);
  try { writeLog('Эмчилгээний курс нэмэв', i.id, i.horse, med + ' ' + fmtQty(dose) + ' ' + c.unit + ' × ' + perDay + '/өдөр, ' + days + ' хоног, ' + start, typeof inpExamNum === 'function' ? inpExamNum(i) : ''); } catch (e) {}
  renderInpCourseBlock(i);
  // Өнөөдрийн/сонгосон өдрийн маягтад шууд бэлтгэнэ
  const ld = document.getElementById('inp-log-date');
  inpPrefillDraftFromCourse(i, (ld && ld.value) || todayStr());
  toast('💊 ' + med + ' курс нэмэгдлээ — ' + days + ' хоног', 'ok');
  try { updatePharmBadge(); } catch (e) {}
}
function stopInpCourse(id) {
  const i = STATE.inps.find(x => String(x.id) === String(STATE.selectedI)); if (!i) return;
  const c = inpCourses(i).find(x => String(x.id) === String(id)); if (!c) return;
  if (!confirm('«' + c.med + '» курсийг өнөөдрөөр зогсоох уу?')) return;
  c.stopped = todayStr(); c.stoppedBy = (STATE.user && STATE.user.name) || ''; i.ms = nowMs();
  saveAll(); fbSaveRecord('inps', i);
  try { writeLog('Эмчилгээний курс зогсоов', i.id, i.horse, c.med, typeof inpExamNum === 'function' ? inpExamNum(i) : ''); } catch (e) {}
  renderInpCourseBlock(i);
}
function deleteInpCourse(id) {
  const i = STATE.inps.find(x => String(x.id) === String(STATE.selectedI)); if (!i) return;
  const c = inpCourses(i).find(x => String(x.id) === String(id)); if (!c) return;
  if (!confirm('«' + c.med + '» курсийг устгах уу?\n(Аль хэдийн хадгалсан өдрийн бичлэгүүд хэвээр үлдэнэ)')) return;
  c.deleted = true; c.ms = nowMs(); i.ms = nowMs();
  saveAll(); fbSaveRecord('inps', i);
  try { writeLog('Эмчилгээний курс устгав', i.id, i.horse, c.med, typeof inpExamNum === 'function' ? inpExamNum(i) : ''); } catch (e) {}
  // Маягтад курсээс орсон мөрүүдээс энэ курсийнхийг авна
  INP_DRAFT.meds = INP_DRAFT.meds.filter(m => String(m.courseId) !== String(id));
  if (typeof renderInpDraftMeds === 'function') renderInpDraftMeds();
  if (typeof recomputeInpDayAmt === 'function') recomputeInpDayAmt();
  renderInpCourseBlock(i);
}

// ── Нэгтгэсэн эм / үйлчилгээний задаргаа (гарах үед) ────────
function inpItemizedTotals(i) {
  const meds = {}, svcs = {};
  (Array.isArray(i.log) ? i.log : []).forEach(l => {
    (l.meds || []).forEach(m => { if (!m) return; const n = m.name || String(m); const k = medKey(n); if (!meds[k]) meds[k] = { name: n, qty: 0, unit: m.unit || medUnitOf(n), amount: 0, n: 0 }; meds[k].qty += parseFloat(m.qty) || 0; meds[k].amount += parseFloat(m.price) || 0; meds[k].n++; if (!meds[k].unit && m.unit) meds[k].unit = m.unit; });
    (l.services || []).forEach(s => { if (!s) return; const n = s.name || String(s); const k = medKey(n); if (!svcs[k]) svcs[k] = { name: n, amount: 0, n: 0 }; svcs[k].amount += parseFloat(s.price) || 0; svcs[k].n++; });
  });
  const sortA = (a, b) => b.amount - a.amount || a.name.localeCompare(b.name);
  return { meds: Object.values(meds).sort(sortA), svcs: Object.values(svcs).sort(sortA) };
}
function inpItemizedHTML(i) {
  const T = inpItemizedTotals(i);
  if (!T.meds.length && !T.svcs.length) return '';
  const medTotal = T.meds.reduce((a, m) => a + m.amount, 0), svcTotal = T.svcs.reduce((a, s) => a + s.amount, 0);
  return `<div class="ch" style="margin-top:10px">💊 Эм, эмчилгээний задаргаа <span class="muted" style="font-weight:600;text-transform:none;font-size:11px">— бүх өдрийн бичлэгийг нэгтгэв</span></div>
    <div class="tbl-wrap" style="max-height:220px;overflow-y:auto"><table>
      <thead><tr><th>Нэр</th><th>Тоо</th><th>Удаа</th><th style="text-align:right">Дүн</th></tr></thead><tbody>
      ${T.meds.map(m => `<tr><td>💉 ${escHTML(m.name)}</td><td>${m.qty ? fmtQty(m.qty) + ' ' + escHTML(m.unit || '') : '—'}</td><td>${m.n}</td><td class="bold" style="text-align:right">${fmt(m.amount)}</td></tr>`).join('')}
      ${T.meds.length ? `<tr><td colspan="3" class="muted" style="text-align:right">Эм нийт</td><td class="bold" style="text-align:right">${fmt(medTotal)}</td></tr>` : ''}
      ${T.svcs.map(s => `<tr><td>🩺 ${escHTML(s.name)}</td><td>—</td><td>${s.n}</td><td class="bold" style="text-align:right">${fmt(s.amount)}</td></tr>`).join('')}
      ${T.svcs.length ? `<tr><td colspan="3" class="muted" style="text-align:right">Эмчилгээ нийт</td><td class="bold" style="text-align:right">${fmt(svcTotal)}</td></tr>` : ''}
    </tbody></table></div>`;
}

// ── 💊 Эмийн сан хуудас ──────────────────────────────────────
let PH_TAB = 'today';
function setPhTab(t) { PH_TAB = t; renderPharmacy(); }
function phDate() { const el = document.getElementById('ph-date'); return (el && el.value) || todayStr(); }
function phDispKey(date, k) { return date + '|' + k; }
function phDispOf(i, date, k) { return (i && i.disp && i.disp[phDispKey(date, k)]) || null; }
// Тухайн өдрийн, тухайн адууны бүх эмийн мөр: курс + өдрийн бичлэгт гараар нэмсэн эм
function phItemsFor(i, date) {
  const out = [];
  courseItemsFor(i, date).forEach(it => out.push(Object.assign({ key: it.courseId, src: 'course', logged: courseLoggedOn(i, date, it.courseId) }, it)));
  (typeof inpLogsOn === 'function' ? inpLogsOn(i, date) : []).forEach(l => (l.meds || []).forEach((m, idx) => {
    if (!m || m.courseId) return;
    out.push({ key: l.id + ':' + idx, src: 'log', logged: true, name: m.name || String(m), note: m.note || '', qty: parseFloat(m.qty) || 0, unit: m.unit || medUnitOf(m.name || ''), price: parseFloat(m.price) || 0, slot: l.slot || '', docName: l.docName || '' });
  }));
  return out;
}
function togglePhDisp(inpId, key, on) {
  const i = (STATE.inps || []).find(x => String(x.id) === String(inpId)); if (!i) return;
  const date = phDate(); const k = phDispKey(date, key);
  if (!i.disp || typeof i.disp !== 'object') i.disp = {};
  if (on) i.disp[k] = { by: (STATE.user && STATE.user.name) || '', ms: nowMs() }; else delete i.disp[k];
  i.ms = nowMs();
  saveAll(); fbSaveRecord('inps', i);
  renderPharmacy();
}
function updatePharmBadge() {
  const today = todayStr();
  let n = 0;
  (STATE.inps || []).forEach(i => { if (i.discharged) return; phItemsFor(i, today).forEach(it => { if (!phDispOf(i, today, it.key)) n++; }); });
  ['bdg-ph', 'bdg-ph2'].forEach(id => { const el = document.getElementById(id); if (el) { el.textContent = n; el.style.display = n ? '' : 'none'; } });
}
function renderPharmacy() {
  const page = document.getElementById('page-pharmacy'); if (!page) return;
  try { if (typeof ensureInpCardStyles === 'function') ensureInpCardStyles(); } catch (e) {}
  const dEl = document.getElementById('ph-date'); if (dEl && !dEl.value) dEl.value = todayStr();
  const date = phDate();
  document.querySelectorAll('.tab[data-phtab]').forEach(t => { t.classList.toggle('active', t.dataset.phtab === PH_TAB); t.onclick = () => setPhTab(t.dataset.phtab); });
  document.querySelectorAll('.phtab').forEach(x => x.classList.toggle('hidden', x.dataset.phtab !== PH_TAB));
  const q = medKey((document.getElementById('ph-q') || {}).value || '');
  // ── Өдрийн эм ──
  const active = (STATE.inps || []).filter(i => !i.discharged && (typeof inpInHospitalOn !== 'function' || inpInHospitalOn(i, date) || date >= (i.admittedDate || date)));
  let cards = active.map(i => ({ i, items: phItemsFor(i, date) })).filter(c => c.items.length);
  if (q) cards = cards.filter(c => (c.i.horse + ' ' + c.i.owner + ' ' + (c.i.location || '') + ' ' + (c.i.docName || '') + ' ' + c.items.map(it => it.name).join(' ')).toLowerCase().includes(q));
  cards.sort((a, b) => (a.i.location || 'я').localeCompare(b.i.location || 'я') || (a.i.horse || '').localeCompare(b.i.horse || ''));
  const totalItems = cards.reduce((a, c) => a + c.items.length, 0);
  const doneItems = cards.reduce((a, c) => a + c.items.filter(it => phDispOf(c.i, date, it.key)).length, 0);
  const sub = document.getElementById('ph-sub'); if (sub) sub.textContent = date + ' · ' + cards.length + ' адуу · ' + totalItems + ' эм · өгсөн ' + doneItems;
  const todayBox = document.getElementById('ph-today');
  if (todayBox) {
    const canMark = canAccess('pharmacy');
    todayBox.innerHTML = `
      <div class="inp-summary" style="margin-bottom:10px">
        <div class="inp-sum-card"><div class="inp-sum-n">${cards.length}</div><div class="inp-sum-l">адуу</div></div>
        <div class="inp-sum-card"><div class="inp-sum-n">${totalItems}</div><div class="inp-sum-l">эмийн мөр</div></div>
        <div class="inp-sum-card ${totalItems - doneItems ? 'inp-sum-warn' : ''}"><div class="inp-sum-n">${totalItems - doneItems}</div><div class="inp-sum-l">бэлтгэх</div></div>
        <div class="inp-sum-card"><div class="inp-sum-n">${doneItems}</div><div class="inp-sum-l">өгсөн ✔</div></div>
      </div>
      <div class="row" style="gap:6px;flex-wrap:wrap;margin-bottom:10px">
        <button class="btn btn-sm" type="button" onclick="printPharmacyDay()">🖨 Өдрийн эмийн хуудас</button>
        <span class="muted" style="font-size:11.5px">📅 = курсээс · ✍ = эмч өдрийн бичлэгт нэмсэн · <b>бичээгүй</b> = эмч өнөөдрийн бичлэгээ хараахан хадгалаагүй (курсийн дагуу бэлтгэнэ)</span>
      </div>
      ${cards.length ? `<div class="inp-grid" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:10px">${cards.map(c => {
        const i = c.i; const days = typeof inpatientDays === 'function' ? inpatientDays(i.admittedMs) : '';
        const done = c.items.filter(it => phDispOf(i, date, it.key)).length;
        return `<div class="card" style="margin:0;padding:12px;border-left:4px solid ${done === c.items.length ? 'var(--green)' : 'var(--purple)'}">
          <div class="row" style="justify-content:space-between;align-items:flex-start;gap:6px;flex-wrap:wrap">
            <div><div style="font-size:15px;font-weight:900">🐴 ${escHTML(i.horse)}</div>
              <div class="muted" style="font-size:11.5px">${escHTML(i.owner || '')} · ${i.location ? '📍 ' + escHTML(i.location) + ' · ' : ''}${days} хоног · ${escHTML(i.docName || '')}${i.diagnosis ? '<br>🩺 ' + escHTML(String(i.diagnosis).slice(0, 80)) : ''}</div></div>
            <span class="row" style="gap:4px"><span class="badge ${done === c.items.length ? 'b-g' : 'b-p'}">${done}/${c.items.length}</span>
              ${canAccess('inpatient') ? `<button class="btn btn-xs" type="button" onclick="openInpHorse('${escHTML(i.id)}','treat')" title="Байрлангийн карт нээх">📋</button>` : ''}</span>
          </div>
          <div style="margin-top:8px;display:flex;flex-direction:column;gap:4px">${c.items.map(it => {
            const d = phDispOf(i, date, it.key);
            return `<label style="display:flex;align-items:flex-start;gap:8px;background:${d ? 'var(--green-soft)' : 'var(--input)'};border-radius:8px;padding:7px 9px;cursor:${canMark ? 'pointer' : 'default'}">
              <input type="checkbox" ${d ? 'checked' : ''} ${canMark ? '' : 'disabled'} onchange="togglePhDisp('${escHTML(i.id)}','${escHTML(it.key)}',this.checked)" style="margin-top:3px;width:16px;height:16px">
              <span style="flex:1;font-size:12.5px;line-height:1.35"><b>${it.src === 'course' ? '📅' : '✍'} ${escHTML(it.name)}</b> — <b>${fmtQty(it.qty)} ${escHTML(it.unit || '')}</b>${it.note ? '<br><span class="muted" style="font-size:11px">' + escHTML(it.note) + '</span>' : ''}${it.slot ? ' <span class="badge" style="font-size:10px">' + escHTML(it.slot) + '</span>' : ''}${it.src === 'course' && !it.logged ? ' <span class="badge b-o" style="font-size:10px" title="Эмч өнөөдрийн бичлэгээ хадгалаагүй">бичээгүй</span>' : ''}${d ? '<br><span style="font-size:10.5px;color:var(--green)">✔ ' + escHTML(d.by || '') + ' · ' + escHTML(fmtDateTime(d.ms)) + '</span>' : ''}</span>
            </label>`; }).join('')}</div>
        </div>`; }).join('')}</div>` : '<div class="empty"><div class="empty-em">💊</div>' + escHTML(date) + '-нд эм өгөх адуу алга<br><span class="muted" style="font-size:12px">Эмч байрлагчийн картанд «Эмчилгээний курс» бичихэд энд гарч ирнэ</span></div>'}`;
  }
  // ── Каталог ──
  const catBox = document.getElementById('ph-catalog');
  if (catBox && PH_TAB === 'catalog') renderMedCatalog(catBox, q);
  // ── Хэрэглээ ──
  const useBox = document.getElementById('ph-usage');
  if (useBox && PH_TAB === 'usage') renderMedUsage(useBox, q);
  try { updatePharmBadge(); } catch (e) {}
}
function renderMedCatalog(box, q) {
  const canEdit = canEditMedCatalog();
  let list = medCatalog().slice().sort((a, b) => a.name.localeCompare(b.name));
  if (q) list = list.filter(m => medKey(m.name + ' ' + (m.note || '')).includes(q));
  // Курс/бичлэгт хэрэглэгдсэн атал каталогт үнэгүй эмүүд — эмийн санч эхлээд эдгээрийг оруулна
  const used = new Set();
  (STATE.inps || []).forEach(i => { inpCourses(i).forEach(c => used.add(c.med)); (i.log || []).forEach(l => (l.meds || []).forEach(m => m && used.add(m.name || String(m)))); });
  const missing = [...used].filter(n => n && !(medUnitPrice(n) > 0)).sort().slice(0, 40);
  box.innerHTML = `
    ${canEdit ? `<div class="card" style="padding:12px">
      <div class="ch">➕ Эм нэмэх / үнэ засах</div>
      <div style="display:flex;flex-wrap:wrap;gap:6px;align-items:flex-end">
        <div class="fld" style="flex:2 1 220px;min-width:160px"><label>Эмийн нэр</label><div class="dd"><input class="inp" id="ph-c-name" placeholder="Нэр бичих / хайх..." autocomplete="off" oninput="onPhCatNameInput(this.value)" onblur="setTimeout(()=>{const l=document.getElementById('ph-c-name-list'); if(l) l.classList.remove('show');},150)"><div class="dd-list" id="ph-c-name-list"></div></div></div>
        <div class="fld" style="flex:0 1 100px"><label>Нэгж</label><select class="inp" id="ph-c-unit">${MED_UNITS.map(u => '<option>' + u + '</option>').join('')}</select></div>
        <div class="fld" style="flex:0 1 130px"><label>Нэгжийн үнэ ₮</label><input class="inp" type="number" min="0" id="ph-c-price" placeholder="500"></div>
        <div class="fld" style="flex:1 1 160px"><label>Тайлбар</label><input class="inp" id="ph-c-note" placeholder="ж: 100 мл флакон 50,000₮ → 1 мл 500₮"></div>
        <div class="fld" style="flex:0 0 auto"><label>&nbsp;</label><button class="btn btn-p btn-sm" type="button" onclick="savePhCatForm()">💾 Хадгалах</button></div>
        <input type="hidden" id="ph-c-id">
      </div>
      ${missing.length ? `<div style="margin-top:8px;font-size:12px;background:var(--orange-soft);border-radius:8px;padding:8px 10px"><b>⚠ Хэрэглэгдэж байгаа ч үнэгүй эмүүд (${missing.length}):</b> ${missing.map(n => `<a href="#" onclick="phCatPrefill('${escHTML(n)}');return false;">${escHTML(n)}</a>`).join(', ')}</div>` : ''}
    </div>` : '<div class="muted" style="font-size:12px;margin-bottom:8px">Каталог засах эрх: Pharmacist, Senior Veterinarian, Chief Veterinarian, Admin.</div>'}
    <div class="card" style="padding:12px"><div class="ch">📚 Эмийн каталог <span class="ch-r">${list.length}</span></div>
      ${list.length ? `<div class="tbl-wrap"><table><thead><tr><th>Эм</th><th>Нэгж</th><th style="text-align:right">Нэгжийн үнэ</th><th>Тайлбар</th><th>Засварласан</th>${canEdit ? '<th></th>' : ''}</tr></thead><tbody>
        ${list.map(m => `<tr><td class="bold">${escHTML(m.name)}</td><td>${escHTML(m.unit || '—')}</td><td style="text-align:right" class="bold">${fmt(parseFloat(m.price) || 0)}</td><td class="muted" style="font-size:11px">${escHTML(m.note || '')}</td><td class="muted" style="font-size:11px">${escHTML(m.by || '')} ${m.ms ? escHTML(fmtDateTime(m.ms)) : ''}</td>${canEdit ? `<td><span class="row" style="gap:4px"><button class="btn btn-xs" type="button" onclick="phCatEdit('${escHTML(m.id)}')">✎</button><button class="btn btn-r btn-xs" type="button" onclick="deleteMedCatalogItem('${escHTML(m.id)}')">✕</button></span></td>` : ''}</tr>`).join('')}
      </tbody></table></div>` : '<div class="empty" style="padding:16px;font-size:12px">Каталог хоосон — дээрх маягтаар эм нэмж нэгжийн үнийг оруулна. Эмчийн курс, өдрийн бичлэгийн үнэ эндээс автоматаар бодогдоно.</div>'}
    </div>`;
}
function onPhCatNameInput(v) {
  const list = document.getElementById('ph-c-name-list'); if (!list) return;
  const res = medSearchAll(v, 10);
  if (!res.length) { list.classList.remove('show'); list.innerHTML = ''; return; }
  list.innerHTML = res.map(r => `<div class="dd-i" data-m="${escHTML(r.name)}">${escHTML(r.name)}${r.inCat ? ' <span class="muted" style="font-size:10.5px">· каталогт бий</span>' : ''}</div>`).join('');
  list.classList.add('show');
  list.querySelectorAll('.dd-i').forEach(el => el.onmousedown = (ev) => { ev.preventDefault(); phCatPrefill(el.dataset.m); });
}
function phCatPrefill(name) {
  const cat = medCatFind(name);
  const set = (id, v) => { const el = document.getElementById(id); if (el) el.value = v; };
  set('ph-c-name', name); set('ph-c-id', cat ? cat.id : ''); set('ph-c-price', cat ? (cat.price || '') : ''); set('ph-c-note', cat ? (cat.note || '') : '');
  if (cat && cat.unit) set('ph-c-unit', cat.unit);
  const list = document.getElementById('ph-c-name-list'); if (list) { list.classList.remove('show'); list.innerHTML = ''; }
  const p = document.getElementById('ph-c-price'); if (p) p.focus();
}
function phCatEdit(id) { const m = medCatalog().find(x => String(x.id) === String(id)); if (m) { phCatPrefill(m.name); window.scrollTo({ top: 0, behavior: 'smooth' }); } }
function savePhCatForm() {
  const v = id => { const el = document.getElementById(id); return el ? el.value : ''; };
  const m = saveMedCatalogItem({ id: v('ph-c-id'), name: v('ph-c-name'), unit: v('ph-c-unit'), price: v('ph-c-price'), note: v('ph-c-note') });
  if (!m) return;
  toast('💾 ' + m.name + ' · ' + fmt(parseFloat(m.price) || 0) + '/' + (m.unit || 'нэгж'), 'ok');
  ['ph-c-name', 'ph-c-id', 'ph-c-price', 'ph-c-note'].forEach(id => { const el = document.getElementById(id); if (el) el.value = ''; });
  renderPharmacy();
}
// Сарын хэрэглээ — байрлагчдын өдрийн бичлэг + үзлэгийн эм (тоо/дүн)
function renderMedUsage(box, q) {
  const mEl = document.getElementById('ph-month'); const ym = (mEl && mEl.value) || todayStr().slice(0, 7);
  const agg = {};
  const add = (name, qty, unit, amount, src) => { const k = medKey(name); if (!k) return; if (!agg[k]) agg[k] = { name, qty: 0, unit: unit || medUnitOf(name), amount: 0, n: 0, inp: 0, exam: 0 }; agg[k].qty += qty || 0; agg[k].amount += amount || 0; agg[k].n++; agg[k][src]++; };
  (STATE.inps || []).forEach(i => (i.log || []).forEach(l => { if ((l.date || '').slice(0, 7) !== ym) return; (l.meds || []).forEach(m => m && add(m.name || String(m), parseFloat(m.qty) || 0, m.unit, parseFloat(m.price) || 0, 'inp')); }));
  (STATE.exams || []).forEach(e => { if ((e.date || '').slice(0, 7) !== ym) return; (e.meds || []).forEach(m => m && add(m.name || String(m), 0, '', 0, 'exam')); });
  let rows = Object.values(agg).sort((a, b) => b.n - a.n || b.amount - a.amount);
  if (q) rows = rows.filter(r => medKey(r.name).includes(q));
  const canFin = typeof canSeeFinance === 'function' ? canSeeFinance() : false;
  box.innerHTML = `<div class="card" style="padding:12px">
    <div class="ch" style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:6px"><span>📊 Эмийн хэрэглээ</span>
      <span class="row" style="gap:6px"><input class="inp" type="month" id="ph-month" value="${escHTML(ym)}" onchange="renderPharmacy()" style="max-width:160px"><button class="btn btn-xs" type="button" onclick="exportMedUsageCSV()">⬇ CSV</button></span></div>
    <div class="muted" style="font-size:11.5px;margin-bottom:8px">Байрлагчдын өдрийн бичлэг (тоо, дүнтэй) + үзлэгийн эмийн жор (зөвхөн удаа). Сүүлийн 120 хоногоос хуучин үзлэг энд бүрэн ирэхгүй байж болно.</div>
    ${rows.length ? `<div class="tbl-wrap"><table><thead><tr><th>Эм</th><th>Удаа</th><th>Байрлан</th><th>Үзлэг</th><th>Тоо</th>${canFin ? '<th style="text-align:right">Дүн</th>' : ''}</tr></thead><tbody>
      ${rows.map(r => `<tr><td class="bold">${escHTML(r.name)}</td><td>${r.n}</td><td>${r.inp}</td><td>${r.exam}</td><td>${r.qty ? fmtQty(r.qty) + ' ' + escHTML(r.unit || '') : '—'}</td>${canFin ? '<td class="bold" style="text-align:right">' + fmt(r.amount) + '</td>' : ''}</tr>`).join('')}
    </tbody></table></div>` : '<div class="empty" style="padding:16px;font-size:12px">Энэ сард эмийн бичлэг алга</div>'}</div>`;
  box.__rows = rows;
}
function exportMedUsageCSV() {
  const box = document.getElementById('ph-usage'); const rows = (box && box.__rows) || [];
  if (!rows.length) { toast('Экспортлох мөр алга', 'err'); return; }
  const ym = (document.getElementById('ph-month') || {}).value || todayStr().slice(0, 7);
  const csv = [['Эм', 'Удаа', 'Байрлан', 'Үзлэг', 'Тоо', 'Нэгж', 'Дүн']].concat(rows.map(r => [r.name, r.n, r.inp, r.exam, r.qty, r.unit || '', r.amount])).map(r => r.map(v => '"' + String(v == null ? '' : v).replace(/"/g, '""') + '"').join(',')).join('\n');
  const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8' })); a.download = 'emiin-khereglee-' + ym + '.csv'; a.click();
}
// 🖨 Өдрийн эмийн хуудас — эмийн санчийн ажлын хуудас
function printPharmacyDay() {
  const date = phDate();
  const cards = (STATE.inps || []).filter(i => !i.discharged).map(i => ({ i, items: phItemsFor(i, date) })).filter(c => c.items.length).sort((a, b) => (a.i.location || 'я').localeCompare(b.i.location || 'я'));
  if (!cards.length) { toast('Хэвлэх мөр алга', 'err'); return; }
  const html = `<!doctype html><html><head><meta charset="utf-8"><title>Өдрийн эм ${date}</title>
    <style>body{font-family:Arial,sans-serif;font-size:12px;margin:14mm}h1{font-size:16px;margin:0 0 4px}table{border-collapse:collapse;width:100%;margin-top:8px}th,td{border:1px solid #999;padding:4px 6px;text-align:left;vertical-align:top}th{background:#eee}.c{text-align:center;width:14mm}.ft{margin-top:14px;font-size:11px;color:#555}@media print{button{display:none}}</style></head><body>
    <h1>💊 Өдрийн эмийн хуудас — ${escHTML(date)}</h1><div>Морьтон адууны эмнэлэг · Эмийн сан · Хэвлэсэн: ${escHTML(todayStr())} ${escHTML((STATE.user && STATE.user.name) || '')}</div>
    <table><thead><tr><th>Адуу / Эзэн</th><th>Байрлал</th><th>Эмч</th><th>Эм</th><th>Тоо</th><th>Тайлбар</th><th class="c">Бэлтгэсэн</th><th class="c">Өгсөн</th></tr></thead><tbody>
    ${cards.map(c => c.items.map((it, k) => `<tr>${k === 0 ? `<td rowspan="${c.items.length}"><b>${escHTML(c.i.horse)}</b><br>${escHTML(c.i.owner || '')}</td><td rowspan="${c.items.length}">${escHTML(c.i.location || '')}</td><td rowspan="${c.items.length}">${escHTML(c.i.docName || '')}</td>` : ''}<td>${escHTML(it.name)}</td><td>${fmtQty(it.qty)} ${escHTML(it.unit || '')}</td><td>${escHTML(it.note || '')}</td><td class="c">☐</td><td class="c">${phDispOf(c.i, date, it.key) ? '☑' : '☐'}</td></tr>`).join('')).join('')}
    </tbody></table>
    <div class="ft">Pharmacist: ______________________ &nbsp;&nbsp; Хянасан эмч: ______________________</div>
    <script>window.onload=function(){window.print();}<\/script></body></html>`;
  const w = window.open('', '_blank'); if (!w) { toast('Popup хаалттай байна', 'err'); return; }
  w.document.write(html); w.document.close();
}
