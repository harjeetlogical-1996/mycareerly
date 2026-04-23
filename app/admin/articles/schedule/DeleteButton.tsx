"use client";

import { useTransition } from "react";
import { Trash2 } from "lucide-react";
import { deleteScheduled } from "../../../actions/articleGen";

export default function DeleteButton({ id }: { id: string }) {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      onClick={() => {
        if (!confirm("Remove this scheduled article?")) return;
        startTransition(async () => {
          await deleteScheduled(id);
        });
      }}
      disabled={isPending}
      className="p-1.5 rounded-lg hover:bg-red-50 text-[#9A9A9A] hover:text-red-500 transition-colors disabled:opacity-50"
      aria-label="Delete"
    >
      <Trash2 size={14} />
    </button>
  );
}
