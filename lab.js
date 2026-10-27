/* ============================================================
   МОРЬТОН — ШИНЖИЛГЭЭНИЙ МОДУЛЬ (lab.js)
   ------------------------------------------------------------
   Урсгал:
     Эмч үзлэг дээрээ "Шинжилгээ ..." үйлчилгээ сонгоод үзлэгээ
     дуусгамагц → энд захиалга автоматаар үүснэ.
     Эмчийн урсгалд ямар ч өөрчлөлт ОРОХГҮЙ.

   Төлөв:  Захиалсан → Сорьц авсан → Төв рүү илгээсэн →
           Сорьц хүлээн авсан → Хариу гарсан   (+ Цуцалсан)

   Эрх:   'lab' хуудасны эрх  = ҮЗЭХ
          labEdit туг         = ЗАСАХ (төлөв солих, хариу оруулах)
   ============================================================ */
'use strict';

/* ── Төлвүүд ───────────────────────────────────────────────── */
const LAB_STATUSES = [
  { id: 'ordered',   label: 'Ordered',          icon: '📝', cls: 'b-a' },
  { id: 'collected', label: 'Sample Collected',        icon: '🧪', cls: 'b-o' },
  { id: 'sent',      label: 'Sent to Central Lab',   icon: '🚚', cls: 'b-p' },
  { id: 'received',  label: 'Sample Received by Lab', icon: '📥', cls: 'b-a' },
  { id: 'done',      label: 'Results Ready',       icon: '✅', cls: 'b-g' },
  { id: 'cancelled', label: 'Cancelled',           icon: '🚫', cls: 'b-r' }
];
// Үндсэн урсгал (Цуцалсан үүнд ороогүй — тусад нь товчоор)
const LAB_FLOW = ['ordered', 'collected', 'sent', 'received', 'done'];

function labSt(id) {
  return LAB_STATUSES.find(s => s.id === id) || LAB_STATUSES[0];
}
function labStBadge(id) {
  const s = labSt(id);
  return '<span class="badge ' + s.cls + '">' + s.icon + ' ' + escHTML(s.label) + '</span>';
}
// Дуусаагүй (идэвхтэй) захиалга мөн эсэх
function labIsOpen(l) {
  return l && l.status !== 'done' && l.status !== 'cancelled';
}

/* ── Аль үйлчилгээ нь шинжилгээ вэ ─────────────────────────── */
const LAB_KEYWORD = 'шинжилгээ';

function isLabService(name) {
  const n = String(name || '').trim();
  if (!n) return false;
  if ((STATE.labSvcOff || []).includes(n)) return false; // Admin хассан
  if ((STATE.labSvcOn  || []).includes(n)) return true;  // Admin нэмсэн
  return n.toLowerCase().indexOf(LAB_KEYWORD) !== -1;    // автомат таних
}
function getLabServices() {
  try { return getAllServices().filter(isLabService); } catch (e) { return []; }
}

/* ── Эрх ───────────────────────────────────────────────────── */
function canViewLab() {
  return typeof canAccess === 'function' && canAccess('lab');
}
function canEditLab() {
  if (!STATE.user || !canViewLab()) return false;
  if (STATE.user.role === 'Admin') return true;
  const me = getUsers()[STATE.user.name];
  return !!(me && me.labEdit);
}
// Шинжилгээг үзэх эрхтэй хэрэглэгчдийн жагсаалт
function labViewers() {
  return (STATE.users || []).filter(u => {
    const pages = Array.isArray(u.pages) ? u.pages : (pagesForRole(u.role) || []);
    return pages.includes('lab');
  });
}

/* ============================================================
   ЗАХИАЛГА ҮҮСГЭХ — үзлэг дуусгах агшинд app.js-ээс дуудагдана
   ============================================================ */
function createLabOrdersFromExam(exam) {
  if (!exam || !Array.isArray(exam.services)) return [];
  if (!Array.isArray(STATE.labs)) STATE.labs = [];

  const created = [];
  exam.services.forEach(s => {
    const name = (s && (s.name || s)) || '';
    if (!isLabService(name)) return;
    // Нэг үзлэг дээр нэг шинжилгээ давхардахаас сэргийлнэ
    const dup = STATE.labs.some(l =>
      String(l.examId) === String(exam.id) && l.service === name && l.status !== 'cancelled'
    );
    if (dup) return;

    const ms = nowMs();
    const lab = {
      id: uid(),
      examId: exam.id,
      examNum: exam.examNum || '',
      horseId: exam.horseId || '',
      horse: exam.horse || '',
      owner: exam.owner || '',
      phone: exam.phone || '',
      docId: exam.docId || '',
      docName: exam.docName || '',
      service: name,
      price: parseFloat(s && s.price) || 0,
      diagnosis: exam.diagnosis || '',
      date: exam.date || todayStr(),
      status: 'ordered',
      history: [{
        status: 'ordered',
        ms: ms,
        user: (STATE.user && STATE.user.name) || '',
        note: 'Үзлэгээс автоматаар үүссэн'
      }],
      results: [],
      resultNote: '',
      orderedMs: ms,
      doneMs: 0,
      ms: ms
    };
    STATE.labs.push(lab);
    created.push(lab);
    try { fbSaveRecord('labs', lab); } catch (e) {}
    try {
      writeLog('Шинжилгээ захиалсан', lab.id,
        (exam.horse || '') + ' — ' + name,
        'Эмч: ' + (exam.docName || ''), exam.examNum || '');
    } catch (e) {}
  });

  if (created.length) {
    try { saveAll(); } catch (e) {}
    try { updateBadges(); } catch (e) {}
  }
  return created;
}

