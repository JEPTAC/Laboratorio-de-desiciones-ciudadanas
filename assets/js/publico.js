import { db, auth } from './firebase-config.js';
import { DATOS_INICIALES, FUENTES_OFICIALES } from './datos-iniciales.js';
import {
  collection, doc, getDoc, getDocs, limit, query, serverTimestamp,
  setDoc, where, writeBatch
} from 'https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js';
import {
  GoogleAuthProvider, getRedirectResult, onAuthStateChanged, signInWithPopup,
  signInWithRedirect, signOut
} from 'https://www.gstatic.com/firebasejs/12.16.0/firebase-auth.js';

const state = {
  user: null,
  problematicas: [], retos: [], propuestas: [], reportes: [], planes: [], prototipos: [], consultas: [], aportesPublicos: [],
  filteredProblematicas: [], filteredRetos: [], selectedProblematicId: '', selectedProposal: null,
  retoPhase: '', prototypeStage: ''
};

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
const provider = new GoogleAuthProvider();
provider.setCustomParameters({ prompt: 'select_account' });

function normalize(value) {
  return String(value ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
}
function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>'"]/g, (char) => ({ '&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;' }[char]));
}
function safeUrl(value) {
  try {
    const url = new URL(String(value || ''));
    return ['http:', 'https:'].includes(url.protocol) ? url.href : '';
  } catch { return ''; }
}
function timestampDate(value) {
  if (!value) return null;
  if (typeof value.toDate === 'function') return value.toDate();
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}
function formatDate(value, fallback = 'Sin fecha') {
  if (!value) return fallback;
  const date = /^\d{4}-\d{2}-\d{2}$/.test(String(value)) ? new Date(`${value}T12:00:00`) : timestampDate(value);
  return date && !Number.isNaN(date.getTime()) ? date.toLocaleDateString('es-CO', { year:'numeric', month:'short', day:'numeric' }) : fallback;
}
function formatDateTime(value) {
  const date = timestampDate(value);
  return date ? date.toLocaleString('es-CO', { dateStyle:'medium', timeStyle:'short' }) : 'Sin fecha';
}
function todayBogota() {
  return new Date().toLocaleDateString('en-CA', { timeZone:'America/Bogota' });
}
function generateCode(prefix, year = 2026, length = 8) {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const values = new Uint32Array(length); crypto.getRandomValues(values);
  return `${prefix}-${year}-${[...values].map(v => alphabet[v % alphabet.length]).join('')}`;
}
function toast(message, type = 'info') {
  const region = $('#toast-region');
  const node = document.createElement('div');
  node.className = `toast ${type}`; node.textContent = message;
  region.append(node); setTimeout(() => node.remove(), 5200);
}
function setNotice(element, message, type = 'info') {
  element.textContent = message; element.className = `notice ${type}`; element.hidden = false;
}
function closeNotice(element) { element.hidden = true; }
function statusSlug(value) { return normalize(value).replace(/\s+/g, '-'); }
function unique(values) { return [...new Set(values.filter(Boolean))].sort((a,b) => String(a).localeCompare(String(b), 'es')); }
function csvCell(value) { return `"${String(value ?? '').replace(/"/g, '""')}"`; }
function downloadCsv(filename, headers, rows) {
  const content = '\ufeff' + [headers, ...rows].map(row => row.map(csvCell).join(';')).join('\r\n');
  const blob = new Blob([content], { type:'text/csv;charset=utf-8' });
  const link = document.createElement('a'); link.href = URL.createObjectURL(blob); link.download = filename;
  document.body.append(link); link.click(); link.remove(); setTimeout(() => URL.revokeObjectURL(link.href), 1000);
}
function daysUntil(dateString) {
  if (!dateString) return null;
  const today = new Date(`${todayBogota()}T12:00:00`);
  const target = new Date(`${dateString}T12:00:00`);
  if (Number.isNaN(target.getTime())) return null;
  return Math.ceil((target - today) / 86400000);
}
function parseLines(value) {
  return String(value || '').split(/\r?\n/).map(line => line.trim()).filter(Boolean);
}
function parseCriteria(value) {
  return parseLines(value).map(line => {
    const parts = line.split('|').map(item => item.trim());
    return { name: parts[0] || 'Criterio', weight: Number(parts[1]) || 0 };
  });
}
function phaseIndex(phase) {
  const phases = ['Próximo','Recibiendo propuestas','En votación','En evaluación','Solución seleccionada','En implementación','Cerrado'];
  const index = phases.indexOf(phase); return index < 0 ? 0 : index;
}
function challengeDeadline(reto) {
  const map = {
    'Próximo': reto.fechaApertura,
    'Recibiendo propuestas': reto.fechaCierrePropuestas,
    'En votación': reto.fechaCierreVotacion,
    'En evaluación': reto.fechaSeleccion,
    'Solución seleccionada': reto.fechaPublicacionPlan,
    'En implementación': reto.fechaCierreImplementacion,
    'Cerrado': reto.fechaCierreImplementacion
  };
  return map[reto.estadoReto] || '';
}
function publicQuery(name) {
  return query(collection(db, name), where('estadoPublicacion', '==', 'publicado'), limit(200));
}
async function loadCollection(name) {
  try {
    const snapshot = await getDocs(publicQuery(name));
    return snapshot.docs.map(item => ({ id:item.id, ...item.data() }));
  } catch (error) {
    console.error(`No se pudo consultar ${name}:`, error);
    return [];
  }
}

function mergeOfficialSeed(seedItems, firestoreItems) {
  const merged = new Map(seedItems.map(item => [item.id, { ...item, fuenteLocal: true }]));
  firestoreItems.forEach(item => merged.set(item.id, { ...item, fuenteLocal: false }));
  return [...merged.values()];
}

async function loadPublicBoard() {
  try {
    const snapshot = await getDocs(query(
      collection(db, 'participacionAportesPublicos'),
      where('estadoPublicacion', '==', 'publicado'),
      limit(200)
    ));
    return snapshot.docs.map(item => ({ id: item.id, ...item.data() })).sort(sortUpdated);
  } catch (error) {
    console.error('No se pudo consultar el tablero ciudadano:', error);
    return [];
  }
}

