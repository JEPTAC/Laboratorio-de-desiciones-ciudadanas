# San Pedro Innova — Laboratorio de Ideas Ciudadanas

Micrositio público e interactivo para GitHub Pages, conectado al proyecto Firebase `rendicion-de-cuentas-6aceb`.

## Contenido incluido desde la primera publicación

La vista pública no inicia vacía. Incluye una base informativa derivada de fuentes oficiales del municipio:

- 8 problemáticas municipales para consulta ciudadana.
- 5 retos de innovación abierta en diferentes fases.
- 4 propuestas iniciales para ilustrar el ciclo de participación.
- 1 reporte inicial de votación.
- 1 plan de trabajo con actividades y semáforo.
- 1 prototipo publicado.
- 20 fuentes oficiales enlazadas.

Los registros iniciales se muestran inmediatamente desde archivos locales. En el primer ingreso del superadministrador, la aplicación crea en Firestore únicamente los documentos faltantes y no sobrescribe información existente.

## Participación ciudadana

Sin iniciar sesión, cualquier visitante puede:

- Consultar problemáticas, retos, resultados, planes y prototipos publicados.
- Publicar una idea, pregunta o comentario en el tablero ciudadano.
- Buscar, filtrar, imprimir y descargar información pública.

Con una cuenta de Google, la ciudadanía puede:

- Aportar información a consultas específicas.
- Presentar propuestas a retos abiertos.
- Votar una vez por reto cuando la fase de votación esté activa.

## Administración centralizada

Solo el usuario reconocido como `super_admin` puede acceder al panel de administración, donde se visualizan:

- Indicadores generales y embudo de participación.
- Ideas, preguntas y comentarios del tablero público.
- Aportes a consultas.
- Propuestas recibidas.
- Votos por reto y cortes oficiales.
- Inscripciones a procesos de participación.
- Evaluaciones ciudadanas, satisfacción y recomendación.
- Gestión de problemáticas, retos, selección, planes y prototipos.
- Exportaciones CSV y registro de auditoría.

## Publicación

1. Suba el contenido de esta carpeta a la raíz de la rama `main`.
2. En GitHub Pages seleccione `main` y `/ (root)`.
3. Mantenga publicadas las reglas incluidas en `firestore.rules`.
4. En Firebase Authentication habilite Google.
5. Agregue el dominio de GitHub Pages en los dominios autorizados.
6. Verifique que la cuenta administrativa tenga rol `super_admin` mediante custom claims, `users/{uid}` o `users/{correo}`.
7. Ingrese una vez a `administracion.html`. La base inicial será creada automáticamente en Firestore cuando las colecciones de innovación estén vacías.

## Archivos principales

- `index.html`: portal público.
- `administracion.html`: panel privado con Google.
- `assets/js/datos-iniciales.js`: información municipal inicial y fuentes.
- `assets/js/publico.js`: consulta, tablero, aportes, propuestas y votos.
- `assets/js/admin.js`: gestión e indicadores centralizados.
- `firestore.rules`: reglas completas.
- `FUENTES-OFICIALES-INCLUIDAS.md`: inventario de fuentes utilizadas.
- `MAPA-CUMPLIMIENTO-ITA.md`: correspondencia funcional con los criterios ITA.

La aplicación no utiliza Firebase Storage. Las evidencias, documentos, imágenes y videos se publican mediante enlaces HTTPS.
