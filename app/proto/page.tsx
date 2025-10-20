'use client';
import React, { useEffect, useMemo, useRef, useState } from "react";

/**
 * VALIDATIO – SPA-прототип на React (один файл)
 * Полностью на русском. Хранение в localStorage. Без бэкенда.
 * Цель: показать целевой UX до переноса в Next.js / Codex.
 */

// ============================= Типы =============================

type QuestionType = "stars" | "binary" | "text";

interface Question {
  id: string;
  label: string;
  type: QuestionType;
  scale?: number; // для stars (3–10)
}

type TaskStatus = "Новая" | "В работе" | "Завершена";

interface TaskFile {
  id: string;
  name: string;
  size: number;
  content?: any; // распарсенный JSON
}

interface Task {
  id: string;
  name: string;
  projectId: string;
  status: TaskStatus;
  files: TaskFile[];
  createdAt: string;
}

interface ProjectKippCfg {
  model: string;
  systemPrompt: string;
  quickPrompts: string[];
}

interface Project {
  id: string;
  name: string;
  instruction: string; // Инструкция для асессоров
  questionnaire: Question[];
  taskIds: string[];
  createdAt: string;
  kipp: ProjectKippCfg; // настройки KIPP для проекта
}

// ============================= Утилиты =============================

const uid = () =>
  typeof crypto !== "undefined" && (crypto as any).randomUUID
    ? (crypto as any).randomUUID()
    : Math.random().toString(36).slice(2);

function save<T>(key: string, value: T) {
  localStorage.setItem(key, JSON.stringify(value));
}
function load<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

// ============================= Хранилище (localStorage) =============================

const PKEY = "validatio:projects";
const TKEY = "validatio:tasks";

function useDb() {
  const [projects, setProjects] = useState<Project[]>(() => load<Project[]>(PKEY, []));
  const [tasks, setTasks] = useState<Task[]>(() => load<Task[]>(TKEY, []));

  useEffect(() => save(PKEY, projects), [projects]);
  useEffect(() => save(TKEY, tasks), [tasks]);

  // ----- Projects -----
  const createProject = (data: { name: string; instruction?: string }) => {
    const proj: Project = {
      id: uid(),
      name: data.name.trim(),
      instruction: data.instruction ?? "",
      questionnaire: [
        { id: uid(), label: "Качество ответа (звёзды)", type: "stars", scale: 5 },
        { id: uid(), label: "Ответ релевантен?", type: "binary" },
        { id: uid(), label: "Комментарий", type: "text" },
      ],
      taskIds: [],
      createdAt: new Date().toISOString(),
      kipp: {
        model: "gpt-4o-mini",
        systemPrompt:
          "Вы — ассистент разметчика. Кратко и по делу помогайте оценивать ответы.",
        quickPrompts: ["Подскажи критерии релевантности", "Есть ли токсичность?"],
      },
    };
    setProjects((arr) => [proj, ...arr]);
    return proj;
  };

  const updateProject = (id: string, patch: Partial<Project>) => {
    setProjects((arr) => arr.map((p) => (p.id === id ? { ...p, ...patch } : p)));
  };

  // ----- Tasks -----
  const createTask = (data: { projectId: string; name: string; files: TaskFile[] }) => {
    const task: Task = {
      id: uid(),
      name: data.name.trim(),
      projectId: data.projectId,
      status: "Новая",
      files: data.files,
      createdAt: new Date().toISOString(),
    };
    setTasks((arr) => [task, ...arr]);
    setProjects((arr) =>
      arr.map((p) => (p.id === data.projectId ? { ...p, taskIds: [task.id, ...p.taskIds] } : p))
    );
    return task;
  };

  const updateTask = (id: string, patch: Partial<Task>) => {
    setTasks((arr) => arr.map((t) => (t.id === id ? { ...t, ...patch } : t)));
  };

  return { projects, tasks, createProject, updateProject, createTask, updateTask };
}

// ============================= Навигация (SPA) =============================

type View =
  | { name: "dashboard" }
  | { name: "projects" }
  | { name: "projectNew" }
  | { name: "project"; id: string }
  | { name: "questionnaire"; id: string }
  | { name: "taskNew"; projectId: string }
  | { name: "task"; taskId: string }
  | { name: "annotators" }
  | { name: "settings" }
  | { name: "kippSettings"; projectId: string };

// ============================= Базовая оболочка =============================

