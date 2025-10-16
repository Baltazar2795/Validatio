'use client';
import React, { useMemo, useState } from "react";

type QuestionType = "stars" | "binary" | "text";

type Question = {
  id: string;
  label: string;
  type: QuestionType;
  scale?: number;
};

type Questionnaire = {
  id: string;
  name: string;
  items: Question[];
};

type Dialogue = {
  id: string;
  question: string;
  transcriptA: string[];
  transcriptB: string[];
  answerA: string;
  answerB: string;
};

type Task = {
  id: string;
  name: string;
  questionnaireId: string;
  dialogues: Dialogue[];
  status: "draft" | "published";
};

type Project = {
  id: string;
  name: string;
  kipp: { model: string; systemPrompt: string; quickPrompts: string[] };
  questionnaires: Questionnaire[];
  tasks: Task[];
};

const Section: React.FC<{ title: string; actions?: React.ReactNode; className?: string }> = ({ title, actions, className, children }) => (
  <div className={`bg-white/5 border border-white/10 rounded-2xl p-5 ${className ?? ""}`}>
    <div className="flex items-center justify-between mb-4">
      <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
      <div className="flex gap-2">{actions}</div>
    </div>
    {children}
  </div>
);

const Btn: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement>> = ({ className, children, ...props }) => (
  <button
    {...props}
    className={`px-3 py-2 rounded-xl text-sm font-medium border border-white/10 hover:border-white/20 hover:bg-white/5 transition ${className ?? ""}`}
  >
    {children}
  </button>
);

const PrimaryBtn: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement>> = ({ className, children, ...props }) => (
  <button
    {...props}
    className={`px-3 py-2 rounded-xl text-sm font-semibold bg-white text-black hover:opacity-90 transition ${className ?? ""}`}
  >
    {children}
  </button>
);

const Input: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = ({ className, ...props }) => (
  <input {...props} className={`bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 ring-white/20 ${className ?? ""}`} />
);

const TextArea: React.FC<React.TextareaHTMLAttributes<HTMLTextAreaElement>> = ({ className, ...props }) => (
  <textarea {...props} className={`bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 ring-white/20 ${className ?? ""}`} />
);

const defaultQuestions: Question[] = [
  { id: "q1", label: "Глубина и полнота анализа", type: "stars", scale: 5 },
  { id: "q2", label: "Логическая корректность", type: "stars", scale: 5 },
  { id: "q3", label: "Фактологическая точность", type: "stars", scale: 5 },
];

function makeDemoProject(): Project {
  return {
    id: "p1",
    name: "Демо-проект",
    kipp: {
      model: "gpt-4o-mini",
      systemPrompt: "Ты — КИПП: проверяешь факты, логику и математику. Даёшь ссылочные объяснения.",
      quickPrompts: ["Сравни ответы A и B по критериям проекта.", "Проверь арифметику в ответах.", "Сделай фактчек по ключевым утверждениям."],
    },
    questionnaires: [
      { id: "qn1", name: "Базовый опросник (3 вопроса)", items: defaultQuestions },
    ],
    tasks: [
      {
        id: "t1",
        name: "Задание 1",
        questionnaireId: "qn1",
        status: "published",
        dialogues: [
          {
            id: "d1",
            question: "Сравните подходы двух агентов и укажите сильные и слабые стороны.",
            transcriptA: ["User: Объясни, как работает градиентный спуск?", "Agent A: ... длинный разъясняющий ответ ..."],
            transcriptB: ["User: Объясни, как работает градиентный спуск?", "Agent B: ... альтернативное объяснение ..."],
            answerA: "Градиентный спуск итеративно обновляет параметры по антиградиенту функции потерь...",
            answerB: "Алгоритм минимизирует ошибку, вычисляя производные и делая маленькие шаги...",
          },
        ],
      },
    ],
  };
}

const StarInput: React.FC<{ value: number; onChange: (v: number) => void; max?: number; label?: string }> = ({ value, onChange, max = 5, label }) => (
  <div className="flex items-center gap-2 select-none">
    {label && <span className="text-xs text-white/70 w-40">{label}</span>}
    {Array.from({ length: max }).map((_, i) => (
      <button
        key={i}
        className={`text-xl ${i < value ? "text-yellow-400" : "text-white/20"}`}
        onClick={() => onChange(i + 1)}
        aria-label={`star-${i + 1}`}
      >
        ★
      </button>
    ))}
    <span className="text-xs text-white/60 ml-1">{value}/{max}</span>
  </div>
);

