export function localApiBase(value) {
  const url = new URL(value);
  if (url.protocol !== 'http:' || !['localhost', '127.0.0.1', '[::1]'].includes(url.hostname)
      || url.username || url.password || url.pathname !== '/' || url.search || url.hash) {
    throw new Error('Use an HTTP localhost API origin, such as http://localhost:8001.');
  }
  return url.origin;
}

const sections = [
  ['branch', 'Current branch', ['branch.read'], '🏢'],
  ['appointments', 'Appointments and roster', ['appointment.read', 'roster.read'], '🗓️'],
  ['audit', 'Audit history', ['audit.read'], '📋'],
];
export function visibleSections(permissions) {
  return sections.filter(([, , actions]) => actions.some((action) => permissions.includes(action)));
}

export function createClient(base, fetcher = globalThis.fetch) {
  const origin = localApiBase(base);
  let csrf = '';
  return {
    setCsrf(value) { csrf = value; },
    async request(path, { method = 'GET', body } = {}) {
      if (!path.startsWith('/api/v1/') || path.includes('://')) throw new Error('Invalid API path.');
      const headers = { Accept: 'application/json' };
      if (body !== undefined) headers['Content-Type'] = 'application/json';
      if (csrf) headers['X-CSRFToken'] = csrf;
      const response = await fetcher(origin + path, { method, headers,
        body: body === undefined ? undefined : JSON.stringify(body), credentials: 'include', redirect: 'error' });
      let data = null;
      if (response.status !== 204) {
        const payload = await response.text();
        if (payload) {
          try { data = JSON.parse(payload); } catch {
            const message = response.status === 401
              ? 'The P1 session has expired. Reconnect the P1 Clinical API session and try again.'
              : `The Clinical API returned a non-JSON response (HTTP ${response.status}). Check the API service and reconnect the P1 session if needed.`;
            const error = new Error(message);
            error.status = response.status;
            throw error;
          }
        }
      }
      if (!response.ok) {
        const error = new Error(data?.error?.message || data?.detail || JSON.stringify(data));
        error.status = response.status;
        error.payload = data;
        throw error;
      }
      return data;
    },
  };
}

if (typeof document !== 'undefined') initialize();