const PageShell: React.FC<{
  title?: string;
  setView: (v: View) => void;
  view: View;
}> = ({ children, title, setView, view }) => {
  const NavItem: React.FC<{
    label: string;
    active: boolean;
    onClick: () => void;
  }> = ({ label, active, onClick }) => (
    <button
      onClick={onClick}
      className={`w-full text-left px-4 py-2 rounded-lg transition ${
        active ? "bg-zinc-700 text-white" : "text-zinc-200 hover:bg-zinc-800"
      }`}
    >
      {label}
    </button>
  );

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex">
      {/* Sidebar */}
      <aside className="w-64 border-r border-zinc-800 p-4 hidden md:block">
        <div className="text-xl font-semibold mb-6">Validatio</div>
        <nav className="space-y-1">
          <NavItem
            label="Дашборд"
            active={view.name === "dashboard"}
            onClick={() => setView({ name: "dashboard" })}
          />
          <NavItem
            label="Проекты"
            active={
              view.name === "projects" ||
              view.name === "project" ||
              view.name === "projectNew"
            }
            onClick={() => setView({ name: "projects" })}
          />
          <NavItem
            label="Разметчики"
            active={view.name === "annotators"}
            onClick={() => setView({ name: "annotators" })}
          />
          <NavItem
            label="Настройки"
            active={view.name === "settings"}
            onClick={() => setView({ name: "settings" })}
          />
        </nav>
      </aside>

      {/* Main */}
      <main className="flex-1">
        {/* Header */}
        <header className="sticky top-0 z-10 bg-zinc-950/80 backdrop-blur border-b border-zinc-800 px-4 py-3 flex items-center justify-between">
          <div className="text-lg font-medium">{title ?? ""}</div>
        </header>
        <div className="p-4">{children}</div>
      </main>
    </div>
  );
};

// ============================= Модалки и UI-утилиты =============================

const Modal: React.FC<{
  open: boolean;
  onClose: () => void;
  title: string;
}> = ({ open, onClose, title, children }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-zinc-900 border border-zinc-800 rounded-xl shadow-xl">
        <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800">
          <div className="font-semibold">{title}</div>
          <button onClick={onClose} className="text-zinc-400 hover:text-white">
            ✕
          </button>
        </div>
        <div className="p-4">{children}</div>
      </div>
    </div>
  );
};

const Confirm: React.FC<{
  open: boolean;
  title: string;
  message: string;
  onYes: () => void;
  onNo: () => void;
}> = ({ open, title, message, onYes, onNo }) => (
  <Modal open={open} onClose={onNo} title={title}>
    <div className="space-y-4">
      <p className="text-zinc-300">{message}</p>
      <div className="flex justify-end gap-2">
        <button className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700" onClick={onNo}>
          Нет
        </button>
        <button className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white" onClick={onYes}>
          Да
        </button>
      </div>
    </div>
  </Modal>
);

const EmptyState: React.FC<{ title: string; action?: React.ReactNode }> = ({ title, action }) => (
  <div className="border border-dashed border-zinc-800 rounded-xl p-10 text-center">
    <div className="text-zinc-300 mb-3">{title}</div>
    {action}
  </div>
);

// ============================= Формы =============================

const ProjectForm: React.FC<{
  onSubmit: (data: { name: string; instruction: string }) => void;
}> = ({ onSubmit }) => {
  const [name, setName] = useState("");
  const [instruction, setInstruction] = useState("");
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (!name.trim()) return;
        onSubmit({ name, instruction });
      }}
      className="space-y-4"
    >
      <div>
        <label className="block text-sm mb-1">Название проекта</label>
        <input
          className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Например: Разметка диалогов v1"
        />
      </div>
      <div>
        <label className="block text-sm mb-1">Инструкция для асессоров</label>
        <textarea
          className="w-full min-h-[140px] bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2"
          value={instruction}
          onChange={(e) => setInstruction(e.target.value)}
          placeholder="Опишите критерии оценки, запреты, примеры и т.п."
        />
      </div>
      <div className="flex justify-end">
        <button className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 rounded-lg text-white">
          Создать
        </button>
      </div>
    </form>
  );
};

const TaskUpload: React.FC<{
  onCreate: (data: { name: string; files: TaskFile[] }) => void;
}> = ({ onCreate }) => {
  const [name, setName] = useState("");
  const [files, setFiles] = useState<TaskFile[]>([]);

  async function handleFiles(list: FileList | null) {
    if (!list) return;
    const arr: TaskFile[] = [];
    for (const f of Array.from(list)) {
      if (!f.name.endsWith(".json")) continue;
      const text = await f.text();
      let parsed: any = null;
      try {
        parsed = JSON.parse(text);
      } catch {}
      arr.push({ id: uid(), name: f.name, size: f.size, content: parsed });
    }
    setFiles(arr);
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (!name.trim()) return;
        onCreate({ name, files });
      }}
      className="space-y-4"
    >
      <div>
        <label className="block text-sm mb-1">Название задачи</label>
        <input
          className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Например: Диалоги 2024-10-19"
        />
      </div>
      <div>
        <label className="block text-sm mb-1">Загрузка JSON-файлов</label>
        <input type="file" multiple accept=".json" onChange={(e) => handleFiles(e.target.files)} />
        <div className="mt-3 space-y-2">
          {files.map((f) => (
            <div
              key={f.id}
              className="text-sm text-zinc-300 flex items-center justify-between bg-zinc-800/60 border border-zinc-700 rounded-lg px-3 py-2"
            >
              <div>
                <div className="font-medium">{f.name}</div>
                <div className="text-xs text-zinc-400">{(f.size / 1024).toFixed(1)} КБ</div>
              </div>
              <div className="text-xs text-zinc-400">{f.content ? "JSON ок" : "не удалось распарсить"}</div>
            </div>
          ))}
        </div>
      </div>
      <div className="flex justify-end">
        <button className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 rounded-lg text-white">
          Создать задачу
        </button>
      </div>
    </form>
  );
};

