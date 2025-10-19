import Section from "@/components/section";

export default function KippPage() {
  return (
    <div className="space-y-6">
      <Section
        title="KIPP Workspace"
        description="Configure automated evaluation agents and prompts."
        actions={
          <button className="rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-xs font-semibold text-white transition hover:bg-white/20">
            Launch console
          </button>
        }
      >
        <div className="space-y-4">
          <div className="rounded-2xl border border-white/5 bg-white/10 p-4">
            <h3 className="text-sm font-semibold text-white">Active model</h3>
            <p className="mt-2 text-sm text-white/60">gpt-4o-mini — tuned for factuality and reasoning depth.</p>
          </div>
          <div className="rounded-2xl border border-white/5 bg-white/10 p-4">
            <h3 className="text-sm font-semibold text-white">System prompt</h3>
            <p className="mt-2 text-sm text-white/60">
              “You are KIPP, the Validatio co-pilot helping teams evaluate AI output. Provide citations and highlight gaps.”
            </p>
          </div>
        </div>
      </Section>
    </div>
  );
}
