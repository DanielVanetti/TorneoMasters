export default function PageHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="bg-tms-teal-dark px-6 py-5 sm:px-12 sm:py-9">
      <div className="max-w-[1240px] mx-auto">
        <div className="flex items-center gap-3">
          <div className="w-1.5 h-6 sm:h-[30px] bg-tms-gold rounded-sm" />
          <h1 className="font-display text-tms-cream text-[21px] sm:text-[34px] m-0 tracking-wide">{title}</h1>
        </div>
        <p className="text-tms-cream/75 text-sm sm:text-base mt-2 ml-0 sm:ml-[18px]">{subtitle}</p>
      </div>
    </div>
  );
}
