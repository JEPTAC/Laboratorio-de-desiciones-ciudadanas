import { auth, db } from './firebase-config.js';
import {
  GoogleAuthProvider,
  getRedirectResult,
  onAuthStateChanged,
  signInWithPopup,
  signInWithRedirect,
  signOut
} from 'https://www.gstatic.com/firebasejs/12.16.0/firebase-auth.js';
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  limit,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where
} from 'https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js';

const loginView = document.querySelector('#vista-login');
const dashboardView = document.querySelector('#vista-panel');
const googleButton = document.querySelector('#iniciar-google');
const loginStatus = document.querySelector('#estado-login');
const adminUser = document.querySelector('#usuario-admin');
const logoutButton = document.querySelector('#cerrar-sesion');
const refreshButton = document.querySelector('#actualizar-panel');
const exportButton = document.querySelector('#exportar-admin');
const adminNavButtons = [...document.querySelectorAll('[data-vista]')];
const summaryView = document.querySelector('#vista-resumen');
const formView = document.querySelector('#vista-formulario');
const contributionsView = document.querySelector('#vista-aportes');
const decisionForm = document.querySelector('#form-decision');
const tableBody = document.querySelector('#tabla-decisiones');
const loadingDecisions = document.querySelector('#admin-cargando');
const emptyDecisions = document.querySelector('#admin-sin-registros');
const adminCount = document.querySelector('#admin-conteo');
const searchInput = document.querySelector('#admin-buscar');
const statusFilter = document.querySelector('#admin-filtro-estado');
const publicationFilter = document.querySelector('#admin-filtro-publicacion');
const yearFilter = document.querySelector('#admin-filtro-vigencia');
const clearButton = document.querySelector('#admin-limpiar');
const createButton = document.querySelector('#crear-decision');
const cancelButton = document.querySelector('#cancelar-edicion');
const saveDraftButton = document.querySelector('#guardar-borrador');
const formStatus = document.querySelector('#estado-formulario');
const progressInput = document.querySelector('#porcentajeAvance');
const progressOutput = document.querySelector('#valor-avance');
const contributionSearch = document.querySelector('#buscar-aporte-admin');
const contributionType = document.querySelector('#tipo-aporte-admin');
const clearContributionFilters = document.querySelector('#limpiar-aportes-admin');
const contributionAdminList = document.querySelector('#lista-aportes-admin');
const contributionAdminLoading = document.querySelector('#cargando-aportes-admin');
const contributionAdminEmpty = document.querySelector('#sin-aportes-admin');

const SUPER_ROLES = new Set([
  'super_admin', 'superadmin', 'super_administrador',
  'superadministrador', 'administrador_principal'
]);

const formFields = [
  'codigo', 'vigencia', 'tipoRegistro', 'fechaDecision', 'titulo', 'tema', 'territorio',
  'poblacionBeneficiaria', 'tipoProceso', 'fechaProceso', 'procesoParticipativo',
  'numeroParticipantes', 'numeroAportes', 'frecuenciaParticipacion', 'canalesParticipacion',
  'nivelIncorporacion', 'codigosAportes', 'resumenProblema',
  'sintesisAportes', 'decision', 'fundamentoTecnico', 'fundamentoJuridico',
  'fundamentoPresupuestal', 'interpretacionAutorizada', 'justificacionNoAdopcion',
  'dependenciaResponsable', 'responsableSeguimiento', 'accionComprometida',
  'fechaInicio', 'fechaCumplimiento', 'frecuenciaSeguimiento', 'estadoDecision',
  'porcentajeAvance', 'indicador', 'meta', 'resultadoActual', 'observacionesSeguimiento',
  'enlaceActa', 'enlaceDecision', 'enlaceEvidencia', 'enlacesAdicionales',
  'estadoPublicacion', 'fechaPublicacion', 'destacado'
];

const completenessFields = [
  'titulo', 'fechaDecision', 'tema', 'territorio', 'procesoParticipativo', 'resumenProblema',
  'sintesisAportes', 'decision', 'fundamentoTecnico', 'fundamentoJuridico',
  'fundamentoPresupuestal', 'dependenciaResponsable', 'responsableSeguimiento',
  'accionComprometida', 'frecuenciaSeguimiento', 'indicador', 'meta', 'resultadoActual',
  'estadoDecision', 'fechaPublicacion'
];

