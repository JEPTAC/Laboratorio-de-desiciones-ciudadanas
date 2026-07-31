# Guía rápida de publicación

1. Descomprima el ZIP.
2. Suba todos los archivos internos a la raíz de la rama `main`.
3. Active GitHub Pages desde `main` y `/ (root)`.
4. En Firebase Authentication habilite Google y autorice el dominio `USUARIO.github.io`.
5. Publique `firestore.rules` solamente si sus reglas actuales no contienen ya las colecciones incluidas.
6. Abra `administracion.html` e ingrese con la cuenta `super_admin`.
7. En el primer ingreso, la aplicación activa automáticamente los registros iniciales que falten en Firestore.
8. Revise fechas, responsables y documentos de cada reto antes de declararlo como convocatoria institucional definitiva.

La vista pública muestra el contenido inicial aun antes de la activación en Firestore. La activación permite recibir aportes y votos asociados a esos registros.
