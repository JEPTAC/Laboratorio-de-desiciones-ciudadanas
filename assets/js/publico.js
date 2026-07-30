import { db } from './firebase-config.js';
import {
  collection,
  getDocs,
  limit,
  query,
  where
} from 'https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js';

const decisionList = document.querySelector('#lista-decisiones');
const contributionList = document.querySelector('#lista-aportes');
const loadingDecisions = document.querySelector('#cargando-decisiones');
const loadingContributions = document.querySelector('#cargando-aportes');
const emptyDecisions = document.querySelector('#sin-decisiones');
const emptyContributions = document.querySelector('#sin-aportes');
const decisionCount = document.querySelector('#conteo-decisiones');
const searchInput = document.querySelector('#buscar-decision');
const yearFilter = document.querySelector('#filtro-vigencia');
const statusFilter = document.querySelector('#filtro-estado');
const topicFilter = document.querySelector('#filtro-tema');
const territoryFilter = document.querySelector('#filtro-territorio');
const clearFiltersButton = document.querySelector('#limpiar-filtros');
const downloadButton = document.querySelector('#descargar-decisiones');
const printButton = document.querySelector('#imprimir-pagina');
const modal = document.querySelector('#modal-decision');
const modalCode = document.querySelector('#codigo-modal');
const modalTitle = document.querySelector('#titulo-modal');
const modalContent = document.querySelector('#contenido-modal');
const closeModalButton = document.querySelector('#cerrar-modal');

let decisions = [];
let filteredDecisions = [];
let contributions = [];
let activeContributionType = '';

