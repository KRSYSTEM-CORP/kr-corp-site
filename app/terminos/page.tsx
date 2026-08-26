import type { Metadata } from "next";
import { LegalDocument, LegalSection } from "@/components/legal/LegalDocument";
import { CONTACT_EMAIL, LEGAL_UPDATED_AT } from "@/lib/legal";

export const metadata: Metadata = { title: "Términos y Condiciones · KR System" };

export default function TermsPage() {
  return (
    <LegalDocument title="Términos y Condiciones" updatedAt={LEGAL_UPDATED_AT}>
      <LegalSection title="1. Aceptación de los términos">
        <p>
          Al usar este sitio web o crear una cuenta en KR POS, KR Citas, KR ChatBot o cualquier otro
          sistema de KR SYSTEM, aceptas estos Términos y Condiciones. Si no estás de acuerdo, no
          debes usar el servicio.
        </p>
      </LegalSection>

      <LegalSection title="2. Descripción del servicio">
        <p>
          KR SYSTEM diseña y desarrolla software a medida y ofrece sus propios productos de
          suscripción: KR POS (punto de venta, inventario y facturación), KR Citas (agenda y clientes)
          y KR ChatBot (atención por WhatsApp con IA). Podemos agregar, modificar o retirar funciones
          de estos productos en cualquier momento, procurando notificarlo con antelación razonable
          cuando el cambio sea significativo.
        </p>
      </LegalSection>

      <LegalSection title="3. Este sitio web">
        <p>
          El contenido de este sitio es informativo y puede cambiar sin previo aviso. No garantizamos
          que la información esté siempre actualizada o libre de errores; para condiciones
          comerciales concretas, contáctanos directamente.
        </p>
      </LegalSection>

      <LegalSection title="4. Suscripción y pagos de nuestros productos">
        <p>
          El uso de KR POS, KR Citas y KR ChatBot requiere el pago de una tarifa periódica. El pago se
          coordina de forma manual (por ejemplo, transferencia o Binance) y se confirma reportándolo
          dentro del producto y por WhatsApp; la activación o reactivación de tu cuenta queda sujeta a
          la verificación de ese pago por nuestro equipo. Si tu cuenta queda en mora, podemos suspender
          el acceso hasta regularizar el pago. Los precios pueden ajustarse; te avisaremos con
          anticipación razonable antes de que un cambio de precio te afecte.
        </p>
      </LegalSection>

      <LegalSection title="5. Uso aceptable">
        <p>
          No puedes usar nuestros productos para actividades ilegales, para vulnerar la seguridad del
          sistema, para revender o sublicenciar el acceso sin nuestra autorización expresa, ni de
          forma que perjudique a otros usuarios o a la operación del servicio.
        </p>
      </LegalSection>

      <LegalSection title="6. Propiedad intelectual">
        <p>
          El software, el diseño, las marcas y el contenido de este sitio, de KR POS, KR Citas y KR
          ChatBot son propiedad de KR SYSTEM. Estos Términos no te otorgan ningún derecho sobre ellos
          más allá del uso del sitio o del servicio contratado.
        </p>
      </LegalSection>

      <LegalSection title="7. Limitación de responsabilidad">
        <p>
          En la medida permitida por la ley aplicable, KR SYSTEM no será responsable por daños
          indirectos, pérdida de ganancias o de datos derivados del uso o la imposibilidad de uso de
          este sitio o de nuestros productos.
        </p>
      </LegalSection>

      <LegalSection title="8. Modificaciones a estos Términos">
        <p>
          Podemos actualizar estos Términos ocasionalmente. La fecha de &quot;Última
          actualización&quot; al inicio de este documento indica la versión vigente.
        </p>
      </LegalSection>

      <LegalSection title="9. Ley aplicable y disputas">
        <p>
          Estos Términos se rigen por las leyes aplicables según la relación entre las partes. Ante
          cualquier desacuerdo, ambas partes procurarán resolverlo primero de forma directa y de
          buena fe antes de acudir a cualquier otra vía.
        </p>
      </LegalSection>

      <LegalSection title="10. Contacto">
        <p>
          Si tienes preguntas sobre estos Términos y Condiciones, escríbenos a{" "}
          <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a> o por WhatsApp al +1 (904)
          579-6156.
        </p>
      </LegalSection>
    </LegalDocument>
  );
}