async function loadAll() {
  const [problematicas, retos, propuestas, reportes, planes, prototipos, consultas, aportesPublicos] = await Promise.all([
    loadCollection('innovacionProblematicas'), loadCollection('innovacionRetos'),
    loadCollection('innovacionPropuestas'), loadCollection('innovacionReportesVotacion'),
    loadCollection('innovacionPlanesTrabajo'), loadCollection('innovacionPrototipos'),
    loadCollection('innovacionConsultas'), loadPublicBoard()
  ]);
  state.problematicas = mergeOfficialSeed(DATOS_INICIALES.problematicas, problematicas).sort(sortUpdated);
  state.retos = mergeOfficialSeed(DATOS_INICIALES.retos, retos).sort(sortUpdated);
  state.propuestas = mergeOfficialSeed(DATOS_INICIALES.propuestas, propuestas).sort(sortUpdated);
  state.reportes = mergeOfficialSeed(DATOS_INICIALES.reportes, reportes).sort((a,b) => String(b.fechaCorte || '').localeCompare(String(a.fechaCorte || '')));
  state.planes = mergeOfficialSeed(DATOS_INICIALES.planes, planes).sort(sortUpdated);
  state.prototipos = mergeOfficialSeed(DATOS_INICIALES.prototipos, prototipos).sort(sortUpdated);
  state.consultas = consultas.sort(sortUpdated);
  state.aportesPublicos = aportesPublicos;
  populateFilters(); renderEverything();
}
function sortUpdated(a,b) {
  const da = timestampDate(a.updatedAt || a.createdAt)?.getTime() || 0;
  const dbv = timestampDate(b.updatedAt || b.createdAt)?.getTime() || 0;
  return dbv - da;
}
function populateFilters() {
  const tema = $('#filtro-problematica-tema');
  unique(state.problematicas.map(item => item.tema)).forEach(value => tema.insertAdjacentHTML('beforeend', `<option>${escapeHtml(value)}</option>`));
  const vigencia = $('#filtro-reto-vigencia');
  unique(state.retos.map(item => item.vigencia)).sort((a,b)=>b-a).forEach(value => vigencia.insertAdjacentHTML('beforeend', `<option>${escapeHtml(value)}</option>`));
}
function renderEverything() {
  renderKpis(); filterProblematicas(); filterRetos(); renderSelected(); renderPlans(); renderPrototypes(); renderPublicBoard(); renderOfficialSources(); updateDownloads();
}
function renderKpis() {
  const activePhases = new Set(['Próximo','Recibiendo propuestas','En votación','En evaluación','Solución seleccionada','En implementación']);
  $('#kpi-problematicas').textContent = state.problematicas.length;
  $('#kpi-retos').textContent = state.retos.filter(item => activePhases.has(item.estadoReto)).length;
  $('#kpi-propuestas').textContent = state.propuestas.length;
  $('#kpi-seleccionadas').textContent = state.propuestas.filter(item => item.seleccionada === true).length;
  $('#kpi-prototipos').textContent = state.prototipos.length;
}
function filterProblematicas() {
  const search = normalize($('#buscar-problematica').value);
  const tema = $('#filtro-problematica-tema').value;
  const status = $('#filtro-problematica-estado').value;
  state.filteredProblematicas = state.problematicas.filter(item => {
    const haystack = normalize([item.codigo,item.titulo,item.tema,item.territorio,item.resumen,item.preguntaOrientadora].join(' '));
    return (!search || haystack.includes(search)) && (!tema || item.tema === tema) && (!status || item.estadoProblematica === status);
  });
  renderProblematicas();
}
function renderProblematicas() {
  const container = $('#lista-problematicas'); container.innerHTML = '';
  $('#conteo-problematicas').textContent = `${state.filteredProblematicas.length} problemática${state.filteredProblematicas.length === 1 ? '' : 's'} disponible${state.filteredProblematicas.length === 1 ? '' : 's'}`;
  $('#sin-problematicas').hidden = state.filteredProblematicas.length > 0;
  state.filteredProblematicas.forEach(item => {
    const related = state.consultas.filter(c => c.problematicaId === item.id).length;
    const article = document.createElement('article'); article.className = 'problem-card';
    article.innerHTML = `
      <div class="problem-card-top"><div class="card-label-row"><span class="code-label">${escapeHtml(item.codigo || '')}</span><span class="status-pill ${statusSlug(item.estadoProblematica)}">${escapeHtml(item.estadoProblematica || 'En consulta')}</span></div><h3>${escapeHtml(item.titulo)}</h3><p class="question">${escapeHtml(item.preguntaOrientadora || '')}</p></div>
      <div class="problem-card-body"><div class="problem-meta"><span class="meta-chip">${escapeHtml(item.tema || 'Tema general')}</span><span class="meta-chip">${escapeHtml(item.territorio || 'Municipio')}</span><span class="meta-chip">${related} aportes publicados</span></div><p>${escapeHtml(item.resumen || '')}</p><div class="card-actions"><button class="link-action" type="button" data-detail-problematica="${item.id}">Ver diagnóstico</button>${item.estadoProblematica === 'En consulta' ? `<button class="btn outline small" type="button" data-aportar="${item.id}">Aportar información</button>` : ''}</div></div>`;
    container.append(article);
  });
}
function filterRetos() {
  const search = normalize($('#buscar-reto').value);
  const year = $('#filtro-reto-vigencia').value;
  state.filteredRetos = state.retos.filter(item => {
    const haystack = normalize([item.codigo,item.titulo,item.preguntaReto,item.tema,item.territorio,item.descripcion].join(' '));
    const phaseMatch = !state.retoPhase || (state.retoPhase === 'Cerrado' ? ['Cerrado','Suspendido'].includes(item.estadoReto) : item.estadoReto === state.retoPhase);
    return (!search || haystack.includes(search)) && (!year || String(item.vigencia) === year) && phaseMatch;
  });
  renderRetos(); updatePhaseCounts();
}
function updatePhaseCounts() {
  const count = phase => state.retos.filter(item => item.estadoReto === phase).length;
  $('#fase-todos').textContent = state.retos.length;
  $('#fase-propuestas').textContent = count('Recibiendo propuestas');
  $('#fase-votacion').textContent = count('En votación');
  $('#fase-evaluacion').textContent = count('En evaluación');
  $('#fase-implementacion').textContent = count('En implementación');
  $('#fase-cerrados').textContent = count('Cerrado') + count('Suspendido');
}
function renderRetos() {
  const container = $('#lista-retos'); container.innerHTML = '';
  $('#conteo-retos').textContent = `${state.filteredRetos.length} reto${state.filteredRetos.length === 1 ? '' : 's'} encontrado${state.filteredRetos.length === 1 ? '' : 's'}`;
  $('#sin-retos').hidden = state.filteredRetos.length > 0;
  state.filteredRetos.forEach(reto => {
    const proposals = state.propuestas.filter(item => item.retoId === reto.id);
    const reports = state.reportes.filter(item => item.retoId === reto.id);
    const latest = reports[0];
    const deadline = challengeDeadline(reto); const days = daysUntil(deadline);
    const phase = phaseIndex(reto.estadoReto); let timeline = '';
    for (let i=0;i<5;i++) timeline += `<span class="phase-step ${i < Math.min(phase,5) ? 'done' : ''} ${i === Math.min(phase,5) ? 'active' : ''}"></span>`;
    let action = `<button class="btn outline" type="button" data-detail-reto="${reto.id}">Ver reto completo</button>`;
    if (reto.estadoReto === 'Recibiendo propuestas') action += `<button class="btn primary dark" type="button" data-proponer="${reto.id}">Presentar solución</button>`;
    if (reto.estadoReto === 'En votación') action += `<button class="btn primary dark" type="button" data-votar-reto="${reto.id}">Ver propuestas y votar</button>`;
    const deadlineText = days === null ? 'Cronograma disponible' : days < 0 ? 'Plazo finalizado' : days === 0 ? 'Cierra hoy' : `${days} días restantes`;
    const article = document.createElement('article'); article.className = 'challenge-card'; article.dataset.phase = reto.estadoReto || '';
    article.innerHTML = `<div class="challenge-accent"></div><div class="challenge-card-head"><div class="card-label-row"><span class="code-label">${escapeHtml(reto.codigo || '')}</span><span class="status-pill ${statusSlug(reto.estadoReto)}">${escapeHtml(reto.estadoReto || 'Próximo')}</span></div><h3>${escapeHtml(reto.titulo)}</h3><p class="challenge-question">${escapeHtml(reto.preguntaReto || '')}</p></div><div class="challenge-card-body"><div class="problem-meta"><span class="meta-chip">${escapeHtml(reto.tema || 'Tema')}</span><span class="meta-chip">${escapeHtml(reto.territorio || 'San Pedro')}</span><span class="meta-chip">${escapeHtml(reto.modalidad || 'Mixta')}</span></div><div class="challenge-stats"><div><strong>${proposals.length}</strong><small>Propuestas publicadas</small></div><div><strong>${Number(latest?.totalVotos || 0)}</strong><small>Votos en último corte</small></div><div><strong>${reports.length}</strong><small>Cortes · ${escapeHtml(reto.frecuenciaReporte || 'Sin frecuencia')}</small></div></div><div class="phase-timeline" aria-label="Avance del reto">${timeline}</div><div class="deadline-box"><span>Próxima fecha: <strong>${formatDate(deadline)}</strong></span><strong>${deadlineText}</strong></div><div class="challenge-card-actions">${action}</div></div>`;
    container.append(article);
  });
}
function renderSelected() {
  const container = $('#lista-seleccionadas'); container.innerHTML = '';
  const selected = state.propuestas.filter(item => item.seleccionada === true);
  $('#sin-seleccionadas').hidden = selected.length > 0;
  selected.forEach(item => {
    const reto = state.retos.find(r => r.id === item.retoId) || {};
    const score = Math.max(0, Math.min(100, Number(item.puntajeFinal || 0)));
    const article = document.createElement('article'); article.className = 'selected-card';
    article.innerHTML = `<span class="selected-badge">✓ Solución seleccionada</span><span class="challenge-ref">${escapeHtml(reto.codigo || item.retoCodigo || '')} · ${escapeHtml(reto.titulo || '')}</span><h3>${escapeHtml(item.titulo)}</h3><div class="selected-score"><div class="score-ring" style="--score:${score}"><strong>${score}</strong></div><div><strong>Puntaje final</strong><p>${escapeHtml(item.justificacionSeleccion || reto.justificacionSeleccion || 'Consulte el detalle para conocer la decisión.')}</p></div></div><button class="btn outline" type="button" data-detail-propuesta="${item.id}">Ver criterios y selección</button>`;
    container.append(article);
  });
}
function planStatusClass(status) {
  if (status === 'Cumplido') return 'cumplido'; if (status === 'Con alerta' || status === 'Suspendido') return 'riesgo'; if (status === 'En ejecución') return 'ejecucion'; return 'preparacion';
}
function renderPlans() {
  const container = $('#lista-planes'); container.innerHTML = '';
  const counts = { preparacion:0, ejecucion:0, riesgo:0, cumplido:0 };
  state.planes.forEach(plan => counts[planStatusClass(plan.estadoPlan)]++);
  $('#planes-preparacion').textContent = counts.preparacion; $('#planes-ejecucion').textContent = counts.ejecucion; $('#planes-riesgo').textContent = counts.riesgo; $('#planes-cumplidos').textContent = counts.cumplido;
  $('#sin-planes').hidden = state.planes.length > 0;
  state.planes.forEach(plan => {
    const reto = state.retos.find(item => item.id === plan.retoId) || {};
    const activities = Array.isArray(plan.actividades) ? plan.actividades : [];
    const completed = activities.filter(item => item.estado === 'Cumplida').length;
    const progress = Math.max(0, Math.min(100, Number(plan.porcentajeAvance || 0)));
    const article = document.createElement('article'); article.className = 'plan-card';
    article.innerHTML = `<div class="plan-head"><div><span class="code-label">${escapeHtml(reto.codigo || plan.retoCodigo || '')}</span><h3>${escapeHtml(plan.titulo || `Implementación de ${reto.titulo || 'la solución'}`)}</h3><p>${escapeHtml(plan.objetivo || '')}</p></div><div class="progress-block"><span class="status-pill ${statusSlug(plan.estadoPlan)}">${escapeHtml(plan.estadoPlan || 'En preparación')}</span><strong>${progress}%</strong><div class="progress-track"><div class="progress-fill" style="--progress:${progress}%"></div></div></div></div><div class="plan-meta"><div><small>Responsable</small><strong>${escapeHtml(plan.liderResponsable || 'Por definir')}</strong></div><div><small>Inicio</small><strong>${formatDate(plan.fechaInicio)}</strong></div><div><small>Finalización</small><strong>${formatDate(plan.fechaFin)}</strong></div><div><small>Indicador</small><strong>${escapeHtml(plan.indicador || 'Por definir')}</strong></div></div><div class="activity-preview"><span>${completed} de ${activities.length} actividades cumplidas · Actualizado ${formatDateTime(plan.updatedAt)}</span><button class="link-action" type="button" data-detail-plan="${plan.id}">Ver plan completo</button></div>`;
    container.append(article);
  });
}
function renderPrototypes() {
  const container = $('#lista-prototipos'); container.innerHTML = '';
  const filtered = state.prototipos.filter(item => !state.prototypeStage || item.etapa === state.prototypeStage);
  $('#sin-prototipos').hidden = filtered.length > 0;
  filtered.forEach(item => {
    const image = safeUrl(item.imagenUrl); const reto = state.retos.find(r => r.id === item.retoId) || {};
    const links = [
      ['Ver demostración', item.demoUrl], ['Documento técnico', item.documentoTecnicoUrl], ['Video', item.videoUrl]
    ].filter(([,url]) => safeUrl(url)).map(([label,url]) => `<a href="${escapeHtml(safeUrl(url))}" target="_blank" rel="noopener">${label}</a>`).join('');
    const article = document.createElement('article'); article.className = 'prototype-card';
    article.innerHTML = `<div class="prototype-media">${image ? `<img src="${escapeHtml(image)}" alt="${escapeHtml(item.altImagen || `Prototipo ${item.titulo}`)}" loading="lazy">` : '<div class="fallback-art">△</div>'}<span class="stage-badge">${escapeHtml(item.etapa || 'Concepto')}</span></div><div class="prototype-body"><span class="code-label">${escapeHtml(reto.codigo || item.retoCodigo || '')} · Versión ${escapeHtml(item.version || '1.0')}</span><h3>${escapeHtml(item.titulo)}</h3><p>${escapeHtml(item.descripcion || '')}</p><div class="prototype-links">${links}<button class="link-action" type="button" data-detail-prototipo="${item.id}">Ver resultados</button></div></div>`;
    container.append(article);
  });
}
function updateDownloads() {
  $('#descargar-problematicas').disabled = !state.problematicas.length;
  $('#descargar-retos').disabled = !state.retos.length;
  $('#descargar-propuestas').disabled = !state.propuestas.length;
  $('#descargar-reportes').disabled = !state.reportes.length;
}
function openModal(title, code, html) {
  $('#modal-title').textContent = title; $('#modal-code').textContent = code || ''; $('#modal-body').innerHTML = html;
  $('#modal-detalle').hidden = false; document.body.classList.add('modal-open');
}
function closeModal(id) { $(id).hidden = true; document.body.classList.remove('modal-open'); }
function detailProblematic(id) {
  const item = state.problematicas.find(x => x.id === id); if (!item) return;
  const contributions = state.consultas.filter(x => x.problematicaId === id);
  const link = safeUrl(item.enlaceDiagnostico);
  openModal(item.titulo, item.codigo, `<div class="detail-hero"><span class="status-pill ${statusSlug(item.estadoProblematica)}">${escapeHtml(item.estadoProblematica)}</span><h3>${escapeHtml(item.preguntaOrientadora || '')}</h3><p>${escapeHtml(item.resumen || '')}</p></div><div class="detail-grid"><div class="detail-box"><small>Tema</small><strong>${escapeHtml(item.tema || '')}</strong></div><div class="detail-box"><small>Territorio</small><strong>${escapeHtml(item.territorio || '')}</strong></div><div class="detail-box full"><small>Antecedentes</small><p>${escapeHtml(item.antecedentes || 'No se han publicado antecedentes adicionales.')}</p></div><div class="detail-box full"><small>Datos o evidencias disponibles</small><p>${escapeHtml(item.datosClave || 'No se han publicado datos adicionales.')}</p></div><div class="detail-box"><small>Población relacionada</small><p>${escapeHtml(item.poblacion || 'Comunidad en general')}</p></div><div class="detail-box"><small>Dependencia responsable</small><p>${escapeHtml(item.dependenciaResponsable || 'Alcaldía Municipal')}</p></div></div>${link ? `<p><a class="btn outline" href="${escapeHtml(link)}" target="_blank" rel="noopener">Consultar documento de diagnóstico</a></p>` : ''}<h3>Aportes publicados</h3>${contributions.length ? `<div class="proposal-list">${contributions.map(c => `<article class="proposal-public-card"><span class="code-label">${escapeHtml(c.tipoAporte || 'Aporte')}</span><h4>${escapeHtml(c.nombrePublico || 'Ciudadanía')}</h4><p>${escapeHtml(c.aporte)}</p></article>`).join('')}</div>` : '<p class="muted">Aún no hay aportes publicados para esta problemática.</p>'}`);
}
function challengeDetail(id) {
  const reto = state.retos.find(x => x.id === id); if (!reto) return;
  const proposals = state.propuestas.filter(x => x.retoId === id);
  const reports = state.reportes.filter(x => x.retoId === id);
  const criteria = parseCriteria(reto.criteriosEvaluacion);
  const dates = [
    ['Apertura',reto.fechaApertura],['Cierre de propuestas',reto.fechaCierrePropuestas],['Inicio de votación',reto.fechaInicioVotacion],['Cierre de votación',reto.fechaCierreVotacion],['Selección',reto.fechaSeleccion],['Plan de trabajo',reto.fechaPublicacionPlan]
  ];
  const proposalHtml = proposals.length ? proposals.map(p => proposalHtmlCard(p, reto)).join('') : '<p class="muted">No hay propuestas publicadas para este reto.</p>';
  const reportHtml = reports.length ? reports.map(report => `<article class="report-card"><header><strong>Corte ${formatDate(report.fechaCorte)}</strong><span>${escapeHtml(report.frecuencia || '')} · ${Number(report.totalVotos || 0)} votos</span></header>${report.notaPublica ? `<p>${escapeHtml(report.notaPublica)}</p>` : ''}<div class="report-results">${(Array.isArray(report.resultados) ? report.resultados : []).map(r => `<span>${escapeHtml(r.propuestaTitulo)}: <strong>${Number(r.votos || 0)}</strong></span>`).join('')}</div></article>`).join('') : '<p class="muted">No se han publicado cortes de votación.</p>';
  const actions = `${reto.estadoReto === 'Recibiendo propuestas' ? `<button class="btn primary dark" type="button" data-proponer="${reto.id}">Presentar solución</button>` : ''}${reto.estadoReto === 'En votación' ? `<p class="muted">Seleccione una propuesta publicada para registrar su voto.</p>` : ''}`;
  openModal(reto.titulo, reto.codigo, `<div class="detail-hero"><span class="status-pill ${statusSlug(reto.estadoReto)}">${escapeHtml(reto.estadoReto)}</span><h3>${escapeHtml(reto.preguntaReto || '')}</h3><p>${escapeHtml(reto.descripcion || '')}</p>${actions}</div><div class="detail-grid"><div class="detail-box full"><small>Objetivo del reto</small><p>${escapeHtml(reto.objetivo || '')}</p></div><div class="detail-box"><small>Quiénes pueden participar</small><p>${escapeHtml(reto.participantesHabilitados || 'Ciudadanía y grupos de valor')}</p></div><div class="detail-box"><small>Modalidad</small><p>${escapeHtml(reto.modalidad || 'Mixta')}</p></div><div class="detail-box"><small>Frecuencia de reportes de votación</small><p>${escapeHtml(reto.frecuenciaReporte || 'No definida')}</p></div><div class="detail-box full"><small>Requisitos de las propuestas</small><p>${escapeHtml(reto.requisitos || '')}</p></div><div class="detail-box"><small>Dependencia responsable</small><p>${escapeHtml(reto.dependenciaResponsable || '')}</p></div><div class="detail-box"><small>Contacto institucional</small><p>${escapeHtml(reto.contacto || '')}</p></div></div><h3>Cronograma</h3><div class="timeline-list">${dates.map(([label,date]) => `<div class="timeline-row"><strong>${label}</strong><span>${formatDate(date)}</span><small>${date && date < todayBogota() ? 'Finalizada' : 'Programada'}</small></div>`).join('')}</div><h3>Criterios de evaluación</h3>${criteria.length ? `<div class="detail-grid">${criteria.map(c => `<div class="detail-box"><small>${escapeHtml(c.name)}</small><strong>${c.weight}%</strong></div>`).join('')}</div>` : '<p class="muted">Consulte los términos de la convocatoria.</p>'}<h3>Propuestas publicadas</h3><div class="proposal-list">${proposalHtml}</div><h3>Reportes de votación</h3><div class="report-list">${reportHtml}</div>${safeUrl(reto.enlaceBases) ? `<p><a class="btn outline" href="${escapeHtml(safeUrl(reto.enlaceBases))}" target="_blank" rel="noopener">Consultar bases del reto</a></p>` : ''}`);
}
function proposalHtmlCard(proposal, reto) {
  const pct = Math.max(0, Math.min(100, Number(proposal.porcentajeVotacion || 0)));
  return `<article class="proposal-public-card ${proposal.seleccionada ? 'selected' : ''}"><div class="card-label-row"><span class="code-label">${escapeHtml(proposal.codigo || '')}</span>${proposal.seleccionada ? '<span class="status-pill convertida">Seleccionada</span>' : ''}</div><h4>${escapeHtml(proposal.titulo)}</h4><p>${escapeHtml(proposal.resumen || '')}</p><div class="vote-bar"><span style="--vote:${pct}%"></span></div><div class="vote-row"><span>${Number(proposal.votosPublicados || 0)} votos publicados</span><strong>${pct}%</strong></div><div class="card-actions"><button class="link-action" type="button" data-detail-propuesta="${proposal.id}">Ver solución</button>${reto.estadoReto === 'En votación' ? `<button class="btn primary dark small" type="button" data-votar="${proposal.id}" data-reto="${reto.id}">Votar</button>` : ''}</div></article>`;
}
function detailProposal(id) {
  const item = state.propuestas.find(x => x.id === id); if (!item) return;
  const reto = state.retos.find(x => x.id === item.retoId) || {};
  const selection = item.seleccionada ? `<h3>Resultado de la selección</h3><div class="detail-grid"><div class="detail-box"><small>Puntaje final</small><strong>${Number(item.puntajeFinal || 0)} / 100</strong></div><div class="detail-box"><small>Fecha de selección</small><strong>${formatDate(item.fechaSeleccion || reto.fechaSeleccion)}</strong></div><div class="detail-box full"><small>Justificación</small><p>${escapeHtml(item.justificacionSeleccion || reto.justificacionSeleccion || '')}</p></div><div class="detail-box full"><small>Criterios y puntajes</small><p>${escapeHtml(item.resultadoCriterios || reto.resultadoCriterios || '')}</p></div></div>${safeUrl(item.enlaceActaSeleccion || reto.enlaceActaSeleccion) ? `<p><a class="btn outline" href="${escapeHtml(safeUrl(item.enlaceActaSeleccion || reto.enlaceActaSeleccion))}" target="_blank" rel="noopener">Consultar acta de selección</a></p>` : ''}` : '';
  openModal(item.titulo, item.codigo, `<div class="detail-hero"><span class="code-label">Propuesta para ${escapeHtml(reto.codigo || '')}</span><h3>${escapeHtml(item.resumen || '')}</h3><p>Autor o equipo: <strong>${escapeHtml(item.autorNombre || '')}</strong>${item.organizacion ? ` · ${escapeHtml(item.organizacion)}` : ''}</p></div><div class="detail-grid"><div class="detail-box full"><small>Descripción de la solución</small><p>${escapeHtml(item.descripcion || '')}</p></div><div class="detail-box"><small>Beneficiarios</small><p>${escapeHtml(item.beneficiarios || '')}</p></div><div class="detail-box"><small>Impacto esperado</small><p>${escapeHtml(item.impactoEsperado || '')}</p></div><div class="detail-box"><small>Recursos necesarios</small><p>${escapeHtml(item.recursos || 'No especificados')}</p></div><div class="detail-box"><small>Viabilidad</small><p>${escapeHtml(item.viabilidad || 'No especificada')}</p></div><div class="detail-box full"><small>Componente innovador</small><p>${escapeHtml(item.innovacion || '')}</p></div></div>${safeUrl(item.enlaceAnexo) ? `<p><a class="btn outline" href="${escapeHtml(safeUrl(item.enlaceAnexo))}" target="_blank" rel="noopener">Consultar anexo de la propuesta</a></p>` : ''}${selection}`);
}
function detailPlan(id) {
  const item = state.planes.find(x => x.id === id); if (!item) return;
  const reto = state.retos.find(x => x.id === item.retoId) || {};
  const activities = Array.isArray(item.actividades) ? item.actividades : [];
  openModal(item.titulo || `Plan de ${reto.titulo || ''}`, item.codigo || reto.codigo, `<div class="detail-hero"><span class="status-pill ${statusSlug(item.estadoPlan)}">${escapeHtml(item.estadoPlan || '')}</span><h3>${escapeHtml(item.objetivo || '')}</h3><p>${escapeHtml(item.alcance || '')}</p></div><div class="detail-grid"><div class="detail-box"><small>Líder responsable</small><strong>${escapeHtml(item.liderResponsable || '')}</strong></div><div class="detail-box"><small>Aliados</small><p>${escapeHtml(item.aliados || '')}</p></div><div class="detail-box"><small>Indicador</small><p>${escapeHtml(item.indicador || '')}</p></div><div class="detail-box"><small>Meta</small><p>${escapeHtml(item.meta || '')}</p></div><div class="detail-box full"><small>Riesgos y medidas</small><p>${escapeHtml(item.riesgos || '')}</p></div></div><h3>Actividades</h3><div class="timeline-list">${activities.length ? activities.map(a => `<div class="timeline-row"><strong>${escapeHtml(a.actividad || '')}</strong><span>${escapeHtml(a.responsable || '')}<br><small>${formatDate(a.fecha)}</small></span><span class="status-pill ${statusSlug(a.estado)}">${escapeHtml(a.estado || '')}</span></div>`).join('') : '<p class="muted">No hay actividades publicadas.</p>'}</div>${safeUrl(item.enlacePlan) ? `<p><a class="btn outline" href="${escapeHtml(safeUrl(item.enlacePlan))}" target="_blank" rel="noopener">Consultar plan completo</a></p>` : ''}`);
}
function detailPrototype(id) {
  const item = state.prototipos.find(x => x.id === id); if (!item) return;
  const reto = state.retos.find(x => x.id === item.retoId) || {};
  openModal(item.titulo, `${reto.codigo || ''} · Versión ${item.version || ''}`, `<div class="detail-hero"><span class="status-pill convertida">${escapeHtml(item.etapa || 'Concepto')}</span><h3>${escapeHtml(item.descripcion || '')}</h3><p>${escapeHtml(item.problemaResuelto || '')}</p></div><div class="detail-grid"><div class="detail-box"><small>Tipo de desarrollo</small><strong>${escapeHtml(item.tipoPrototipo || '')}</strong></div><div class="detail-box"><small>Fecha</small><strong>${formatDate(item.fechaPrototipo)}</strong></div><div class="detail-box full"><small>Equipo responsable</small><p>${escapeHtml(item.equipoResponsable || '')}</p></div><div class="detail-box full"><small>Resultados de las pruebas</small><p>${escapeHtml(item.resultadosPruebas || '')}</p></div><div class="detail-box full"><small>Observaciones recibidas</small><p>${escapeHtml(item.observacionesRecibidas || '')}</p></div><div class="detail-box full"><small>Ajustes realizados</small><p>${escapeHtml(item.ajustesRealizados || '')}</p></div><div class="detail-box full"><small>Siguiente paso</small><p>${escapeHtml(item.siguientePaso || '')}</p></div></div>`);
}
async function signInGoogle() {
  try { await signInWithPopup(auth, provider); }
  catch (error) {
    if (['auth/popup-blocked','auth/cancelled-popup-request','auth/popup-closed-by-user'].includes(error.code)) {
      if (error.code === 'auth/popup-blocked') await signInWithRedirect(auth, provider);
      return;
    }
    toast('No fue posible iniciar sesión con Google.', 'error');
  }
}
async function requireLogin() {
  if (state.user) return true;
  toast('Inicie sesión con Google para participar.', 'info'); await signInGoogle(); return Boolean(auth.currentUser);
}
function updateSession(user) {
  state.user = user;
  $('#login-publico').textContent = user ? 'Cuenta ciudadana' : 'Participar con Google';
  $('#session-chip').hidden = !user;
  if (user) {
    $('#session-name').textContent = user.displayName || user.email || 'Ciudadanía';
    const photo = $('#session-photo'); if (user.photoURL) { photo.src = user.photoURL; photo.hidden = false; } else photo.hidden = true;
  }
}
async function openContribution(id) {
  if (!await requireLogin()) return;
  const item = state.problematicas.find(x => x.id === id); if (!item) return;
  state.selectedProblematicId = id; $('#aporte-problematica-id').value = id; $('#aporte-contexto').textContent = item.titulo;
  $('#aporte-nombre').value = state.user?.displayName || ''; $('#form-aporte').reset(); $('#aporte-problematica-id').value = id; $('#aporte-nombre').value = state.user?.displayName || '';
  $('#aporte-contexto').textContent = item.titulo; closeNotice($('#aporte-estado')); $('#modal-aporte').hidden = false; document.body.classList.add('modal-open');
}
async function submitContribution(event) {
  event.preventDefault(); const form = event.currentTarget; const notice = $('#aporte-estado'); closeNotice(notice);
  if (!state.user || !form.reportValidity()) return;
  const id = doc(collection(db, 'innovacionConsultas')).id;
  const data = {
    codigo: generateCode('CON'), vigencia: 2026, problematicaId: $('#aporte-problematica-id').value,
    nombrePublico: $('#aporte-nombre').value.trim(), tipoAporte: $('#aporte-tipo').value,
    aporte: $('#aporte-texto').value.trim(), consentimientoPublicacion: $('#aporte-consentimiento').checked,
    estadoModeracion:'pendiente', estadoPublicacion:'pendiente', origen:'san_pedro_innova',
    createdAt:serverTimestamp(), updatedAt:serverTimestamp()
  };
  const button = $('#enviar-aporte'); button.disabled = true;
  try { await setDoc(doc(db,'innovacionConsultas',id), data); setNotice(notice,'Su aporte fue registrado y será revisado antes de publicarse.','success'); form.reset(); setTimeout(()=>closeModal('#modal-aporte'),1800); }
  catch(error){ console.error(error); setNotice(notice,'No fue posible registrar el aporte. Revise los campos e intente nuevamente.','error'); }
  finally { button.disabled = false; }
}
async function openProposal(id) {
  if (!await requireLogin()) return;
  const reto = state.retos.find(x => x.id === id); if (!reto || reto.estadoReto !== 'Recibiendo propuestas') return;
  const form = $('#form-propuesta'); form.reset(); $('#propuesta-reto-id').value = id; $('#propuesta-reto-codigo').value = reto.codigo || '';
  $('#propuesta-contexto').textContent = `${reto.codigo || ''} · ${reto.titulo}`; $('#propuesta-autor').value = state.user?.displayName || '';
  closeNotice($('#propuesta-estado')); $('#modal-propuesta').hidden = false; document.body.classList.add('modal-open');
}
async function submitProposal(event) {
  event.preventDefault(); const form = event.currentTarget; const notice = $('#propuesta-estado'); closeNotice(notice);
  if (!state.user || !form.reportValidity()) return;
  const proposalRef = doc(collection(db,'innovacionPropuestas')); const batch = writeBatch(db);
  const retoId = $('#propuesta-reto-id').value; const retoCodigo = $('#propuesta-reto-codigo').value;
  const publicData = {
    codigo:generateCode('SOL'), vigencia:2026, retoId, retoCodigo,
    titulo:$('#propuesta-titulo').value.trim(), autorNombre:$('#propuesta-autor').value.trim(), organizacion:$('#propuesta-organizacion').value.trim(), territorio:$('#propuesta-territorio').value.trim(),
    resumen:$('#propuesta-resumen').value.trim(), descripcion:$('#propuesta-descripcion').value.trim(), beneficiarios:$('#propuesta-beneficiarios').value.trim(), impactoEsperado:$('#propuesta-impacto').value.trim(), recursos:$('#propuesta-recursos').value.trim(), viabilidad:$('#propuesta-viabilidad').value.trim(), tiempoImplementacion:$('#propuesta-tiempo').value.trim(), innovacion:$('#propuesta-innovacion').value.trim(), enlaceAnexo:$('#propuesta-enlace').value.trim(),
    autorizacionPublicacion:$('#propuesta-consentimiento').checked,
    estadoModeracion:'pendiente', estadoPublicacion:'pendiente', seleccionada:false, votosPublicados:0, porcentajeVotacion:0,
    puntajeFinal:0, justificacionSeleccion:'', resultadoCriterios:'', fechaSeleccion:'', enlaceActaSeleccion:'', origen:'san_pedro_innova',
    createdAt:serverTimestamp(), updatedAt:serverTimestamp()
  };
  const privateData = { propuestaId:proposalRef.id, retoId, userId:state.user.uid, email:state.user.email || '', nombreCuenta:state.user.displayName || '', createdAt:serverTimestamp(), updatedAt:serverTimestamp() };
  batch.set(proposalRef, publicData); batch.set(doc(db,'innovacionPropuestasPrivadas',proposalRef.id), privateData);
  const button = $('#enviar-propuesta'); button.disabled = true;
  try { await batch.commit(); setNotice(notice,`Propuesta registrada con el código ${publicData.codigo}. Será revisada antes de publicarse.`, 'success'); form.reset(); setTimeout(()=>closeModal('#modal-propuesta'),2200); }
  catch(error){ console.error(error); setNotice(notice,'No fue posible registrar la propuesta. Revise la información e intente nuevamente.','error'); }
  finally { button.disabled = false; }
}
async function openVote(proposalId, retoId) {
  if (!await requireLogin()) return;
  const proposal = state.propuestas.find(x => x.id === proposalId); const reto = state.retos.find(x => x.id === retoId);
  if (!proposal || !reto || reto.estadoReto !== 'En votación') return;
  const voteId = `${retoId}_${state.user.uid}`;
  try {
    const existing = await getDoc(doc(db,'innovacionVotos',voteId));
    if (existing.exists()) { toast('Ya registró un voto en este reto.', 'info'); return; }
  } catch(error){ console.warn(error); }
  state.selectedProposal = { proposal, reto, voteId };
  $('#voto-eleccion').innerHTML = `<strong>${escapeHtml(proposal.titulo)}</strong><small>${escapeHtml(proposal.codigo || '')}</small>`;
  closeNotice($('#voto-estado')); $('#modal-voto').hidden = false; document.body.classList.add('modal-open');
}
async function confirmVote() {
  if (!state.user || !state.selectedProposal) return;
  const { proposal, reto, voteId } = state.selectedProposal; const notice = $('#voto-estado'); closeNotice(notice);
  $('#confirmar-voto').disabled = true;
  try {
    await setDoc(doc(db,'innovacionVotos',voteId), { retoId:reto.id, propuestaId:proposal.id, userId:state.user.uid, createdAt:serverTimestamp() });
    setNotice(notice,'Su voto fue registrado. Se reflejará en el siguiente corte oficial.','success'); setTimeout(()=>closeModal('#modal-voto'),1800);
  } catch(error){ console.error(error); setNotice(notice,error.code === 'permission-denied' ? 'No fue posible registrar el voto. Verifique que el reto continúe en votación y que no haya votado antes.' : 'Ocurrió un error al registrar el voto.','error'); }
  finally { $('#confirmar-voto').disabled = false; }
}
function setupAccessibility() {
  const savedScale = Number(localStorage.getItem('spi-font-scale') || 1); document.documentElement.style.setProperty('--font-scale', savedScale);
  if (localStorage.getItem('spi-contrast') === '1') document.body.classList.add('high-contrast');
  if (localStorage.getItem('spi-readable') === '1') document.body.classList.add('readable-mode');
  $('[data-access="contrast"]').setAttribute('aria-pressed', document.body.classList.contains('high-contrast'));
  $('[data-access="readable"]').setAttribute('aria-pressed', document.body.classList.contains('readable-mode'));
  $$('.access-inner button').forEach(button => button.addEventListener('click', () => {
    const action = button.dataset.access; let scale = Number(localStorage.getItem('spi-font-scale') || 1);
    if (action === 'increase') scale = Math.min(1.25, +(scale + .05).toFixed(2));
    if (action === 'decrease') scale = Math.max(.9, +(scale - .05).toFixed(2));
    if (['increase','decrease'].includes(action)) { localStorage.setItem('spi-font-scale', scale); document.documentElement.style.setProperty('--font-scale', scale); }
    if (action === 'contrast') { document.body.classList.toggle('high-contrast'); localStorage.setItem('spi-contrast', document.body.classList.contains('high-contrast') ? '1':'0'); button.setAttribute('aria-pressed', document.body.classList.contains('high-contrast')); }
    if (action === 'readable') { document.body.classList.toggle('readable-mode'); localStorage.setItem('spi-readable', document.body.classList.contains('readable-mode') ? '1':'0'); button.setAttribute('aria-pressed', document.body.classList.contains('readable-mode')); }
    if (action === 'reset') { localStorage.removeItem('spi-font-scale'); localStorage.removeItem('spi-contrast'); localStorage.removeItem('spi-readable'); document.documentElement.style.setProperty('--font-scale',1); document.body.classList.remove('high-contrast','readable-mode'); $('[data-access="contrast"]').setAttribute('aria-pressed','false'); $('[data-access="readable"]').setAttribute('aria-pressed','false'); }
  }));
}