function timestampToDate(value) {
  if (!value) return null;
  if (typeof value.toDate === 'function') return value.toDate();
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function formatTimestamp(value, includeTime = false) {
  const date = timestampToDate(value);
  if (!date) return 'Sin fecha registrada';
  return date.toLocaleString('es-CO', includeTime
    ? { dateStyle: 'medium', timeStyle: 'short' }
    : { dateStyle: 'long' });
}

function formatDate(value) {
  if (!value) return 'No informada';
  const parts = String(value).split('-').map(Number);
  if (parts.length !== 3 || parts.some((part) => !part)) return String(value);
  return new Date(parts[0], parts[1] - 1, parts[2]).toLocaleDateString('es-CO', { dateStyle: 'long' });
}

function normalizeText(value) {
  return String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
}

function statusClass(status) {
  const map = {
    'En análisis': 'analisis',
    'Adoptada': 'adoptada',
    'En ejecución': 'ejecucion',
    'Cumplida': 'cumplida',
    'No adoptada': 'no-adoptada',
    'Suspendida': 'suspendida'
  };
  return map[status] || 'analisis';
}

function safeUrl(value) {
  try {
    const url = new URL(value);
    return ['http:', 'https:'].includes(url.protocol) ? url.href : '';
  } catch {
    return '';
  }
}

function uniqueSorted(values) {
  return [...new Set(values.filter(Boolean).map((value) => String(value).trim()))]
    .sort((a, b) => a.localeCompare(b, 'es', { numeric: true }));
}

function fillSelect(select, values) {
  const current = select.value;
  [...select.options].slice(1).forEach((option) => option.remove());
  values.forEach((value) => {
    const option = document.createElement('option');
    option.value = value;
    option.textContent = value;
    select.appendChild(option);
  });
  if (values.includes(current)) select.value = current;
}

function setText(id, value) {
  const element = document.querySelector(id);
  if (element) element.textContent = value;
}

function updateKpis() {
  setText('#kpi-aportes', contributions.length.toLocaleString('es-CO'));
  setText('#kpi-decisiones', decisions.length.toLocaleString('es-CO'));
  setText('#kpi-ejecucion', decisions.filter((item) => item.estadoDecision === 'En ejecución').length.toLocaleString('es-CO'));
  setText('#kpi-cumplidas', decisions.filter((item) => item.estadoDecision === 'Cumplida').length.toLocaleString('es-CO'));
  const withIncorporation = decisions.filter((item) => ['Incorporación total', 'Incorporación parcial'].includes(item.nivelIncorporacion)).length;
  setText('#kpi-incorporacion', decisions.length ? `${Math.round((withIncorporation / decisions.length) * 100)}%` : '—');
}

function createBadge(status) {
  const badge = document.createElement('span');
  badge.className = `badge ${statusClass(status)}`;
  badge.textContent = status || 'En análisis';
  return badge;
}

function createDecisionCard(item) {
  const article = document.createElement('article');
  article.className = `decision-card${item.destacado ? ' featured' : ''}`;

  const top = document.createElement('div');
  top.className = 'decision-top';
  const headingWrap = document.createElement('div');
  const code = document.createElement('span');
  code.className = 'code';
  code.textContent = item.codigo || item.id;
  const title = document.createElement('h3');
  title.textContent = item.titulo || 'Decisión sin título';
  headingWrap.append(code, title);
  top.append(headingWrap, createBadge(item.estadoDecision));

  const body = document.createElement('div');
  body.className = 'decision-body';
  const summary = document.createElement('p');
  summary.textContent = item.decision || 'Consulte el detalle de esta decisión.';
  const meta = document.createElement('div');
  meta.className = 'meta-grid';
  [
    ['Tema', item.tema],
    ['Territorio', item.territorio],
    ['Responsable', item.dependenciaResponsable],
    ['Vigencia', item.vigencia]
  ].forEach(([label, value]) => {
    const box = document.createElement('div');
    box.className = 'meta-item';
    const strong = document.createElement('strong');
    strong.textContent = label;
    box.append(strong, document.createTextNode(value || 'No informado'));
    meta.appendChild(box);
  });
  body.append(summary, meta);

  const progressWrap = document.createElement('div');
  progressWrap.className = 'progress-wrap';
  const progressLabel = document.createElement('div');
  progressLabel.className = 'progress-label';
  const progress = Math.max(0, Math.min(100, Number(item.porcentajeAvance) || 0));
  progressLabel.innerHTML = `<span>Avance reportado</span><span>${progress}%</span>`;
  const progressBar = document.createElement('div');
  progressBar.className = 'progress';
  const progressFill = document.createElement('span');
  progressFill.style.width = `${progress}%`;
  progressBar.appendChild(progressFill);
  progressWrap.append(progressLabel, progressBar);

  const footer = document.createElement('div');
  footer.className = 'decision-footer';
  const updated = document.createElement('small');
  updated.textContent = `Actualización: ${formatTimestamp(item.updatedAt || item.createdAt)}`;
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'btn small';
  button.textContent = 'Ver información completa';
  button.addEventListener('click', () => openDecision(item));
  footer.append(updated, button);

  article.append(top, body, progressWrap, footer);
  return article;
}

function renderDecisions() {
  decisionList.replaceChildren();
  filteredDecisions.forEach((item) => decisionList.appendChild(createDecisionCard(item)));
  emptyDecisions.hidden = filteredDecisions.length > 0;
  decisionCount.textContent = `${filteredDecisions.length.toLocaleString('es-CO')} de ${decisions.length.toLocaleString('es-CO')} decisiones publicadas`;
  downloadButton.disabled = filteredDecisions.length === 0;
}

function applyDecisionFilters() {
  const text = normalizeText(searchInput.value);
  const year = yearFilter.value;
  const status = statusFilter.value;
  const topic = topicFilter.value;
  const territory = territoryFilter.value;

  filteredDecisions = decisions.filter((item) => {
    const haystack = normalizeText([
      item.codigo, item.titulo, item.tema, item.territorio, item.dependenciaResponsable,
      item.decision, item.resumenProblema, item.sintesisAportes, item.procesoParticipativo
    ].join(' '));
    return (!text || haystack.includes(text))
      && (!year || String(item.vigencia) === year)
      && (!status || item.estadoDecision === status)
      && (!topic || item.tema === topic)
      && (!territory || item.territorio === territory);
  });
  renderDecisions();
}

function addDetailBox(container, title, value, full = false) {
  const box = document.createElement('section');
  box.className = `detail-box${full ? ' full' : ''}`;
  const heading = document.createElement('h3');
  heading.textContent = title;
  const paragraph = document.createElement('p');
  paragraph.textContent = value === '' || value == null ? 'No informado' : String(value);
  box.append(heading, paragraph);
  container.appendChild(box);
}

function addLinksBox(container, item) {
  const links = [
    ['Acta o memoria', item.enlaceActa],
    ['Documento de la decisión', item.enlaceDecision],
    ['Evidencia principal', item.enlaceEvidencia],
    ...(Array.isArray(item.enlacesAdicionales) ? item.enlacesAdicionales.map((url, index) => [`Evidencia adicional ${index + 1}`, url]) : [])
  ].map(([label, url]) => [label, safeUrl(url)]).filter(([, url]) => url);

  const box = document.createElement('section');
  box.className = 'detail-box full';
  const heading = document.createElement('h3');
  heading.textContent = 'Documentos y evidencias';
  box.appendChild(heading);
  if (!links.length) {
    const p = document.createElement('p');
    p.textContent = 'No se han publicado enlaces de evidencia para este registro.';
    box.appendChild(p);
  } else {
    const list = document.createElement('ul');
    list.className = 'links-list';
    links.forEach(([label, url]) => {
      const li = document.createElement('li');
      const a = document.createElement('a');
      a.href = url;
      a.target = '_blank';
      a.rel = 'noopener';
      a.textContent = label;
      li.appendChild(a);
      list.appendChild(li);
    });
    box.appendChild(list);
  }
  container.appendChild(box);
}

function openDecision(item) {
  modalCode.textContent = item.codigo || item.id;
  modalTitle.textContent = item.titulo || 'Detalle de la decisión';
  modalContent.replaceChildren();

  const hero = document.createElement('section');
  hero.className = 'detail-hero';
  const badge = createBadge(item.estadoDecision);
  const summary = document.createElement('p');
  summary.textContent = item.decision || 'Sin descripción de la decisión.';
  const progress = Math.max(0, Math.min(100, Number(item.porcentajeAvance) || 0));
  const progressLabel = document.createElement('div');
  progressLabel.className = 'progress-label';
  progressLabel.innerHTML = `<span>Avance reportado</span><span>${progress}%</span>`;
  const progressBar = document.createElement('div');
  progressBar.className = 'progress';
  const fill = document.createElement('span');
  fill.style.width = `${progress}%`;
  progressBar.appendChild(fill);
  hero.append(badge, summary, progressLabel, progressBar);

  const grid = document.createElement('div');
  grid.className = 'detail-grid';
  addDetailBox(grid, 'Tipo de registro', item.tipoRegistro);
  addDetailBox(grid, 'Vigencia', item.vigencia);
  addDetailBox(grid, 'Fecha de la decisión', formatDate(item.fechaDecision));
  addDetailBox(grid, 'Fecha de publicación', formatDate(item.fechaPublicacion));
  addDetailBox(grid, 'Tema', item.tema);
  addDetailBox(grid, 'Territorio', item.territorio);
  addDetailBox(grid, 'Población beneficiaria o afectada', item.poblacionBeneficiaria, true);
  addDetailBox(grid, 'Proceso participativo', item.procesoParticipativo, true);
  addDetailBox(grid, 'Mecanismo o espacio', item.tipoProceso);
  addDetailBox(grid, 'Fecha del proceso', formatDate(item.fechaProceso));
  addDetailBox(grid, 'Número de participantes', Number(item.numeroParticipantes || 0).toLocaleString('es-CO'));
  addDetailBox(grid, 'Número de aportes recibidos', Number(item.numeroAportes || 0).toLocaleString('es-CO'));
  addDetailBox(grid, 'Frecuencia de participación', item.frecuenciaParticipacion);
  addDetailBox(grid, 'Canales utilizados para participar', item.canalesParticipacion);
  addDetailBox(grid, 'Nivel de incorporación', item.nivelIncorporacion);
  addDetailBox(grid, 'Códigos de aportes relacionados', item.codigosAportes || 'No relacionados', true);
  addDetailBox(grid, 'Problema, necesidad o asunto analizado', item.resumenProblema, true);
  addDetailBox(grid, 'Síntesis de los aportes recibidos', item.sintesisAportes, true);
  addDetailBox(grid, 'Decisión adoptada', item.decision, true);
  addDetailBox(grid, 'Fundamento técnico', item.fundamentoTecnico, true);
  addDetailBox(grid, 'Fundamento jurídico o normativo', item.fundamentoJuridico, true);
  addDetailBox(grid, 'Fundamento presupuestal', item.fundamentoPresupuestal, true);
  addDetailBox(grid, 'Interpretación, alcance o criterio autorizado', item.interpretacionAutorizada, true);
  if (item.justificacionNoAdopcion) addDetailBox(grid, 'Justificación de no incorporación o no adopción', item.justificacionNoAdopcion, true);
  addDetailBox(grid, 'Dependencia responsable', item.dependenciaResponsable);
  addDetailBox(grid, 'Responsable del seguimiento', item.responsableSeguimiento);
  addDetailBox(grid, 'Acción o compromiso', item.accionComprometida, true);
  addDetailBox(grid, 'Fecha de inicio', formatDate(item.fechaInicio));
  addDetailBox(grid, 'Fecha prevista de cumplimiento', formatDate(item.fechaCumplimiento));
  addDetailBox(grid, 'Frecuencia de seguimiento', item.frecuenciaSeguimiento);
  addDetailBox(grid, 'Indicador', item.indicador);
  addDetailBox(grid, 'Meta', item.meta);
  addDetailBox(grid, 'Resultado o avance reportado', item.resultadoActual, true);
  addDetailBox(grid, 'Observaciones de seguimiento', item.observacionesSeguimiento, true);
  addLinksBox(grid, item);
  addDetailBox(grid, 'Última actualización', formatTimestamp(item.updatedAt || item.createdAt, true), true);

  modalContent.append(hero, grid);
  modal.hidden = false;
  document.body.classList.add('modal-open');
  closeModalButton.focus();
  const url = new URL(window.location.href);
  url.searchParams.set('decision', item.codigo || item.id);
  history.replaceState({}, '', url);
}

function closeModal() {
  modal.hidden = true;
  document.body.classList.remove('modal-open');
  const url = new URL(window.location.href);
  url.searchParams.delete('decision');
  history.replaceState({}, '', url);
}

function createContributionCard(item) {
  const card = document.createElement('article');
  card.className = 'contribution-card';
  const type = document.createElement('span');
  type.className = 'code';
  type.textContent = `${item.tipo || 'Aporte'} · ${item.codigo || item.id}`;
  const title = document.createElement('h3');
  title.textContent = item.nombre || 'Participante';
  const content = document.createElement('p');
  content.textContent = item.comentario || '';
  const date = document.createElement('small');
  date.textContent = `Publicado: ${formatTimestamp(item.createdAt)}`;
  card.append(type, title, content, date);
  return card;
}

function renderContributions() {
  const filtered = activeContributionType
    ? contributions.filter((item) => item.tipo === activeContributionType)
    : contributions;
  contributionList.replaceChildren();
  filtered.forEach((item) => contributionList.appendChild(createContributionCard(item)));
  emptyContributions.hidden = filtered.length > 0;
}

function csvEscape(value) {
  const text = value == null ? '' : String(value);
  return `"${text.replaceAll('"', '""')}"`;
}

function downloadCsv() {
  const columns = [
    ['Código', 'codigo'], ['Vigencia', 'vigencia'], ['Tipo', 'tipoRegistro'], ['Título', 'titulo'],
    ['Fecha decisión', 'fechaDecision'], ['Tema', 'tema'], ['Territorio', 'territorio'],
    ['Proceso participativo', 'procesoParticipativo'], ['Participantes', 'numeroParticipantes'], ['Aportes recibidos', 'numeroAportes'], ['Frecuencia de participación', 'frecuenciaParticipacion'], ['Canales de participación', 'canalesParticipacion'],
    ['Nivel de incorporación', 'nivelIncorporacion'], ['Decisión', 'decision'],
    ['Fundamento técnico', 'fundamentoTecnico'], ['Fundamento jurídico', 'fundamentoJuridico'],
    ['Fundamento presupuestal', 'fundamentoPresupuestal'], ['Dependencia responsable', 'dependenciaResponsable'],
    ['Estado', 'estadoDecision'], ['Avance', 'porcentajeAvance'], ['Indicador', 'indicador'], ['Meta', 'meta'],
    ['Resultado', 'resultadoActual'], ['Fecha cumplimiento', 'fechaCumplimiento'], ['Frecuencia seguimiento', 'frecuenciaSeguimiento'],
    ['Acta', 'enlaceActa'], ['Documento decisión', 'enlaceDecision'], ['Evidencia', 'enlaceEvidencia'],
    ['Fecha publicación', 'fechaPublicacion']
  ];
  const rows = [columns.map(([label]) => csvEscape(label)).join(',')];
  filteredDecisions.forEach((item) => rows.push(columns.map(([, key]) => csvEscape(item[key])).join(',')));
  const blob = new Blob([`\uFEFF${rows.join('\n')}`], { type: 'text/csv;charset=utf-8' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `decisiones-participacion-san-pedro-${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(link.href);
}

async function loadDecisions() {
  loadingDecisions.hidden = false;
  try {
    const snapshot = await getDocs(query(
      collection(db, 'participacionDecisiones'),
      where('estadoPublicacion', '==', 'publicado'),
      limit(200)
    ));
    decisions = snapshot.docs.map((document) => ({ id: document.id, ...document.data() }));
    decisions.sort((a, b) => {
      if (Boolean(a.destacado) !== Boolean(b.destacado)) return a.destacado ? -1 : 1;
      const dateA = timestampToDate(a.updatedAt || a.createdAt)?.getTime() || 0;
      const dateB = timestampToDate(b.updatedAt || b.createdAt)?.getTime() || 0;
      return dateB - dateA;
    });
    fillSelect(yearFilter, uniqueSorted(decisions.map((item) => item.vigencia)).reverse());
    fillSelect(topicFilter, uniqueSorted(decisions.map((item) => item.tema)));
    fillSelect(territoryFilter, uniqueSorted(decisions.map((item) => item.territorio)));
    filteredDecisions = [...decisions];
    renderDecisions();

    const requestedCode = new URL(window.location.href).searchParams.get('decision');
    if (requestedCode) {
      const requested = decisions.find((item) => (item.codigo || item.id) === requestedCode);
      if (requested) openDecision(requested);
    }
  } catch (error) {
    console.error(error);
    decisionCount.textContent = 'No fue posible consultar las decisiones.';
    emptyDecisions.hidden = false;
    emptyDecisions.querySelector('strong').textContent = 'No fue posible cargar la información';
    emptyDecisions.querySelector('span').textContent = 'Verifique la conexión e intente nuevamente.';
  } finally {
    loadingDecisions.hidden = true;
    updateKpis();
  }
}

async function loadContributions() {
  loadingContributions.hidden = false;
  try {
    const snapshot = await getDocs(query(
      collection(db, 'participacionAportesPublicos'),
      where('estadoPublicacion', '==', 'publicado'),
      limit(120)
    ));
    contributions = snapshot.docs.map((document) => ({ id: document.id, ...document.data() }));
    contributions.sort((a, b) => {
      const dateA = timestampToDate(a.createdAt)?.getTime() || 0;
      const dateB = timestampToDate(b.createdAt)?.getTime() || 0;
      return dateB - dateA;
    });
    renderContributions();
  } catch (error) {
    console.error(error);
    emptyContributions.hidden = false;
    emptyContributions.querySelector('strong').textContent = 'No fue posible cargar los aportes';
    emptyContributions.querySelector('span').textContent = 'Intente nuevamente más adelante.';
  } finally {
    loadingContributions.hidden = true;
    updateKpis();
  }
}

[searchInput, yearFilter, statusFilter, topicFilter, territoryFilter].forEach((element) => {
  element.addEventListener(element.tagName === 'INPUT' ? 'input' : 'change', applyDecisionFilters);
});
clearFiltersButton.addEventListener('click', () => {
  searchInput.value = '';
  yearFilter.value = '';
  statusFilter.value = '';
  topicFilter.value = '';
  territoryFilter.value = '';
  applyDecisionFilters();
});
downloadButton.addEventListener('click', downloadCsv);
printButton.addEventListener('click', () => window.print());
closeModalButton.addEventListener('click', closeModal);
modal.addEventListener('click', (event) => { if (event.target === modal) closeModal(); });
document.addEventListener('keydown', (event) => { if (event.key === 'Escape' && !modal.hidden) closeModal(); });
document.querySelectorAll('[data-tipo-aporte]').forEach((button) => {
  button.addEventListener('click', () => {
    document.querySelectorAll('[data-tipo-aporte]').forEach((item) => item.classList.remove('active'));
    button.classList.add('active');
    activeContributionType = button.dataset.tipoAporte || '';
    renderContributions();
  });
});

Promise.all([loadDecisions(), loadContributions()]);
