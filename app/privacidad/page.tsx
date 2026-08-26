import type { Metadata } from "next";
import { LegalDocument, LegalSection } from "@/components/legal/LegalDocument";
import { CONTACT_EMAIL, LEGAL_UPDATED_AT, WHATSAPP_PHONE } from "@/lib/legal";

export const metadata: Metadata = { title: "Política de Privacidad · KR System" };

export default function PrivacyPolicyPage() {
  return (
    <LegalDocument title="Política de Privacidad" updatedAt={LEGAL_UPDATED_AT}>
      <LegalSection title="1. Quiénes somos">
        <p>
          KR SYSTEM (&quot;nosotros&quot;, &quot;la empresa&quot;) es la empresa desarrolladora de KR
          POS y KR Citas, un conjunto de sistemas de gestión para negocios: punto de venta,
          inventario y facturación; y agenda de citas y clientes. Esta Política de Privacidad
          explica cómo tratamos la información en este sitio web y, en general, en nuestros
          productos.
        </p>
      </LegalSection>

      <LegalSection title="2. Este sitio web">
        <p>
          Este sitio web es informativo — no tiene formularios ni recopila datos personales
          directamente. Si nos escribes por WhatsApp o correo desde los enlaces de contacto, esa
          conversación queda en la plataforma que elijas usar (WhatsApp o tu cliente de correo), y la
          usamos únicamente para responderte.
        </p>
      </LegalSection>

      <LegalSection title="3. Si te conviertes en cliente de un producto">
        <p>
          Al registrarte en KR POS o KR Citas recopilamos los datos necesarios para
          prestarte el servicio: datos de tu cuenta (nombre, correo, teléfono, contraseña cifrada) y
          los datos operativos de tu negocio que tú mismo registras (clientes, ventas, citas,
          inventario, conversaciones, etc.). Esos datos son tuyos — nosotros solo los alojamos y
          procesamos para que el sistema funcione, y sigues siendo responsable de cómo los
          obtuviste.
        </p>
        <p>
          No recopilamos datos de pago con fines de procesamiento de tarjetas: los pagos de la
          suscripción se coordinan manualmente y se confirman por WhatsApp; no almacenamos números
          de tarjeta ni datos bancarios completos.
        </p>
      </LegalSection>

      <LegalSection title="4. Con quién compartimos información">
        <p>
          No vendemos ni alquilamos tu información a terceros con fines publicitarios. Compartimos
          datos únicamente con proveedores que nos ayudan a operar el servicio (hosting y base de
          datos, correo transaccional y, si eliges usarlo, inicio de sesión con Google), bajo sus
          propias obligaciones de confidencialidad, o cuando la ley nos lo exige.
        </p>
      </LegalSection>

      <LegalSection title="5. Dónde se almacena tu información">
        <p>
          Usamos infraestructura en la nube que puede alojar tu información en servidores ubicados
          fuera de tu país. Aplicamos las mismas medidas de seguridad sin importar dónde se procesen
          los datos.
        </p>
      </LegalSection>

      <LegalSection title="6. Tus derechos">
        <p>
          Puedes solicitarnos en cualquier momento acceder a tu información, corregirla, exportarla
          o eliminarla. Para ejercer estos derechos, escríbenos a{" "}
          <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a> o por WhatsApp al +1 (904)
          579-6156.
        </p>
      </LegalSection>

      <LegalSection title="7. Cambios a esta política">
        <p>
          Podemos actualizar esta Política de Privacidad ocasionalmente. La fecha de &quot;Última
          actualización&quot; al inicio de este documento indica la versión vigente.
        </p>
      </LegalSection>

      <LegalSection title="8. Contacto">
        <p>
          Si tienes preguntas sobre esta Política de Privacidad, escríbenos a{" "}
          <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a> o por WhatsApp al{" "}
          <a href={`https://wa.me/${WHATSAPP_PHONE}`} target="_blank" rel="noopener noreferrer">
            +1 (904) 579-6156
          </a>
          .
        </p>
      </LegalSection>
    </LegalDocument>
  );
}