const BinaryInput: React.FC<{ value: boolean | null; onChange: (v: boolean) => void; label?: string }> = ({ value, onChange, label }) => (
  <div className="flex items-center gap-3">
    {label && <span className="text-xs text-white/70 w-40">{label}</span>}
    <Btn onClick={() => onChange(true)} className={value === true ? "bg-white text-black" : ""}>Да</Btn>
    <Btn onClick={() => onChange(false)} className={value === false ? "bg-white text-black" : ""}>Нет</Btn>
  </div>
);

type PageKey = "projects" | "project" | "taskCreate" | "assess" | "dashboard" | "kipp" | "files" | "questionnaires";

export default function App() {
  const [page, setPage] = useState<PageKey>("projects");
  const [project, setProject] = useState<Project>(() => makeDemoProject());
  const [currentTaskId] = useState<string | null>("t1");
  const [currentDialogueId] = useState<string | null>("d1");
  const [kippOpen, setKippOpen] = useState<boolean>(false);

  const currentTask = useMemo(() => project.tasks.find(t => t.id === currentTaskId) ?? null, [project, currentTaskId]);
  const currentDialogue = useMemo(() => currentTask?.dialogues.find(d => d.id === currentDialogueId) ?? null, [currentTask, currentDialogueId]);
  const questionnaire = useMemo(() => project.questionnaires.find(q => q.id === (currentTask?.questionnaireId ?? "")) ?? null, [project, currentTask]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-900 to-black text-white">
      <div className="flex">
        <aside className="w-60 shrink-0 h-screen sticky top-0 p-4 border-r border-white/10 bg-black/40 backdrop-blur">
          <div className="text-xl font-bold mb-6">KIPP Admin</div>
          <nav className="flex flex-col gap-2 text-sm">
            <Btn className={page === "projects" ? "bg-white text-black" : ""} onClick={() => setPage("projects")}>Проекты</Btn>
            <Btn className={page === "project" ? "bg-white text-black" : ""} onClick={() => setPage("project")}>Текущий проект</Btn>
            <Btn className={page === "questionnaires" ? "bg-white text-black" : ""} onClick={() => setPage("questionnaires")}>Опросники</Btn>
            <Btn className={page === "files" ? "bg-white text-black" : ""} onClick={() => setPage("files")}>Файлы</Btn>
            <Btn className={page === "assess" ? "bg-white text-black" : ""} onClick={() => setPage("assess")}>Оценка</Btn>
            <Btn className={page === "kipp" ? "bg-white text-black" : ""} onClick={() => setPage("kipp")}>KIPP</Btn>
            <Btn className={page === "dashboard" ? "bg-white text-black" : ""} onClick={() => setPage("dashboard")}>Дашборд</Btn>
          </nav>
        </aside>

        <main className="flex-1 p-6 space-y-6">
          {page === "projects" && (
            <ProjectsPage project={project} onOpen={() => setPage("project")} />
          )}

          {page === "project" && (
            <ProjectView
              project={project}
              setProject={setProject}
              onOpenAssess={() => setPage("assess")}
              onOpenKipp={() => setPage("kipp")}
              onOpenDashboard={() => setPage("dashboard")}
              onOpenFiles={() => setPage("files")}
              onOpenQuestionnaires={() => setPage("questionnaires")}
            />
          )}

          {page === "questionnaires" && (
            <QuestionnairesPage project={project} setProject={setProject} />
          )}

          {page === "files" && (
            <FilesPage />
          )}

          {page === "assess" && currentTask && currentDialogue && questionnaire && (
            <AssessPage
              dialogue={currentDialogue}
              questionnaire={questionnaire}
              onPrev={() => {}}
              onNext={() => {}}
              onOpenKipp={() => setKippOpen(true)}
            />
          )}

          {page === "kipp" && (
            <KippSettingsPage project={project} setProject={setProject} />
          )}

          {page === "dashboard" && (
            <DashboardPage project={project} />
          )}
        </main>
      </div>

      <KippChatDrawer open={kippOpen} onClose={() => setKippOpen(false)} project={project} />
    </div>
  );
}

