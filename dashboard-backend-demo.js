(() => {
  'use strict';
  if (new URLSearchParams(window.location.search).get('backendDemo') !== '1') return;

  const byId = (id) => document.getElementById(id);
  const panel = byId('d-backend-demo');
  if (!panel) return;
  panel.hidden = false;

  const state = { csrf: '', connected: false, horseId: '', resourceId: '', appointment: null };
  const status = byId('bkd-result');
  const sessionState = byId('bkd-session-state');

  function message(text, kind = '') {
    status.textContent = text;
    status.style.color = kind === 'error' ? 'var(--red)' : kind === 'ok' ? 'var(--green)' : 'var(--muted)';
  }

  function localApiBase() {
    const url = new URL(byId('bkd-api-base').value.trim());
    if (url.protocol !== 'http:' || !['localhost', '127.0.0.1', '::1'].includes(url.hostname)) {
      throw new Error('For safety, this demo only connects to an HTTP localhost API address.');
    }
    return url.href.replace(/\/+$/, '');
  }

  async function api(path, options = {}) {
    const headers = new Headers(options.headers || {});
    headers.set('Accept', 'application/json');
    if (options.body) headers.set('Content-Type', 'application/json');
    if (state.csrf) headers.set('X-CSRFToken', state.csrf);
    const base = localApiBase();
    let response;
    try {
      response = await fetch(`${base}${path}`, {
        ...options, headers, credentials: 'include', mode: 'cors',
      });
    } catch (_) {
      throw new Error('Cannot reach the localhost Clinical API. Start the local backend and check its port.');
    }
    const body = await response.json().catch(() => ({}));
    if (!response.ok) {
      const detail = body?.error?.message || body?.detail || `HTTP ${response.status}`;
      throw new Error(typeof detail === 'string' ? detail : JSON.stringify(detail));
    }
    return body;
  }

  function setAppointment(appointment) {
    state.appointment = appointment;
    const selector = byId('bkd-resource');
    const horse = byId('bkd-horse');
    const when = appointment.starts_at ? new Date(appointment.starts_at).toLocaleString() : '';
    const horseLabel = horse.selectedOptions[0]?.textContent || 'local demo horse';
    const resourceLabel = selector.selectedOptions[0]?.textContent || 'local demo resource';
    message(`${appointment.status} · ${horseLabel} · ${resourceLabel} · ${when} · version ${appointment.version}. Visit created: no. Clinical clearance: no.`, 'ok');
    byId('bkd-confirm').disabled = appointment.status !== 'REQUESTED';
    byId('bkd-arrive').disabled = appointment.status !== 'CONFIRMED';
  }

  async function connect() {
    const button = byId('bkd-connect');
    button.disabled = true;
    message('Connecting to the localhost Clinical API...');
    try {
      const csrf = await api('/api/v1/dev/csrf');
      state.csrf = csrf.csrf_token;
      await api('/api/v1/dev/session', { method: 'POST', body: '{}' });
      state.connected = true;
      sessionState.textContent = 'Local session active (10 min)';
      message('Connected. No Firebase data was accessed. Create synthetic local records to continue.', 'ok');
    } catch (error) {
      state.connected = false;
      sessionState.textContent = 'Not connected';
      message(error.message, 'error');
    } finally { button.disabled = false; }
  }

  async function createHorse() {
    if (!state.connected) return message('Connect the local demo session first.', 'error');
    const button = byId('bkd-create-horse'); button.disabled = true;
    try {
      const enteredName = byId('bkd-horse-name').value.trim();
      const name = enteredName || `P1 UI Demo Horse ${new Date().toISOString().slice(0, 16)}`;
      const horse = await api('/api/v1/horses', {
        method: 'POST', body: JSON.stringify({ name, breed: 'Synthetic demo record' }),
      });
      state.horseId = horse.id;
      const select = byId('bkd-horse');
      select.replaceChildren(new Option(`${horse.name} · synthetic`, horse.id));
      select.value = horse.id;
      message(`Synthetic horse created in the local Clinical database (${horse.id}).`, 'ok');
    } catch (error) { message(error.message, 'error'); }
    finally { button.disabled = false; }
  }

  async function createResource() {
    if (!state.connected) return message('Connect the local demo session first.', 'error');
    const button = byId('bkd-create-resource'); button.disabled = true;
    try {
      const resource = await api('/api/v1/dev/scheduling-resources', {
        method: 'POST', body: JSON.stringify({
          name: `P1 UI Demo Room ${new Date().toISOString().slice(0, 16)}`,
          resource_type: 'room',
        }),
      });
      state.resourceId = resource.id;
      const select = byId('bkd-resource');
      select.replaceChildren(new Option(`${resource.name} · synthetic`, resource.id));
      select.value = resource.id;
      message(`Synthetic room created in the local Clinical database (${resource.id}).`, 'ok');
    } catch (error) { message(error.message, 'error'); }
    finally { button.disabled = false; }
  }

  async function requestAppointment() {
    if (!state.connected) return message('Connect the local demo session first.', 'error');
    if (!state.horseId || !state.resourceId) return message('Create a synthetic horse and room first.', 'error');
    const starts = byId('bkd-starts').value;
    const ends = byId('bkd-ends').value;
    if (!starts || !ends) return message('Enter both appointment times.', 'error');
    const button = byId('bkd-request'); button.disabled = true;
    try {
      const appointment = await api('/api/v1/appointments', {
        method: 'POST', body: JSON.stringify({
          horse_id: state.horseId, resource_id: state.resourceId,
          starts_at: new Date(starts).toISOString(), ends_at: new Date(ends).toISOString(),
        }),
      });
      setAppointment(appointment);
    } catch (error) { message(error.message, 'error'); }
    finally { button.disabled = false; }
  }

  async function transition(action, buttonId) {
    if (!state.appointment) return;
    const button = byId(buttonId); button.disabled = true;
    try {
      const appointment = await api(`/api/v1/appointments/${state.appointment.id}/actions`, {
        method: 'POST', body: JSON.stringify({ action, expected_version: state.appointment.version }),
      });
      setAppointment(appointment);
    } catch (error) { message(error.message, 'error'); button.disabled = false; }
  }

  function initializeTimes() {
    const start = new Date(Date.now() + 60 * 60 * 1000);
    start.setMinutes(0, 0, 0);
    const end = new Date(start.getTime() + 60 * 60 * 1000);
    const localInput = (date) => {
      const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
      return local.toISOString().slice(0, 16);
    };
    byId('bkd-starts').value = localInput(start);
    byId('bkd-ends').value = localInput(end);
  }

  byId('bkd-connect').addEventListener('click', connect);
  byId('bkd-create-horse').addEventListener('click', createHorse);
  byId('bkd-create-resource').addEventListener('click', createResource);
  byId('bkd-request').addEventListener('click', requestAppointment);
  byId('bkd-confirm').addEventListener('click', () => transition('confirm', 'bkd-confirm'));
  byId('bkd-arrive').addEventListener('click', () => transition('arrive', 'bkd-arrive'));
  initializeTimes();
})();