// ============================= Компоненты страниц =============================

const Dashboard: React.FC<{
  projects: Project[];
  tasks: Task[];
  setView: (v: View) => void;
}> = ({ projects, tasks, setView }) => {
  const inProgress = tasks.filter((t) => t.status === "В работе").length;
  const done = tasks.filter((t) => t.status === "Завершена").length;

  const Card: React.FC<{
    title: string;
    value: number;
    onClick?: () => void;
  }> = ({ title, value, onClick }) => (
    <button onClick={onClick} className="text-left w-full bg-zinc-900 border border-zinc-800 rounded-xl p-5 hover:bg-zinc-900/70">
      <div className="text-sm text-zinc-400">{title}</div>
      <div className="text-3xl font-semibold mt-1">{value}</div>
    </button>
  );

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card title="Проектов" value={projects.length} onClick={() => setView({ name: "projects" })} />
        <Card title="Задач всего" value={tasks.length} />
        <Card title="В работе" value={inProgress} />
        <Card title="Завершено" value={done} />
      </div>
      <EmptyState
        title="Добро пожаловать! Перейдите во вкладку “Проекты”, чтобы создать первый проект."
        action={
          <button onClick={() => setView({ name: "projects" })} className="mt-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-white">
            К проектам
          </button>
        }
      />
    </div>
  );
};