const ProjectsPage: React.FC<{ project: Project; onOpen: () => void }> = ({ project, onOpen }) => (
  <div className="space-y-4">
    <h1 className="text-2xl font-semibold">Проекты</h1>
    <Section title="Список проектов" actions={<PrimaryBtn onClick={() => alert("Создание проекта (прототип)")}>Создать проект</PrimaryBtn>}>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-white/10 p-4 bg-white/5 hover:bg-white/10 transition cursor-pointer" onClick={onOpen}>
          <div className="text-sm text-white/60">Проект</div>
          <div className="text-lg font-semibold mb-2">{project.name}</div>
          <div className="text-xs text-white/60">Заданий: {project.tasks.length} · Опросников: {project.questionnaires.length}</div>
        </div>
      </div>
    </Section>
  </div>
);

const ProjectView: React.FC<{
  project: Project;
  setProject: (p: Project) => void;
  onOpenAssess: () => void;
  onOpenKipp: () => void;
  onOpenDashboard: () => void;
  onOpenFiles: () => void;
  onOpenQuestionnaires: () => void;
}> = ({ project, onOpenAssess, onOpenKipp, onOpenDashboard, onOpenFiles, onOpenQuestionnaires }) => {
  const task = project.tasks[0];
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">{project.name}</h1>
        <div className="flex gap-2">
          <Btn onClick={onOpenFiles}>Файлы</Btn>
          <Btn onClick={onOpenQuestionnaires}>Опросники</Btn>
          <Btn onClick={onOpenKipp}>KIPP</Btn>
          <PrimaryBtn onClick={onOpenDashboard}>Дашборд</PrimaryBtn>
        </div>
      </div>

      <Section title="Задания" actions={<PrimaryBtn onClick={() => alert("Создание задания (прототип)")}>Создать задание</PrimaryBtn>}>
        <div className="grid md:grid-cols-2 gap-3">
          <div className="rounded-xl border border-white/10 p-4 bg-white/5">
            <div className="text-sm text-white/60">Задание</div>
            <div className="text-lg font-semibold">{task.name}</div>
            <div className="text-xs text-white/60 mt-1">Статус: {task.status === "published" ? "Опубликовано" : "Черновик"}</div>
            <div className="text-xs text-white/60">Кейсов: {task.dialogues.length}</div>
            <div className="mt-3 flex gap-2">
              <PrimaryBtn onClick={onOpenAssess}>Открыть для оценки</PrimaryBtn>
              <Btn onClick={() => alert("Импорт файла (прототип)")}>Импорт</Btn>
            </div>
          </div>
        </div>
      </Section>
    </div>
  );
};