function initialize() {
  const $ = (id) => document.getElementById(id);
  const placements = { branch: 'page-dashboard', appointments: 'page-planned', audit: 'page-history' };
  for (const [id, target] of Object.entries(placements)) {
    const area = $(id);
    area.classList.remove('page', 'wb-page');
    area.classList.add('p1-inline-area');
    area.hidden = true;
    $(target).prepend(area);
  }
  $('p1-connect-card').append($('p1-status'));
  $('p1-mobile-nav').hidden = true;
  for (const id of ['p1-nav-heading', 'p1-nav-list', 'p1-drawer-heading', 'p1-drawer-list']) $(id).hidden = true;
  let client, session, profile = null, cursor = null, screeningForms = [], screeningVisits = [];
  let clinicalVisits = [], currentClinicalNote = null;
  const can = (permission) => session?.permissions.includes(permission);
  const element = (tag, text) => { const node = document.createElement(tag); if (text !== undefined) node.textContent = String(text); return node; };
  function message(text, error = false) { $('p1-status').textContent = text; $('p1-status').className = error ? 'error' : 'ok'; }
  function clearSession() {
    session = null; profile = null; cursor = null;
    window.p1ClinicalApi = null;
    $('p1-nav-list').replaceChildren(); $('p1-mobile-nav').replaceChildren();
    $('p1-drawer-list').replaceChildren();
    for (const id of ['p1-nav-heading', 'p1-nav-list', 'p1-drawer-heading', 'p1-drawer-list']) $(id).hidden = true;
    document.body.classList.remove('p1-active');
    $('p1-identity').textContent = 'No active local session.';
    $('p1-api-state').textContent = 'Not connected';
    $('p1-logout').disabled = true;
    $('p1-connect').disabled = false;
    restoreLegacyMenus();
    for (const [id] of sections) $(id).hidden = true;
    $('workbench-home').hidden = true; $('workbench-home').classList.remove('active');
    $('p1-connect-card').hidden = false;
    for (const id of ['appointment-records', 'roster-records', 'audit-records']) $(id).replaceChildren();
    $('api-visit-records').replaceChildren(); $('api-reception-records').replaceChildren(); $('api-waiting-area').hidden = true;
    $('screening-area').hidden = true; $('screening-questions').replaceChildren(); $('screening-review-note').textContent = '';
    $('screening-review-records').replaceChildren();
    $('clinical-draft-area').hidden = true; $('clinical-draft-form').reset(); $('clinical-draft-status').textContent = '';
    $('clinical-draft-version').value = 'No draft note'; clinicalVisits = []; currentClinicalNote = null;
    screeningForms = []; screeningVisits = [];
    $('legacy-waiting-view').hidden = false;
    for (const select of document.querySelectorAll('#appointment-resource')) select.replaceChildren();
    for (const id of ['branch-form']) $(id).reset();
    $('branch-record').textContent = '';
    window.p1OriginalRegistrationReady?.();
  }
  window.p1Exit = () => {
    document.body.classList.remove('p1-active');
  };
  window.p1Disconnect = async () => {
    try { if (client && session) await client.request('/api/v1/session', { method: 'DELETE' }); }
    finally { clearSession(); }
  };
  async function run(task) {
    try { return await task(); } catch (error) {
      if (error.status === 401) clearSession();
      const active = document.querySelector('.page.active')?.id;
      const target = active === 'page-waiting' ? $('api-waiting-status')
        : active === 'page-planned' ? $('schedule-status')
        : active === 'page-history' ? $('audit-status')
          : active === 'page-exam' && !$('screening-area').hidden ? $('screening-status') : $('p1-status');
      target.textContent = error.message; target.className = 'p1-api-status error';
    }
  }
  const values = (form) => Object.fromEntries(new FormData(form).entries());
  function iso(value) { const date = new Date(value); if (!value || !Number.isFinite(date.getTime())) throw new Error('Enter a valid date and time.'); return date.toISOString(); }
  function table(target, headers, rows) {
    const grid = element('table'), head = element('tr'); headers.forEach((label) => head.append(element('th', label)));
    const thead = element('thead'); thead.append(head); grid.append(thead);
    const body = element('tbody');
    for (const row of rows) { const tr = element('tr'); for (const value of row) { const td = element('td'); td.append(value instanceof Node ? value : element('span', value ?? '—')); tr.append(td); } body.append(tr); }
    grid.append(body); $(target).replaceChildren(grid); $(target).classList.add('scroll');
    if (!rows.length) $(target).append(element('p', 'No records in this branch/window.'));
  }
  function button(label, action) {
    const b = element('button', label); b.type = 'button'; b.className = 'btn btn-xs';
    b.addEventListener('click', () => run(async () => { b.disabled = true; try { await action(); } finally { b.disabled = false; } }));
    return b;
  }
  function options(select, rows, label) {
    const prior = select.value; select.replaceChildren(new Option('Select a record', ''));
    rows.forEach((row) => select.add(new Option(label(row), row.id)));
    if (rows.some((row) => row.id === prior)) select.value = prior;
  }
  function configureMenus() {
    for (const id of ['p1-nav-heading', 'p1-nav-list', 'p1-drawer-heading', 'p1-drawer-list', 'p1-mobile-nav']) $(id).hidden = true;
    $('branch').hidden = !can('branch.read') && !can('branch.manage');
    $('appointments').hidden = !can('appointment.read') && !can('appointment.request') && !can('roster.read');
    $('audit').hidden = !can('audit.read');
    $('screening-area').hidden = !can('screening.read') && !can('screening.review.read');
    $('screening-form').hidden = !can('screening.read');
    $('screening-review-area').hidden = !can('screening.review.read');
    $('screening-submit').hidden = !can('screening.submit');
    $('clinical-draft-area').hidden = !can('visit.read') || !can('clinical_note.draft.write');
    $('workbench-home').hidden = true;
    const pageRules = {
      register: ['registry.create', 'registry.read'],
      waiting: ['visit.read'],
      planned: ['appointment.read', 'appointment.request', 'roster.read'],
      history: ['audit.read'],
    };
    for (const [page, permissions] of Object.entries(pageRules)) {
      for (const item of document.querySelectorAll(`[data-page="${page}"]`)) {
        if (item.dataset.p1OriginalHidden === undefined) item.dataset.p1OriginalHidden = item.hidden ? '1' : '0';
        const allowed = permissions.some((permission) => can(permission));
        item.hidden = allowed ? item.dataset.p1OriginalHidden === '1' : true;
      }
    }
    for (const [id, permission] of [['branch-form', 'branch.manage'],
      ['resource-form', 'demo.resource.create'], ['appointment-form', 'appointment.request'],
      ['roster-admin-area', 'roster.manage']]) $(id).hidden = !can(permission);
    window.p1OriginalRegistrationReady?.();
  }
  function restoreLegacyMenus() {
    for (const item of document.querySelectorAll('[data-p1-original-hidden]')) {
      item.hidden = item.dataset.p1OriginalHidden === '1';
      delete item.dataset.p1OriginalHidden;
    }
  }
  async function loadBranch() {
    if (!can('branch.read')) return;
    const result = await client.request('/api/v1/branches/current'); profile = result.profile;
    $('branch-record').textContent = profile ? `${profile.display_name} (${profile.code}) · version ${profile.version}` : `Branch ${result.branch_id}: profile not yet recorded.`;
    if (profile) { $('branch-form').elements.display_name.value = profile.display_name; $('branch-form').elements.code.value = profile.code; }
  }
  function windowQuery() { return new URLSearchParams({ starts_at: iso($('window-start').value), ends_at: iso($('window-end').value) }); }
  async function loadSchedule() {
    const query = windowQuery();
    let horseNames = new Map();
    if (can('registry.read')) {
      const horses = await client.request('/api/v1/horses?limit=100');
      horseNames = new Map(horses.items.map((row) => [row.id, row.name]));
      for (const select of document.querySelectorAll('[data-horses]')) options(select, horses.items, (row) => row.name);
    }
    if (can('roster.read')) {
      const roster = await client.request('/api/v1/roster?' + query);
      options($('appointment-resource'), roster.resources.filter((row) => row.active), (row) => row.name);
      options($('roster-qual-practitioner'), roster.practitioners.filter((row) => row.active), (row) => row.display_name);
      options($('roster-shift-practitioner'), roster.practitioners.filter((row) => row.active), (row) => row.display_name);
      const names = new Map(roster.practitioners.map((row) => [row.id, row.display_name]));
      table('roster-records', ['Practitioner', 'Recorded qualifications', 'Shifts in window'], roster.practitioners.map((row) => [names.get(row.id),
        roster.qualifications.filter((q) => q.practitioner_id === row.id).map((q) => `${q.code} (${q.valid_from} – ${q.valid_until || 'open'})`).join('; '),
        roster.shifts.filter((s) => s.practitioner_id === row.id).map((s) => `${s.status}: ${s.starts_at} – ${s.ends_at}`).join('; ')]));
    }
    if (can('appointment.read')) {
      const result = await client.request('/api/v1/appointments?' + query);
      table('appointment-records', ['Horse', 'Window', 'Status/version', 'Actions'], result.items.map((row) => {
        const actions = element('div'); actions.className = 'actions';
        const mutate = (action) => async () => {
          const body = { action, expected_version: row.version };
          if (['cancel', 'reschedule'].includes(action)) { body.reason = $('change-reason').value.trim(); if (!body.reason) throw new Error('Enter a reason for this change.'); }
          if (action === 'reschedule') { body.starts_at = iso($('new-start').value); body.ends_at = iso($('new-end').value); }
          await client.request(`/api/v1/appointments/${row.id}/actions`, { method: 'POST', body });
          await loadSchedule(); message(`Appointment ${action} saved with audit history.`);
        };
        if (row.status === 'REQUESTED' && can('appointment.confirm')) actions.append(button('Confirm', mutate('confirm')));
        if (row.status === 'CONFIRMED' && can('appointment.arrive')) actions.append(button('Record arrival', mutate('arrive')));
        if (['REQUESTED', 'CONFIRMED'].includes(row.status)) for (const [action, label] of [['reschedule', 'Reschedule'], ['cancel', 'Cancel']]) if (can('appointment.' + action)) actions.append(button(label, mutate(action)));
        return [horseNames.get(row.horse_id) || row.horse_id, `${row.starts_at} – ${row.ends_at}`, `${row.status} / ${row.version}`, actions];
      }));
    }
  }
  async function loadAudit(next = false) {
    const query = new URLSearchParams();
    for (const [key, value] of Object.entries(values($('audit-form')))) if (value.trim()) query.set(key, value.trim());
    if (next && cursor) query.set('cursor', cursor);
    const result = await client.request('/api/v1/audit-events?' + query);
    table('audit-records', ['Time', 'Action', 'Record', 'Actor', 'Details'], result.items.map((row) => [row.occurred_at, row.action, `${row.aggregate_type}: ${row.aggregate_id}`, row.actor_id, element('pre', JSON.stringify(row.details, null, 2))]));
    cursor = result.next_cursor; $('audit-next').hidden = !cursor;
  }
  async function loadVisits() {
    $('api-waiting-area').hidden = false;
    $('legacy-waiting-view').hidden = true;
    if (!can('visit.read')) {
      $('api-waiting-status').textContent = 'This session needs visit.read to display Clinical API visits. Ask the local administrator to add it, then reconnect.';
      $('api-visit-count').textContent = '—'; $('api-visit-records').replaceChildren(); return;
    }
    const result = await client.request('/api/v1/visits');
    const roster = can('roster.read') ? await client.request('/api/v1/roster?' + windowQuery()) : { practitioners: [] };
    const practitioners = roster.practitioners.filter((row) => row.active);
    const waiting = result.items.filter((row) => ['REGISTERED', 'ARRIVED'].includes(row.status));
    $('api-visit-count').textContent = waiting.length;
    $('w-sub').textContent = `${waiting.length} Clinical API visits waiting for examination`;
    $('api-waiting-status').textContent = 'Clinical API records for the authorized branch. Arrival and vet assignment actions are permission controlled.';
    table('api-visit-records', ['Visit', 'Horse', 'Owner', 'Status', 'Reception notes', 'Actions'], waiting.map((row) => {
      const actions = element('div'); actions.className = 'actions';
      if (row.status === 'REGISTERED' && can('visit.arrive')) actions.append(button('Record arrival', async () => {
        await client.request(`/api/v1/visits/${row.id}/arrival`, { method: 'POST', body: { expected_version: row.version } });
        await loadVisits();
      }));
      if (can('visit.assign') && practitioners.length) {
        const select = element('select'); select.className = 'inp';
        options(select, practitioners, (person) => person.display_name);
        if (row.assigned_practitioner_id) select.value = row.assigned_practitioner_id;
        actions.append(select, button(row.assigned_practitioner_id ? 'Reassign vet' : 'Assign vet', async () => {
          if (!select.value) throw new Error('Select a practitioner first.');
          await client.request(`/api/v1/visits/${row.id}/assignments`, { method: 'POST', body: { practitioner_id: select.value } });
          await loadVisits();
        }));
      }
      return [row.slip_number, row.horse?.name, row.owner?.display_name, row.status,
        row.reception?.summary, actions];
    }));
    if (can('reception.read')) {
      const inbox = await client.request('/api/v1/reception/tasks');
      const horses = can('registry.read') ? await client.request('/api/v1/horses?limit=100') : { items: [] };
      $('api-reception-count').textContent = inbox.items.length;
      table('api-reception-records', ['Source', 'Caller', 'Phone', 'Request', 'Status', 'Actions'], inbox.items.map((task) => {
        const actions = element('div'); actions.className = 'actions';
        if (!task.horse_id && can('reception.link') && horses.items.length) {
          const select = element('select'); select.className = 'inp'; options(select, horses.items, (horse) => horse.name);
          actions.append(select, button('Link selected horse', async () => {
            if (!select.value) throw new Error('Select the horse confirmed by staff.');
            await client.request(`/api/v1/reception/tasks/${task.id}/actions`, { method: 'POST', body: {
              action: 'link', horse_id: select.value, expected_version: task.version,
            } });
            await loadVisits();
          }));
        } else if (task.horse_id && !task.visit_id && can('visit.create')) {
          actions.append(button('Register visit', async () => {
            await client.request('/api/v1/visits', { method: 'POST', body: {
              horse_id: task.horse_id, reception_task_id: task.id,
            } });
            await loadVisits();
          }));
        }
        return [task.source, task.customer_name, task.phone, task.summary, task.status, actions];
      }));
    } else {
      $('api-reception-count').textContent = '—'; $('api-reception-records').replaceChildren(element('p', 'This session needs reception.read to view reception requests.'));
    }
  }
  function renderScreeningQuestions() {
    const version = screeningForms.find((row) => row.id === $('screening-version').value);
    const target = $('screening-questions'); target.replaceChildren();
    if (!version) return;
    const questions = Array.isArray(version.schema?.questions) ? version.schema.questions : [];
    if (!questions.length) {
      target.append(element('p', 'This published version contains no questions in the supported question list. Ask the form owner to provide the approved question schema.'));
      return;
    }
    for (const question of questions) {
      if (!question || typeof question.id !== 'string' || !question.id.trim()) continue;
      const wrapper = element('div'); wrapper.className = 'fld';
      const label = element('label', question.label || question.question || question.id);
      if (question.required) label.append(element('span', ' *'));
      wrapper.append(label);
      const type = String(question.type || 'text').toLowerCase();
      let input;
      if (type === 'textarea') { input = element('textarea'); input.rows = 3; }
      else if (type === 'select' || type === 'yes_no' || type === 'boolean') {
        input = element('select'); input.append(new Option('Select an answer', ''));
        const choices = type === 'yes_no' || type === 'boolean' ? [{ value: 'yes', label: 'Yes' }, { value: 'no', label: 'No' }]
          : (Array.isArray(question.options) ? question.options.map((choice) => typeof choice === 'string'
            ? { value: choice, label: choice } : choice) : []);
        choices.forEach((choice) => {
          if (choice && typeof choice.value === 'string' && typeof (choice.label ?? choice.value) === 'string')
            input.add(new Option(choice.label ?? choice.value, choice.value));
        });
      } else {
        input = element('input');
        input.type = ['number', 'date'].includes(type) ? type : 'text';
      }
      input.className = 'inp'; input.id = `screening-answer-${question.id}`;
      input.dataset.answerId = question.id; label.htmlFor = input.id;
      input.required = Boolean(question.required); wrapper.append(input); target.append(wrapper);
    }
  }
  async function loadScreening() {
    if (!can('screening.read') && !can('screening.review.read')) return;
    $('screening-area').hidden = false;
    const [forms, visits, reviews] = await Promise.all([
      can('screening.read') ? client.request('/api/v1/screening/forms') : Promise.resolve({ items: [] }),
      can('screening.read') && can('visit.read') ? client.request('/api/v1/visits') : Promise.resolve({ items: [] }),
      can('screening.review.read') ? client.request('/api/v1/screening/reviews') : Promise.resolve({ items: [] }),
    ]);
    screeningForms = forms.items || [];
    screeningVisits = (visits.items || []).filter((row) => ['REGISTERED', 'ARRIVED', 'IN_PROGRESS'].includes(row.status));
    options($('screening-version'), screeningForms, (row) => `${row.name} · v${row.version}`);
    options($('screening-visit'), screeningVisits, (row) => `${row.slip_number} · ${row.horse?.name || row.horse_id} · ${row.status}`);
    renderScreeningQuestions();
    $('screening-status').textContent = !can('screening.read') ? '' : screeningForms.length
      ? `${screeningForms.length} published questionnaire version(s) available for this branch.`
      : 'No published questionnaire versions are available in this branch yet. Client-approved form content is required before staff can complete screening.';
    $('screening-submit').disabled = !can('screening.submit') || !screeningForms.length || !screeningVisits.length
      || !$('screening-questions').querySelector('[data-answer-id]');
    if (can('screening.read') && !can('visit.read')) $('screening-status').textContent += ' This session also needs visit.read to choose a visit.';
    if (can('screening.read') && !can('screening.submit')) $('screening-status').textContent += ' This session needs screening.submit to submit answers.';
    table('screening-review-records', ['Submitted', 'Visit / horse', 'Questionnaire', 'Answers', 'Status'], (reviews.items || []).map((row) => [
      row.submitted_at, `${row.slip_number} · ${row.horse_name}`, `${row.form_name} v${row.form_version} / rev ${row.revision}`,
      element('pre', JSON.stringify(row.answers, null, 2)), row.decision,
    ]));
  }
  async function loadClinicalDrafts() {
    if (!can('visit.read') || !can('clinical_note.draft.write')) return;
    $('clinical-draft-area').hidden = false;
    const result = await client.request('/api/v1/visits');
    clinicalVisits = (result.items || []).filter((row) => ['REGISTERED', 'ARRIVED', 'IN_PROGRESS'].includes(row.status));
    options($('clinical-draft-visit'), clinicalVisits,
      (row) => `${row.slip_number} · ${row.horse?.name || row.horse_id} · ${row.status}`);
    selectClinicalDraftVisit();
    $('clinical-draft-status').textContent = clinicalVisits.length
      ? 'Draft notes are available for active Clinical visits in this branch.'
      : 'No active Clinical API visits are available in this branch.';
  }
  function selectClinicalDraftVisit() {
    const selectedId = $('clinical-draft-visit').value;
    const visit = clinicalVisits.find((row) => row.id === selectedId);
    currentClinicalNote = visit?.draft_note || null;
    $('clinical-draft-body').value = currentClinicalNote?.body || '';
    $('clinical-draft-version').value = currentClinicalNote
      ? `${currentClinicalNote.status} · revision ${currentClinicalNote.version}` : 'No draft note';
  }
  window.p1PageChanged = (page) => {
    if (!session) return;
    if (page === 'dashboard' && can('branch.read')) run(loadBranch);
    if (page === 'planned' && (can('appointment.read') || can('roster.read'))) run(loadSchedule);
    if (page === 'history' && can('audit.read')) run(() => loadAudit());
    if (page === 'waiting') run(loadVisits);
    if (page === 'exam' && (can('screening.read') || can('screening.review.read'))) run(loadScreening);
    if (page === 'exam' && can('clinical_note.draft.write') && can('visit.read')) run(loadClinicalDrafts);
  };
  function form(id, handler) { $(id).addEventListener('submit', (event) => { event.preventDefault(); run(async () => { const submit = $(id).querySelector('button'); submit.disabled = true; try { await handler(values($(id))); } finally { submit.disabled = false; } }); }); }
  $('p1-connect').addEventListener('click', () => run(async () => {
    clearSession(); client = createClient($('p1-api-base').value.trim());
    const csrf = await client.request('/api/v1/dev/csrf'); client.setCsrf(csrf.csrf_token);
    await client.request('/api/v1/dev/session', { method: 'POST', body: {} });
    session = await client.request('/api/v1/session');
    if (!session.local_prototype) throw new Error('This workbench requires an opted-in local development session.');
    window.p1ClinicalApi = {
      get connected() { return Boolean(client && session); },
      can,
      request(path, options) { if (!client || !session) throw new Error('Connect the P1 Clinical API session first.'); return client.request(path, options); },
      searchContacts(query) { return client.request('/api/v1/contacts?q=' + encodeURIComponent(query)); },
      registerIntake(payload) { return client.request('/api/v1/registration-intakes', { method: 'POST', body: payload }); },
      listHorses() { return client.request('/api/v1/horses?limit=100'); },
    };
    $('p1-identity').textContent = `Actor ${session.actor_id} · branch ${session.branch_id} · expires ${session.expires_at}`;
    $('p1-api-state').textContent = 'Connected · server permissions';
    $('p1-logout').disabled = false; $('p1-connect').disabled = true; configureMenus();
    await loadBranch(); window.p1OriginalRegistrationReady?.();
    if (can('appointment.read') || can('roster.read')) await loadSchedule();
    if (can('visit.read')) await loadVisits();
    if (can('clinical_note.draft.write') && can('visit.read')) await loadClinicalDrafts();
    message('P1 API session connected. API access is controlled by server permissions.');
  }));
  $('p1-logout').addEventListener('click', () => run(async () => { await window.p1Disconnect(); message('Signed out.'); }));
  form('branch-form', async (body) => { await client.request('/api/v1/branches/current', { method: profile ? 'PATCH' : 'POST', body: { ...body, ...(profile ? { expected_version: profile.version } : {}) } }); await loadBranch(); message('Current-branch profile saved.'); });
  form('window-form', loadSchedule);
  form('resource-form', async (body) => { await client.request('/api/v1/dev/scheduling-resources', { method: 'POST', body: { ...body, resource_type: 'room' } }); await loadSchedule(); message('Synthetic local room created.'); });
  form('appointment-form', async (body) => { body.starts_at = iso(body.starts_at); body.ends_at = iso(body.ends_at); await client.request('/api/v1/appointments', { method: 'POST', body }); await loadSchedule(); message('Appointment requested; no visit or clinical clearance created.'); });
  form('roster-practitioner-form', async (body) => { await client.request('/api/v1/roster/practitioners', { method: 'POST', body }); await loadSchedule(); message('Practitioner added to the local roster.'); });
  form('roster-qualification-form', async (body) => {
    const practitioner = body.practitioner_id; delete body.practitioner_id;
    body.kind = 'qualification'; body.valid_from = iso(body.valid_from);
    if (body.valid_until) body.valid_until = iso(body.valid_until); else delete body.valid_until;
    await client.request(`/api/v1/roster/practitioners/${practitioner}/entries`, { method: 'POST', body });
    await loadSchedule(); message('Qualification recorded. Eligibility rules are not yet enforced.');
  });
  form('roster-shift-form', async (body) => {
    const practitioner = body.practitioner_id; delete body.practitioner_id;
    body.kind = 'shift'; body.starts_at = iso(body.starts_at); body.ends_at = iso(body.ends_at);
    await client.request(`/api/v1/roster/practitioners/${practitioner}/entries`, { method: 'POST', body });
    await loadSchedule(); message('Duty shift recorded.');
  });
  form('audit-form', () => loadAudit()); $('audit-next').addEventListener('click', () => run(() => loadAudit(true)));
  $('screening-version').addEventListener('change', renderScreeningQuestions);
  $('clinical-draft-visit').addEventListener('change', selectClinicalDraftVisit);
  $('clinical-draft-form').addEventListener('submit', (event) => {
    event.preventDefault(); run(async () => {
      const form = $('clinical-draft-form');
      if (!form.reportValidity()) return;
      const visitId = $('clinical-draft-visit').value;
      if (!visitId) throw new Error('Select a Clinical visit first.');
      const submit = $('clinical-draft-save'); submit.disabled = true;
      try {
        const body = $('clinical-draft-body').value.trim();
        if (currentClinicalNote) {
          await client.request(`/api/v1/clinical-notes/${currentClinicalNote.id}/revisions`, {
            method: 'POST', body: { expected_version: currentClinicalNote.version, body },
          });
        } else {
          await client.request(`/api/v1/visits/${visitId}/draft-notes`, {
            method: 'POST', body: { note_type: 'general', body },
          });
        }
        await loadClinicalDrafts();
        $('clinical-draft-status').textContent = 'Unsigned draft saved with version history and audit record.';
      } finally { submit.disabled = false; }
    });
  });
  $('screening-form').addEventListener('submit', (event) => {
    event.preventDefault(); run(async () => {
      const form = $('screening-form');
      if (!form.reportValidity()) return;
      const answers = {};
      for (const field of $('screening-questions').querySelectorAll('[data-answer-id]'))
        answers[field.dataset.answerId] = field.value;
      const submit = $('screening-submit'); submit.disabled = true;
      try {
        const result = await client.request('/api/v1/screening/answers', { method: 'POST', body: {
          form_version_id: $('screening-version').value, visit_id: $('screening-visit').value, answers,
        } });
        $('screening-review-note').textContent = `Submitted (revision ${result.revision}). Status: ${result.review.decision}. Vet review is pending; no clinical clearance was granted.`;
        $('screening-status').textContent = 'Answers submitted and audit recorded.';
        form.reset(); $('screening-questions').replaceChildren();
      } finally { submit.disabled = false; }
    });
  });
  $('api-refresh-visits').addEventListener('click', () => run(loadVisits));
  const localValue = (date) => new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
  const tomorrow = new Date(); tomorrow.setDate(tomorrow.getDate() + 1); tomorrow.setHours(9, 0, 0, 0);
  $('window-start').value = localValue(new Date(tomorrow.getTime() - 3600000)); $('window-end').value = localValue(new Date(tomorrow.getTime() + 86400000));
  for (const input of $('appointment-form').querySelectorAll('input[type="datetime-local"]')) input.value = localValue(new Date(tomorrow.getTime() + (input.name === 'ends_at' ? 3600000 : 0)));
  $('new-start').value = localValue(new Date(tomorrow.getTime() + 7200000)); $('new-end').value = localValue(new Date(tomorrow.getTime() + 10800000));
}
