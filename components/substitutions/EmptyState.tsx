import { CalendarCheck } from "lucide-react";

export function EmptyState({ text }: { text: string }) {
  return (
    <div className="flex flex-col items-center gap-2 py-10 px-4 text-center">
      <CalendarCheck className="text-faint" size={20} />
      <p className="text-sm text-muted-foreground">{text}</p>
    </div>
  );
}