/* ============================================================
   ТӨЛӨВ СОЛИХ
   ============================================================ */
function findLab(id) {
  return (STATE.labs || []).find(x => String(x.id) === String(id));
}

function setLabStatus(labId, statusId, note) {
  if (!canEditLab()) { toast('⛔ Танд шинжилгээ засах эрх алга', 'err'); return; }
  const l = findLab(labId);
  if (!l) return;
  if (!LAB_STATUSES.some(s => s.id === statusId)) return;
  if (l.status === statusId) return;

  // Буцаах чиглэлд явж байвал баталгаажуулна
  const from = LAB_FLOW.indexOf(l.status);
  const to   = LAB_FLOW.indexOf(statusId);
  if (from > -1 && to > -1 && to < from) {
    if (!confirm('Төлвийг "' + labSt(l.status).label + '" → "' + labSt(statusId).label +
      '" болгож БУЦААХ уу?')) return;
  }
  // Хариу гарсан гэхэд зураг байхгүй бол сануулна
  if (statusId === 'done' && (!Array.isArray(l.results) || l.results.length === 0)) {
    if (!confirm('Хариуны зураг оруулаагүй байна.\n"Хариу гарсан" болгох уу?')) return;
  }

  const ms = nowMs();
  l.status = statusId;
  if (!Array.isArray(l.history)) l.history = [];
  l.history.push({
    status: statusId,
    ms: ms,
    user: (STATE.user && STATE.user.name) || '',
    note: note || ''
  });
  if (statusId === 'done') l.doneMs = ms;
  l.ms = ms;

  saveAll();
  fbSaveRecord('labs', l);
  writeLog('Шинжилгээний төлөв', l.id,
    (l.horse || '') + ' — ' + (l.service || ''),
    labSt(statusId).label, l.examNum || '');
  updateBadges();
  renderLab();
  if (document.getElementById('lab-modal').classList.contains('show')) openLabModal(l.id);
  toast(labSt(statusId).icon + ' ' + labSt(statusId).label, 'ok');
}

// Дараагийн төлөв рүү нэг алхам
function labNextStatus(labId) {
  const l = findLab(labId);
  if (!l) return;
  const i = LAB_FLOW.indexOf(l.status);
  if (i < 0 || i >= LAB_FLOW.length - 1) return;
  setLabStatus(labId, LAB_FLOW[i + 1]);
}

function cancelLab(labId) {
  if (!canEditLab()) { toast('⛔ Танд шинжилгээ засах эрх алга', 'err'); return; }
  const l = findLab(labId);
  if (!l) return;
  const reason = prompt('Цуцлах шалтгаан:', '');
  if (reason === null) return;
  l.cancelReason = reason || '';
  setLabStatus(labId, 'cancelled', reason || '');
  // 🩸 Шууд сорьцын захиалга: төлөгдөөгүй нэхэмжлэхээс энэ шинжилгээний үнийг хасна
  if (labIsDirect(l) && l.finId) {
    const f = (STATE.fins || []).find(x => String(x.id) === String(l.finId));
    if (f && !(typeof getPaidAmount === 'function' && getPaidAmount(f) > 0)) {
      f.amount = Math.max(0, (parseFloat(f.amount) || 0) - (parseFloat(l.price) || 0));
      f.services = (STATE.labs || []).filter(x => String(x.finId) === String(l.finId) && x.status !== 'cancelled').map(x => x.service).join(', ') || ('Цуцалсан: ' + l.service);
      f.ms = nowMs(); saveAll(); try { fbSaveRecord('fins', f); } catch (e) {}
      toast('Нэхэмжлэх ' + fmt(f.amount) + ' болж буурлаа', 'ok');
    }
  }
}

/* ── Хариуны тайлбар хадгалах ──────────────────────────────── */
function saveLabNote(labId) {
  if (!canEditLab()) { toast('⛔ Эрх алга', 'err'); return; }
  const l = findLab(labId);
  if (!l) return;
  const el = document.getElementById('lab-result-note');
  l.resultNote = el ? el.value : '';
  l.ms = nowMs();
  saveAll();
  fbSaveRecord('labs', l);
  toast('✓ Тайлбар хадгалагдлаа', 'ok');
}

/* ============================================================
   ХАРИУНЫ ЗУРАГ (Firebase Storage)
   ============================================================ */
const LAB_IMG_MAX = 8;

