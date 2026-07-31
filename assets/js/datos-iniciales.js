const FUENTES_OFICIALES = [
  {
    categoria: 'Planeación',
    titulo: 'Plan de Desarrollo Municipal 2024–2027',
    descripcion: 'Marco general de programas, metas y prioridades de la administración municipal.',
    url: 'https://www.sanpedro-valle.gov.co/planes/plan-de-desarrollo-municipal-san-pedro-valle-del-cauca'
  },
  {
    categoria: 'Planeación',
    titulo: 'Plan de Acción Municipal 2026',
    descripcion: 'Instrumento que orienta la ejecución institucional durante la vigencia 2026.',
    url: 'https://www.sanpedro-valle.gov.co/planes/plan-de-accion-municipal-de-san-pedro-valle-del-cauca'
  },
  {
    categoria: 'Participación',
    titulo: 'Consulta ciudadana',
    descripcion: 'Sección institucional para la consulta y participación de la ciudadanía.',
    url: 'https://www.sanpedro-valle.gov.co/tema/consulta-ciudadana'
  },
  {
    categoria: 'Control social',
    titulo: 'Control ciudadano',
    descripcion: 'Información sobre modalidades, mecanismos y ejercicios de control social.',
    url: 'https://www.sanpedro-valle.gov.co/control-ciudadano/control-ciudadano-631934'
  },
  {
    categoria: 'Transparencia',
    titulo: 'Rendición de cuentas',
    descripcion: 'Información pública sobre gestión, diálogo y evaluación de la administración.',
    url: 'https://www.sanpedro-valle.gov.co/tema/control'
  },
  {
    categoria: 'Datos',
    titulo: 'Datos abiertos publicados por el municipio',
    descripcion: 'Conjuntos de datos e información generada por las dependencias municipales.',
    url: 'https://www.sanpedro-valle.gov.co/datos-abiertos/datos-abiertos-publicados-por-el-municipio'
  },
  {
    categoria: 'Desarrollo económico',
    titulo: 'San Pedro Impulsa',
    descripcion: 'Espacio institucional orientado a la reactivación y fortalecimiento de la economía municipal.',
    url: 'https://www.sanpedro-valle.gov.co/tema/san-pedro-emprendedora'
  },
  {
    categoria: 'Juventud',
    titulo: 'Consejo Municipal de Juventud',
    descripcion: 'Información institucional sobre participación y representación juvenil.',
    url: 'https://www.sanpedro-valle.gov.co/instancias-de-participacion/eleccion-de-consejo-municipal-de-juventud'
  },
  {
    categoria: 'Gobierno digital',
    titulo: 'Plan de Mantenimiento de Servicios Tecnológicos 2024–2027',
    descripcion: 'Planeación institucional para mantener y fortalecer los servicios tecnológicos.',
    url: 'https://www.sanpedro-valle.gov.co/planes/plan-de-mantenimiento-de-servicios-tecnologicos-periodo'
  },
  {
    categoria: 'Integridad',
    titulo: 'Programa de Transparencia y Ética Pública 2026',
    descripcion: 'Instrumento institucional de transparencia, integridad y prevención de riesgos.',
    url: 'https://www.sanpedro-valle.gov.co/planes/programa-de-transparencia-y-etica-publica-vigencia-2026'
  },
  {
    categoria: 'Ambiente',
    titulo: 'Plan de Austeridad del Gasto Público y Gestión Ambiental 2026–2027',
    descripcion: 'Acciones institucionales asociadas con austeridad, uso eficiente de recursos y gestión ambiental.',
    url: 'https://www.sanpedro-valle.gov.co/planes/plan-de-austeridad-del-gasto-publico-y-gestion-ambiental'
  },
  {
    categoria: 'Gestión documental',
    titulo: 'Plan de Conservación Documental 2026',
    descripcion: 'Lineamientos municipales para preservar la información y memoria institucional.',
    url: 'https://www.sanpedro-valle.gov.co/planes/plan-de-conservacion-documental-de-la-alcaldia-municipal'
  },
  {
    categoria: 'Bienestar social',
    titulo: 'Secretaría de Salud, Protección y Bienestar Social',
    descripcion: 'Dependencia encargada de orientar planes, programas y proyectos del sector social y de salud.',
    url: 'https://www.sanpedro-valle.gov.co/directorio-institucional/secretaria-de-salud-proteccion-y-bienestar-social'
  },
  {
    categoria: 'Trámites',
    titulo: 'Impuesto predial unificado',
    descripcion: 'Información institucional sobre el trámite y acceso al servicio tributario.',
    url: 'https://www.sanpedro-valle.gov.co/tramites-y-servicios/impuesto-predial-unificado'
  },
  {
    categoria: 'Proyectos',
    titulo: 'Proyectos del Plan de Desarrollo Municipal',
    descripcion: 'Sección de consulta sobre proyectos municipales asociados al Plan de Desarrollo.',
    url: 'https://www.sanpedro-valle.gov.co/proyectos-en-ejecucion/proyectos-del-plan-de-desarrollo-municipal'
  },
  {
    categoria: 'Participación',
    titulo: 'Menú Participa del municipio',
    descripcion: 'Punto de acceso a mecanismos, instancias y contenidos de participación ciudadana.',
    url: 'https://www.sanpedro-valle.gov.co/tema/participa'
  },
  {
    categoria: 'Participación en salud',
    titulo: 'Comité de Participación Comunitaria Municipal – COPACO',
    descripcion: 'Información sobre la instancia comunitaria de participación en el sector salud.',
    url: 'https://www.sanpedro-valle.gov.co/instancias-de-participacion/reactivacion-del-comite-de-participacion-comunitaria'
  },
  {
    categoria: 'Control y derechos',
    titulo: 'Personería Municipal',
    descripcion: 'Sección institucional relacionada con la protección de derechos y el control ciudadano.',
    url: 'https://www.sanpedro-valle.gov.co/tema/personeria-municipal'
  },
  {
    categoria: 'Integridad',
    titulo: 'Plan Anual de Integridad 2026–2027',
    descripcion: 'Hoja de ruta para fortalecer la cultura ética, la transparencia y el comportamiento íntegro.',
    url: 'https://www.sanpedro-valle.gov.co/planes/plan-anual-de-integridad-periodo-20262027-alcaldia-municipal'
  },
  {
    categoria: 'Innovación institucional',
    titulo: 'Plan Anual de Gestión del Conocimiento e Innovación',
    descripcion: 'Instrumento para identificar, compartir y aplicar conocimiento generado en la Alcaldía.',
    url: 'https://www.sanpedro-valle.gov.co/planes/plan-anual-de-gestion-del-conocimiento-e-innovacion'
  }
];

