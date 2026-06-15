# Decisiones de Diseño — Integra

## DD-001: Stack Next.js
- **Decisión**: Usar Next.js (mismo ecosistema que Tutor).
- **Alternativas**: React puro + Node.js aparte, SvelteKit.
- **Criterio**: Reutilización de templates, un solo deploy en Vercel, middleware de auth integrado.
- **Impacto**: Menor complejidad operativa, mismo patrón que Tutor.

## DD-002: PDFKit sobre Puppeteer
- **Decisión**: Usar PDFKit para generación de PDF.
- **Alternativas**: Puppeteer, jsPDF en frontend.
- **Criterio**: Puppeteer no cabe en serverless (300MB vs 50MB límite). PDFKit es liviano.
- **Impacto**: PDF generado en API route, sin chromium.

## DD-003: Cálculo en frontend
- **Decisión**: Calcular precios de socios en memoria (React) en vez de stored procedures.
- **Alternativas**: Vistas materializadas en PostgreSQL, funciones PL/pgSQL.
- **Criterio**: Los descuentos cambian poco. Cálculo en frontend evita latencia de DB.
- **Impacto**: Matriz responde instantáneo, sin carga extra en Supabase.

## DD-004: Biometría para edición
- **Decisión**: WebAuthn API para proteger edición de precios.
- **Alternativas**: PIN, 2FA por email.
- **Criterio**: El Coordinador usa dispositivo móvil con sensor biométrico. Es más rápido que 2FA.
- **Impacto**: Sin fallback para dispositivos sin sensor (requiere PIN alternativo).
