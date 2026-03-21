export default function SettingsLoading() {
  return (
    <div className="p-6 space-y-6">
      <div className="h-8 w-40 bg-gray-200 rounded-lg animate-pulse" />
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-16 bg-gray-200 rounded-xl animate-pulse" />
        ))}
      </div>
    </div>
  );
}