const problematicas = [
  {
    id: 'problematica-informacion-territorial',
    codigo: 'PRO-2026-001', vigencia: 2026,
    titulo: 'Información municipal oportuna para barrios, corregimientos y veredas',
    tema: 'Gobierno abierto y comunicación', territorio: 'Todo el municipio',
    preguntaOrientadora: '¿Cómo podemos lograr que la ciudadanía conozca de manera clara y oportuna los programas, convocatorias, servicios y espacios de participación de la Alcaldía?',
    resumen: 'La información institucional se publica en diferentes canales, pero existen ciudadanos que requieren rutas más sencillas, formatos comprensibles y mecanismos de difusión adaptados a las dinámicas urbanas y rurales.',
    antecedentes: 'La Alcaldía dispone de portal web, secciones de participación, noticias, planes y documentos. La consulta busca identificar qué canales consulta la comunidad, qué barreras encuentra y qué formatos facilitarían el acceso a la información.',
    datosClave: 'Fuentes de referencia: Plan de Desarrollo Municipal 2024–2027, Plan de Acción 2026, Consulta Ciudadana, Rendición de Cuentas y Datos Abiertos.',
    poblacion: 'Habitantes de la cabecera municipal, corregimientos, veredas, organizaciones comunitarias y ciudadanía interesada.',
    dependenciaResponsable: 'Administración Municipal – Gobierno Digital y Participación Ciudadana',
    fechaCierreConsulta: '2026-09-30',
    enlaceDiagnostico: 'https://www.sanpedro-valle.gov.co/planes/plan-de-accion-municipal-de-san-pedro-valle-del-cauca',
    estadoProblematica: 'Convertida en reto', estadoPublicacion: 'publicado', fechaPublicacion: '2026-07-30'
  },
  {
    id: 'problematica-tramites-digitales',
    codigo: 'PRO-2026-002', vigencia: 2026,
    titulo: 'Trámites y servicios digitales más claros y fáciles de usar',
    tema: 'Gobierno digital y servicios', territorio: 'Todo el municipio',
    preguntaOrientadora: '¿Qué cambios facilitarían encontrar, comprender y realizar los trámites y servicios municipales?',
    resumen: 'La ciudadanía necesita identificar rápidamente requisitos, costos, horarios, canales, responsables y pasos de cada trámite, especialmente cuando utiliza dispositivos móviles.',
    antecedentes: 'El portal municipal publica trámites, servicios tributarios y documentos institucionales. Esta consulta busca priorizar mejoras de lenguaje claro, navegación, accesibilidad y acompañamiento ciudadano.',
    datosClave: 'Fuentes de referencia: Plan de Mantenimiento de Servicios Tecnológicos 2024–2027, trámites y servicios del portal e impuesto predial unificado.',
    poblacion: 'Ciudadanía usuaria de trámites, contribuyentes, comerciantes, población rural y personas con necesidades de accesibilidad.',
    dependenciaResponsable: 'Administración Municipal – Gobierno Digital y dependencias responsables de trámites',
    fechaCierreConsulta: '2026-10-15',
    enlaceDiagnostico: 'https://www.sanpedro-valle.gov.co/planes/plan-de-mantenimiento-de-servicios-tecnologicos-periodo',
    estadoProblematica: 'Convertida en reto', estadoPublicacion: 'publicado', fechaPublicacion: '2026-07-30'
  },
  {
    id: 'problematica-emprendimiento-local',
    codigo: 'PRO-2026-003', vigencia: 2026,
    titulo: 'Fortalecimiento de emprendimientos, comercio local y experiencias turísticas',
    tema: 'Desarrollo económico y turismo', territorio: 'Todo el municipio',
    preguntaOrientadora: '¿Cómo podemos conectar mejor a emprendedores, productores, comerciantes y prestadores turísticos con clientes, formación y oportunidades institucionales?',
    resumen: 'El municipio cuenta con iniciativas y capacidades productivas que pueden fortalecerse mediante visibilidad, colaboración, formación, encadenamientos y herramientas digitales sencillas.',
    antecedentes: 'La sección San Pedro Impulsa promueve la reactivación económica y el portal ha divulgado programas para fortalecer competencias del sector turístico.',
    datosClave: 'Se requieren propuestas de bajo costo, sostenibles y adaptadas a negocios urbanos y rurales.',
    poblacion: 'Emprendedores, comerciantes, productores, asociaciones, artesanos, prestadores turísticos y consumidores.',
    dependenciaResponsable: 'Administración Municipal – Desarrollo Económico y áreas relacionadas',
    fechaCierreConsulta: '2026-10-31',
    enlaceDiagnostico: 'https://www.sanpedro-valle.gov.co/tema/san-pedro-emprendedora',
    estadoProblematica: 'En consulta', estadoPublicacion: 'publicado', fechaPublicacion: '2026-07-30'
  },
  {
    id: 'problematica-juventud-participa',
    codigo: 'PRO-2026-004', vigencia: 2026,
    titulo: 'Participación juvenil cercana, creativa y permanente',
    tema: 'Juventud y participación', territorio: 'Todo el municipio',
    preguntaOrientadora: '¿Qué espacios, canales y actividades harían que más jóvenes participen en las decisiones y proyectos del municipio?',
    resumen: 'La participación juvenil requiere formatos ágiles, comunicación cercana, espacios seguros y oportunidades reales para formular, votar y desarrollar iniciativas.',
    antecedentes: 'El municipio ha divulgado información relacionada con el Consejo Municipal de Juventud y espacios de participación para jóvenes.',
    datosClave: 'La consulta prioriza ideas desarrollables con instituciones educativas, organizaciones juveniles y comunidades.',
    poblacion: 'Adolescentes y jóvenes, organizaciones juveniles, instituciones educativas, familias y actores comunitarios.',
    dependenciaResponsable: 'Administración Municipal – Juventud, Desarrollo Comunitario y Educación',
    fechaCierreConsulta: '2026-11-15',
    enlaceDiagnostico: 'https://www.sanpedro-valle.gov.co/instancias-de-participacion/eleccion-de-consejo-municipal-de-juventud',
    estadoProblematica: 'En consulta', estadoPublicacion: 'publicado', fechaPublicacion: '2026-07-30'
  },
  {
    id: 'problematica-control-social',
    codigo: 'PRO-2026-005', vigencia: 2026,
    titulo: 'Seguimiento ciudadano sencillo a compromisos, decisiones y proyectos',
    tema: 'Transparencia y control social', territorio: 'Todo el municipio',
    preguntaOrientadora: '¿Cómo presentar el avance de compromisos y decisiones públicas de forma visual, comprensible y verificable?',
    resumen: 'La ciudadanía necesita consultar qué se decidió, quién responde, cuáles son los plazos, qué avances existen y dónde están las evidencias.',
    antecedentes: 'El portal cuenta con secciones de Control Ciudadano, Rendición de Cuentas y Datos Abiertos. La problemática busca integrar la información en una experiencia más clara y trazable.',
    datosClave: 'La solución debe utilizar texto, porcentaje, semáforo, fechas y evidencias; el color no puede ser la única señal.',
    poblacion: 'Ciudadanía, veedurías, organizaciones sociales, juntas de acción comunal, medios y servidores públicos.',
    dependenciaResponsable: 'Administración Municipal – Control Interno, Planeación y Participación Ciudadana',
    fechaCierreConsulta: '2026-08-31',
    enlaceDiagnostico: 'https://www.sanpedro-valle.gov.co/control-ciudadano/control-ciudadano-631934',
    estadoProblematica: 'Convertida en reto', estadoPublicacion: 'publicado', fechaPublicacion: '2026-07-30'
  },
  {
    id: 'problematica-gestion-ambiental',
    codigo: 'PRO-2026-006', vigencia: 2026,
    titulo: 'Ideas comunitarias para el uso eficiente de recursos y el cuidado del entorno',
    tema: 'Ambiente y sostenibilidad', territorio: 'Todo el municipio',
    preguntaOrientadora: '¿Qué acciones colaborativas pueden ayudar a reducir desperdicios, cuidar espacios públicos y fortalecer hábitos ambientales?',
    resumen: 'La innovación comunitaria puede convertir acciones pequeñas y medibles en resultados sostenibles para la administración, los hogares y los espacios compartidos.',
    antecedentes: 'El Plan de Austeridad del Gasto Público y Gestión Ambiental 2026–2027 contiene acciones institucionales relacionadas con el uso eficiente de recursos y la gestión ambiental.',
    datosClave: 'Se priorizan propuestas de educación, medición, reutilización, mantenimiento, separación y apropiación comunitaria.',
    poblacion: 'Hogares, instituciones educativas, comerciantes, organizaciones ambientales y comunidad en general.',
    dependenciaResponsable: 'Administración Municipal – Planeación y dependencias con competencias ambientales',
    fechaCierreConsulta: '2026-11-30',
    enlaceDiagnostico: 'https://www.sanpedro-valle.gov.co/planes/plan-de-austeridad-del-gasto-publico-y-gestion-ambiental',
    estadoProblematica: 'En consulta', estadoPublicacion: 'publicado', fechaPublicacion: '2026-07-30'
  },
  {
    id: 'problematica-bienestar-social',
    codigo: 'PRO-2026-007', vigencia: 2026,
    titulo: 'Información y orientación cercana sobre programas sociales y de bienestar',
    tema: 'Salud y bienestar social', territorio: 'Todo el municipio',
    preguntaOrientadora: '¿Cómo facilitar que las personas conozcan los programas sociales, requisitos, fechas y canales de atención que les corresponden?',
    resumen: 'La diversidad de programas y poblaciones requiere rutas de orientación comprensibles, actualizadas y accesibles para disminuir desplazamientos y pérdida de oportunidades.',
    antecedentes: 'La Secretaría de Salud, Protección y Bienestar Social orienta planes, programas y proyectos del sector y el portal publica convocatorias e información para distintos grupos poblacionales.',
    datosClave: 'La consulta no reemplaza los canales oficiales de atención; busca cocrear herramientas de orientación y divulgación.',
    poblacion: 'Personas mayores, familias, cuidadores, población vulnerable, organizaciones y ciudadanía en general.',
    dependenciaResponsable: 'Secretaría de Salud, Protección y Bienestar Social',
    fechaCierreConsulta: '2026-12-15',
    enlaceDiagnostico: 'https://www.sanpedro-valle.gov.co/directorio-institucional/secretaria-de-salud-proteccion-y-bienestar-social',
    estadoProblematica: 'En consulta', estadoPublicacion: 'publicado', fechaPublicacion: '2026-07-30'
  },
  {
    id: 'problematica-memoria-publica',
    codigo: 'PRO-2026-008', vigencia: 2026,
    titulo: 'Memoria pública y consulta organizada de documentos municipales',
    tema: 'Gestión documental y conocimiento', territorio: 'Todo el municipio',
    preguntaOrientadora: '¿Cómo organizar documentos, actas, resultados y evidencias para que la ciudadanía pueda encontrarlos y comprenderlos con facilidad?',
    resumen: 'La publicación de información debe conservar contexto, vigencia, responsable, fecha de actualización y relación con los procesos ciudadanos.',
    antecedentes: 'El Plan de Conservación Documental 2026 y el Plan Anual de Gestión del Conocimiento e Innovación orientan la preservación, organización y aprovechamiento de la información institucional.',
    datosClave: 'Se buscan ideas de clasificación, buscadores, fichas de lectura, líneas de tiempo e históricos descargables.',
    poblacion: 'Ciudadanía, estudiantes, investigadores, organizaciones sociales, veedurías y servidores públicos.',
    dependenciaResponsable: 'Administración Municipal – Gestión Documental y Gobierno Digital',
    fechaCierreConsulta: '2026-12-15',
    enlaceDiagnostico: 'https://www.sanpedro-valle.gov.co/planes/plan-anual-de-gestion-del-conocimiento-e-innovacion',
    estadoProblematica: 'En consulta', estadoPublicacion: 'publicado', fechaPublicacion: '2026-07-30'
  }
];

