import type { Metadata } from "next";
import { LegalDocument, LegalSection } from "@/components/legal/LegalDocument";
import { CONTACT_EMAIL, LEGAL_UPDATED_AT } from "@/lib/legal";

export const metadata: Metadata = { title: "Aviso de Cookies · KR System" };

export default function CookiesNoticePage() {
  return (
    <LegalDocument title="Aviso de Cookies" updatedAt={LEGAL_UPDATED_AT}>
      <LegalSection title="¿Qué son las cookies?">
        <p>
          Las cookies son pequeños archivos que un sitio web guarda en tu navegador para recordar
          información entre visitas.
        </p>
      </LegalSection>

      <LegalSection title="¿Qué cookies usa este sitio?">
        <p>
          Este sitio web es puramente informativo: no usa cookies de publicidad, rastreo entre sitios
          ni de análisis de terceros (como Google Analytics). No necesitas aceptar nada para
          navegarlo.
        </p>
        <p>
          Nuestros productos (KR POS, KR Citas, KR ChatBot) sí usan una cookie de sesión estrictamente
          necesaria para mantenerte con la sesión iniciada una vez te registras — el detalle de esa
          cookie está en el Aviso de Cookies dentro de cada producto.
        </p>
      </LegalSection>

      <LegalSection title="Cambios a este aviso">
        <p>
          Si en el futuro incorporamos cookies adicionales en este sitio, actualizaremos este aviso y,
          de ser necesario, solicitaremos tu consentimiento antes de activarlas.
        </p>
      </LegalSection>

      <LegalSection title="Contacto">
        <p>
          Si tienes preguntas sobre este Aviso de Cookies, escríbenos a{" "}
          <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.
        </p>
      </LegalSection>
    </LegalDocument>
  );
}
