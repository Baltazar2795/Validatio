import Section from "@/components/section";

const preferences = [
  {
    title: "Notifications",
    description: "Choose how you receive alerts for project activity.",
  },
  {
    title: "Integrations",
    description: "Connect Slack, Jira, or custom webhooks to keep teams aligned.",
  },
  {
    title: "Security",
    description: "Configure SSO, roles, and API tokens for your workspace.",
  },
];

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <Section title="Workspace settings" description="Fine-tune Validatio to fit your team.">
        <div className="space-y-4">
          {preferences.map(pref => (
            <div
              key={pref.title}
              className="rounded-2xl border border-white/5 bg-white/10 p-5"
            >
              <h3 className="text-sm font-semibold text-white">{pref.title}</h3>
              <p className="mt-1 text-sm text-white/60">{pref.description}</p>
            </div>
          ))}
        </div>
      </Section>
    </div>
  );
}
