
const TOTAL_PRICE_COP = 300_000;
const MIN_ABONO_COP = 100_000;

const NEQUI_TESORERIA_NUMBER = "3145207871";
const NEQUI_TESORERIA_NAME = "Laura Valles";

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
        <br />
        Que puedes cancelar a través de los siguientes medios:
      </p>

      <ul className="terms__list">
        <li>
          <strong>Consignación o transferencias a las siguientes cuentas:</strong>
          <br />
          Puedes cancelar por transferencia Nequi al número de tesorería:{" "}
          <strong>
            {NEQUI_TESORERIA_NUMBER} - {NEQUI_TESORERIA_NAME}
          </strong>
          .
        </li>
      </ul>

      <p>
        El diligenciamiento de este formulario no asegura la separación del cupo para
        la realización del retiro, para hacer este válida se debe realizar un abono
        mínimo de <strong>{minAbonoText}</strong> (cien mil pesos colombianos) a más
        tardar el día <strong>30 de marzo del 2026</strong>. Adicionalmente, a
        pesar de que se realice el abono, es indispensable la asistencia a las{" "}
        <strong>formaciones</strong> para poder servir dentro del retiro.
      </p>

      <p>
        Completados los cupos que se apartaron con abono, el número restante de
        inscritos quedará en lista de espera. Así mismo, se debe cancelar el valor total
        del retiro a más tardar el día <strong>15 de abril del 2026</strong>.
      </p>

      <p>
        Quien no haya pagado el valor total del servicio antes del{" "}
        <strong>15 de abril</strong>, no podrá ingresar a la casa de retiros.
      </p>

      <p>
        Respecto de las devoluciones por cancelación del cupo de forma injustificada,
        la misma no aplica en razón de lo preceptuado en el{" "}
        <strong>Decreto 4705 del 2008</strong>.
      </p>

      <p>
        Exceptuando las eventualidades de fuerza mayor o caso fortuito tales como
        enfermedad o accidente por fenómenos naturales; de igual manera, se deberá
        aportar los debidos comprobantes que den veracidad de lo ocurrido.
      </p>
    </section>
  );
}