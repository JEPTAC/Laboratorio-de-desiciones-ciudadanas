# Configuración Firebase

## 1. Firestore

Copie el contenido completo de `firestore.rules` en:

Firebase Console → Firestore Database → Reglas → Publicar.

## 2. Google Authentication

Firebase Console → Authentication → Sign-in method → Google → Habilitar.

Agregue el dominio de GitHub Pages en Authentication → Settings → Authorized domains.

## 3. Superadministrador

La cuenta administrativa debe estar reconocida mediante uno de estos mecanismos:

- Custom claim `role: "super_admin"`.
- Custom claim `super_admin: true`.
- Documento `users/{uid}` con `role: "super_admin"` y `active: true`.
- Documento legado `users/{correo}` con rol de superadministrador y estado activo.

## 4. Participación ciudadana

La consulta pública no exige sesión. Google se solicita únicamente para:

- enviar aportes a una problemática;
- presentar una solución;
- votar una vez por reto.

Los correos de las propuestas se guardan exclusivamente en `innovacionPropuestasPrivadas`, que no tiene lectura pública.
