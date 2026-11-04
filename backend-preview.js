(() => {
  const byId = (id) => document.getElementById(id);
  const status = byId('status');
  const apiBase = () => byId('api-base').value.trim().replace(/\/+$/, '');
  let csrfToken = '';
  let connected = false;
  let currentVisitId = '';

  function showStatus(message, kind = '') {
    status.textContent = message;
    status.className = kind;
  }

  async function request(path, options = {}) {
    const headers = new Headers(options.headers || {});
    headers.set('Accept', 'application/json');
    if (options.body) headers.set('Content-Type', 'application/json');
    if (csrfToken) headers.set('X-CSRFToken', csrfToken);
    let response;
    try {
      response = await fetch(`${apiBase()}${path}`, {
        ...options, headers, credentials: 'include', mode: 'cors',
      });
    } catch (error) {
      throw new Error(`Cannot reach ${apiBase()}. Check that Docker is running and the API address is reachable.`);
    }
    const body = response.status === 204 ? null : await response.json().catch(() => null);
    if (!response.ok) {
      const detail = body?.error?.message || body?.detail || body?.error || `HTTP ${response.status}`;
      throw new Error(typeof detail === 'string' ? detail : JSON.stringify(detail));
    }
    return body;
  }

  async function connect() {
    byId('connect').disabled = true;
    showStatus('Requesting local development session…');
    try {
      const csrf = await request('/api/v1/dev/csrf');
      csrfToken = csrf.csrf_token;
      await request('/api/v1/dev/session', { method: 'POST', body: '{}' });
      connected = true;
      showStatus('Connected to the local Clinical API. Session expires after 10 minutes.', 'ok');
      await loadHorses();
    } catch (error) {
      connected = false;
      showStatus(`${error.message} Ensure the local mock session is enabled in backend/.env and restart Compose.`, 'error');
    } finally {
      byId('connect').disabled = false;
    }
  }

  function renderHorses(horses) {
    const rows = byId('horse-rows');
    if (!horses.length) {
      rows.innerHTML = '<tr><td class="muted" colspan="5">No matching horses in this local database.</td></tr>';
      return;
    }
    rows.replaceChildren(...horses.map((horse) => {
      const row = document.createElement('tr');
      [horse.name, horse.breed || '—', horse.tamga || '—', horse.birth_year || '—', horse.id].forEach((value) => {
        const cell = document.createElement('td');
        cell.textContent = String(value);
        row.appendChild(cell);
      });
      return row;
    }));
    const selector = byId('visit-horse');
    const selectedId = selector.value;
    selector.replaceChildren(new Option(horses.length ? 'Choose a horse' : 'No horses loaded', ''));
    horses.forEach((horse) => selector.add(new Option(`${horse.name}${horse.tamga ? ` · ${horse.tamga}` : ''}`, horse.id)));
    if (horses.some((horse) => horse.id === selectedId)) selector.value = selectedId;
  }

  async function loadHorses() {
    if (!connected) return;
    try {
      const query = encodeURIComponent(byId('search').value.trim());
      const result = await request(`/api/v1/horses?limit=100&q=${query}`);
      renderHorses(result.items || []);
      await loadPrescriptions();
    } catch (error) {
      showStatus(error.message, 'error');
    }
  }

  function node(tag, className, text) {
    const item = document.createElement(tag);
    if (className) item.className = className;
    if (text !== undefined) item.textContent = text;
    return item;
  }

  async function loadPrescriptions() {
    if (!connected) return;
    try {
      const result = await request('/api/v1/pharmacy/prescriptions');
      const records = (result.items || []).filter((item) => !currentVisitId || item.visit_id === currentVisitId);
      renderPrescriptions(records);
    } catch (error) {
      showStatus(error.message, 'error');
    }
  }

  function renderPrescriptions(records) {
    const target = byId('prescriptions');
    target.replaceChildren();
    if (!currentVisitId) {
      target.append(node('p', 'muted', 'Open a local visit before creating a prescription.'));
      return;
    }
    if (!records.length) {
      target.append(node('p', 'muted', 'No prescriptions for this visit yet.'));
      return;
    }
    records.forEach((prescription) => {
      const card = node('div', 'card');
      card.style.margin = '14px 0 0';
      card.style.background = '#f8fafb';
      card.append(node('strong', '', `${prescription.status} · ${prescription.lines.map((line) => `${line.medication_name} (${line.prescribed_quantity} ${line.unit})`).join(', ')}`));
      card.append(node('p', 'muted', `Prescription ${prescription.id} · version ${prescription.version}`));
      if (prescription.status === 'DRAFT') {
        const verify = node('button', '', 'Verify prescription');
        verify.type = 'button';
        verify.addEventListener('click', async () => {
          verify.disabled = true;
          try {
            await request(`/api/v1/prescriptions/${prescription.id}/verify`, { method: 'POST', body: JSON.stringify({ expected_version: prescription.version }) });
            showStatus('Prescription verified. No stock reservation was sent.', 'ok');
            await loadPrescriptions();
          } catch (error) { showStatus(error.message, 'error'); verify.disabled = false; }
        });
        card.append(verify);
      }
      prescription.lines.forEach((line) => {
        const lineBlock = node('div');
        lineBlock.style.cssText = 'margin-top:12px;padding-top:10px;border-top:1px solid #dbe4e7';
        lineBlock.append(node('div', '', `${line.medication_name}: prescribed ${line.prescribed_quantity} ${line.unit}`));
        if (prescription.status === 'VERIFIED') {
          const quantity = document.createElement('input');
          quantity.type = 'number'; quantity.min = '0.0001'; quantity.step = '0.0001';
          quantity.value = line.prescribed_quantity; quantity.setAttribute('aria-label', 'Physical issue quantity');
          quantity.style.cssText = 'width:140px;margin:8px 8px 0 0';
          const issueButton = node('button', '', 'Record physical issue'); issueButton.type = 'button';
          issueButton.addEventListener('click', async () => {
            issueButton.disabled = true;
            try {
              await request(`/api/v1/prescription-lines/${line.id}/issues`, { method: 'POST', body: JSON.stringify({ quantity: quantity.value, unit: line.unit }) });
              showStatus('Physical issue recorded locally; Odoo posting remains pending.', 'ok');
              await loadPrescriptions();
            } catch (error) { showStatus(error.message, 'error'); issueButton.disabled = false; }
          });
          lineBlock.append(quantity, issueButton);
        }
        line.physical_issues.forEach((issue) => {
          lineBlock.append(node('p', 'muted', `Issue ${issue.id}: ${issue.quantity} ${issue.unit} · ERP ${issue.external_posting_state}`));
          const adminQuantity = document.createElement('input');
          adminQuantity.type = 'number'; adminQuantity.min = '0.0001'; adminQuantity.step = '0.0001';
          adminQuantity.value = issue.quantity; adminQuantity.setAttribute('aria-label', 'Administration quantity');
          adminQuantity.style.cssText = 'width:140px;margin-right:8px';
          const adminButton = node('button', '', 'Record administration'); adminButton.type = 'button';
          adminButton.addEventListener('click', async () => {
            adminButton.disabled = true;
            try {
              await request(`/api/v1/physical-issues/${issue.id}/administrations`, { method: 'POST', body: JSON.stringify({ quantity: adminQuantity.value, outcome: 'GIVEN' }) });
              showStatus('Administration recorded. It created no additional stock movement.', 'ok');
              await loadPrescriptions();
            } catch (error) { showStatus(error.message, 'error'); adminButton.disabled = false; }
          });
          lineBlock.append(adminQuantity, adminButton);
          issue.administrations.forEach((row) => lineBlock.append(node('p', 'muted', `Administered ${row.quantity} ${row.unit} at ${new Date(row.administered_at).toLocaleString()} · ${row.outcome}`)));
        });
        card.append(lineBlock);
      });
      target.append(card);
    });
  }

  byId('connect').addEventListener('click', connect);
  byId('refresh').addEventListener('click', loadHorses);
  byId('search').addEventListener('input', () => {
    window.clearTimeout(window.__horseSearchTimer);
    window.__horseSearchTimer = window.setTimeout(loadHorses, 250);
  });
  byId('create-visit').addEventListener('click', async () => {
    const horseId = byId('visit-horse').value;
    if (!connected || !horseId) return showStatus('Connect and select a horse first.', 'error');
    byId('create-visit').disabled = true;
    try {
      const visit = await request('/api/v1/visits', { method: 'POST', body: JSON.stringify({ horse_id: horseId }) });
      currentVisitId = visit.id;
      byId('visit-status').textContent = `Open visit ${visit.slip_number} (${visit.id}).`;
      showStatus('Local visit created.', 'ok');
      await loadPrescriptions();
    } catch (error) { showStatus(error.message, 'error'); }
    finally { byId('create-visit').disabled = false; }
  });
  byId('prescription-form').addEventListener('submit', async (event) => {
    event.preventDefault();
    if (!connected || !currentVisitId) return showStatus('Connect and create a local visit first.', 'error');
    const button = byId('create-prescription'); button.disabled = true;
    try {
      await request(`/api/v1/visits/${currentVisitId}/prescriptions`, { method: 'POST', body: JSON.stringify({
        medication_name: byId('medicine-name').value.trim(),
        quantity: byId('prescribed-quantity').value,
        unit: byId('medicine-unit').value.trim(),
      }) });
      byId('prescription-form').reset();
      showStatus('Draft prescription created. It has no stock reservation.', 'ok');
      await loadPrescriptions();
    } catch (error) { showStatus(error.message, 'error'); }
    finally { button.disabled = false; }
  });
  byId('horse-form').addEventListener('submit', async (event) => {
    event.preventDefault();
    if (!connected) return showStatus('Connect to the local demo session first.', 'error');
    const button = byId('save-horse');
    button.disabled = true;
    const birthYear = byId('horse-year').value;
    const payload = {
      name: byId('horse-name').value.trim(),
      breed: byId('horse-breed').value.trim(),
      tamga: byId('horse-tamga').value.trim(),
      birth_year: birthYear ? Number(birthYear) : null,
    };
    try {
      const result = await request('/api/v1/horses', { method: 'POST', body: JSON.stringify(payload) });
      byId('horse-form').reset();
      showStatus(`Horse saved to the local backend (${result.id}).`, 'ok');
      await loadHorses();
    } catch (error) {
      showStatus(error.message, 'error');
    } finally {
      button.disabled = false;
    }
  });
})();
