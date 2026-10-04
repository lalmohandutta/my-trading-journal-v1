export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5">
        <h2 className="text-xl font-semibold text-white">Settings</h2>
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5">
          <h3 className="text-lg font-semibold text-white">Profile</h3>
          <div className="mt-4 space-y-4">
            <label className="block text-sm text-slate-300">
              Name
              <input defaultValue="Trader" className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950/60 px-3 py-2 text-white" />
            </label>
            <label className="block text-sm text-slate-300">
              Email
              <input defaultValue="trader@example.com" className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950/60 px-3 py-2 text-white" />
            </label>
          </div>
        </div>
        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5">
          <h3 className="text-lg font-semibold text-white">Trading Preferences</h3>
          <div className="mt-4 space-y-4">
            <label className="block text-sm text-slate-300">
              Default currency
              <select defaultValue="INR" className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950/60 px-3 py-2 text-white"><option>INR</option></select>
            </label>
            <label className="block text-sm text-slate-300">
              Default quantity
              <input defaultValue={25} type="number" className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950/60 px-3 py-2 text-white" />
            </label>
            <label className="block text-sm text-slate-300">
              Default timeframe
              <input defaultValue="15m" className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950/60 px-3 py-2 text-white" />
            </label>
            <label className="block text-sm text-slate-300">
              Default market
              <input defaultValue="NIFTY" className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950/60 px-3 py-2 text-white" />
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}