async function addLabResultImages(labId, fileList) {
  if (!canEditLab()) { toast('⛔ Эрх алга', 'err'); return; }
  const l = findLab(labId);
  if (!l) return;
  if (!Array.isArray(l.results)) l.results = [];

  const files = Array.from(fileList || []);
  if (!files.length) return;
  if (l.results.length + files.length > LAB_IMG_MAX) {
    toast('Шинжилгээ бүрт дээд тал нь ' + LAB_IMG_MAX + ' зураг', 'err');
    return;
  }
  if (!window.__fbReady || !window.__fbUploadImage) {
    toast('⛔ Firebase холбогдоогүй. Зураг хадгалах боломжгүй.', 'err');
    return;
  }

  toast('Зураг боловсруулж байна...', 'ok');
  let ok = 0;
  for (const file of files) {
    try {
      const dataUrl = await resizeImageFile(file);
      const imgId = uid();
      const path = 'lab-results/' + l.id + '/' + imgId + '.jpg';
      try {
        const url = await window.__fbUploadImage(path, dataUrl);
        l.results.push({
          id: imgId, url: url, path: path, ms: nowMs(),
          by: (STATE.user && STATE.user.name) || ''
        });
        ok++;
      } catch (upErr) {
        toast('⛔ Хариу илгээж чадсангүй: ' +
          (typeof storageErrMsg === 'function' ? storageErrMsg(upErr) : (upErr.message || 'алдаа')), 'err');
        console.error('[Storage] lab-results бичих алдаа:', path, upErr);
      }
    } catch (err) {
      toast(err.message || 'Зураг боловсруулж чадсангүй', 'err');
    }
  }

  if (ok > 0) {
    l.ms = nowMs();
    saveAll();
    fbSaveRecord('labs', l);
    writeLog('Шинжилгээний хариу оруулсан', l.id,
      (l.horse || '') + ' — ' + (l.service || ''), ok + ' зураг', l.examNum || '');
    renderLabResults(l);
    renderLab();
    toast('✅ ' + ok + ' зураг нэмэгдлээ', 'ok');
  }
}

function removeLabResultImage(labId, imgId) {
  if (!canEditLab()) { toast('⛔ Эрх алга', 'err'); return; }
  const l = findLab(labId);
  if (!l || !Array.isArray(l.results)) return;
  if (!confirm('Энэ зургийг устгах уу?')) return;
  const im = l.results.find(x => x.id === imgId);
  if (im && im.url && window.__fbDeleteImageByUrl) window.__fbDeleteImageByUrl(im.url);
  l.results = l.results.filter(x => x.id !== imgId);
  l.ms = nowMs();
  saveAll();
  fbSaveRecord('labs', l);
  renderLabResults(l);
  renderLab();
  toast('Зураг устгагдлаа', 'ok');
}

/* ============================================================
   ХУУДАС RENDER
   ============================================================ */
let LAB_FILTER = 'open';   // 'open' | 'all' | төлвийн id
let LAB_SEARCH = '';

function labFilterCounts() {
  const labs = STATE.labs || [];
  const c = { all: labs.length, open: labs.filter(labIsOpen).length };
  LAB_STATUSES.forEach(s => { c[s.id] = labs.filter(l => l.status === s.id).length; });
  return c;
}

function labFiltered() {
  let list = (STATE.labs || []).slice();
  if (LAB_FILTER === 'open') list = list.filter(labIsOpen);
  else if (LAB_FILTER !== 'all') list = list.filter(l => l.status === LAB_FILTER);

  const q = LAB_SEARCH.toLowerCase().trim();
  if (q) {
    list = list.filter(l =>
      String(l.horse || '').toLowerCase().includes(q) ||
      String(l.owner || '').toLowerCase().includes(q) ||
      String(l.service || '').toLowerCase().includes(q) ||
      String(l.docName || '').toLowerCase().includes(q) ||
      String(l.examNum || '').toLowerCase().includes(q) ||
      String(l.phone || '').toLowerCase().includes(q)
    );
  }
  // Идэвхтэй нь дээрээ, дараа нь шинэ нь дээрээ
  return list.sort((a, b) => {
    const oa = labIsOpen(a) ? 0 : 1, ob = labIsOpen(b) ? 0 : 1;
    if (oa !== ob) return oa - ob;
    return (parseFloat(b.orderedMs) || 0) - (parseFloat(a.orderedMs) || 0);
  });
}

