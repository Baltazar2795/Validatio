import Section from "@/components/section";

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <Section title="Today" description="Quick snapshot of your workspace.">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {[
            { label: "Active projects", value: "4" },
            { label: "Pending reviews", value: "12" },
            { label: "Files uploaded", value: "28" },
          ].map(item => (
            <div
              key={item.label}
              className="rounded-2xl border border-white/5 bg-white/10 p-4 text-sm text-white/70"
            >
              <div className="text-xs uppercase tracking-wide text-white/50">{item.label}</div>
              <div className="mt-2 text-2xl font-semibold text-white">{item.value}</div>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Updates" description="Keep exploring the new Validatio shell.">
        <p className="leading-relaxed text-white/70">
          Your dashboard is ready for upcoming integrations. Use the navigation to explore Files, Projects,
          KIPP, and Settings.
        </p>
      </Section>
    </div>
  );
}