function renderPublicBoard() {
  const container = $('#lista-tablero-ciudadano');
  const count = $('#conteo-tablero-ciudadano');
  const empty = $('#sin-tablero-ciudadano');
  if (!container || !count || !empty) return;
  const search = normalize($('#buscar-tablero-ciudadano')?.value || '');
  const type = $('#filtro-tablero-tipo')?.value || '';
  const items = state.aportesPublicos.filter(item => {
    const haystack = normalize([item.codigo, item.nombre, item.tipo, item.comentario, item.respuestaInstitucional].join(' '));
    return (!search || haystack.includes(search)) && (!type || item.tipo === type);
  });
  count.textContent = `${items.length} aporte${items.length === 1 ? '' : 's'} publicado${items.length === 1 ? '' : 's'}`;
  empty.hidden = items.length > 0;
  container.innerHTML = items.map(item => `
    <article class="citizen-board-card">
      <header><span class="status-pill ${statusSlug(item.tipo)}">${escapeHtml(item.tipo || 'Aporte')}</span><span class="code-label">${escapeHtml(item.codigo || '')}</span></header>
      <blockquote>${escapeHtml(item.comentario || '')}</blockquote>
      <div class="citizen-board-meta"><strong>${escapeHtml(item.nombre || 'Ciudadanía')}</strong><span>${formatDate(item.createdAt, 'Publicado recientemente')}</span></div>
      ${item.respuestaInstitucional ? `<div class="institutional-response"><small>Respuesta institucional</small><p>${escapeHtml(item.respuestaInstitucional)}</p></div>` : ''}
    </article>`).join('');
}

