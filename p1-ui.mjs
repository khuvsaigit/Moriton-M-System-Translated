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
  ['intake', 'Registration and reception', ['registry.read', 'contact.read', 'reception.read'], '🐴'],
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
      const data = response.status === 204 ? null : await response.json();
      if (!response.ok) {
        const error = new Error(data?.error?.message || data?.detail || JSON.stringify(data));
        error.status = response.status;
        throw error;
      }
      return data;
    },
  };
}

if (typeof document !== 'undefined') initialize();

function initialize() {
  const $ = (id) => document.getElementById(id);
  let client, session, profile = null, cursor = null;
  const can = (permission) => session?.permissions.includes(permission);
  const element = (tag, text) => { const node = document.createElement(tag); if (text !== undefined) node.textContent = String(text); return node; };
  function message(text, error = false) { $('p1-status').textContent = text; $('p1-status').className = error ? 'error' : 'ok'; }
  function clearSession() {
    session = null; profile = null; cursor = null;
    activeSection = null;
    $('p1-nav-list').replaceChildren(); $('p1-mobile-nav').replaceChildren();
    $('p1-drawer-list').replaceChildren();
    for (const id of ['p1-nav-heading', 'p1-nav-list', 'p1-drawer-heading', 'p1-drawer-list']) $(id).hidden = true;
    document.body.classList.remove('p1-active');
    $('p1-identity').textContent = 'No active local session.';
    $('p1-api-state').textContent = 'Not connected';
    $('p1-logout').disabled = true;
    for (const [id] of sections) { $(id).hidden = true; $(id).classList.remove('active'); }
    $('workbench-home').hidden = true; $('workbench-home').classList.remove('active');
    $('p1-connect-card').hidden = false;
    for (const id of ['horses', 'contacts', 'parties', 'reception', 'appointment-records', 'roster-records', 'audit-records']) $(id).replaceChildren();
    for (const select of document.querySelectorAll('[data-horses],#party-contact,#appointment-resource')) select.replaceChildren();
    for (const id of ['branch-form', 'horse-form', 'contact-form', 'party-form', 'reception-form']) $(id).reset();
    $('branch-record').textContent = ''; $('visit-result').textContent = '';
  }
  window.p1Exit = () => {
    document.body.classList.remove('p1-active');
    for (const [id] of sections) { $(id).hidden = true; $(id).classList.remove('active'); }
  };
  window.p1Disconnect = async () => {
    try { if (client && session) await client.request('/api/v1/session', { method: 'DELETE' }); }
    finally { clearSession(); }
  };
  async function run(task) {
    try { return await task(); } catch (error) {
      if (error.status === 401) clearSession();
      message(error.message, true);
    }
  }
  const values = (form) => Object.fromEntries(new FormData(form).entries());
  let activeSection = null;
  function setActiveSection(id) {
    const chosen = visibleSections(session?.permissions || []).find((entry) => entry[0] === id);
    if (!chosen) return;
    activeSection = id;
    document.body.classList.add('p1-active');
    for (const [sectionId] of sections) {
      const page = $(sectionId);
      const active = sectionId === id;
      page.hidden = !active;
      page.classList.toggle('active', active);
    }
    document.querySelectorAll('[data-workbench-section]').forEach((item) => {
      const active = item.dataset.workbenchSection === id;
      item.classList.toggle('active', active);
      if (active) item.setAttribute('aria-current', 'page');
      else item.removeAttribute('aria-current');
    });
  }
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
    $('p1-nav-list').replaceChildren(); $('p1-mobile-nav').replaceChildren();
    $('p1-drawer-list').replaceChildren();
    for (const id of ['p1-nav-heading', 'p1-nav-list', 'p1-drawer-heading', 'p1-drawer-list']) $(id).hidden = false;
    for (const [id] of sections) { $(id).hidden = true; $(id).classList.remove('active'); }
    const available = visibleSections(session.permissions);
    for (const [id, label, , icon] of available) {
      for (const menu of [$('p1-nav-list'), $('p1-drawer-list'), $('p1-mobile-nav')]) {
        const item = element('button'); item.type = 'button'; item.className = 'ni';
        item.dataset.workbenchSection = id; item.setAttribute('aria-label', label);
        const glyph = element('span', icon); glyph.className = 'ni-icon'; glyph.setAttribute('aria-hidden', 'true');
        const text = element('span', label); text.className = 'ni-label';
        item.append(glyph, text); item.addEventListener('click', () => setActiveSection(id));
        menu.append(item);
      }
    }
    $('workbench-home').hidden = true;
    if (!available.some(([id]) => id === activeSection)) activeSection = available[0]?.[0] || null;
    if (activeSection) setActiveSection(activeSection);
    for (const [id, permission] of [['branch-form', 'branch.manage'], ['horse-form', 'registry.create'],
      ['contact-form', 'contact.create'], ['party-form', 'party.create'], ['reception-form', 'reception.create'],
      ['resource-form', 'demo.resource.create'], ['appointment-form', 'appointment.request']]) $(id).hidden = !can(permission);
  }
  async function loadBranch() {
    if (!can('branch.read')) return;
    const result = await client.request('/api/v1/branches/current'); profile = result.profile;
    $('branch-record').textContent = profile ? `${profile.display_name} (${profile.code}) · version ${profile.version}` : `Branch ${result.branch_id}: profile not yet recorded.`;
    if (profile) { $('branch-form').elements.display_name.value = profile.display_name; $('branch-form').elements.code.value = profile.code; }
  }
  async function loadRegistry() {
    if (can('registry.read')) {
      const result = await client.request('/api/v1/horses?limit=100');
      table('horses', ['Horse', 'Record UUID'], result.items.map((row) => [row.name, row.id]));
      for (const select of document.querySelectorAll('[data-horses]')) options(select, result.items, (row) => row.name);
    }
    if (can('contact.read')) {
      const result = await client.request('/api/v1/contacts');
      table('contacts', ['Contact', 'Phone'], result.items.map((row) => [row.display_name, row.phone]));
      options($('party-contact'), result.items, (row) => row.display_name);
    }
    await loadReception();
  }
  async function loadParties() {
    const horse = $('party-form').elements.horse_id.value;
    if (!horse) throw new Error('Select a horse first.');
    const result = await client.request(`/api/v1/horses/${horse}/parties`);
    table('parties', ['Role', 'Contact', 'Valid from', 'Valid to'], result.items.map((row) => [row.role, row.contact.display_name, row.valid_from, row.valid_to]));
  }
  async function loadReception() {
    if (!can('reception.read')) return;
    const result = await client.request('/api/v1/reception/tasks');
    table('reception', ['Caller', 'Summary', 'Status', 'Actions'], result.items.map((row) => {
      const actions = element('div'); actions.className = 'actions';
      if (can('reception.link') && row.status !== 'resolved') actions.append(button('Link selected horse', async () => {
        const horse = $('reception-horse').value; if (!horse) throw new Error('Select the horse confirmed by staff.');
        await client.request(`/api/v1/reception/tasks/${row.id}/actions`, { method: 'POST', body: { action: 'link', horse_id: horse, expected_version: row.version, reason: 'Staff confirmed in local workbench' } });
        await loadReception(); message('Horse linked by staff. No automatic identity match was used.');
      }));
      if (can('visit.create') && row.horse_id && !row.visit_id) actions.append(button('Register local visit', async () => {
        const visit = await client.request('/api/v1/visits', { method: 'POST', body: { horse_id: row.horse_id, reception_task_id: row.id } });
        $('visit-result').textContent = `Visit ${visit.slip_number} registered. No clinical clearance inferred.`;
        await loadReception(); message('Local visit registered. Numbering remains provisional.');
      }));
      return [row.customer_name, row.summary, row.status, actions];
    }));
  }
  function windowQuery() { return new URLSearchParams({ starts_at: iso($('window-start').value), ends_at: iso($('window-end').value) }); }
  async function loadSchedule() {
    const query = windowQuery();
    if (can('roster.read')) {
      const roster = await client.request('/api/v1/roster?' + query);
      options($('appointment-resource'), roster.resources.filter((row) => row.active), (row) => row.name);
      const names = new Map(roster.practitioners.map((row) => [row.id, row.display_name]));
      table('roster-records', ['Practitioner', 'Recorded qualifications', 'Shifts in window'], roster.practitioners.map((row) => [names.get(row.id),
        roster.qualifications.filter((q) => q.practitioner_id === row.id).map((q) => `${q.code} (${q.valid_from} – ${q.valid_until || 'open'})`).join('; '),
        roster.shifts.filter((s) => s.practitioner_id === row.id).map((s) => `${s.status}: ${s.starts_at} – ${s.ends_at}`).join('; ')]));
    }
    if (can('appointment.read')) {
      const result = await client.request('/api/v1/appointments?' + query);
      table('appointment-records', ['Appointment', 'Window', 'Status/version', 'Actions'], result.items.map((row) => {
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
        return [row.id, `${row.starts_at} – ${row.ends_at}`, `${row.status} / ${row.version}`, actions];
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
  function form(id, handler) { $(id).addEventListener('submit', (event) => { event.preventDefault(); run(async () => { const submit = $(id).querySelector('button'); submit.disabled = true; try { await handler(values($(id))); } finally { submit.disabled = false; } }); }); }
  $('p1-connect').addEventListener('click', () => run(async () => {
    clearSession(); client = createClient($('p1-api-base').value.trim());
    const csrf = await client.request('/api/v1/dev/csrf'); client.setCsrf(csrf.csrf_token);
    await client.request('/api/v1/dev/session', { method: 'POST', body: {} });
    session = await client.request('/api/v1/session');
    if (!session.local_prototype) throw new Error('This workbench requires an opted-in local development session.');
    $('p1-identity').textContent = `Actor ${session.actor_id} · branch ${session.branch_id} · expires ${session.expires_at}`;
    $('p1-api-state').textContent = 'Connected · server permissions';
    $('p1-logout').disabled = false; $('p1-connect-card').hidden = true; configureMenus();
    await loadBranch(); await loadRegistry();
    if (can('appointment.read') || can('roster.read')) await loadSchedule();
    message('Local session connected. Menus reflect server permissions.');
  }));
  $('p1-logout').addEventListener('click', () => run(async () => { await window.p1Disconnect(); message('Signed out.'); }));
  form('branch-form', async (body) => { await client.request('/api/v1/branches/current', { method: profile ? 'PATCH' : 'POST', body: { ...body, ...(profile ? { expected_version: profile.version } : {}) } }); await loadBranch(); message('Current-branch profile saved.'); });
  form('horse-form', async (body) => { await client.request('/api/v1/horses', { method: 'POST', body }); await loadRegistry(); message('Synthetic horse saved.'); });
  form('contact-form', async (body) => { await client.request('/api/v1/contacts', { method: 'POST', body }); await loadRegistry(); message('Contact saved; phone is not treated as a unique identity.'); });
  form('party-form', async ({ horse_id, ...body }) => { body.valid_from = iso(body.valid_from); await client.request(`/api/v1/horses/${horse_id}/parties`, { method: 'POST', body }); await loadParties(); message('Party role recorded with audit evidence.'); });
  $('load-parties').addEventListener('click', () => run(loadParties));
  form('reception-form', async (body) => { await client.request('/api/v1/reception/tasks', { method: 'POST', body }); await loadReception(); message('Manual reception task saved.'); });
  form('window-form', loadSchedule);
  form('resource-form', async (body) => { await client.request('/api/v1/dev/scheduling-resources', { method: 'POST', body: { ...body, resource_type: 'room' } }); await loadSchedule(); message('Synthetic local room created.'); });
  form('appointment-form', async (body) => { body.starts_at = iso(body.starts_at); body.ends_at = iso(body.ends_at); await client.request('/api/v1/appointments', { method: 'POST', body }); await loadSchedule(); message('Appointment requested; no visit or clinical clearance created.'); });
  form('audit-form', () => loadAudit()); $('audit-next').addEventListener('click', () => run(() => loadAudit(true)));
  const localValue = (date) => new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
  const tomorrow = new Date(); tomorrow.setDate(tomorrow.getDate() + 1); tomorrow.setHours(9, 0, 0, 0);
  $('window-start').value = localValue(new Date(tomorrow.getTime() - 3600000)); $('window-end').value = localValue(new Date(tomorrow.getTime() + 86400000));
  for (const id of ['appointment-form', 'party-form']) for (const input of $(id).querySelectorAll('input[type="datetime-local"]')) input.value = localValue(new Date(tomorrow.getTime() + (input.name === 'ends_at' ? 3600000 : 0)));
  $('new-start').value = localValue(new Date(tomorrow.getTime() + 7200000)); $('new-end').value = localValue(new Date(tomorrow.getTime() + 10800000));
}