function renderLab() {
  const page = document.getElementById('page-lab');
  if (!page) return;

  // Эрхгүй бол хоослоно
  if (!canViewLab()) {
    const w = document.getElementById('lab-list');
    if (w) w.innerHTML = '<div class="empty"><div class="empty-em">🔒</div>Танд энэ хэсгийг үзэх эрх алга</div>';
    return;
  }

  const c = labFilterCounts();
  const sub = document.getElementById('lab-sub');
  if (sub) sub.textContent = c.open + ' хүлээгдэж буй · нийт ' + c.all;

  // Шүүлтүүрийн таб
  const tabs = document.getElementById('lab-tabs');
  if (tabs) {
    const items = [
      { id: 'open', label: '⏳ Хүлээгдэж буй', n: c.open },
      { id: 'all',  label: '📋 Бүгд',          n: c.all }
    ].concat(LAB_STATUSES.map(s => ({ id: s.id, label: s.icon + ' ' + s.label, n: c[s.id] })));
    tabs.innerHTML = items.map(t =>
      '<div class="tab' + (LAB_FILTER === t.id ? ' active' : '') + '" onclick="setLabFilter(\'' + t.id + '\')">' +
      escHTML(t.label) + ' <b>' + t.n + '</b></div>'
    ).join('');
  }

  // Жагсаалт
  const wrap = document.getElementById('lab-list');
  if (!wrap) return;
  const list = labFiltered();
  const cnt = document.getElementById('lab-cnt');
  if (cnt) cnt.textContent = list.length;

  if (!list.length) {
    wrap.innerHTML = '<div class="empty"><div class="empty-em">🧪</div>Шинжилгээ алга</div>';
  } else {
    wrap.innerHTML = list.map(l => {
      const nRes = Array.isArray(l.results) ? l.results.length : 0;
      const days = l.orderedMs ? Math.floor((nowMs() - l.orderedMs) / 86400000) : 0;
      const late = labIsOpen(l) && days >= 3;
      return '' +
        '<div class="li" style="cursor:pointer" onclick="openLabModal(\'' + l.id + '\')">' +
          '<div class="li-av">' + labSt(l.status).icon + '</div>' +
          '<div class="li-info">' +
            '<div class="li-name">' + escHTML(l.horse || '—') + ' · <span style="font-weight:700;color:var(--muted)">' + escHTML(l.service || '') + '</span>' +
              (labIsDirect(l) ? ' <span class="badge b-o" style="font-size:10px" title="Адуу ирээгүй, сорьц шууд хүлээн авсан">🩸 ' + escHTML(l.sample || 'сорьц') + '</span>' : '') + '</div>' +
            '<div class="li-sub">' + escHTML(l.owner || '') + ' · ' + escHTML(l.docName || '') + ' · ' + escHTML(l.date || '') +
              (nRes ? ' · 🖼️ ' + nRes : '') +
              (late ? ' · <span style="color:var(--red);font-weight:800">' + days + ' хоног</span>' : '') +
            '</div>' +
          '</div>' +
          '<div class="li-r">' + labStBadge(l.status) + '</div>' +
        '</div>';
    }).join('');
  }

  renderLabViewers();
}

function setLabFilter(id) {
  LAB_FILTER = id;
  renderLab();
}
function onLabSearch(v) {
  LAB_SEARCH = v || '';
  renderLab();
}

/* ── Үзэх эрхтэй хүмүүсийн жагсаалт (шинжилгээний хуудсан дээр) ── */
function renderLabViewers() {
  const wrap = document.getElementById('lab-viewers');
  if (!wrap) return;
  const vs = labViewers();
  if (!vs.length) {
    wrap.innerHTML = '<div class="empty" style="padding:14px;font-size:12px">Эрх олгосон хэрэглэгч алга</div>';
    return;
  }
  wrap.innerHTML = vs.map(u => {
    const edit = (u.role === 'Admin') || !!u.labEdit;
    return '' +
      '<div class="li" style="cursor:default">' +
        '<div class="li-av">' + (edit ? '✍️' : '👁️') + '</div>' +
        '<div class="li-info">' +
          '<div class="li-name">' + escHTML(u.name) + '</div>' +
          '<div class="li-sub">' + escHTML(u.role || '') + '</div>' +
        '</div>' +
        '<div class="li-r">' +
          (edit
            ? '<span class="badge b-g">Үзэх + Засах</span>'
            : '<span class="badge b-a">Зөвхөн үзэх</span>') +
        '</div>' +
      '</div>';
  }).join('');
}

/* ============================================================
   ДЭЛГЭРЭНГҮЙ МОДАЛ
   ============================================================ */
let _labCur = null;