let currentUser = null;
let decisions = [];
let filteredDecisions = [];
let contributions = [];

function normalizeRole(value) {
  return String(value || '').trim().toLowerCase();
}

function roleFromData(data = {}) {
  return normalizeRole(data.role || data.rol || data.tipoUsuario || data.userRole || 'guest');
}

async function isSuperAdmin(user) {
  const token = await user.getIdTokenResult(true);
  const tokenRole = normalizeRole(
    token.claims.role || token.claims.userRole ||
    (token.claims.super_admin === true ? 'super_admin' : '')
  );
  if (SUPER_ROLES.has(tokenRole)) return true;

  const paths = [`users/${user.uid}`];
  if (user.email) paths.push(`users/${user.email}`);
  for (const path of paths) {
    try {
      const snapshot = await getDoc(doc(db, path));
      if (!snapshot.exists()) continue;
      const data = snapshot.data();
      if (data.active === false) continue;
      if (SUPER_ROLES.has(roleFromData(data))) return true;
    } catch (error) {
      console.warn('No fue posible verificar el perfil de acceso:', error);
    }
  }
  return false;
}

function setLoginStatus(message, type = 'info') {
  loginStatus.textContent = message;
  loginStatus.className = `notice ${type}`;
  loginStatus.hidden = false;
}

function setFormStatus(message, type = 'info') {
  formStatus.textContent = message;
  formStatus.className = `notice ${type}`;
  formStatus.hidden = false;
}

function hideFormStatus() {
  formStatus.hidden = true;
}

function showLogin() {
  dashboardView.hidden = true;
  loginView.hidden = false;
  adminUser.textContent = '';
}

function showDashboard(user) {
  loginView.hidden = true;
  dashboardView.hidden = false;
  adminUser.textContent = user.displayName || user.email || user.uid;
}

