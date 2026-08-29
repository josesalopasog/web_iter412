const PHONE_NUMBER_H = "3195571763";
const PHONE_NUMBER_M = "3196188804";
const TOTAL_PRICE_COP = 300_000;
const MIN_ABONO_COP = 100_000;

const NEQUI_CONTACT_NAME_H = "Yostin Arteaga - Coordinador XVI Retiro";
const NEQUI_CONTACT_NAME_M = "Karen Cruz - Coordinadora XVI Retiro";
const RETREAT_LABEL = "XVI RETIRO ITER 4.12";

const BANK_ACCOUNT_TYPE = "Cuenta corriente";
const BANK_NAME = "Banco Caja Social";
const BANK_ACCOUNT_NUMBER = "24072347779";

function formatCOP(value: number) {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(value);
}

export default function TermsAndConditions() {
  const totalPriceText = formatCOP(TOTAL_PRICE_COP);
  const minAbonoText = formatCOP(MIN_ABONO_COP);

  return (
    <section className="terms">
      <p>
        El valor total del servicio es de <strong>{totalPriceText}</strong>.
      </p>

      <p>
        El diligenciamiento de este formulario <strong>NO</strong> asegura la
        separación del cupo para la realización del retiro. Para hacerla
        válida, se debe cancelar un <strong>abono mínimo</strong> de{" "}
        <strong>{minAbonoText}</strong> entre el{" "}
        <strong>1 y el 15 de octubre del 2026</strong>. El valor restante, o
        la totalidad del valor (<strong>{totalPriceText}</strong>) si se paga
        de una sola vez, debe ser cancelado entre el{" "}
        <strong>1 y el 7 de noviembre del 2026</strong>. Adicionalmente, a
        pesar de que se realice el abono, es indispensable la asistencia a
        las <strong>formaciones</strong> para poder servir dentro del retiro.
      </p>

      <div className="terms__block">
        <h3 className="terms__subtitle">Modalidades de pago:</h3>

        <p>
          <strong>{BANK_ACCOUNT_TYPE}:</strong> {BANK_NAME}, cuenta N.º{" "}
          <strong>{BANK_ACCOUNT_NUMBER}</strong>.
        </p>
        <br />

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
          <strong>NOMBRE COMPLETO - {RETREAT_LABEL}</strong>
        </div>

        <p>
          Para hacer efectiva esta modalidad de pago, se debe hacer envío del
          soporte de la transacción a WhatsApp junto con el nombre del
          participante del retiro. Si el participante es hombre a:{" "}
          <strong>{PHONE_NUMBER_H}</strong>{" "}
          <strong>{NEQUI_CONTACT_NAME_H}</strong> y si el participante es
          mujer a: <strong>{PHONE_NUMBER_M}</strong>{" "}
          <strong>{NEQUI_CONTACT_NAME_M}</strong>.
          <br />
          <br />
          De no realizarse el envío del soporte correspondiente, este pago{" "}
          <strong>NO</strong> será tenido en cuenta.
          <br />
          <br />
          Si la consignación se realiza desde otro banco u otra ciudad
          diferente a Bogotá, deberás asumir el costo de la transacción.
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
          Exceptuando las eventualidades de fuerza mayor o caso fortuito
          tales como enfermedad o accidente por fenómenos naturales; de igual
          manera, se deberá aportar los debidos comprobantes que den
          veracidad de lo ocurrido.
        </p>
      </div>
    </section>
  );
}