function openLabModal(labId) {
  if (!canViewLab()) { toast('⛔ Эрх алга', 'err'); return; }
  const l = findLab(labId);
  if (!l) return;
  _labCur = l.id;
  const edit = canEditLab();

  const t = document.getElementById('lab-modal-title');
  if (t) t.textContent = '🧪 ' + (l.horse || '—') + ' · ' + (l.service || '');

  // Мэдээлэл
  const info = document.getElementById('lab-info');
  if (info) {
    const rows = labIsDirect(l) ? [
      ['Эзэн',           l.owner || '—'],
      ['Утас',           l.phone || '—'],
      ['Сорьц',          '🩸 ' + (l.sample || 'Цус') + ' — адуу ирээгүй, шууд хүлээн авсан'],
      ['Хүлээн авсан',   l.receivedBy || l.docName || '—'],
      ['Огноо',          l.date || '—'],
      ['Тэмдэглэл',      l.note || '—'],
      ['Үнэ',            fmt(l.price || 0) + ' (нэхэмжлэх Accountant / Financeд)']
    ] : [
      ['Эзэн',           l.owner || '—'],
      ['Утас',           l.phone || '—'],
      ['Эмч',            l.docName || '—'],
      ['Үзлэгийн дугаар', l.examNum || '—'],
      ['Огноо',          l.date || '—'],
      ['Онош',           l.diagnosis || '—'],
      ['Үнэ',            fmt(l.price || 0)]
    ];
    info.innerHTML = rows.map(r =>
      '<div style="display:flex;gap:8px;padding:5px 0;border-bottom:1px solid var(--line,#eee)">' +
        '<span style="min-width:130px;font-size:12px;font-weight:700;color:var(--muted)">' + escHTML(r[0]) + '</span>' +
        '<span style="font-size:13px;font-weight:600">' + escHTML(String(r[1])) + '</span>' +
      '</div>'
    ).join('');
  }

  // Төлвийн алхмууд
  const stWrap = document.getElementById('lab-steps');
  if (stWrap) {
    if (l.status === 'cancelled') {
      stWrap.innerHTML =
        '<div class="badge b-r" style="padding:8px 12px">🚫 Цуцлагдсан' +
        (l.cancelReason ? ' — ' + escHTML(l.cancelReason) : '') + '</div>';
    } else {
      const cur = LAB_FLOW.indexOf(l.status);
      stWrap.innerHTML = LAB_FLOW.map((sid, i) => {
        const s = labSt(sid);
        const done = i <= cur;
        const clickable = edit && i !== cur;
        return '<button type="button" ' +
          (clickable ? 'onclick="setLabStatus(\'' + l.id + '\',\'' + sid + '\')"' : 'disabled') +
          ' style="flex:1;min-width:110px;padding:9px 8px;border-radius:10px;font-size:11px;font-weight:800;' +
          'cursor:' + (clickable ? 'pointer' : 'default') + ';' +
          'border:1.5px solid ' + (done ? 'var(--orange)' : 'var(--border)') + ';' +
          'background:' + (i === cur ? 'var(--orange)' : (done ? 'var(--orange-soft)' : '#fff')) + ';' +
          'color:' + (i === cur ? '#fff' : (done ? 'var(--orange-dark)' : 'var(--muted)')) + '">' +
          s.icon + '<br>' + escHTML(s.label) + '</button>';
      }).join('');
    }
  }

  // Үйлдлийн товчнууд
  const acts = document.getElementById('lab-actions');
  if (acts) {
    if (!edit) {
      acts.innerHTML = '<div class="muted" style="font-size:12px">👁️ Танд зөвхөн үзэх эрх байна</div>';
    } else {
      const i = LAB_FLOW.indexOf(l.status);
      const nextBtn = (i > -1 && i < LAB_FLOW.length - 1)
        ? '<button class="btn btn-p btn-sm" onclick="labNextStatus(\'' + l.id + '\')">' +
          labSt(LAB_FLOW[i + 1]).icon + ' ' + escHTML(labSt(LAB_FLOW[i + 1]).label) + '</button>'
        : '';
      const cancelBtn = (l.status !== 'cancelled')
        ? '<button class="btn btn-r btn-sm" onclick="cancelLab(\'' + l.id + '\')">🚫 Цуцлах</button>'
        : '';
      acts.innerHTML = nextBtn + cancelBtn;
    }
  }

  // Хариу — зураг + тайлбар
  renderLabResults(l);
  const noteEl = document.getElementById('lab-result-note');
  if (noteEl) {
    noteEl.value = l.resultNote || '';
    noteEl.disabled = !edit;
  }
  const upWrap = document.getElementById('lab-upload-wrap');
  if (upWrap) upWrap.style.display = edit ? '' : 'none';
  const noteBtn = document.getElementById('lab-note-btn');
  if (noteBtn) noteBtn.style.display = edit ? '' : 'none';
  const upInput = document.getElementById('lab-file');
  if (upInput) upInput.setAttribute('data-lab', l.id);

  // Түүх
  const hist = document.getElementById('lab-history');
  if (hist) {
    const h = Array.isArray(l.history) ? l.history.slice().reverse() : [];
    hist.innerHTML = h.length ? h.map(x =>
      '<div style="display:flex;gap:8px;padding:6px 0;border-bottom:1px solid var(--line,#eee)">' +
        '<span style="min-width:150px">' + labStBadge(x.status) + '</span>' +
        '<span style="font-size:12px;color:var(--muted);font-weight:600">' +
          escHTML(fmtDateTime(x.ms)) + (x.user ? ' · ' + escHTML(x.user) : '') +
          (x.note ? ' · ' + escHTML(x.note) : '') +
        '</span>' +
      '</div>'
    ).join('') : '<div class="muted" style="font-size:12px">Түүх алга</div>';
  }

  openModal('lab-modal');
}