const retos = [
  {
    id: 'reto-informacion-cercana-2026',
    codigo: 'RET-2026-001', vigencia: 2026,
    problematicaId: 'problematica-informacion-territorial', problematicaCodigo: 'PRO-2026-001',
    titulo: 'San Pedro Conecta: información pública cercana a cada territorio',
    preguntaReto: '¿Cómo podemos hacer que la información municipal llegue de manera clara, útil y oportuna a barrios, corregimientos y veredas?',
    descripcion: 'Convocatoria abierta para diseñar soluciones de comunicación y orientación ciudadana que integren canales digitales, comunitarios y presenciales.',
    objetivo: 'Cocrear y probar una solución replicable que facilite conocer convocatorias, programas, servicios, fechas y espacios de participación.',
    tema: 'Gobierno abierto y comunicación', territorio: 'Todo el municipio',
    poblacionObjetivo: 'Ciudadanía urbana y rural, juntas de acción comunal, organizaciones y servidores públicos.',
    modalidad: 'Mixta',
    participantesHabilitados: 'Personas mayores de 14 años, organizaciones, grupos comunitarios, instituciones educativas, emprendedores y equipos interdisciplinarios.',
    requisitos: 'Presentar una solución comprensible, viable, inclusiva y aplicable en San Pedro. Puede ser digital, presencial o combinada. Debe explicar beneficiarios, actividades, recursos e impacto esperado.',
    criteriosEvaluacion: 'Pertinencia frente al problema|25\nImpacto ciudadano|25\nViabilidad técnica y operativa|20\nAccesibilidad e inclusión|15\nInnovación y posibilidad de réplica|10\nVotación ciudadana|5',
    dependenciaResponsable: 'Administración Municipal – Gobierno Digital y Participación Ciudadana',
    contacto: 'Equipo de Participación Ciudadana', correoContacto: 'adminterritorial@sanpedro-valle.gov.co',
    enlaceBases: 'https://www.sanpedro-valle.gov.co/planes/plan-de-accion-municipal-de-san-pedro-valle-del-cauca',
    fechaApertura: '2026-08-03', fechaCierrePropuestas: '2026-09-04',
    fechaInicioVotacion: '2026-09-07', fechaCierreVotacion: '2026-09-18',
    fechaSeleccion: '2026-09-25', fechaPublicacionPlan: '2026-10-02', fechaCierreImplementacion: '2026-12-18',
    frecuenciaReporte: 'Semanal durante la votación', estadoReto: 'Recibiendo propuestas',
    estadoPublicacion: 'publicado', fechaPublicacion: '2026-07-30', destacado: 'Sí',
    propuestaSeleccionadaId: '', propuestaSeleccionadaCodigo: '', justificacionSeleccion: '', resultadoCriterios: '', enlaceActaSeleccion: ''
  },
  {
    id: 'reto-tramites-claros-2026',
    codigo: 'RET-2026-002', vigencia: 2026,
    problematicaId: 'problematica-tramites-digitales', problematicaCodigo: 'PRO-2026-002',
    titulo: 'Trámites claros: una ruta ciudadana fácil de entender',
    preguntaReto: '¿Cómo podemos explicar y organizar los trámites municipales para que cualquier persona encuentre rápidamente qué necesita y qué debe hacer?',
    descripcion: 'Reto para crear una experiencia de orientación con lenguaje claro, pasos visibles, accesibilidad y navegación adaptada a celulares.',
    objetivo: 'Diseñar un prototipo de ruta ciudadana que reduzca dudas, desplazamientos innecesarios y errores al preparar trámites.',
    tema: 'Gobierno digital y servicios', territorio: 'Todo el municipio',
    poblacionObjetivo: 'Personas usuarias de trámites y servicios, comerciantes, contribuyentes, población rural y cuidadores.',
    modalidad: 'Virtual',
    participantesHabilitados: 'Ciudadanía, estudiantes, diseñadores, desarrolladores, servidores públicos, organizaciones y equipos comunitarios.',
    requisitos: 'La propuesta debe incluir un ejemplo funcional o boceto, lenguaje claro, opción móvil y mecanismos de accesibilidad.',
    criteriosEvaluacion: 'Claridad para la ciudadanía|25\nFacilidad de uso|20\nAccesibilidad|20\nViabilidad|20\nInnovación|10\nVotación ciudadana|5',
    dependenciaResponsable: 'Administración Municipal – Gobierno Digital',
    contacto: 'Equipo de Gobierno Digital', correoContacto: 'adminterritorial@sanpedro-valle.gov.co',
    enlaceBases: 'https://www.sanpedro-valle.gov.co/planes/plan-de-mantenimiento-de-servicios-tecnologicos-periodo',
    fechaApertura: '2026-08-10', fechaCierrePropuestas: '2026-09-18',
    fechaInicioVotacion: '2026-09-21', fechaCierreVotacion: '2026-10-02',
    fechaSeleccion: '2026-10-09', fechaPublicacionPlan: '2026-10-16', fechaCierreImplementacion: '2027-02-26',
    frecuenciaReporte: 'Semanal durante la votación', estadoReto: 'Recibiendo propuestas',
    estadoPublicacion: 'publicado', fechaPublicacion: '2026-07-30', destacado: 'No',
    propuestaSeleccionadaId: '', propuestaSeleccionadaCodigo: '', justificacionSeleccion: '', resultadoCriterios: '', enlaceActaSeleccion: ''
  },
  {
    id: 'reto-control-visual-2026',
    codigo: 'RET-2026-003', vigencia: 2026,
    problematicaId: 'problematica-control-social', problematicaCodigo: 'PRO-2026-005',
    titulo: 'Control ciudadano visual: ¿cómo quiere consultar los avances?',
    preguntaReto: '¿Cuál alternativa facilita más el seguimiento ciudadano a compromisos, decisiones y proyectos?',
    descripcion: 'Votación pública de alternativas iniciales para organizar el seguimiento con estados, porcentajes, fechas, responsables y evidencias.',
    objetivo: 'Seleccionar la alternativa de visualización más comprensible para la ciudadanía y utilizar el resultado como insumo del prototipo público.',
    tema: 'Transparencia y control social', territorio: 'Todo el municipio',
    poblacionObjetivo: 'Ciudadanía, veedurías, juntas de acción comunal, organizaciones y medios.',
    modalidad: 'Virtual',
    participantesHabilitados: 'Cualquier ciudadano con cuenta de Google.',
    requisitos: 'Revisar las alternativas publicadas y registrar un solo voto. El voto ciudadano se integra con criterios de claridad, accesibilidad y viabilidad.',
    criteriosEvaluacion: 'Claridad de la información|30\nFacilidad de consulta|25\nAccesibilidad|20\nViabilidad institucional|15\nVotación ciudadana|10',
    dependenciaResponsable: 'Administración Municipal – Planeación, Control y Participación Ciudadana',
    contacto: 'Equipo de Participación Ciudadana', correoContacto: 'adminterritorial@sanpedro-valle.gov.co',
    enlaceBases: 'https://www.sanpedro-valle.gov.co/control-ciudadano/control-ciudadano-631934',
    fechaApertura: '2026-07-30', fechaCierrePropuestas: '2026-07-30',
    fechaInicioVotacion: '2026-07-31', fechaCierreVotacion: '2026-08-21',
    fechaSeleccion: '2026-08-28', fechaPublicacionPlan: '2026-09-04', fechaCierreImplementacion: '2026-11-30',
    frecuenciaReporte: 'Semanal, con corte cada viernes', estadoReto: 'En votación',
    estadoPublicacion: 'publicado', fechaPublicacion: '2026-07-30', destacado: 'Sí',
    propuestaSeleccionadaId: '', propuestaSeleccionadaCodigo: '', justificacionSeleccion: '', resultadoCriterios: '', enlaceActaSeleccion: ''
  },
  {
    id: 'reto-emprendimiento-2026',
    codigo: 'RET-2026-004', vigencia: 2026,
    problematicaId: 'problematica-emprendimiento-local', problematicaCodigo: 'PRO-2026-003',
    titulo: 'San Pedro Impulsa en red: visibilidad y colaboración para la economía local',
    preguntaReto: '¿Cómo podemos conectar y visibilizar mejor la oferta de emprendedores, productores, comerciantes y experiencias turísticas del municipio?',
    descripcion: 'Convocatoria próxima para diseñar una herramienta o estrategia colaborativa que facilite descubrir, contactar y apoyar la oferta local.',
    objetivo: 'Construir una solución sencilla que fortalezca la circulación de información comercial y las conexiones entre actores económicos locales.',
    tema: 'Desarrollo económico y turismo', territorio: 'Todo el municipio',
    poblacionObjetivo: 'Emprendedores, comerciantes, productores, asociaciones, artesanos y prestadores turísticos.',
    modalidad: 'Mixta',
    participantesHabilitados: 'Ciudadanía, negocios, asociaciones, estudiantes, organizaciones y equipos creativos.',
    requisitos: 'La convocatoria detallada será publicada antes de la apertura.',
    criteriosEvaluacion: 'Impacto económico local|30\nViabilidad|25\nFacilidad de uso|20\nCobertura territorial|15\nInnovación|10',
    dependenciaResponsable: 'Administración Municipal – Desarrollo Económico',
    contacto: 'Equipo San Pedro Impulsa', correoContacto: 'adminterritorial@sanpedro-valle.gov.co',
    enlaceBases: 'https://www.sanpedro-valle.gov.co/tema/san-pedro-emprendedora',
    fechaApertura: '2026-10-01', fechaCierrePropuestas: '2026-11-13',
    fechaInicioVotacion: '2026-11-16', fechaCierreVotacion: '2026-11-27',
    fechaSeleccion: '2026-12-04', fechaPublicacionPlan: '2026-12-11', fechaCierreImplementacion: '2027-04-30',
    frecuenciaReporte: 'Semanal durante la votación', estadoReto: 'Próximo',
    estadoPublicacion: 'publicado', fechaPublicacion: '2026-07-30', destacado: 'No',
    propuestaSeleccionadaId: '', propuestaSeleccionadaCodigo: '', justificacionSeleccion: '', resultadoCriterios: '', enlaceActaSeleccion: ''
  },
  {
    id: 'reto-laboratorio-piloto-2026',
    codigo: 'RET-2026-005', vigencia: 2026,
    problematicaId: 'problematica-control-social', problematicaCodigo: 'PRO-2026-005',
    titulo: 'Piloto institucional: Laboratorio de Ideas Ciudadanas',
    preguntaReto: '¿Cómo integrar en un solo espacio el diagnóstico, los retos, las propuestas, las votaciones, las decisiones, los planes y los prototipos?',
    descripcion: 'Ejercicio piloto institucional para organizar el ciclo completo de colaboración e innovación y habilitar nuevos procesos de cocreación pública.',
    objetivo: 'Poner en funcionamiento un prototipo público, accesible y trazable que permita desarrollar los futuros retos del municipio.',
    tema: 'Participación, transparencia e innovación pública', territorio: 'Todo el municipio',
    poblacionObjetivo: 'Ciudadanía, organizaciones, veedurías, servidores públicos y equipos de innovación.',
    modalidad: 'Virtual',
    participantesHabilitados: 'Equipo institucional y ciudadanía durante las pruebas de experiencia.',
    requisitos: 'Cumplimiento de los componentes de Colaboración e Innovación del Menú Participa, accesibilidad, trazabilidad y protección de datos.',
    criteriosEvaluacion: 'Cobertura de criterios ITA|30\nUsabilidad y accesibilidad|25\nTrazabilidad del ciclo|20\nViabilidad técnica|15\nCapacidad de mejora continua|10',
    dependenciaResponsable: 'Administración Municipal – Gobierno Digital y Participación Ciudadana',
    contacto: 'Equipo administrador del laboratorio', correoContacto: 'adminterritorial@sanpedro-valle.gov.co',
    enlaceBases: 'https://www.sanpedro-valle.gov.co/tema/consulta-ciudadana',
    fechaApertura: '2026-07-01', fechaCierrePropuestas: '2026-07-10',
    fechaInicioVotacion: '2026-07-11', fechaCierreVotacion: '2026-07-15',
    fechaSeleccion: '2026-07-16', fechaPublicacionPlan: '2026-07-20', fechaCierreImplementacion: '2026-09-30',
    frecuenciaReporte: 'Al cierre del piloto', estadoReto: 'En implementación',
    estadoPublicacion: 'publicado', fechaPublicacion: '2026-07-20', destacado: 'No',
    propuestaSeleccionadaId: 'propuesta-san-pedro-innova', propuestaSeleccionadaCodigo: 'SOL-2026-005A',
    justificacionSeleccion: 'La propuesta integra en un único micrositio el ciclo completo de innovación abierta, incorpora participación pública, autenticación, trazabilidad, indicadores, publicación de resultados y criterios de accesibilidad.',
    resultadoCriterios: 'Cobertura ITA: 30/30\nUsabilidad y accesibilidad: 23/25\nTrazabilidad: 20/20\nViabilidad técnica: 14/15\nMejora continua: 9/10\nPuntaje total: 96/100',
    enlaceActaSeleccion: ''
  }
];

