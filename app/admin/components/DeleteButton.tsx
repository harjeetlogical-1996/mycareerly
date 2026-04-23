"use client";

import { Trash2 } from "lucide-react";

export default function DeleteButton({
  message = "Are you sure you want to delete this?",
}: {
  message?: string;
}) {
  return (
    <button
      type="submit"
      title="Delete"
      className="w-7 h-7 rounded-lg bg-[#FAFAF8] hover:bg-red-50 text-[#6B6B6B] hover:text-red-600 flex items-center justify-center transition-colors"
      onClick={(e) => {
        if (!confirm(message)) e.preventDefault();
      }}
    >
      <Trash2 size={13} />
    </button>
  );
}
