export default function Footer() {
  return (
    <footer className="bg-tms-teal-dark border-t-4 border-tms-gold text-tms-cream font-body">
      <div className="max-w-[1240px] mx-auto grid grid-cols-1 sm:grid-cols-[1.3fr_1fr_1fr] gap-5 sm:gap-8 px-5 sm:px-7 pt-8 pb-6">
        <div>
          <div className="font-display text-xl text-tms-gold tracking-wide">TORNEO MÁSTER SANTA CRUZ</div>
          <p className="max-w-[360px] mt-2.5 text-[15px] leading-relaxed text-tms-cream/80">
            Fútbol de categoría Máster (+50) en Santa Cruz, Guanacaste. Comunidad, tradición sabanera y pasión por el fútbol de siempre.
          </p>
        </div>
        <div>
          <div className="font-extrabold text-[13px] tracking-[1.5px] text-tms-gold uppercase mb-2.5">Contacto</div>
          <div className="flex flex-col gap-1.5 text-[15px] text-tms-cream/85">
            <span>Junta Organizadora Torneo Máster</span>
            <span>WhatsApp: 8888-0000</span>
            <span>correo@torneomastersantacruz.cr</span>
            <span>Estadio Municipal, Santa Cruz, Guanacaste</span>
          </div>
        </div>
        <div>
          <div className="font-extrabold text-[13px] tracking-[1.5px] text-tms-gold uppercase mb-2.5">Redes sociales</div>
          <div className="flex gap-2.5">
            {["FB", "IG", "WA"].map((r) => (
              <a
                key={r}
                href="#"
                className="w-[38px] h-[38px] rounded-full bg-tms-gold/15 border border-tms-gold/40 flex items-center justify-center text-tms-gold font-body font-extrabold text-[13px] no-underline"
              >
                {r}
              </a>
            ))}
          </div>
        </div>
      </div>
      <div className="border-t border-tms-cream/15 px-7 py-4 text-center text-[13px] text-tms-cream/55">
        © 2026 Torneo Máster Santa Cruz — nombre provisional. Datos de jornada actualizados semanalmente.
      </div>
    </footer>
  );
}