function renderOfficialSources() {
  const container = $('#lista-fuentes-oficiales');
  if (!container) return;
  container.innerHTML = FUENTES_OFICIALES.map(source => `
    <a class="official-source-card" href="${safeUrl(source.url)}" target="_blank" rel="noopener noreferrer">
      <span>${escapeHtml(source.categoria)}</span>
      <strong>${escapeHtml(source.titulo)}</strong>
      <p>${escapeHtml(source.descripcion)}</p>
      <small>Consultar fuente oficial ↗</small>
    </a>`).join('');
  const count = $('#conteo-fuentes-oficiales');
  if (count) count.textContent = `${FUENTES_OFICIALES.length} fuentes institucionales relacionadas`;
}

async function submitOpenBoard(event) {
  event.preventDefault();
  const form = event.currentTarget;
  const notice = $('#tablero-form-estado');
  if (!form.reportValidity()) return;
  const button = $('#enviar-tablero-ciudadano');
  button.disabled = true;
  button.textContent = 'Publicando…';
  closeNotice(notice);
  const ref = doc(collection(db, 'participacionAportesPublicos'));
  const payload = {
    codigo: generateCode('AP'),
    vigencia: 2026,
    nombre: $('#tablero-nombre').value.trim(),
    tipo: $('#tablero-tipo').value,
    comentario: $('#tablero-comentario').value.trim(),
    consentimientoPublicacion: true,
    estadoPublicacion: 'publicado',
    respuestaInstitucional: '',
    origen: 'tablero_publico',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  };
  try {
    await setDoc(ref, payload);
    form.reset();
    $('#tablero-contador').textContent = '0';
    setNotice(notice, `Su ${payload.tipo.toLowerCase()} fue publicado correctamente. Código: ${payload.codigo}.`, 'success');
    toast('Aporte publicado en el tablero ciudadano.', 'success');
    await loadAll();
  } catch (error) {
    console.error(error);
    setNotice(notice, 'No fue posible publicar el aporte. Verifique la conexión e inténtelo nuevamente.', 'error');
  } finally {
    button.disabled = false;
    button.textContent = 'Publicar aporte';
  }
}

