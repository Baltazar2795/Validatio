export type Turn = {
  speaker: string;
  text: string;
};

export type Example = {
  dialogueA?: Turn[];
  dialogueB?: Turn[];
};

function toTurns(msgs?: any[]): Turn[] | undefined {
  if (!Array.isArray(msgs)) return undefined;
  const turns = msgs
    .map((m) => {
      const rawRole = typeof m?.role === "string" ? m.role : undefined;
      const rawName = typeof m?.name === "string" ? m.name : undefined;
      const preferred =
        rawRole && rawRole.startsWith("function_") && rawName && rawName.length > 0
          ? rawName
          : rawRole ?? rawName ?? "";
      const rawSpeaker = String(preferred);
      const speaker = rawSpeaker.includes(".") ? rawSpeaker.split(".").pop() ?? "" : rawSpeaker;
      const text = String(m?.data ?? m?.content ?? m?.text ?? "").trim();
      return { speaker: speaker.trim(), text } satisfies Turn;
    })
    .filter((t) => t.text.length > 0);

  return turns.length > 0 ? turns : undefined;
}

export function parseUploaded(json: any): Example[] {
  const arr = Array.isArray(json) ? json : json != null ? [json] : [];

  return arr
    .map((it) => {
      const data = it?.data ?? it;
      const dialogueA = toTurns(data?.input);
      const dialogueB = toTurns(data?.input_2);
      return {
        dialogueA,
        dialogueB,
      } satisfies Example;
    })
    .filter((ex) => (ex.dialogueA && ex.dialogueA.length > 0) || (ex.dialogueB && ex.dialogueB.length > 0));
}