const ProjectsPage: React.FC<{
  projects: Project[];
  tasks: Task[];
  setView: (v: View) => void;
}> = ({ projects, tasks, setView }) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Проекты</h2>
        <button className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white" onClick={() => setView({ name: "projectNew" })}>
          Создать проект
        </button>
      </div>
      {projects.length === 0 ? (
        <EmptyState
          title="Пока нет проектов"
          action={
            <button className="mt-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 rounded-lg text-white" onClick={() => setView({ name: "projectNew" })}>
              Создать проект
            </button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {projects.map((p) => {
            const pTasks = tasks.filter((t) => t.projectId === p.id);
            return (
              <div key={p.id} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
                <div className="font-medium text-lg">{p.name}</div>
                <div className="text-sm text-zinc-400 mt-1">Задач: {pTasks.length}</div>
                <div className="flex gap-2 mt-4">
                  <button className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700" onClick={() => setView({ name: "project", id: p.id })}>
                    Открыть
                  </button>
                  <button className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700" onClick={() => setView({ name: "questionnaire", id: p.id })}>
                    Настроить вопросы
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

const ProjectNewPage: React.FC<{
  create: (d: { name: string; instruction: string }) => Project;
  setView: (v: View) => void;
}> = ({ create, setView }) => (
  <div className="max-w-3xl">
    <h2 className="text-xl font-semibold mb-4">Новый проект</h2>
    <div className="mb-4">
      <button className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700" onClick={() => setView({ name: "projects" })}>
        ← Назад к списку проектов
      </button>
    </div>
    <ProjectForm
      onSubmit={(data) => {
        const proj = create(data);
        setView({ name: "project", id: proj.id });
      }}
    />
  </div>
);

const ProjectDetailPage: React.FC<{
  project: Project;
  tasks: Task[];
  setView: (v: View) => void;
  updateProject: (id: string, patch: Partial<Project>) => void;
  updateTask: (id: string, patch: Partial<Task>) => void;
}> = ({ project, tasks, setView, updateProject, updateTask }) => {
  const [editing, setEditing] = useState(false);
  const [instruction, setInstruction] = useState(project.instruction);
  const [statusFilter, setStatusFilter] = useState<"Все" | TaskStatus>("Все");

  const pTasksAll = tasks.filter((t) => t.projectId === project.id);
  const pTasks = pTasksAll.filter((t) => (statusFilter === "Все" ? true : t.status === statusFilter));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700" onClick={() => setView({ name: "projects" })}>
            ← К проектам
          </button>
          <h2 className="text-xl font-semibold">{project.name}</h2>
        </div>
        <div className="space-x-2">
          <button className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700" onClick={() => setView({ name: "taskNew", projectId: project.id })}>
            Создать задачу
          </button>
          <button className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700" onClick={() => setView({ name: "questionnaire", id: project.id })}>
            Настроить вопросы
          </button>
          <button className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700" onClick={() => setView({ name: "kippSettings", projectId: project.id })}>
            Настроить KIPP
          </button>
        </div>
      </div>

      {/* Инструкция */}
      <section className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
        <div className="flex items-center justify-between">
          <div className="font-medium">Инструкция для асессоров</div>
          <button className="text-sm text-indigo-400 hover:text-indigo-300" onClick={() => setEditing((v) => !v)}>
            {editing ? "Отменить" : "Редактировать"}
          </button>
        </div>
        {editing ? (
          <div className="mt-3 space-y-3">
            <textarea
              className="w-full min-h-[160px] bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2"
              value={instruction}
              onChange={(e) => setInstruction(e.target.value)}
            />
            <div className="flex justify-end">
              <button
                className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white"
                onClick={() => {
                  updateProject(project.id, { instruction });
                  setEditing(false);
                }}
              >
                Сохранить
              </button>
            </div>
          </div>
        ) : (
          <p className="mt-2 whitespace-pre-wrap text-zinc-300">{project.instruction || "Инструкция не заполнена."}</p>
        )}
      </section>

      {/* Задачи */}
      <section className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="font-medium">Задачи</div>
          <select
            className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-1.5 text-sm"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
          >
            <option value="Все">Все</option>
            <option value="Новая">Новая</option>
            <option value="В работе">В работе</option>
            <option value="Завершена">Завершена</option>
          </select>
        </div>
        {pTasks.length === 0 ? (
          <EmptyState
            title={statusFilter === "Все" ? "Задач нет" : "Нет задач с выбранным статусом"}
            action={
              <button className="mt-2 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white" onClick={() => setView({ name: "taskNew", projectId: project.id })}>
                Создать задачу
              </button>
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-zinc-400">
                <tr>
                  <th className="text-left py-2 pr-3">Название</th>
                  <th className="text-left py-2 pr-3">Статус</th>
                  <th className="text-left py-2 pr-3">Файлов</th>
                  <th className="text-left py-2 pr-3">Создана</th>
                  <th className="text-left py-2 pr-3">Действия</th>
                </tr>
              </thead>
              <tbody>
                {pTasks.map((t) => (
                  <tr key={t.id} className="border-t border-zinc-800">
                    <td className="py-2 pr-3">{t.name}</td>
                    <td className="py-2 pr-3">
                      <span className="px-2 py-0.5 rounded bg-zinc-800 text-zinc-200">{t.status}</span>
                    </td>
                    <td className="py-2 pr-3">{t.files.length}</td>
                    <td className="py-2 pr-3">{new Date(t.createdAt).toLocaleString()}</td>
                    <td className="py-2 pr-3 space-x-2">
                      <button className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700" onClick={() => setView({ name: "task", taskId: t.id })}>
                        Открыть
                      </button>
                      {t.status === "Новая" && (
                        <button className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white" onClick={() => updateTask(t.id, { status: "В работе" })}>
                          Отправить на разметку
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
};

const QuestionnaireEditor: React.FC<{
  project: Project;
  updateProject: (id: string, patch: Partial<Project>) => void;
  goBack: () => void;
}> = ({ project, updateProject, goBack }) => {
  const [items, setItems] = useState<Question[]>(project.questionnaire);

  const addQuestion = (type: QuestionType) => {
    setItems((arr) => [
      ...arr,
      { id: uid(), label: "Новый вопрос", type, scale: type === "stars" ? 5 : undefined },
    ]);
  };

  const save = () => updateProject(project.id, { questionnaire: items });

  return (
    <div className="max-w-3xl space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Вопросы проекта</h2>
        <div className="space-x-2">
          <button className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700" onClick={() => addQuestion("stars")}>
            Добавить «Звёзды»
          </button>
          <button className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700" onClick={() => addQuestion("binary")}>
            Добавить «Да/Нет»
          </button>
          <button className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700" onClick={() => addQuestion("text")}>
            Добавить «Текст»
          </button>
        </div>
      </div>

      <div className="space-y-3">
        {items.map((q, i) => (
          <div key={q.id} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
            <div className="text-sm text-zinc-400">Вопрос {i + 1}</div>
            <div className="mt-2 grid md:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm mb-1">Текст</label>
                <input
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2"
                  value={q.label}
                  onChange={(e) =>
                    setItems((arr) => arr.map((it) => (it.id === q.id ? { ...it, label: e.target.value } : it)))
                  }
                />
              </div>
              <div>
                <label className="block text-sm mb-1">Тип</label>
                <select
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2"
                  value={q.type}
                  onChange={(e) =>
                    setItems((arr) =>
                      arr.map((it) =>
                        it.id === q.id
                          ? {
                              ...it,
                              type: e.target.value as QuestionType,
                              scale: e.target.value === "stars" ? it.scale ?? 5 : undefined,
                            }
                          : it
                      )
                    )
                  }
                >
                  <option value="stars">Звёзды</option>
                  <option value="binary">Да/Нет</option>
                  <option value="text">Текст</option>
                </select>
              </div>
              {q.type === "stars" && (
                <div>
                  <label className="block text-sm mb-1">Шкала (3–10)</label>
                  <input
                    type="number"
                    min={3}
                    max={10}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2"
                    value={q.scale ?? 5}
                    onChange={(e) =>
                      setItems((arr) =>
                        arr.map((it) => (it.id === q.id ? { ...it, scale: Number(e.target.value) } : it))
                      )
                    }
                  />
                </div>
              )}
            </div>
            <div className="flex justify-end mt-3">
              <button className="text-sm text-red-400 hover:text-red-300" onClick={() => setItems((arr) => arr.filter((it) => it.id !== q.id))}>
                Удалить
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-between">
        <button className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700" onClick={goBack}>
          Назад к проекту
        </button>
        <button className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white" onClick={save}>
          Сохранить
        </button>
      </div>
    </div>
  );
};

const DialogViewer: React.FC<{ title: string; data: any[] | undefined }> = ({ title, data }) => {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
      <div className="font-medium mb-3">{title}</div>
      {!data || data.length === 0 ? (
        <div className="text-zinc-400 text-sm">Нет данных диалога.</div>
      ) : (
        <div className="space-y-2 max-h-[300px] overflow-auto">
          {data.map((turn, idx) => (
            <div key={idx} className={`px-3 py-2 rounded-lg inline-block ${turn.speaker === "user" ? "bg-zinc-800" : "bg-indigo-900/30"}`}>
              <div className="text-xs text-zinc-400 mb-0.5">{turn.speaker}</div>
              <div>{String(turn.text ?? turn.content ?? "")}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const Stars: React.FC<{
  value: number;
  onChange: (v: number) => void;
  max?: number;
}> = ({ value, onChange, max = 5 }) => (
  <div className="flex gap-1">
    {Array.from({ length: max }, (_, i) => i + 1).map((n) => (
      <button
        key={n}
        onClick={() => onChange(n)}
        className={"text-2xl " + (n <= value ? "text-yellow-400" : "text-zinc-600")}
        aria-label={`Поставить ${n} из ${max}`}
      >
        ★
      </button>
    ))}
  </div>
);

// ============================= KIPP Панель (фикс) =============================

const KippPanel: React.FC<{
  open: boolean;
  onClose: () => void;
  project: Project;
  context: any;
}> = ({ open, onClose, project, context }) => {
  const [chat, setChat] = useState<{ role: "user" | "assistant"; text: string }[]>([]);
  const [input, setInput] = useState("");

  if (!open) return null;

  function reply() {
    const text = input.trim();
    if (!text) return;
    const userMsg = { role: "user" as const, text };

    // Простая заглушка-"модель": формируем подсказку на основе контекста
    const suggestion = `Модель: ${project.kipp.model}.\nРекомендация: проверьте соответствие ответа инструкции проекта, используйте шкалу ${
      project.questionnaire.find((q) => q.type === "stars")?.scale ?? 5
    } и отметьте релевантность.\nКонтекст: ${typeof context === "string" ? context : "см. текущие диалоги"}.`;
    const botMsg = { role: "assistant" as const, text: suggestion };
    setChat((c) => [...c, userMsg, botMsg]);
    setInput("");
  }

  return (
    <div className="fixed inset-0 flex justify-end">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <aside className="relative z-10 w-full max-w-md h-full bg-zinc-950 border-l border-zinc-800 p-4 flex flex-col">
        <div className="flex items-center justify-between mb-2">
          <div className="font-semibold">KIPP помощник</div>
          <button onClick={onClose} className="text-zinc-400 hover:text-white">✕</button>
        </div>
        <div className="text-xs text-zinc-400 mb-2">Модель: {project.kipp.model}</div>
        <div className="flex-1 overflow-auto space-y-2">
          {chat.length === 0 && (
            <div className="text-zinc-400 text-sm">Задайте вопрос по текущему примеру или нажмите на быструю подсказку ниже.</div>
          )}
          {chat.map((m, i) => (
            <div key={i} className={`p-2 rounded-lg ${m.role === "user" ? "bg-zinc-800" : "bg-indigo-900/30"}`}>
              <div className="text-xs text-zinc-400 mb-0.5">{m.role}</div>
              <div className="whitespace-pre-wrap">{m.text}</div>
            </div>
          ))}
        </div>
        <div className="mt-2 grid grid-cols-3 gap-2">
          {project.kipp.quickPrompts.map((qp) => (
            <button key={qp} className="text-xs px-2 py-1 rounded bg-zinc-800 hover:bg-zinc-700" onClick={() => setInput(qp)}>
              {qp}
            </button>
          ))}
        </div>
        <div className="mt-2 flex gap-2">
          <input
            className="flex-1 bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2"
            placeholder="Спросить KIPP…"
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <button className="px-3 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white" onClick={reply}>
            Отправить
          </button>
        </div>
      </aside>
    </div>
  );
};

const TaskPage: React.FC<{
  task: Task;
  project: Project;
  updateTask: (id: string, patch: Partial<Task>) => void;
}> = ({ task, project, updateTask }) => {
  // предполагаем формат { dialogueA: [...], dialogueB: [...] } или массив таких объектов
  const allItems = useMemo(() => {
    const items: any[] = [];
    for (const f of task.files) {
      const c = f.content;
      if (!c) continue;
      if (Array.isArray(c)) items.push(...c);
      else items.push(c);
    }
    return items;
  }, [task.files]);

  const [index, setIndex] = useState(0);
  const item = allItems[index];

  // ===== Автосохранение ответов по каждому примеру =====
  const ANSW_KEY = useMemo(() => `validatio:answers:${task.id}`, [task.id]);
  const [answersByIndex, setAnswersByIndex] = useState<Record<number, Record<string, any>>>(() => {
    try {
      const raw = localStorage.getItem(ANSW_KEY);
      return raw ? (JSON.parse(raw) as Record<number, Record<string, any>>) : {};
    } catch {
      return {};
    }
  });
  const currentAnswers = answersByIndex[index] ?? {};
  const [saveState, setSaveState] = useState<"" | "Черновик" | "Сохранено">("");
  const firstSave = useRef(true);

  function persist(next: Record<number, Record<string, any>>) {
    try {
      localStorage.setItem(ANSW_KEY, JSON.stringify(next));
    } catch {}
  }

  function setAnswer(qid: string, value: any) {
    setSaveState("Черновик");
    setAnswersByIndex((map) => {
      const next = { ...map, [index]: { ...(map[index] ?? {}), [qid]: value } };
      persist(next);
      return next;
    });
  }

  useEffect(() => {
    if (firstSave.current) {
      firstSave.current = false;
      return;
    }
    const t = setTimeout(() => setSaveState("Сохранено"), 150);
    return () => clearTimeout(t);
  }, [answersByIndex]);

  // ===== Проверки заполненности =====
  function isAnswered(q: Question, a: any): boolean {
    if (q.type === "stars") return typeof a === "number" && a > 0;
    if (q.type === "binary") return a === true || a === false;
    if (q.type === "text") return typeof a === "string" && a.trim().length > 0;
    return false;
  }

  const currentComplete = project.questionnaire.every((q) => isAnswered(q, (currentAnswers as any)[q.id]));

  const allComplete = allItems.every((_, i) => {
    const ans = answersByIndex[i] ?? {};
    return project.questionnaire.every((q) => isAnswered(q, (ans as any)[q.id]));
  });

  const [kippOpen, setKippOpen] = useState(false);
  const [confirmType, setConfirmType] = useState<"" | "complete" | "incomplete">("");
  const [blockMsg, setBlockMsg] = useState<string>("");

  function gotoNext() {
    if (!currentComplete) {
      setBlockMsg("Ответьте на все вопросы, чтобы перейти к следующему примеру.");
      setTimeout(() => setBlockMsg(""), 2000);
      return;
    }
    setIndex((i) => Math.min(allItems.length - 1, i + 1));
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-lg font-semibold">{task.name}</div>
          <div className="text-sm text-zinc-400">Статус: {task.status}</div>
        </div>
        <div className="space-x-2">
          <button className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700" onClick={() => setKippOpen(true)}>
            Открыть KIPP
          </button>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <DialogViewer title="Диалог A" data={item?.dialogueA} />
        <DialogViewer title="Диалог B" data={item?.dialogueB} />
      </div>

      <section className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
        <div className="font-medium mb-3">Опросник</div>
        <div className="space-y-4">
          {project.questionnaire.map((q) => (
            <div key={q.id} className="space-y-2">
              <div className="text-sm">{q.label}</div>
              {q.type === "stars" && (
                <Stars value={(currentAnswers[q.id] as number) ?? 0} onChange={(v) => setAnswer(q.id, v)} max={q.scale ?? 5} />
              )}
              {q.type === "binary" && (
                <div className="flex gap-4 text-sm">
                  <label className="inline-flex items-center gap-2">
                    <input type="radio" name={q.id} checked={currentAnswers[q.id] === true} onChange={() => setAnswer(q.id, true)} />
                    Да
                  </label>
                  <label className="inline-flex items-center gap-2">
                    <input type="radio" name={q.id} checked={currentAnswers[q.id] === false} onChange={() => setAnswer(q.id, false)} />
                    Нет
                  </label>
                </div>
              )}
              {q.type === "text" && (
                <textarea
                  className="w-full min-h-[80px] bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2"
                  value={(currentAnswers[q.id] as string) ?? ""}
                  onChange={(e) => setAnswer(q.id, e.target.value)}
                />
              )}
            </div>
          ))}
        </div>
        <div className="flex items-center justify-between mt-4">
          <button className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700" onClick={() => setIndex((i) => Math.max(0, i - 1))}>
            ← Предыдущий пример
          </button>
          <div className="text-sm text-zinc-400">
            {allItems.length ? `Пример ${index + 1} из ${allItems.length}` : "Нет данных"}
            {saveState && <span className="ml-2 text-xs text-zinc-400">— {saveState}</span>}
          </div>
          <button className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700" onClick={gotoNext}>
            Следующий пример →
          </button>
        </div>
        {blockMsg && <div className="mt-3 text-sm text-amber-400">{blockMsg}</div>}
        <div className="flex justify-end mt-3">
          <button className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white" onClick={() => setConfirmType(allComplete ? "complete" : "incomplete")}>
            Завершить оценку
          </button>
        </div>
      </section>

      <KippPanel open={kippOpen} onClose={() => setKippOpen(false)} project={project} context={item} />

      {/* Подтверждения */}
      <Confirm
        open={confirmType === "complete"}
        title="Завершить оценку?"
        message="Вы уверены, что хотите завершить оценку по этой задаче? Статус будет изменён на «Завершена»."
        onNo={() => setConfirmType("")}
        onYes={() => {
          try {
            localStorage.setItem(ANSW_KEY, JSON.stringify(answersByIndex));
          } catch {}
          updateTask(task.id, { status: "Завершена" });
          setConfirmType("");
        }}
      />

      <Confirm
        open={confirmType === "incomplete"}
        title="Ещё не всё оценено"
        message="Красотуля, ты не закончил(а) оценку всего задания. Ты уверен(а), что хочешь завершить оценку?"
        onNo={() => setConfirmType("")}
        onYes={() => {
          try {
            localStorage.setItem(ANSW_KEY, JSON.stringify(answersByIndex));
          } catch {}
          updateTask(task.id, { status: "Завершена" });
          setConfirmType("");
        }}
      />
    </div>
  );
};

// ============================= KIPP SETTINGS =============================

const KippSettingsPage: React.FC<{
  project: Project;
  onSave: (p: Partial<Project>) => void;
  goBack: () => void;
}> = ({ project, onSave, goBack }) => {
  const [model, setModel] = useState(project.kipp.model);
  const [systemPrompt, setSystemPrompt] = useState(project.kipp.systemPrompt);
  const [quick, setQuick] = useState(project.kipp.quickPrompts.join("\n"));

  return (
    <div className="max-w-3xl space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Настройки KIPP — {project.name}</h2>
        <button className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700" onClick={goBack}>
          ← К проекту
        </button>
      </div>
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 space-y-4">
        <div>
          <label className="block text-sm mb-1">Модель</label>
          <select className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2" value={model} onChange={(e) => setModel(e.target.value)}>
            <option value="gpt-4o-mini">GPT-4o-mini</option>
            <option value="gpt-4o">GPT-4o</option>
            <option value="claude-3.5">Claude 3.5</option>
          </select>
        </div>
        <div>
          <label className="block text-sm mb-1">System Prompt</label>
          <textarea className="w-full min-h-[120px] bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2" value={systemPrompt} onChange={(e) => setSystemPrompt(e.target.value)} />
        </div>
        <div>
          <label className="block text-sm mb-1">Быстрые подсказки (по одной в строке)</label>
          <textarea className="w-full min-h-[100px] bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2" value={quick} onChange={(e) => setQuick(e.target.value)} />
        </div>
        <div className="flex justify-end">
          <button
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 rounded-lg text-white"
            onClick={() =>
              onSave({
                kipp: {
                  model,
                  systemPrompt,
                  quickPrompts: quick
                    .split("\n")
                    .map((s) => s.trim())
                    .filter(Boolean),
                },
              })
            }
          >
            Сохранить
          </button>
        </div>
      </div>
    </div>
  );
};

// ============================= Основное приложение =============================

export default function App() {
  const { projects, tasks, createProject, updateProject, createTask, updateTask } = useDb();
  const [view, setView] = useState<View>({ name: "dashboard" });

  // Если данных нет — создадим демо-проект при первом запуске, чтобы был сценарий
  useEffect(() => {
    if (projects.length === 0) {
      const demo = createProject({
        name: "Демо-проект",
        instruction:
          "Пожалуйста, оценивайте ответы ассистента по трём критериям: звёзды, релевантность (да/нет) и комментарий.",
      });
      // добавим демо-задачу с микроданными
      const demoFile: TaskFile = {
        id: uid(),
        name: "demo.json",
        size: 123,
        content: [
          {
            dialogueA: [
              { speaker: "user", text: "Привет" },
              { speaker: "assistant", text: "Здравствуйте!" },
            ],
            dialogueB: [
              { speaker: "user", text: "Привет" },
              { speaker: "assistant", text: "Привет! Чем помочь?" },
            ],
          },
          {
            dialogueA: [
              { speaker: "user", text: "Суммируй текст" },
              { speaker: "assistant", text: "Конечно, отправьте текст." },
            ],
            dialogueB: [
              { speaker: "user", text: "Суммируй текст" },
              { speaker: "assistant", text: "Дайте текст, я подытожу." },
            ],
          },
        ],
      };
      createTask({ projectId: demo.id, name: "Демо-задача", files: [demoFile] });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const currentProject = useMemo(
    () =>
      view.name === "project" ||
      view.name === "questionnaire" ||
      view.name === "taskNew" ||
      view.name === "kippSettings"
        ? projects.find((p) => p.id === (view as any).id || p.id === (view as any).projectId)
        : undefined,
    [view, projects]
  );
  const currentTask = useMemo(() => (view.name === "task" ? tasks.find((t) => t.id === view.taskId) : undefined), [view, tasks]);

  return (
    <PageShell
      title={
        view.name === "dashboard"
          ? "Дашборд"
          : view.name === "projects"
          ? "Проекты"
          : view.name === "projectNew"
          ? "Новый проект"
          : view.name === "project"
          ? currentProject?.name ?? "Проект"
          : view.name === "questionnaire"
          ? "Настройка вопросов"
          : view.name === "taskNew"
          ? "Новая задача"
          : view.name === "task"
          ? currentTask?.name ?? "Задача"
          : view.name === "annotators"
          ? "Разметчики"
          : view.name === "settings"
          ? "Настройки"
          : view.name === "kippSettings"
          ? "Настройки KIPP"
          : ""
      }
      setView={setView}
      view={view}
    >
      {view.name === "dashboard" && <Dashboard projects={projects} tasks={tasks} setView={setView} />}

      {view.name === "projects" && <ProjectsPage projects={projects} tasks={tasks} setView={setView} />}

      {view.name === "projectNew" && <ProjectNewPage create={(d) => createProject(d)} setView={setView} />}

      {view.name === "project" && currentProject && (
        <ProjectDetailPage project={currentProject} tasks={tasks} setView={setView} updateProject={updateProject} updateTask={updateTask} />
      )}

      {view.name === "questionnaire" && currentProject && (
        <QuestionnaireEditor project={currentProject} updateProject={updateProject} goBack={() => setView({ name: "project", id: currentProject.id })} />
      )}

      {view.name === "taskNew" && currentProject && (
        <div className="max-w-3xl space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Новая задача — {currentProject.name}</h2>
            <button className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700" onClick={() => setView({ name: "project", id: currentProject.id })}>
              ← Назад к проекту
            </button>
          </div>
          <TaskUpload
            onCreate={(d) => {
              createTask({ projectId: currentProject.id, name: d.name, files: d.files });
              setView({ name: "project", id: currentProject.id });
            }}
          />
        </div>
      )}

      {view.name === "task" && currentTask && <TaskPage task={currentTask} project={projects.find((p) => p.id === currentTask.projectId)!} updateTask={updateTask} />}

      {view.name === "annotators" && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Разметчики</h2>
          <EmptyState title="Скоро здесь появится список асессоров и приглашения." />
        </div>
      )}

      {view.name === "settings" && (
        <div className="space-y-4 max-w-xl">
          <h2 className="text-xl font-semibold">Настройки</h2>
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 space-y-3">
            <div>
              <div className="text-sm text-zinc-400 mb-1">Язык интерфейса</div>
              <div className="px-3 py-2 bg-zinc-800 rounded-lg inline-block">Русский</div>
            </div>
            <div>
              <div className="text-sm text-zinc-400 mb-1">Тема</div>
              <div className="px-3 py-2 bg-zinc-800 rounded-lg inline-block">Тёмная</div>
            </div>
            <div className="text-sm text-zinc-400">Версия прототипа: 0.3.1</div>
          </div>
        </div>
      )}

      {view.name === "kippSettings" && currentProject && (
        <KippSettingsPage project={currentProject} onSave={(patch) => updateProject(currentProject.id, patch)} goBack={() => setView({ name: "project", id: currentProject.id })} />
      )}
    </PageShell>
  );
}
