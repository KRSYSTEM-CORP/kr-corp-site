# Optimización web (2026-11-25)

Lighthouse headless, mismo Chrome. Antes = producción krsystem-corp.com; después = build local (`next start`, sin CDN, por eso el peso y el LCP son algo pesimistas).

| Métrica | Antes escritorio | Después escritorio | Antes móvil | Después móvil |
|---|---|---|---|---|
| Rendimiento | 61 | 99 | 74 | 88 |
| TBT | 4.020 ms | 90 ms | 900 ms | 230 ms |
| LCP | 0,6 s | 0,8 s | 2,9 s | 3,4 s (local) |
| CLS | 0 | 0 | 0 | 0 |
| Peso total | 394 KiB | 438 KiB | 373 KiB | 385 KiB |
| Accesibilidad / Mejores prácticas / SEO | 96/100/100 | 96/100/100 | 96/100/100 | 96/100/100 |

## Cambios
- Fondo Galaxy: sin `blur-3xl` en capas enormes (causa de ~3,4 s de tarea larga), 30 fps, menos estrellas, color precalculado, pausa con pestaña oculta.
- Reveal y Tour: sin `filter: blur` animado; el hero ya no arranca en opacidad 0 (mejora LCP).
- Imágenes: avif/webp, caché de un año; icon.png de 512 px/118 KB a 192 px/26 KB; Cache-Control para /krpos y logos.
- SEO: metadataBase, canonical por página, Twitter/OG, imagen OG generada, sitemap.xml, robots.txt, manifest, JSON-LD (Organization y SoftwareApplication con los tres planes).
- Seguridad: CSP, nosniff, Referrer-Policy, Permissions-Policy, X-Frame-Options, COOP; sin X-Powered-By; límite de 8 intentos fallidos por IP y por correo en el login del panel (por instancia).
- 404 y 500 propias; foco visible global; fuentes con display swap.

## No hecho
- Turnstile/captcha en formularios: el formulario de contacto abre el correo del usuario (mailto), no hay envío en servidor.
- El límite de login es en memoria por instancia; uno global requeriría Redis/BD.
- Lint tiene 10 errores previos de `any` en lib/admin/systems.ts (no tocados).

## Segunda ronda (2026-11-25)
- Lint en verde: tipos reales en lib/admin/systems.ts (sin cambio de comportamiento).
- Móvil, mediana de 3 corridas: rendimiento 85 (antes 74 en prod), TBT 230 ms, LCP simulado 3,6 s pero LCP observado 0,48 s; escritorio 100. Galaxy ya no se carga en móvil ni con «reducir movimiento» y en escritorio arranca en idle; Tour y AssistantDemo en trozos aparte; texto del hero visible desde el HTML.
- Accesibilidad 100 (contraste #6e6e73 a #8e8e93).
- Capturas de KR POS: PNG 236-416 KB a WebP 68-129 KB; borrados los PNG y los screenshot-*.png sin uso.
- Límite de login global en tabla `LoginAttempt` (migración aditiva `20261125120000_login_attempt`, NO aplicada a producción; falla abierta si la tabla no existe).
- CSP: se probó SRI y nonces; los scripts en línea de Next los bloquean sin render dinámico, así que se mantiene 'unsafe-inline' en script-src.

## Tercera ronda: móvil (5 corridas, Lighthouse simulado, build local)
Puntajes 90, 84, 90, 91, 90: mediana 90 (85 antes de esta ronda; producción original 74). TBT 90-100 ms, FCP 0,9 s, CLS 0-0,07.
Cambios: Hero sin framer-motion (animación CSS y componente de servidor), Reveal con IntersectionObserver + CSS, el resto con LazyMotion/domAnimation (`m`), imagen del hero con fetchPriority=high, `will-change` en nebulosas y hero (evita falsos CLS), logo y navbar con ancho fijo.
Desglose de lo que falta para 95 (puntos perdidos de 100):
- LCP: unos 8 pts (puntaje 0,67 sobre peso 25). El LCP observado en el navegador es 0,35-0,48 s; los 3,4 s son la simulación de Lighthouse (CPU 4x, RTT 150 ms, 1,6 Mbps) con HTML, CSS bloqueante (11 KB) e imagen del hero (14 KB), que es el elemento más grande del primer pantallazo móvil. Bajarlo exigiría que la imagen no sea el LCP (p. ej. quitar la captura del primer pantallazo móvil): decisión de diseño que no tomé.
- CLS: 0 a 1 pt (0,06 aparece solo en algunas corridas, por las animaciones de las nebulosas con la CPU frenada).
- TBT, FCP y Speed Index: 0 pts perdidos.
- Fuentes: ya es una sola Inter variable latin (49 KB) con preload; una fuente del sistema habría cambiado el diseño.