function switchView(viewName) {
  summaryView.hidden = viewName !== 'resumen';
  formView.hidden = viewName !== 'formulario';
  contributionsView.hidden = viewName !== 'aportes';
  adminNavButtons.forEach((button) => button.classList.toggle('active', button.dataset.vista === viewName));
  if (viewName === 'aportes' && !contributions.length) loadContributions();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function timestampToDate(value) {
  if (!value) return null;
  if (typeof value.toDate === 'function') return value.toDate();
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function formatTimestamp(value) {
  const date = timestampToDate(value);
  return date ? date.toLocaleString('es-CO', { dateStyle: 'medium', timeStyle: 'short' }) : 'Sin fecha';
}

function normalizeText(value) {
  return String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
}

function generateCode(year) {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let suffix = '';
  crypto.getRandomValues(new Uint32Array(6)).forEach((value) => { suffix += alphabet[value % alphabet.length]; });
  return `DEC-${year}-${suffix}`;
}

function currentDateString() {
  return new Date().toLocaleDateString('en-CA', { timeZone: 'America/Bogota' });
}

function valueOf(id) {
  const element = document.querySelector(`#${id}`);
  if (!element) return '';
  if (element.type === 'checkbox') return element.checked;
  return element.value.trim ? element.value.trim() : element.value;
}

function numberOf(id) {
  const value = Number(valueOf(id));
  return Number.isFinite(value) ? value : 0;
}

function collectFormData(publicationOverride = '') {
  const publicationStatus = publicationOverride || valueOf('estadoPublicacion');
  let publicationDate = valueOf('fechaPublicacion');
  if (publicationStatus === 'publicado' && !publicationDate) publicationDate = currentDateString();

  return {
    codigo: valueOf('codigo'),
    vigencia: numberOf('vigencia'),
    tipoRegistro: valueOf('tipoRegistro'),
    fechaDecision: valueOf('fechaDecision'),
    titulo: valueOf('titulo'),
    tema: valueOf('tema'),
    territorio: valueOf('territorio'),
    poblacionBeneficiaria: valueOf('poblacionBeneficiaria'),
    tipoProceso: valueOf('tipoProceso'),
    fechaProceso: valueOf('fechaProceso'),
    procesoParticipativo: valueOf('procesoParticipativo'),
    numeroParticipantes: numberOf('numeroParticipantes'),
    numeroAportes: numberOf('numeroAportes'),
    frecuenciaParticipacion: valueOf('frecuenciaParticipacion'),
    canalesParticipacion: valueOf('canalesParticipacion'),
    nivelIncorporacion: valueOf('nivelIncorporacion'),
    codigosAportes: valueOf('codigosAportes'),
    resumenProblema: valueOf('resumenProblema'),
    sintesisAportes: valueOf('sintesisAportes'),
    decision: valueOf('decision'),
    fundamentoTecnico: valueOf('fundamentoTecnico'),
    fundamentoJuridico: valueOf('fundamentoJuridico'),
    fundamentoPresupuestal: valueOf('fundamentoPresupuestal'),
    interpretacionAutorizada: valueOf('interpretacionAutorizada'),
    justificacionNoAdopcion: valueOf('justificacionNoAdopcion'),
    dependenciaResponsable: valueOf('dependenciaResponsable'),
    responsableSeguimiento: valueOf('responsableSeguimiento'),
    accionComprometida: valueOf('accionComprometida'),
    fechaInicio: valueOf('fechaInicio'),
    fechaCumplimiento: valueOf('fechaCumplimiento'),
    frecuenciaSeguimiento: valueOf('frecuenciaSeguimiento'),
    estadoDecision: valueOf('estadoDecision'),
    porcentajeAvance: numberOf('porcentajeAvance'),
    indicador: valueOf('indicador'),
    meta: valueOf('meta'),
    resultadoActual: valueOf('resultadoActual'),
    observacionesSeguimiento: valueOf('observacionesSeguimiento'),
    enlaceActa: valueOf('enlaceActa'),
    enlaceDecision: valueOf('enlaceDecision'),
    enlaceEvidencia: valueOf('enlaceEvidencia'),
    enlacesAdicionales: valueOf('enlacesAdicionales').split(/\r?\n/).map((line) => line.trim()).filter(Boolean),
    estadoPublicacion: publicationStatus,
    fechaPublicacion: publicationDate,
    destacado: Boolean(valueOf('destacado')),
    updatedAt: serverTimestamp(),
    updatedBy: currentUser.uid,
    updatedByEmail: currentUser.email || ''
  };
}

function resetForm() {
  decisionForm.reset();
  document.querySelector('#documento-id').value = '';
  document.querySelector('#vigencia').value = new Date().getFullYear();
  document.querySelector('#codigo').value = generateCode(new Date().getFullYear());
  document.querySelector('#fechaDecision').value = currentDateString();
  document.querySelector('#estadoPublicacion').value = 'borrador';
  document.querySelector('#estadoDecision').value = 'En análisis';
  document.querySelector('#porcentajeAvance').value = 0;
  document.querySelector('#numeroParticipantes').value = 0;
  document.querySelector('#numeroAportes').value = 0;
  progressOutput.textContent = '0%';
  hideFormStatus();
}

function setFormData(item) {
  resetForm();
  document.querySelector('#documento-id').value = item.id;
  formFields.forEach((fieldName) => {
    const element = document.querySelector(`#${fieldName}`);
    if (!element) return;
    if (fieldName === 'enlacesAdicionales') {
      element.value = Array.isArray(item.enlacesAdicionales) ? item.enlacesAdicionales.join('\n') : '';
    } else if (element.type === 'checkbox') {
      element.checked = Boolean(item[fieldName]);
    } else if (item[fieldName] != null) {
      element.value = item[fieldName];
    }
  });
  progressOutput.textContent = `${Number(item.porcentajeAvance || 0)}%`;
  switchView('formulario');
  document.querySelector('#titulo').focus();
}

function calculateCompleteness(item) {
  const completed = completenessFields.filter((field) => {
    const value = item[field];
    return value !== '' && value != null;
  }).length;
  return Math.round((completed / completenessFields.length) * 100);
}

function uniqueYears() {
  return [...new Set(decisions.map((item) => String(item.vigencia)).filter(Boolean))]
    .sort((a, b) => Number(b) - Number(a));
}

function refreshYearFilter() {
  const selected = yearFilter.value;
  [...yearFilter.options].slice(1).forEach((option) => option.remove());
  uniqueYears().forEach((year) => {
    const option = document.createElement('option');
    option.value = year;
    option.textContent = year;
    yearFilter.appendChild(option);
  });
  if ([...yearFilter.options].some((option) => option.value === selected)) yearFilter.value = selected;
}

function updateStats(data = decisions) {
  document.querySelector('#admin-total').textContent = data.length.toLocaleString('es-CO');
  document.querySelector('#admin-publicadas').textContent = data.filter((item) => item.estadoPublicacion === 'publicado').length.toLocaleString('es-CO');
  document.querySelector('#admin-ejecucion').textContent = data.filter((item) => item.estadoDecision === 'En ejecución').length.toLocaleString('es-CO');
  document.querySelector('#admin-cumplidas').textContent = data.filter((item) => item.estadoDecision === 'Cumplida').length.toLocaleString('es-CO');
  const average = data.length ? Math.round(data.reduce((sum, item) => sum + Number(item.porcentajeAvance || 0), 0) / data.length) : 0;
  document.querySelector('#admin-promedio').textContent = `${average}%`;
}

function createTextCell(row, value) {
  const cell = document.createElement('td');
  cell.textContent = value == null || value === '' ? '—' : String(value);
  row.appendChild(cell);
  return cell;
}

function renderDecisionTable() {
  tableBody.replaceChildren();
  filteredDecisions.forEach((item) => {
    const row = document.createElement('tr');
    createTextCell(row, item.codigo || item.id);
    const titleCell = createTextCell(row, item.titulo || 'Sin título');
    const small = document.createElement('small');
    small.textContent = `${item.tema || 'Sin tema'} · ${item.dependenciaResponsable || 'Sin dependencia'}`;
    small.style.display = 'block';
    small.style.color = '#667085';
    small.style.marginTop = '4px';
    titleCell.appendChild(small);
    createTextCell(row, item.estadoDecision);
    createTextCell(row, `${Number(item.porcentajeAvance || 0)}%`);
    createTextCell(row, item.estadoPublicacion === 'publicado' ? 'Publicada' : 'Borrador');

    const completenessCell = document.createElement('td');
    const completeness = calculateCompleteness(item);
    const wrapper = document.createElement('div');
    wrapper.className = 'completeness';
    const bar = document.createElement('span');
    bar.className = 'completeness-bar';
    const fill = document.createElement('span');
    fill.style.width = `${completeness}%`;
    bar.appendChild(fill);
    wrapper.append(bar, document.createTextNode(`${completeness}%`));
    completenessCell.appendChild(wrapper);
    row.appendChild(completenessCell);

    createTextCell(row, formatTimestamp(item.updatedAt || item.createdAt));
    const actionCell = document.createElement('td');
    actionCell.className = 'actions-cell';

    const editButton = document.createElement('button');
    editButton.type = 'button';
    editButton.className = 'btn secondary small';
    editButton.textContent = 'Editar';
    editButton.addEventListener('click', () => setFormData(item));

    const duplicateButton = document.createElement('button');
    duplicateButton.type = 'button';
    duplicateButton.className = 'btn secondary small';
    duplicateButton.textContent = 'Duplicar';
    duplicateButton.addEventListener('click', () => duplicateDecision(item));

    const deleteButton = document.createElement('button');
    deleteButton.type = 'button';
    deleteButton.className = 'btn danger small';
    deleteButton.textContent = 'Eliminar';
    deleteButton.addEventListener('click', () => removeDecision(item));

    actionCell.append(editButton, duplicateButton, deleteButton);
    row.appendChild(actionCell);
    tableBody.appendChild(row);
  });
  emptyDecisions.hidden = filteredDecisions.length > 0;
  adminCount.textContent = `${filteredDecisions.length.toLocaleString('es-CO')} de ${decisions.length.toLocaleString('es-CO')} registros`;
}

function applyFilters() {
  const text = normalizeText(searchInput.value);
  const status = statusFilter.value;
  const publication = publicationFilter.value;
  const year = yearFilter.value;
  filteredDecisions = decisions.filter((item) => {
    const haystack = normalizeText([item.codigo, item.titulo, item.tema, item.territorio, item.dependenciaResponsable, item.decision].join(' '));
    return (!text || haystack.includes(text))
      && (!status || item.estadoDecision === status)
      && (!publication || item.estadoPublicacion === publication)
      && (!year || String(item.vigencia) === year);
  });
  updateStats(filteredDecisions);
  renderDecisionTable();
}

async function audit(action, itemId, code) {
  try {
    await addDoc(collection(db, 'auditLogs'), {
      action,
      module: 'laboratorio_ideas_ciudadanas',
      collection: 'participacionDecisiones',
      documentId: itemId,
      code: code || '',
      userId: currentUser.uid,
      userEmail: currentUser.email || '',
      createdAt: serverTimestamp()
    });
  } catch (error) {
    console.warn('No fue posible registrar la auditoría:', error);
  }
}

async function saveDecision(event, publicationOverride = '') {
  if (event) event.preventDefault();
  hideFormStatus();
  const targetPublication = publicationOverride || valueOf('estadoPublicacion');
  if (targetPublication === 'publicado' && !decisionForm.reportValidity()) {
    setFormStatus('Complete los campos obligatorios antes de publicar la decisión.', 'error');
    return;
  }

  const saveButtons = [saveDraftButton, document.querySelector('#guardar-publicar')];
  saveButtons.forEach((button) => { button.disabled = true; });
  try {
    const data = collectFormData(publicationOverride);
    if (!data.codigo) data.codigo = generateCode(data.vigencia || new Date().getFullYear());
    document.querySelector('#codigo').value = data.codigo;
    const documentId = document.querySelector('#documento-id').value;

    if (documentId) {
      await updateDoc(doc(db, 'participacionDecisiones', documentId), data);
      await audit('update', documentId, data.codigo);
      setFormStatus('La decisión fue actualizada correctamente.', 'success');
    } else {
      const newReference = doc(collection(db, 'participacionDecisiones'));
      await setDoc(newReference, {
        ...data,
        createdAt: serverTimestamp(),
        createdBy: currentUser.uid,
        createdByEmail: currentUser.email || ''
      });
      document.querySelector('#documento-id').value = newReference.id;
      await audit('create', newReference.id, data.codigo);
      setFormStatus('La decisión fue creada correctamente.', 'success');
    }
    await loadDecisions();
  } catch (error) {
    console.error(error);
    setFormStatus(error.code?.includes('permission-denied')
      ? 'La cuenta no tiene permisos para guardar esta información.'
      : 'No fue posible guardar la decisión. Revise la conexión e intente nuevamente.', 'error');
  } finally {
    saveButtons.forEach((button) => { button.disabled = false; });
  }
}

function duplicateDecision(item) {
  const copy = {
    ...item,
    id: '',
    codigo: generateCode(item.vigencia || new Date().getFullYear()),
    titulo: `${item.titulo || 'Decisión'} (copia)`,
    estadoPublicacion: 'borrador',
    fechaPublicacion: '',
    destacado: false
  };
  setFormData(copy);
  document.querySelector('#documento-id').value = '';
  setFormStatus('Se creó una copia en borrador. Revise la información y guárdela.', 'info');
}

async function removeDecision(item) {
  const confirmation = window.confirm(`¿Desea eliminar definitivamente la decisión ${item.codigo || item.id}?`);
  if (!confirmation) return;
  try {
    await deleteDoc(doc(db, 'participacionDecisiones', item.id));
    await audit('delete', item.id, item.codigo);
    await loadDecisions();
  } catch (error) {
    console.error(error);
    window.alert('No fue posible eliminar la decisión.');
  }
}

async function loadDecisions() {
  loadingDecisions.hidden = false;
  emptyDecisions.hidden = true;
  refreshButton.disabled = true;
  try {
    const snapshot = await getDocs(query(collection(db, 'participacionDecisiones'), limit(1000)));
    decisions = snapshot.docs.map((document) => ({ id: document.id, ...document.data() }));
    decisions.sort((a, b) => {
      const dateA = timestampToDate(a.updatedAt || a.createdAt)?.getTime() || 0;
      const dateB = timestampToDate(b.updatedAt || b.createdAt)?.getTime() || 0;
      return dateB - dateA;
    });
    refreshYearFilter();
    applyFilters();
  } catch (error) {
    console.error(error);
    tableBody.replaceChildren();
    emptyDecisions.hidden = false;
    emptyDecisions.querySelector('strong').textContent = 'No fue posible consultar las decisiones';
    emptyDecisions.querySelector('span').textContent = error.code?.includes('permission-denied')
      ? 'La cuenta no tiene permisos para esta sección.'
      : 'Revise la conexión e intente nuevamente.';
  } finally {
    loadingDecisions.hidden = true;
    refreshButton.disabled = false;
  }
}

function csvEscape(value) {
  const text = value == null ? '' : (Array.isArray(value) ? value.join(' | ') : String(value));
  return `"${text.replaceAll('"', '""')}"`;
}

function exportCsv() {
  const keys = [
    'codigo', 'vigencia', 'tipoRegistro', 'fechaDecision', 'titulo', 'tema', 'territorio',
    'poblacionBeneficiaria', 'tipoProceso', 'fechaProceso', 'procesoParticipativo',
    'numeroParticipantes', 'numeroAportes', 'frecuenciaParticipacion', 'canalesParticipacion',
    'nivelIncorporacion', 'codigosAportes', 'resumenProblema',
    'sintesisAportes', 'decision', 'fundamentoTecnico', 'fundamentoJuridico',
    'fundamentoPresupuestal', 'interpretacionAutorizada', 'justificacionNoAdopcion',
    'dependenciaResponsable', 'responsableSeguimiento', 'accionComprometida',
    'fechaInicio', 'fechaCumplimiento', 'frecuenciaSeguimiento', 'estadoDecision',
    'porcentajeAvance', 'indicador', 'meta', 'resultadoActual', 'observacionesSeguimiento',
    'enlaceActa', 'enlaceDecision', 'enlaceEvidencia', 'enlacesAdicionales',
    'estadoPublicacion', 'fechaPublicacion', 'destacado'
  ];
  const rows = [keys.map(csvEscape).join(',')];
  filteredDecisions.forEach((item) => rows.push(keys.map((key) => csvEscape(item[key])).join(',')));
  const blob = new Blob([`\uFEFF${rows.join('\n')}`], { type: 'text/csv;charset=utf-8' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `laboratorio-decisiones-${currentDateString()}.csv`;
  link.click();
  URL.revokeObjectURL(link.href);
}

function renderAdminContributions() {
  const text = normalizeText(contributionSearch.value);
  const type = contributionType.value;
  const filtered = contributions.filter((item) => {
    const haystack = normalizeText([item.codigo, item.nombre, item.tipo, item.comentario].join(' '));
    return (!text || haystack.includes(text)) && (!type || item.tipo === type);
  });
  contributionAdminList.replaceChildren();
  filtered.forEach((item) => {
    const card = document.createElement('article');
    card.className = 'admin-contribution';
    const code = document.createElement('span');
    code.className = 'code';
    code.textContent = `${item.tipo || 'Aporte'} · ${item.codigo || item.id}`;
    const title = document.createElement('h3');
    title.textContent = item.nombre || 'Participante';
    const textElement = document.createElement('p');
    textElement.textContent = item.comentario || '';
    const footer = document.createElement('footer');
    const date = document.createElement('small');
    date.textContent = formatTimestamp(item.createdAt);
    const useButton = document.createElement('button');
    useButton.type = 'button';
    useButton.className = 'btn secondary small';
    useButton.textContent = 'Usar en decisión';
    useButton.addEventListener('click', () => useContribution(item));
    footer.append(date, useButton);
    card.append(code, title, textElement, footer);
    contributionAdminList.appendChild(card);
  });
  contributionAdminEmpty.hidden = filtered.length > 0;
}

function useContribution(item) {
  resetForm();
  document.querySelector('#codigosAportes').value = item.codigo || item.id;
  document.querySelector('#numeroAportes').value = 1;
  document.querySelector('#sintesisAportes').value = `${item.tipo || 'Aporte'} presentado por ${item.nombre || 'la ciudadanía'}:\n${item.comentario || ''}`;
  document.querySelector('#resumenProblema').value = item.comentario || '';
  switchView('formulario');
  setFormStatus('El aporte fue vinculado como insumo. Complete el análisis y la decisión institucional.', 'info');
}

async function loadContributions() {
  contributionAdminLoading.hidden = false;
  try {
    const snapshot = await getDocs(query(
      collection(db, 'participacionAportesPublicos'),
      where('estadoPublicacion', '==', 'publicado'),
      limit(200)
    ));
    contributions = snapshot.docs.map((document) => ({ id: document.id, ...document.data() }));
    contributions.sort((a, b) => {
      const dateA = timestampToDate(a.createdAt)?.getTime() || 0;
      const dateB = timestampToDate(b.createdAt)?.getTime() || 0;
      return dateB - dateA;
    });
    renderAdminContributions();
  } catch (error) {
    console.error(error);
    contributionAdminEmpty.hidden = false;
    contributionAdminEmpty.querySelector('strong').textContent = 'No fue posible consultar los aportes';
    contributionAdminEmpty.querySelector('span').textContent = 'Revise los permisos y la conexión.';
  } finally {
    contributionAdminLoading.hidden = true;
  }
}

async function loginWithGoogle() {
  loginStatus.hidden = true;
  googleButton.disabled = true;
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: 'select_account' });
  try {
    await signInWithPopup(auth, provider);
  } catch (error) {
    if (['auth/popup-blocked', 'auth/operation-not-supported-in-this-environment'].includes(error.code)) {
      await signInWithRedirect(auth, provider);
      return;
    }
    console.error(error);
    const messages = {
      'auth/unauthorized-domain': 'Este dominio no está autorizado para el ingreso institucional.',
      'auth/popup-closed-by-user': 'La ventana de ingreso fue cerrada antes de completar el proceso.',
      'auth/cancelled-popup-request': 'El ingreso fue cancelado. Intente nuevamente.'
    };
    setLoginStatus(messages[error.code] || 'No fue posible iniciar sesión con Google.', 'error');
  } finally {
    googleButton.disabled = false;
  }
}

adminNavButtons.forEach((button) => button.addEventListener('click', () => switchView(button.dataset.vista)));
createButton.addEventListener('click', () => { resetForm(); switchView('formulario'); });
cancelButton.addEventListener('click', () => switchView('resumen'));
progressInput.addEventListener('input', () => { progressOutput.textContent = `${progressInput.value}%`; });
decisionForm.addEventListener('submit', (event) => saveDecision(event));
saveDraftButton.addEventListener('click', (event) => saveDecision(event, 'borrador'));
refreshButton.addEventListener('click', async () => { await Promise.all([loadDecisions(), contributions.length ? loadContributions() : Promise.resolve()]); });
exportButton.addEventListener('click', exportCsv);
logoutButton.addEventListener('click', () => signOut(auth));
googleButton.addEventListener('click', loginWithGoogle);
[searchInput, statusFilter, publicationFilter, yearFilter].forEach((element) => element.addEventListener(element.tagName === 'INPUT' ? 'input' : 'change', applyFilters));
clearButton.addEventListener('click', () => { searchInput.value = ''; statusFilter.value = ''; publicationFilter.value = ''; yearFilter.value = ''; applyFilters(); });
[contributionSearch, contributionType].forEach((element) => element.addEventListener(element.tagName === 'INPUT' ? 'input' : 'change', renderAdminContributions));
clearContributionFilters.addEventListener('click', () => { contributionSearch.value = ''; contributionType.value = ''; renderAdminContributions(); });
document.querySelector('#vigencia').addEventListener('change', (event) => {
  const codeInput = document.querySelector('#codigo');
  if (!document.querySelector('#documento-id').value && /^DEC-\d{4}-/.test(codeInput.value)) codeInput.value = generateCode(Number(event.target.value) || new Date().getFullYear());
});

getRedirectResult(auth).catch((error) => {
  console.error(error);
  setLoginStatus('No fue posible completar el ingreso con Google.', 'error');
});

onAuthStateChanged(auth, async (user) => {
  if (!user) {
    currentUser = null;
    showLogin();
    return;
  }
  setLoginStatus('Verificando permisos…', 'info');
  try {
    if (!(await isSuperAdmin(user))) {
      await signOut(auth);
      setLoginStatus('La cuenta seleccionada no está autorizada como superadministrador.', 'error');
      return;
    }
    currentUser = user;
    showDashboard(user);
    resetForm();
    switchView('resumen');
    await loadDecisions();
  } catch (error) {
    console.error(error);
    await signOut(auth);
    setLoginStatus('No fue posible validar los permisos de la cuenta.', 'error');
  }
});