const propuestas = [
  {
    id: 'propuesta-semaforo-compromisos',
    codigo: 'SOL-2026-003A', vigencia: 2026,
    retoId: 'reto-control-visual-2026', retoCodigo: 'RET-2026-003',
    titulo: 'Semáforo ciudadano de compromisos', autorNombre: 'Alternativa inicial para deliberación', organizacion: 'Laboratorio de Ideas Ciudadanas', territorio: 'Todo el municipio',
    resumen: 'Tablero de tarjetas con estado textual, color accesible, porcentaje, responsable, plazo y evidencia de cada compromiso.',
    descripcion: 'La ciudadanía consulta un listado filtrable. Cada compromiso muestra una barra de avance y un semáforo: en análisis, adoptado, en ejecución, cumplido o no adoptado. Al abrirlo se visualizan fundamentos, actividades, fechas y evidencias.',
    beneficiarios: 'Ciudadanía, veedurías, organizaciones, medios y dependencias municipales.',
    impactoEsperado: 'Comprensión rápida del estado de cada decisión y reducción del tiempo requerido para localizar evidencias.',
    recursos: 'Micrositio, actualización institucional periódica y enlaces a documentos públicos.',
    viabilidad: 'Puede implementarse sobre la infraestructura web y Firebase ya disponibles.',
    tiempoImplementacion: '8 semanas',
    innovacion: 'Integra visualización, trazabilidad y accesibilidad en una ficha única y reutilizable.',
    enlaceAnexo: '', autorizacionPublicacion: true, estadoModeracion: 'aprobada', estadoPublicacion: 'publicado',
    seleccionada: false, votosPublicados: 0, porcentajeVotacion: 0, puntajeFinal: 0,
    justificacionSeleccion: '', resultadoCriterios: '', fechaSeleccion: '', enlaceActaSeleccion: '', origen: 'san_pedro_innova'
  },
  {
    id: 'propuesta-mapa-territorial',
    codigo: 'SOL-2026-003B', vigencia: 2026,
    retoId: 'reto-control-visual-2026', retoCodigo: 'RET-2026-003',
    titulo: 'Mapa territorial de avances', autorNombre: 'Alternativa inicial para deliberación', organizacion: 'Laboratorio de Ideas Ciudadanas', territorio: 'Todo el municipio',
    resumen: 'Mapa interactivo para consultar compromisos y proyectos según barrio, corregimiento o vereda.',
    descripcion: 'El usuario selecciona un territorio y visualiza decisiones, actividades, avance, dependencia responsable y evidencias asociadas. El mapa se complementa con una lista accesible para personas que no utilizan la visualización geográfica.',
    beneficiarios: 'Comunidades urbanas y rurales, juntas de acción comunal y ciudadanía interesada en su territorio.',
    impactoEsperado: 'Mayor apropiación territorial de la información y facilidad para comparar avances por zona.',
    recursos: 'Base territorial, ubicación aproximada de actuaciones, micrositio y actualización de datos.',
    viabilidad: 'Requiere una fase de consolidación y validación de información geográfica.',
    tiempoImplementacion: '12 semanas',
    innovacion: 'Relaciona el seguimiento institucional con la ubicación y el contexto comunitario.',
    enlaceAnexo: '', autorizacionPublicacion: true, estadoModeracion: 'aprobada', estadoPublicacion: 'publicado',
    seleccionada: false, votosPublicados: 0, porcentajeVotacion: 0, puntajeFinal: 0,
    justificacionSeleccion: '', resultadoCriterios: '', fechaSeleccion: '', enlaceActaSeleccion: '', origen: 'san_pedro_innova'
  },
  {
    id: 'propuesta-boletin-mensual',
    codigo: 'SOL-2026-003C', vigencia: 2026,
    retoId: 'reto-control-visual-2026', retoCodigo: 'RET-2026-003',
    titulo: 'Boletín mensual de decisiones y avances', autorNombre: 'Alternativa inicial para deliberación', organizacion: 'Laboratorio de Ideas Ciudadanas', territorio: 'Todo el municipio',
    resumen: 'Resumen mensual imprimible y compartible con las principales decisiones, compromisos, avances y próximos hitos.',
    descripcion: 'El boletín combina una página web con versión PDF para carteleras, organizaciones comunitarias y difusión por mensajería. Cada edición conserva enlaces a las evidencias completas.',
    beneficiarios: 'Personas con conectividad limitada, organizaciones comunitarias, población mayor y ciudadanía en general.',
    impactoEsperado: 'Ampliar el alcance de la información y facilitar su circulación en canales digitales y físicos.',
    recursos: 'Plantilla editorial, consolidación mensual y distribución por canales institucionales y comunitarios.',
    viabilidad: 'Alta; utiliza información ya registrada en el tablero y la transforma en un resumen periódico.',
    tiempoImplementacion: '6 semanas',
    innovacion: 'Conecta los datos del micrositio con formatos de circulación comunitaria y lectura rápida.',
    enlaceAnexo: '', autorizacionPublicacion: true, estadoModeracion: 'aprobada', estadoPublicacion: 'publicado',
    seleccionada: false, votosPublicados: 0, porcentajeVotacion: 0, puntajeFinal: 0,
    justificacionSeleccion: '', resultadoCriterios: '', fechaSeleccion: '', enlaceActaSeleccion: '', origen: 'san_pedro_innova'
  },
  {
    id: 'propuesta-san-pedro-innova',
    codigo: 'SOL-2026-005A', vigencia: 2026,
    retoId: 'reto-laboratorio-piloto-2026', retoCodigo: 'RET-2026-005',
    titulo: 'San Pedro Innova: laboratorio digital de cocreación pública', autorNombre: 'Equipo institucional de Gobierno Digital y Participación', organizacion: 'Alcaldía Municipal de San Pedro', territorio: 'Todo el municipio',
    resumen: 'Micrositio que reúne problemáticas, retos, propuestas, votaciones, selección, planes, prototipos, históricos e indicadores administrativos.',
    descripcion: 'La solución organiza el ciclo de innovación abierta con una vista pública y un panel restringido. Permite consultar información oficial, participar, realizar seguimiento y publicar evidencias verificables.',
    beneficiarios: 'Ciudadanía, organizaciones, veedurías, equipos institucionales y órganos de control.',
    impactoEsperado: 'Aumentar la trazabilidad de la participación y disponer de evidencia organizada para la mejora institucional y el cumplimiento del Menú Participa.',
    recursos: 'GitHub Pages, Firebase Authentication, Cloud Firestore y administración de contenidos.',
    viabilidad: 'Utiliza servicios ya disponibles y una arquitectura estática de bajo mantenimiento.',
    tiempoImplementacion: '12 semanas',
    innovacion: 'Integra el ciclo completo de colaboración e innovación en una experiencia accesible y basada en datos.',
    enlaceAnexo: '', autorizacionPublicacion: true, estadoModeracion: 'aprobada', estadoPublicacion: 'publicado',
    seleccionada: true, votosPublicados: 0, porcentajeVotacion: 0, puntajeFinal: 96,
    justificacionSeleccion: 'Fue la alternativa con mayor cobertura normativa, trazabilidad, viabilidad técnica y capacidad de mejora continua.',
    resultadoCriterios: 'Cobertura ITA: 30/30\nUsabilidad y accesibilidad: 23/25\nTrazabilidad: 20/20\nViabilidad técnica: 14/15\nMejora continua: 9/10',
    fechaSeleccion: '2026-07-16', enlaceActaSeleccion: '', origen: 'san_pedro_innova'
  }
];

