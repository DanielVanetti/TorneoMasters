export default function EmptyState({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-center py-14 px-5 text-tms-ink/50 text-base">{children}</div>
  );
}
