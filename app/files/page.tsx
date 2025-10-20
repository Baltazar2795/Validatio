import Section from "@/components/section";

export default function FilesPage() {
  return (
    <div className="space-y-6">
      <Section
        title="Recent uploads"
        description="Centralize transcripts, datasets, and prompts. Uploads will appear here soon."
      >
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map(item => (
            <div
              key={item}
              className="flex flex-col gap-3 rounded-2xl border border-white/5 bg-white/10 p-4"
            >
              <div className="text-sm font-medium text-white">Transcript {item}</div>
              <p className="text-xs text-white/60">Placeholder file summary — replace with real upload metadata.</p>
            </div>
          ))}
        </div>
      </Section>
    </div>
  );
}
