import Link from "next/link";
import Section from "@/components/section";

const projects = [
  { name: "Customer QA", status: "Active", href: "#" },
  { name: "Policy Review", status: "Draft", href: "#" },
  { name: "Model Eval", status: "Archived", href: "#" },
];

export default function ProjectsPage() {
  return (
    <div className="space-y-6">
      <Section
        title="Projects"
        description="Manage validation initiatives across your organisation."
        actions={
          <button className="rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-xs font-semibold text-white transition hover:bg-white/20">
            New project
          </button>
        }
      >
        <div className="grid gap-4 md:grid-cols-2">
          {projects.map(project => (
            <Link
              key={project.name}
              href={project.href}
              className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/5 p-5 transition hover:border-white/20 hover:bg-white/10"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-base font-semibold text-white">{project.name}</h3>
                <span className="rounded-full border border-white/10 bg-white/10 px-2 py-0.5 text-xs uppercase tracking-wide text-white/70">
                  {project.status}
                </span>
              </div>
              <p className="text-sm text-white/60">Kick off evaluation tasks, collaborate with teammates, and track completion.</p>
            </Link>
          ))}
        </div>
      </Section>
    </div>
  );
}
