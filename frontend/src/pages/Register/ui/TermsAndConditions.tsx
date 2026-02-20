const PHONE_NUMBER_H = "3017201658";
const PHONE_NUMBER_M = "3136106277";
const TOTAL_PRICE_COP = 435_000;
const MIN_ADVANCE_COP = 100_000;

const NEQUI_CONTACT_NAME_H = "Jose Salopaso - Coordinador XV Retiro";
const NEQUI_CONTACT_NAME_M = "Ana Vargas - Coordinadora XV Retiro";
const RETREAT_LABEL = "XV RETIRO ITER 4.12";

function formatCOP(value: number) {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(value);
}

export default function TermsAndConditions() {
  const totalPriceText = formatCOP(TOTAL_PRICE_COP);
  const minAdvanceText = formatCOP(MIN_ADVANCE_COP);

  return (
    <section className="terms">
      <p className="terms__intro">
        Por favor leer atentamente los términos y condiciones y téngalos
        presentes ya que el cumplimiento de estos es de vital importancia para
        la realización del retiro.
      </p>

      <p>
        El{" "}
        <strong>XIV Retiro Espiritual de la Comunidad ITER 4.12 Bogotá</strong>,
        se llevará a cabo los días{" "}
        <strong>viernes 01, 02 sábado y 03 Domingo</strong> de{" "}
        <strong>mayo del 2026</strong>, en el Centro de Espiritualidad María
        Consolata (Carrera 24B #1D-60).
      </p>

      <p>
        El Retiro tendrá inicio el día viernes a las <strong>4:30 p.m.</strong>{" "}
        y finalizará alrededor de las <strong>6:00 p.m.</strong> el día domingo.
      </p>

      <p>
        Para la realización del retiro es necesario realizar un pago total de{" "}
        <strong>{totalPriceText}</strong> pesos colombianos, el cual incluye
        todo tipo de comodidades y los diferentes gastos del retiro.
      </p>

      <p>
        Es importante tener en cuenta que el diligenciamiento del formulario{" "}
        <strong>NO</strong> garantiza la reserva del cupo. Para su reserva, se
        requerirá cancelar un <strong>adelanto mínimo</strong> de{" "}
        <strong>{minAdvanceText}</strong> o la totalidad del valor (
        <strong>{totalPriceText}</strong>), a más tardar el{" "}
        <strong>día 30 de marzo del 2026</strong>. El valor restante, si es el
        caso, debe ser cancelado antes del{" "}
        <strong>día 15 de abril del 2026</strong>.
      </p>

      <div className="terms__block">
        <h3 className="terms__subtitle">Modalidades de pago:</h3>
        <p>Para participantes hombres:</p>
        <br />
        <p>
          <strong>Nequi:</strong> {NEQUI_CONTACT_NAME_H}
          <br />
          <strong>Nombre:</strong> {PHONE_NUMBER_H}
        </p>
        <br />
        <p>Para participantes mujeres:</p>
        <br />
        <p>
          <strong>Nequi:</strong> {NEQUI_CONTACT_NAME_M}
          <br />
          <strong>Nombre:</strong> {PHONE_NUMBER_M}
        </p>
        <br />
        <p>En el mensaje de la transferencia se debe indicar:</p>

        <div className="terms__highlight">
          <strong>NOMBRE - {RETREAT_LABEL}</strong>
        </div>

        <p>
          Para hacer efectiva esta modalidad de pago, se debe hacer envío del
          soporte de la transacción a WhatsApp. Si el participante es hombre a:{" "}
          <strong>{PHONE_NUMBER_H}</strong>{" "}
          <strong>{NEQUI_CONTACT_NAME_H}</strong> y si el participante es mujer
          a: <strong>{PHONE_NUMBER_M}</strong>{" "}
          <strong>{NEQUI_CONTACT_NAME_M}</strong>{" "}
           junto con la copia de tu documento de identidad. Si la consignación se
          realiza desde otro banco u otra ciudad diferente a Bogotá, deberás
          asumir el costo de la transacción
          <br />
          <br />
          <strong>NOTA:</strong> Es importante mencionar que las reservas del
          cupo se registrarán por el orden de llegada del soporte de pago
          respectivo al WhatsApp mencionado lineas arriba.
        </p>
      </div>

      <div className="terms__block">
        <h3 className="terms__subtitle">Política de devolución:</h3>
        <p>
          Respecto de las devoluciones por cancelación del cupo de forma
          injustificada, la misma no aplica en razón de lo preceptuado en el{" "}
          <strong>Decreto 4705 del 2008</strong>.
        </p>

        <p>
          Exceptuando las eventualidades de fuerza mayor o caso fortuito tales
          como enfermedad o accidente por fenómenos naturales; de igual manera,
          se deberá aportar los debidos comprobantes que den veracidad de lo
          ocurrido.
        </p>
      </div>
    </section>
  );
}