function renderLabResults(l) {
  const wrap = document.getElementById('lab-results');
  if (!wrap) return;
  const imgs = Array.isArray(l.results) ? l.results : [];
  const edit = canEditLab();
  if (!imgs.length) {
    wrap.innerHTML = '<div class="muted" style="font-size:12px">Хариуны зураг алга</div>';
    return;
  }
  _lightboxImgs = imgs; // app.js-ийн lightbox-той нийцтэй
  wrap.innerHTML = imgs.map(im =>
    '<div style="position:relative;width:96px;height:96px;border-radius:8px;overflow:hidden;border:1px solid var(--border)">' +
      '<img src="' + imgSrc(im) + '" style="width:100%;height:100%;object-fit:cover;cursor:pointer" ' +
        'onclick="_lightboxImgs=(findLab(\'' + l.id + '\')||{}).results||[];openImageLightbox(\'' + im.id + '\')">' +
      (edit
        ? '<button type="button" onclick="removeLabResultImage(\'' + l.id + '\',\'' + im.id + '\')" title="Устгах" ' +
          'style="position:absolute;top:2px;right:2px;width:22px;height:22px;border:none;border-radius:50%;' +
          'background:rgba(0,0,0,0.6);color:#fff;cursor:pointer;font-size:13px;line-height:1;display:flex;' +
          'align-items:center;justify-content:center">×</button>'
        : '') +
    '</div>'
  ).join('');
}

/* ============================================================
   АДМИН — аль үйлчилгээ нь шинжилгээ вэ
   ============================================================ */
