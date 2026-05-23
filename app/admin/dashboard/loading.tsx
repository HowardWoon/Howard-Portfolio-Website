export default function LoadingDashboard() {
  return (
    <div className="space-y-6">
      <div className="glass-panel h-36 animate-pulse rounded-[2rem]" />
      <div className="grid gap-6 xl:grid-cols-2">
        <div className="glass-panel h-[34rem] animate-pulse rounded-[2rem]" />
        <div className="glass-panel h-[34rem] animate-pulse rounded-[2rem]" />
      </div>
      <div className="glass-panel h-64 animate-pulse rounded-[2rem]" />
    </div>
  );
}