const reportes = [
  {
    id: 'corte-apertura-control-visual',
    codigo: 'COR-2026-001', vigencia: 2026,
    retoId: 'reto-control-visual-2026', retoCodigo: 'RET-2026-003',
    fechaCorte: '2026-07-30', frecuencia: 'Semanal', totalVotos: 0,
    notaPublica: 'Corte de apertura. La votación inicia con tres alternativas habilitadas y un voto permitido por persona.',
    resultados: [
      { propuestaId: 'propuesta-semaforo-compromisos', propuestaCodigo: 'SOL-2026-003A', propuestaTitulo: 'Semáforo ciudadano de compromisos', votos: 0 },
      { propuestaId: 'propuesta-mapa-territorial', propuestaCodigo: 'SOL-2026-003B', propuestaTitulo: 'Mapa territorial de avances', votos: 0 },
      { propuestaId: 'propuesta-boletin-mensual', propuestaCodigo: 'SOL-2026-003C', propuestaTitulo: 'Boletín mensual de decisiones y avances', votos: 0 }
    ],
    estadoPublicacion: 'publicado', fechaPublicacion: '2026-07-30'
  }
];

const planes = [
  {
    id: 'plan-san-pedro-innova',
    codigo: 'PLA-2026-001', vigencia: 2026,
    retoId: 'reto-laboratorio-piloto-2026', retoCodigo: 'RET-2026-005',
    titulo: 'Implementación y puesta en marcha de San Pedro Innova',
    objetivo: 'Implementar, probar y publicar el Laboratorio de Ideas Ciudadanas como espacio permanente de colaboración e innovación abierta.',
    alcance: 'Configuración del micrositio, seguridad, contenido inicial, participación pública, panel administrativo, indicadores, pruebas y publicación institucional.',
    liderResponsable: 'Administración Municipal – Gobierno Digital y Participación Ciudadana',
    aliados: 'Dependencias municipales, organizaciones comunitarias, ciudadanía participante y equipos de control.',
    fechaInicio: '2026-07-20', fechaFin: '2026-09-30',
    presupuesto: 'Implementación con infraestructura tecnológica disponible; las actividades que requieran recursos adicionales se gestionarán según viabilidad y disponibilidad presupuestal.',
    frecuenciaSeguimiento: 'Quincenal',
    indicador: 'Porcentaje de componentes funcionales, publicados y verificados', meta: '100 % de los seis criterios de colaboración e innovación con evidencia pública',
    estadoPlan: 'En ejecución', porcentajeAvance: 70,
    riesgos: 'Demoras en la consolidación de información; baja participación inicial; falta de actualización periódica; enlaces de evidencias incompletos.',
    resultadosActuales: 'Micrositio funcional, autenticación con Google, gestión de problemáticas y retos, propuestas, votación, selección, planes, prototipos e indicadores.',
    enlacePlan: '',
    actividades: [
      { actividad: 'Diseño de arquitectura y experiencia pública', responsable: 'Gobierno Digital', fecha: '2026-07-24', estado: 'Cumplida', evidencia: '' },
      { actividad: 'Configuración de autenticación, reglas y panel administrativo', responsable: 'Equipo administrador', fecha: '2026-07-30', estado: 'Cumplida', evidencia: '' },
      { actividad: 'Carga de información oficial y apertura de consultas', responsable: 'Participación Ciudadana', fecha: '2026-08-05', estado: 'En ejecución', evidencia: '' },
      { actividad: 'Prueba ciudadana y ajustes de accesibilidad', responsable: 'Gobierno Digital y comunidad', fecha: '2026-08-28', estado: 'Programada', evidencia: '' },
      { actividad: 'Publicación institucional y divulgación', responsable: 'Comunicaciones', fecha: '2026-09-11', estado: 'Programada', evidencia: '' },
      { actividad: 'Primer informe de resultados y mejora', responsable: 'Equipo del laboratorio', fecha: '2026-09-30', estado: 'Programada', evidencia: '' }
    ],
    estadoPublicacion: 'publicado', fechaPublicacion: '2026-07-30'
  }
];