function renderLabSvcConfig() {
  const card = document.getElementById('lab-svc-card');
  const wrap = document.getElementById('lab-svc-list');
  if (!wrap) return;
  const isAdmin = !!(STATE.user && STATE.user.role === 'Admin');
  if (card) card.style.display = isAdmin ? '' : 'none';
  if (!isAdmin) return;

  const q = (document.getElementById('lab-svc-search')?.value || '').toLowerCase().trim();
  let all = [];
  try { all = getAllServices(); } catch (e) { all = []; }
  // Шинжилгээ гэж тэмдэглэгдсэн нь эхэндээ
  all.sort((a, b) => (isLabService(b) ? 1 : 0) - (isLabService(a) ? 1 : 0));
  const list = q ? all.filter(s => s.toLowerCase().includes(q)) : all;

  wrap.innerHTML = list.map(s => {
    const on = isLabService(s);
    const auto = s.toLowerCase().indexOf(LAB_KEYWORD) !== -1;
    return '<div style="display:flex;align-items:center;gap:8px;padding:6px 0;border-bottom:1px solid var(--line,#eee)">' +
      '<span style="flex:1;font-size:13px">' + escHTML(s) +
        (auto ? ' <span class="muted" style="font-size:10px">(автомат)</span>' : '') + '</span>' +
      '<button type="button" class="badge ' + (on ? 'b-g' : '') + '" onclick="toggleLabService(' + JSON.stringify(s).replace(/"/g, '&quot;') + ')" ' +
        'style="cursor:pointer;border:1.5px solid ' + (on ? 'var(--green)' : 'var(--border)') + ';padding:5px 10px;font-weight:800">' +
        (on ? '✓ Шинжилгээ' : 'Шинжилгээ биш') + '</button>' +
    '</div>';
  }).join('') || '<div class="empty" style="padding:16px">Олдсонгүй</div>';
}

function toggleLabService(name) {
  if (!(STATE.user && STATE.user.role === 'Admin')) { toast('⛔ Зөвхөн Admin', 'err'); return; }
  const n = String(name || '').trim();
  if (!n) return;
  if (!Array.isArray(STATE.labSvcOn))  STATE.labSvcOn = [];
  if (!Array.isArray(STATE.labSvcOff)) STATE.labSvcOff = [];

  const auto = n.toLowerCase().indexOf(LAB_KEYWORD) !== -1;
  const on = isLabService(n);

  // Аль ч жагсаалтаас эхлээд арилгана
  STATE.labSvcOn  = STATE.labSvcOn.filter(x => x !== n);
  STATE.labSvcOff = STATE.labSvcOff.filter(x => x !== n);

  if (on) {
    // ИДЭВХГҮЙ болгоно
    if (auto) STATE.labSvcOff.push(n);
  } else {
    // ИДЭВХТЭЙ болгоно
    if (!auto) STATE.labSvcOn.push(n);
  }

  saveAll();
  try { fbSaveLabConfig(); } catch (e) {}
  writeLog('Шинжилгээний үйлчилгээ', '', n, isLabService(n) ? 'Шинжилгээ болгов' : 'Шинжилгээнээс хасав');
  renderLabSvcConfig();
}

// clinic_config руу бичих — ЗААВАЛ app.js-ийн нэгдсэн бичигчээр.
// ⚠️ Хэсэгчлэн бичвэл setDoc нь бусад талбарыг (үнэ!) устгана.
function fbSaveLabConfig() {
  if (typeof fbSaveClinicConfig === 'function') return fbSaveClinicConfig();
}

/* ── Admin хуудасны "үзэх эрхтэй" жагсаалт ─────────────────── */
function renderLabPermList() {
  const wrap = document.getElementById('a-lab-perm-list');
  if (!wrap) return;
  const vs = labViewers();
  const cnt = document.getElementById('lab-perm-count');
  if (cnt) cnt.textContent = '(' + vs.length + ')';
  if (!vs.length) {
    wrap.innerHTML = '<div class="empty"><div class="empty-em">🔒</div>Шинжилгээ үзэх эрхтэй хэрэглэгч алга</div>';
    return;
  }
  wrap.innerHTML = vs.map(u => {
    const edit = (u.role === 'Admin') || !!u.labEdit;
    return '<div class="li" style="cursor:default">' +
      '<div class="li-av">' + (edit ? '✍️' : '👁️') + '</div>' +
      '<div class="li-info">' +
        '<div class="li-name">' + escHTML(u.name) + '</div>' +
        '<div class="li-sub">' + escHTML(u.role || '') + '</div>' +
      '</div>' +
      '<div class="li-r">' + (edit
        ? '<span class="badge b-g">Үзэх + Засах</span>'
        : '<span class="badge b-a">Зөвхөн үзэх</span>') + '</div>' +
    '</div>';
  }).join('');
}

/* ============================================================
   🩸 СОРЬЦ ШУУД ХҮЛЭЭН АВАХ — адуу ирэхгүйгээр цус (сорьц) авчирсан үед
   ------------------------------------------------------------
   - Үзлэгийн хуудасны дугаар ЗАРЦУУЛАХГҮЙ, exams-д бичигдэхгүй.
   - Сонгосон шинжилгээ бүрт labs бичлэг үүснэ (status: 'collected' —
     сорьц гарт байгаа тул), direct:true, sample:'Цус' гэх мэт.
   - Accountant / Financeд нэг нэхэмжлэх (fins, kind:'lab') үүснэ — орлого/авлага алдагдахгүй.
   - Бүртгэлтэй адуугаа хайж холбож болно (horseId), шинэ адуу бүртгэхгүй.
   ============================================================ */
const LAB_SAMPLE_TYPES = ['Цус', 'Ийлдэс', 'Шээс', 'Баас', 'Арьсны хусалт', 'Үс/дэл', 'Бусад'];
let _labSampleHorseId = '';

function canIntakeSample() {
  if (!STATE.user || !canViewLab()) return false;
  if (canEditLab()) return true;
  if (typeof canEditData === 'function' && canEditData()) return true;
  return ['Registration Clerk', 'Accountant / Finance', 'Manager'].includes(STATE.user.role);
}
function labIsDirect(l) { return !!(l && l.direct); }

function openLabSampleModal() {
  if (!canIntakeSample()) { toast('⛔ Сорьц хүлээн авах эрх алга (Шинжилгээ засах эрх хэрэгтэй)', 'err'); return; }
  _labSampleHorseId = '';
  const svcs = getLabServices();
  const set = (id, v) => { const el = document.getElementById(id); if (el) el.value = v; };
  set('ls-owner', ''); set('ls-horse', ''); set('ls-phone', ''); set('ls-note', ''); set('ls-date', todayStr());
  const st = document.getElementById('ls-sample'); if (st) st.innerHTML = LAB_SAMPLE_TYPES.map(s => '<option>' + s + '</option>').join('');
  const link = document.getElementById('ls-horse-link'); if (link) link.innerHTML = '';
  const wrap = document.getElementById('ls-tests');
  if (wrap) {
    wrap.innerHTML = svcs.length ? svcs.map((s, k) => {
      const p = (typeof getSvcPrice === 'function') ? (getSvcPrice(s) || 0) : 0;
      return '<label style="display:flex;align-items:center;gap:8px;background:var(--input);border-radius:8px;padding:7px 10px;cursor:pointer">' +
        '<input type="checkbox" class="ls-test" data-name="' + escHTML(s) + '" data-price="' + p + '" onchange="labSampleRecalc()" style="width:16px;height:16px">' +
        '<span style="flex:1;font-size:13px;font-weight:600">' + escHTML(s) + '</span>' +
        '<input class="inp" type="number" min="0" value="' + p + '" data-k="' + k + '" oninput="labSampleRecalc()" style="width:110px;padding:4px 8px;font-size:12px;font-weight:700" title="Үнэ (гараар засаж болно)">' +
      '</label>';
    }).join('') : '<div class="muted" style="font-size:12px">Шинжилгээний үйлчилгээ олдсонгүй — Системийн тохиргоо → Шинжилгээний үйлчилгээ хэсгээс тохируулна.</div>';
  }
  labSampleRecalc();
  openModal('lab-sample-modal');
  setTimeout(() => { const o = document.getElementById('ls-owner'); if (o) o.focus(); }, 100);
}
function labSampleSelected() {
  const out = [];
  document.querySelectorAll('#ls-tests .ls-test').forEach(cb => {
    if (!cb.checked) return;
    const priceEl = cb.parentElement.querySelector('input[type=number]');
    out.push({ name: cb.dataset.name, price: Math.max(0, parseFloat(priceEl ? priceEl.value : cb.dataset.price) || 0) });
  });
  return out;
}
function labSampleRecalc() {
  const sel = labSampleSelected();
  const total = sel.reduce((a, s) => a + s.price, 0);
  const el = document.getElementById('ls-total'); if (el) el.textContent = sel.length + ' шинжилгээ · ' + fmt(total);
}
// Бүртгэлтэй адуу хайх (зүс / эзэн / утас) — холбовол horseId, утас автоматаар
function onLabSampleHorseInput(v) {
  const list = document.getElementById('ls-horse-list'); if (!list) return;
  const q = String(v || '').trim().toLowerCase();
  _labSampleHorseId = '';
  if (q.length < 2) { list.classList.remove('show'); list.innerHTML = ''; return; }
  const res = (STATE.horses || []).filter(h => h && ((h.name || '') + ' ' + (h.owner || '') + ' ' + (h.phone || '') + ' ' + (h.iabd || '')).toLowerCase().includes(q)).slice(0, 10);
  if (!res.length) { list.classList.remove('show'); list.innerHTML = ''; return; }
  list.innerHTML = res.map(h => '<div class="dd-i" data-id="' + escHTML(h.id) + '"><b>' + escHTML(h.name || '') + '</b> · ' + escHTML(h.owner || '') + ' <span class="muted" style="font-size:10.5px">' + escHTML(h.phone || '') + (h.iabd ? ' · ' + escHTML(h.iabd) : '') + '</span></div>').join('');
  list.classList.add('show');
  list.querySelectorAll('.dd-i').forEach(el => el.onmousedown = (ev) => { ev.preventDefault(); pickLabSampleHorse(el.dataset.id); });
}
function pickLabSampleHorse(id) {
  const h = (STATE.horses || []).find(x => String(x.id) === String(id)); if (!h) return;
  _labSampleHorseId = String(h.id);
  const set = (id2, v) => { const el = document.getElementById(id2); if (el) el.value = v; };
  set('ls-horse', h.name || ''); if (h.owner) set('ls-owner', h.owner); if (h.phone) set('ls-phone', h.phone);
  const list = document.getElementById('ls-horse-list'); if (list) { list.classList.remove('show'); list.innerHTML = ''; }
  const link = document.getElementById('ls-horse-link'); if (link) link.innerHTML = '🔗 Бүртгэлтэй адуутай холбогдлоо: <b>' + escHTML(h.name || '') + '</b> · ' + escHTML(h.owner || '');
}
function saveLabSample() {
  if (!canIntakeSample()) { toast('⛔ Эрх алга', 'err'); return; }
  const v = id => { const el = document.getElementById(id); return el ? String(el.value || '').trim() : ''; };
  const owner = v('ls-owner'), horse = v('ls-horse') || 'Сорьц (адуугүй)', phone = v('ls-phone'), sample = v('ls-sample') || 'Цус', note = v('ls-note');
  const date = v('ls-date') || todayStr();
  const tests = labSampleSelected();
  if (!owner) { toast('Эзний нэр оруулна уу', 'err'); return; }
  if (!tests.length) { toast('Шинжилгээ сонгоно уу', 'err'); return; }
  const me = (STATE.user && STATE.user.name) || '';
  const ms = nowMs();
  const total = tests.reduce((a, s) => a + s.price, 0);
  const finId = uid();
  if (!Array.isArray(STATE.labs)) STATE.labs = [];
  const created = tests.map(s => {
    const lab = {
      id: uid(), examId: null, examNum: '', horseId: _labSampleHorseId || '', horse, owner, phone,
      docId: '', docName: me, service: s.name, price: s.price, diagnosis: '', date,
      direct: true, sample, finId, receivedBy: me, note,
      status: 'collected',
      history: [
        { status: 'ordered', ms, user: me, note: 'Сорьц шууд хүлээн авсан (адуугүй) · ' + sample },
        { status: 'collected', ms: ms + 1, user: me, note: 'Сорьц гарт байна' }
      ],
      results: [], resultNote: '', orderedMs: ms, doneMs: 0, ms
    };
    STATE.labs.push(lab);
    try { fbSaveRecord('labs', lab); } catch (e) {}
    return lab;
  });
  // 💰 Accountant / Financeд нэхэмжлэх — kind:'lab' (Accountant / Financeгийн шүүлтэд «Шинжилгээ (сорьц)»)
  const fin = {
    id: finId, kind: 'lab', labIds: created.map(l => l.id), examId: null, examNum: '',
    horse, owner, phone, docName: me, amount: total,
    services: tests.map(s => s.name).join(', '), sample,
    paid: false, method: '', date, paidDate: '', paidMs: 0, ms
  };
  STATE.fins.push(fin);
  try { fbSaveRecord('fins', fin); } catch (e) {}
  saveAll();
  try { writeLog('Сорьц хүлээн авав', finId, horse + ' — ' + owner, sample + ' · ' + tests.map(s => s.name).join(', ') + ' · ' + fmt(total)); } catch (e) {}
  closeModal('lab-sample-modal');
  updateBadges();
  renderLab();
  toast('🩸 Сорьц бүртгэгдлээ — ' + created.length + ' шинжилгээ, нэхэмжлэх ' + fmt(total) + ' Accountant / Financeд үүслээ', 'ok');
}