const QuestionnairesPage: React.FC<{ project: Project; setProject: (p: Project) => void }> = ({ project, setProject }) => {
  const [name, setName] = useState("");
  const [newLabel, setNewLabel] = useState("");
  const [newType, setNewType] = useState<QuestionType>("stars");
  const [items, setItems] = useState<Question[]>([...defaultQuestions]);

  function addQuestion() {
    if (!newLabel.trim()) return;
    const id = `q${items.length + 1}`;
    const q: Question = { id, label: newLabel, type: newType, scale: newType === "stars" ? 5 : undefined };
    setItems(prev => [...prev, q]);
    setNewLabel("");
  }

  function updateItem(id: string, patch: Partial<Question>) {
    setItems(prev => prev.map(it => (it.id === id ? { ...it, ...patch, scale: (patch.type ?? it.type) === "stars" ? (patch.scale ?? it.scale ?? 5) : undefined } : it)));
  }

  function removeItem(id: string) {
    setItems(prev => prev.filter(it => it.id !== id));
  }

  function save() {
    if (!name.trim()) return alert("Дай название опроснику");
    const q: Questionnaire = { id: `qn${project.questionnaires.length + 1}`, name, items };
    setProject({ ...project, questionnaires: [...project.questionnaires, q] });
    setName(""); setItems([...defaultQuestions]); setNewType("stars"); setNewLabel("");
    alert("Опросник сохранён (прототип)");
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Опросники</h1>

      <Section title="Существующие">
        <ul className="space-y-2 text-sm">
          {project.questionnaires.map(q => (
            <li key={q.id} className="flex items-center justify-between bg-white/5 border border-white/10 rounded-xl px-3 py-2">
              <div><span className="font-medium">{q.name}</span> <span className="text-white/50">· {q.items.length} вопросов</span></div>
              <Btn onClick={() => alert("Привязка к заданию (прототип)")}>Привязать…</Btn>
            </li>
          ))}
        </ul>
      </Section>

      <Section title="Создать опросник">
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <Input placeholder="Название опросника" value={name} onChange={e => setName(e.target.value)} />
            <div className="flex gap-2 items-center">
              <Input placeholder="Текст вопроса" value={newLabel} onChange={e => setNewLabel(e.target.value)} className="flex-1" />
              <select value={newType} onChange={e => setNewType(e.target.value as QuestionType)} className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm">
                <option value="stars">Звёзды</option>
                <option value="binary">Да/Нет</option>
                <option value="text">Свободный ответ</option>
              </select>
              <Btn onClick={addQuestion}>Добавить</Btn>
            </div>
            <PrimaryBtn onClick={save}>Сохранить</PrimaryBtn>
          </div>
          <div>
            <div className="text-sm mb-2 text-white/70">Вопросы</div>
            <div className="space-y-2">
              {items.map(it => (
                <div key={it.id} className="bg-white/5 border border-white/10 rounded-xl p-3 text-sm">
                  <div className="grid md:grid-cols-12 gap-2 items-center">
                    <Input value={it.label} onChange={e => updateItem(it.id, { label: e.target.value })} className="md:col-span-6" />
                    <select value={it.type} onChange={e => updateItem(it.id, { type: e.target.value as QuestionType })} className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm md:col-span-3">
                      <option value="stars">Звёзды</option>
                      <option value="binary">Да/Нет</option>
                      <option value="text">Свободный ответ</option>
                    </select>
                    {it.type === "stars" && (
                      <Input type="number" min={1} max={10} value={it.scale ?? 5} onChange={e => updateItem(it.id, { scale: Math.max(1, Math.min(10, parseInt(e.target.value || "5"))) })} className="md:col-span-2" />
                    )}
                    <Btn onClick={() => removeItem(it.id)} className="md:col-span-1">Удалить</Btn>
                  </div>
                  <div className="text-white/50 mt-1">{it.type === "stars" ? `Звёзды 1…${it.scale ?? 5}` : it.type === "binary" ? "Да/Нет" : "Свободный ответ"}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Section>
    </div>
  );
};

const FilesPage: React.FC = () => {
  const [files, setFiles] = useState<{ name: string; key: string }[]>([]);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function handleSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setMsg(null);
    setBusy(true);
    try {
      // 1) просим у нашего API пресайн-ссылку
      const presignRes = await fetch("/api/s3/presign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileName: file.name, contentType: file.type || "application/octet-stream" }),
      });

      if (!presignRes.ok) {
        const err = await presignRes.json().catch(() => ({}));
        throw new Error(err?.error || `presign failed: ${presignRes.status}`);
      }

      const { url, key } = (await presignRes.json()) as { url: string; key: string };

      // 2) загружаем файл напрямую в S3 через полученный URL
      const putRes = await fetch(url, {
        method: "PUT",
        headers: { "Content-Type": file.type || "application/octet-stream" },
        body: file,
      });
      if (!putRes.ok) throw new Error(`upload failed: ${putRes.status}`);

      // 3) показываем в списке
      setFiles((prev) => [{ name: file.name, key }, ...prev]);
      setMsg("Загружено!");
      e.target.value = ""; // сбрасываем инпут
    } catch (err: any) {
      setMsg(`Ошибка: ${err?.message || err}`);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Файлы</h1>

      <Section title="Загрузка">
        <div className="flex items-center gap-3">
          <input type="file" className="text-sm" onChange={handleSelect} disabled={busy} />
          {busy && <span className="text-xs text-white/60">Загружаем…</span>}
          {msg && <span className="text-xs">{msg}</span>}
        </div>
        <div className="text-xs text-white/50 mt-2">
          Файлы кладём в бакет <code>{process.env.S3_BUCKET}</code> в папку <code>uploads/</code>.
        </div>
      </Section>

      <Section title="Недавние">
        <ul className="text-sm space-y-2">
          {files.length === 0 && <li className="text-white/50">Пока пусто</li>}
          {files.map((f, i) => (
            <li key={i} className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 flex items-center justify-between">
              <div>
                <div className="font-medium">{f.name}</div>
                <div className="text-white/50 text-xs">{f.key}</div>
              </div>
              {/* объект приватный; если понадобится публичный линк — сделаем отдельный presign GET */}
            </li>
          ))}
        </ul>
      </Section>
    </div>
  );
};

const AssessPage: React.FC<{
  dialogue: Dialogue;
  questionnaire: Questionnaire;
  onPrev: () => void;
  onNext: () => void;
  onOpenKipp: () => void;
}> = ({ dialogue, questionnaire, onPrev, onNext, onOpenKipp }) => {
  const [starsA, setStarsA] = useState<Record<string, number>>({});
  const [starsB, setStarsB] = useState<Record<string, number>>({});
  const [binA, setBinA] = useState<Record<string, boolean | null>>({});
  const [binB, setBinB] = useState<Record<string, boolean | null>>({});
  const [txtA, setTxtA] = useState<Record<string, string>>({});
  const [txtB, setTxtB] = useState<Record<string, string>>({});
  const [comment, setComment] = useState("");

  function submit() {
    const needStars = questionnaire.items.filter(q => q.type === "stars");
    const filled = needStars.every(q => (starsA[q.id] ?? 0) > 0 && (starsB[q.id] ?? 0) > 0);
    if (!filled) return alert("Заполни все оценки по звёздам");
    alert("Оценка сохранена (прототип)");
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Экран оценки</h1>
        <div className="flex gap-2">
          <Btn onClick={onPrev}>← Предыдущий</Btn>
          <Btn onClick={onNext}>Следующий →</Btn>
          <PrimaryBtn onClick={onOpenKipp}>Открыть KIPP</PrimaryBtn>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <Section title="Диалог / Вариант A">
          <div className="text-sm whitespace-pre-wrap text-white/80">{dialogue.answerA}</div>
        </Section>
        <Section title="Диалог / Вариант B">
          <div className="text-sm whitespace-pre-wrap text-white/80">{dialogue.answerB}</div>
        </Section>
      </div>

      <Section title="Анкета (A и B по каждому вопросу)">
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <div className="font-semibold mb-2">Оценки варианта A</div>
            <div className="space-y-3">
              {questionnaire.items.map(q => (
                q.type === "stars" ? (
                  <StarInput key={q.id} label={q.label} value={starsA[q.id] ?? 0} max={q.scale ?? 5} onChange={(v) => setStarsA(s => ({ ...s, [q.id]: v }))} />
                ) : q.type === "binary" ? (
                  <BinaryInput key={q.id} label={q.label} value={binA[q.id] ?? null} onChange={(v) => setBinA(s => ({ ...s, [q.id]: v }))} />
                ) : (
                  <div key={q.id} className="space-y-1">
                    <div className="text-xs text-white/70">{q.label}</div>
                    <TextArea rows={2} value={txtA[q.id] ?? ""} onChange={(e) => setTxtA(s => ({ ...s, [q.id]: e.target.value }))} />
                  </div>
                )
              ))}
            </div>
          </div>
          <div>
            <div className="font-semibold mb-2">Оценки варианта B</div>
            <div className="space-y-3">
              {questionnaire.items.map(q => (
                q.type === "stars" ? (
                  <StarInput key={q.id} label={q.label} value={starsB[q.id] ?? 0} max={q.scale ?? 5} onChange={(v) => setStarsB(s => ({ ...s, [q.id]: v }))} />
                ) : q.type === "binary" ? (
                  <BinaryInput key={q.id} label={q.label} value={binB[q.id] ?? null} onChange={(v) => setBinB(s => ({ ...s, [q.id]: v }))} />
                ) : (
                  <div key={q.id} className="space-y-1">
                    <div className="text-xs text-white/70">{q.label}</div>
                    <TextArea rows={2} value={txtB[q.id] ?? ""} onChange={(e) => setTxtB(s => ({ ...s, [q.id]: e.target.value }))} />
                  </div>
                )
              ))}
            </div>
          </div>
        </div>
        <div className="mt-4">
          <TextArea rows={3} placeholder="Комментарий (опционально)" value={comment} onChange={(e) => setComment(e.target.value)} />
        </div>
        <div className="mt-4 flex gap-2">
          <Btn onClick={() => alert("Черновик сохранён (прототип)")}>Сохранить черновик</Btn>
          <PrimaryBtn onClick={submit}>Завершить оценку</PrimaryBtn>
        </div>
      </Section>
    </div>
  );
};

const KippSettingsPage: React.FC<{ project: Project; setProject: (p: Project) => void }> = ({ project, setProject }) => {
  const [model, setModel] = useState(project.kipp.model);
  const [systemPrompt, setSystemPrompt] = useState(project.kipp.systemPrompt);
  const [quick, setQuick] = useState(project.kipp.quickPrompts.join("\n"));

  function save() {
    setProject({ ...project, kipp: { model, systemPrompt, quickPrompts: quick.split("\n").filter(Boolean) } });
    alert("Сохранено (прототип)");
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">KIPP — настройки</h1>
      <Section title="Основное">
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <label className="text-sm text-white/70">Модель</label>
            <Input value={model} onChange={(e) => setModel(e.target.value)} />
            <label className="text-sm text-white/70">Системный промпт</label>
            <TextArea rows={6} value={systemPrompt} onChange={(e) => setSystemPrompt(e.target.value)} />
          </div>
          <div className="space-y-3">
            <label className="text-sm text-white/70">Быстрые подсказки (по одной в строке)</label>
            <TextArea rows={10} value={quick} onChange={(e) => setQuick(e.target.value)} />
            <PrimaryBtn onClick={save}>Сохранить</PrimaryBtn>
          </div>
        </div>
      </Section>
    </div>
  );
};

const DashboardPage: React.FC<{ project: Project }> = ({ project }) => {
  const task = project.tasks[0];
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Дашборд</h1>
      <Section title="Прогресс">
        <div className="text-sm text-white/70">Пока показываем заглушку: оценено 3/10. В реальности сюда придут агрегации и метрики согласованности.</div>
      </Section>
      <Section title="Сводка A/B">
        <div className="grid md:grid-cols-3 gap-4 text-center">
          <div className="bg-white/5 rounded-xl p-4 border border-white/10">
            <div className="text-white/60 text-xs">Средний балл A</div>
            <div className="text-2xl font-semibold">4.2</div>
          </div>
          <div className="bg-white/5 rounded-xl p-4 border border-white/10">
            <div className="text-white/60 text-xs">Средний балл B</div>
            <div className="text-2xl font-semibold">3.9</div>
          </div>
          <div className="bg-white/5 rounded-xl p-4 border border-white/10">
            <div className="text-white/60 text-xs">% победителя (A)</div>
            <div className="text-2xl font-semibold">62%</div>
          </div>
        </div>
      </Section>
      <Section title="Кейсы">
        <div className="text-sm text-white/70">Кейсов в задании: {task.dialogues.length}. Тут будет таблица с фильтрами и экспортом.</div>
      </Section>
    </div>
  );
};

const KippChatDrawer: React.FC<{ open: boolean; onClose: () => void; project: Project }> = ({ open, onClose, project }) => {
  const [messages, setMessages] = useState<{ role: "system" | "user" | "assistant"; content: string }[]>([
    { role: "system", content: project.kipp.systemPrompt },
    { role: "assistant", content: "Я — КИПП. Готов помочь." },
  ]);
  const [input, setInput] = useState("");

  function sendQuick(s: string) {
    setMessages(m => [...m, { role: "user", content: s }, { role: "assistant", content: "(Ответ КИППа — прототип)" }]);
  }

  function send() {
    if (!input.trim()) return;
    setMessages(m => [...m, { role: "user", content: input }, { role: "assistant", content: "(Ответ КИППа — прототип)" }]);
    setInput("");
  }

  return (
    <div className={`fixed top-0 right-0 h-full w-[420px] bg-black/90 border-l border-white/10 backdrop-blur transition-transform duration-300 ${open ? "translate-x-0" : "translate-x-full"}`}>
      <div className="flex items-center justify-between p-4 border-b border-white/10">
        <div className="font-semibold">KIPP — чат</div>
        <Btn onClick={onClose}>Закрыть</Btn>
      </div>
      <div className="p-4 space-y-3 h-[calc(100%-140px)] overflow-auto">
        {messages.map((m, i) => (
          <div key={i} className={`text-sm ${m.role === "user" ? "text-white" : m.role === "assistant" ? "text-white/90" : "text-white/50"}`}>
            <div className="text-[10px] uppercase tracking-wide text-white/40 mb-1">{m.role}</div>
            <div className="bg-white/5 border border-white/10 rounded-xl p-3 whitespace-pre-wrap">{m.content}</div>
          </div>
        ))}
      </div>
      <div className="p-4 border-t border-white/10 space-y-2">
        <div className="flex gap-2 flex-wrap">
          {project.kipp.quickPrompts.map((q, i) => (
            <Btn key={i} onClick={() => sendQuick(q)}>{q}</Btn>
          ))}
        </div>
        <div className="flex gap-2">
          <Input placeholder="Сообщение КИППу…" value={input} onChange={(e) => setInput(e.target.value)} className="flex-1" />
          <PrimaryBtn onClick={send}>Отправить</PrimaryBtn>
        </div>
      </div>
    </div>
  );
};