const prototipos = [
  {
    id: 'prototipo-san-pedro-innova-v1',
    codigo: 'PRT-2026-001', vigencia: 2026,
    retoId: 'reto-laboratorio-piloto-2026', retoCodigo: 'RET-2026-005',
    titulo: 'San Pedro Innova', version: '1.0', tipoPrototipo: 'Micrositio web y tablero de gestión', etapa: 'Piloto',
    fechaPrototipo: '2026-07-30',
    descripcion: 'Primera versión funcional del laboratorio digital para colaboración, innovación, participación y seguimiento público.',
    problemaResuelto: 'Dispersión de información y ausencia de un ciclo integrado para consultar problemáticas, convocar retos, recibir propuestas, votar, seleccionar, implementar y divulgar prototipos.',
    equipoResponsable: 'Administración Municipal – Gobierno Digital y Participación Ciudadana',
    resultadosPruebas: 'Navegación pública adaptable, formularios conectados con Firebase, autenticación con Google, votación única por reto, panel administrativo, indicadores y exportaciones.',
    observacionesRecibidas: 'Se priorizó que la interfaz pública no muestre instrucciones técnicas, que tenga acceso visible, logo municipal, lenguaje ciudadano y trazabilidad por etapas.',
    ajustesRealizados: 'Simplificación de textos, separación del panel administrativo, acceso con Google, semáforos accesibles, información inicial y centralización de indicadores.',
    siguientePaso: 'Publicar en GitHub Pages, activar la información base en Firestore, realizar prueba ciudadana y documentar mejoras en una versión 1.1.',
    imagenUrl: '', altImagen: 'Vista conceptual del Laboratorio de Ideas Ciudadanas San Pedro Innova',
    demoUrl: '', documentoTecnicoUrl: '', videoUrl: '', estadoPublicacion: 'publicado', fechaPublicacion: '2026-07-30'
  }
];

const DATOS_INICIALES = { problematicas, retos, propuestas, reportes, planes, prototipos };

export { DATOS_INICIALES, FUENTES_OFICIALES };
