# Laboratorio de Ideas Ciudadanas — San Pedro, Valle del Cauca

Micrositio estático para GitHub Pages conectado al proyecto Firebase `rendicion-de-cuentas-6aceb`.

## Archivos principales

- `index.html`: tablero público de aportes, decisiones, fundamentos, avances y evidencias.
- `administracion.html`: ingreso con Google y gestión de decisiones para el superadministrador.
- `firestore.rules`: reglas completas fusionadas con la colección `participacionDecisiones`.
- `boton-menu-participa.txt`: fragmento de enlace para insertar en el portal institucional.

## Publicación en GitHub Pages

1. Subir todo el contenido de esta carpeta a la raíz de la rama `main`.
2. En **Settings → Pages**, seleccionar `main` y `/ (root)`.
3. Confirmar que el dominio `TU-USUARIO.github.io` esté autorizado en Firebase Authentication.
4. En Firebase Authentication, habilitar el proveedor **Google**.
5. Copiar el contenido de `firestore.rules` en **Firestore Database → Reglas** y publicar.

## Acceso administrativo

La cuenta de Google debe ser reconocida como `super_admin` mediante custom claims o mediante uno de estos documentos:

- `users/{uid}`
- `users/{correo}`

Campos mínimos:

```json
{
  "role": "super_admin",
  "active": true
}
```

## Colección nueva

`participacionDecisiones`

La ciudadanía solo puede consultar registros con `estadoPublicacion: "publicado"`. La creación, edición y eliminación están reservadas al superadministrador.
