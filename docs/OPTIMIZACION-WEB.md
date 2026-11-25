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