function setupEvents() {
  $('#menu-toggle').addEventListener('click', () => { const menu = $('#menu-principal'); const open = menu.classList.toggle('open'); $('#menu-toggle').setAttribute('aria-expanded', String(open)); });
  $$('#menu-principal a').forEach(link => link.addEventListener('click', () => $('#menu-principal').classList.remove('open')));
  $('#form-tablero-ciudadano')?.addEventListener('submit', submitOpenBoard);
  $('#tablero-comentario')?.addEventListener('input', event => { $('#tablero-contador').textContent = event.target.value.length; });
  $('#buscar-tablero-ciudadano')?.addEventListener('input', renderPublicBoard);
  $('#filtro-tablero-tipo')?.addEventListener('change', renderPublicBoard);
  $('#limpiar-tablero')?.addEventListener('click', () => { $('#buscar-tablero-ciudadano').value = ''; $('#filtro-tablero-tipo').value = ''; renderPublicBoard(); });
  $$('.ita-route article').forEach(card => card.addEventListener('click', () => document.querySelector(card.dataset.target)?.scrollIntoView({behavior:'smooth'})));
  ['#buscar-problematica','#filtro-problematica-tema','#filtro-problematica-estado'].forEach(id => $(id).addEventListener(id.includes('buscar') ? 'input':'change', filterProblematicas));
  $('#limpiar-problematicas').addEventListener('click', () => { $('#buscar-problematica').value=''; $('#filtro-problematica-tema').value=''; $('#filtro-problematica-estado').value=''; filterProblematicas(); });
  ['#buscar-reto','#filtro-reto-vigencia'].forEach(id => $(id).addEventListener(id.includes('buscar') ? 'input':'change', filterRetos));
  $('#limpiar-retos').addEventListener('click', () => { $('#buscar-reto').value=''; $('#filtro-reto-vigencia').value=''; state.retoPhase=''; $$('.phase-filter button').forEach(b=>b.classList.toggle('active',!b.dataset.retoFase)); filterRetos(); });
  $$('.phase-filter button').forEach(button => button.addEventListener('click', () => { state.retoPhase = button.dataset.retoFase; $$('.phase-filter button').forEach(b=>b.classList.toggle('active',b===button)); filterRetos(); }));
  $$('.prototype-filter button').forEach(button => button.addEventListener('click', () => { state.prototypeStage = button.dataset.prototypeStage; $$('.prototype-filter button').forEach(b=>b.classList.toggle('active',b===button)); renderPrototypes(); }));
  document.addEventListener('click', event => {
    const t = event.target.closest('[data-detail-problematica],[data-detail-reto],[data-detail-propuesta],[data-detail-plan],[data-detail-prototipo],[data-aportar],[data-proponer],[data-votar],[data-votar-reto]'); if (!t) return;
    if (t.dataset.detailProblematica) detailProblematic(t.dataset.detailProblematica);
    if (t.dataset.detailReto) challengeDetail(t.dataset.detailReto);
    if (t.dataset.detailPropuesta) detailProposal(t.dataset.detailPropuesta);
    if (t.dataset.detailPlan) detailPlan(t.dataset.detailPlan);
    if (t.dataset.detailPrototipo) detailPrototype(t.dataset.detailPrototipo);
    if (t.dataset.aportar) openContribution(t.dataset.aportar);
    if (t.dataset.proponer) { closeModal('#modal-detalle'); openProposal(t.dataset.proponer); }
    if (t.dataset.votar) openVote(t.dataset.votar,t.dataset.reto);
    if (t.dataset.votarReto) challengeDetail(t.dataset.votarReto);
  });
  $$('[data-close-modal]').forEach(x=>x.addEventListener('click',()=>closeModal('#modal-detalle')));
  $$('[data-close-aporte]').forEach(x=>x.addEventListener('click',()=>closeModal('#modal-aporte')));
  $$('[data-close-propuesta]').forEach(x=>x.addEventListener('click',()=>closeModal('#modal-propuesta')));
  $$('[data-close-voto]').forEach(x=>x.addEventListener('click',()=>closeModal('#modal-voto')));
  $('#form-aporte').addEventListener('submit',submitContribution); $('#aporte-texto').addEventListener('input',e=>$('#aporte-contador').textContent=e.target.value.length);
  $('#form-propuesta').addEventListener('submit',submitProposal); $('#confirmar-voto').addEventListener('click',confirmVote);
  $('#login-publico').addEventListener('click', () => state.user ? toast(`Sesión activa: ${state.user.email || state.user.displayName}`) : signInGoogle());
  $('#logout-publico').addEventListener('click',()=>signOut(auth));
  $('#imprimir').addEventListener('click',()=>window.print());
  $('#descargar-problematicas').addEventListener('click',()=>downloadCsv(`problematicas-san-pedro-${todayBogota()}.csv`,['Código','Título','Tema','Territorio','Estado','Pregunta orientadora','Resumen','Dependencia'],state.problematicas.map(x=>[x.codigo,x.titulo,x.tema,x.territorio,x.estadoProblematica,x.preguntaOrientadora,x.resumen,x.dependenciaResponsable])));
  $('#descargar-retos').addEventListener('click',()=>downloadCsv(`retos-innovacion-san-pedro-${todayBogota()}.csv`,['Código','Título','Pregunta','Tema','Territorio','Fase','Apertura','Cierre propuestas','Inicio votación','Cierre votación','Frecuencia reportes'],state.retos.map(x=>[x.codigo,x.titulo,x.preguntaReto,x.tema,x.territorio,x.estadoReto,x.fechaApertura,x.fechaCierrePropuestas,x.fechaInicioVotacion,x.fechaCierreVotacion,x.frecuenciaReporte])));
  $('#descargar-propuestas').addEventListener('click',()=>downloadCsv(`soluciones-publicadas-san-pedro-${todayBogota()}.csv`,['Código','Reto','Título','Autor o equipo','Organización','Territorio','Estado','Seleccionada','Votos publicados','Porcentaje','Puntaje'],state.propuestas.map(x=>[x.codigo,x.retoCodigo,x.titulo,x.autorNombre,x.organizacion,x.territorio,x.estadoModeracion,x.seleccionada?'Sí':'No',x.votosPublicados,x.porcentajeVotacion,x.puntajeFinal])));
  $('#descargar-reportes').addEventListener('click',()=>downloadCsv(`reportes-votacion-san-pedro-${todayBogota()}.csv`,['Reto','Fecha de corte','Frecuencia','Total votos','Nota','Resultados'],state.reportes.map(x=>[x.retoCodigo,x.fechaCorte,x.frecuencia,x.totalVotos,x.notaPublica,(x.resultados||[]).map(r=>`${r.propuestaTitulo}: ${r.votos}`).join(' | ')])));
  document.addEventListener('keydown',e=>{ if(e.key==='Escape'){ ['#modal-detalle','#modal-aporte','#modal-propuesta','#modal-voto'].forEach(id=>{ if(!$(id).hidden) closeModal(id); }); } });
}

setupAccessibility(); setupEvents();
getRedirectResult(auth).catch(()=>{});
onAuthStateChanged(auth, updateSession);
loadAll().catch(error => { console.error(error); toast('No fue posible cargar la información pública.', 'error'); });
