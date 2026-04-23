import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { createCategory } from "../../../actions/categories";

const inputCls = "w-full bg-[#FAFAF8] border border-[#E8E4DF] rounded-xl px-4 py-3 text-sm text-[#1A1A1A] outline-none focus:border-[#E8705A] focus:ring-2 focus:ring-[#E8705A]/10 transition-all placeholder-[#B0A9A4]";

const COLORS = ["#E8705A", "#C95540", "#7A9E7E", "#B8D4BB", "#1A1A1A", "#6B6B6B", "#4A90D9", "#9B59B6"];

export default function NewCategoryPage() {
  return (
    <div className="p-8 max-w-lg">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/admin/categories" className="w-8 h-8 rounded-xl border border-[#E8E4DF] bg-white flex items-center justify-center hover:bg-[#F9EBE8] transition-colors">
          <ArrowLeft size={15} className="text-[#6B6B6B]" />
        </Link>
        <h1 className="text-xl font-bold text-[#1A1A1A]">Add Category</h1>
      </div>

      <form action={createCategory} className="bg-white border border-[#E8E4DF] rounded-2xl p-6 space-y-5">
        <div>
          <label className="block text-sm font-semibold text-[#1A1A1A] mb-1.5">Name <span className="text-[#E8705A]">*</span></label>
          <input name="name" required placeholder="e.g. Care Guide" className={inputCls} />
        </div>

        <div>
          <label className="block text-sm font-semibold text-[#1A1A1A] mb-1.5">Description</label>
          <textarea name="description" rows={2} placeholder="Short description of this category..." className={`${inputCls} resize-none`} />
        </div>

        <div>
          <label className="block text-sm font-semibold text-[#1A1A1A] mb-2">Color</label>
          <div className="flex gap-2 flex-wrap">
            {COLORS.map((c) => (
              <label key={c} className="cursor-pointer">
                <input type="radio" name="color" value={c} className="sr-only peer" defaultChecked={c === "#E8705A"} />
                <span className="w-7 h-7 rounded-full block ring-2 ring-transparent peer-checked:ring-[#1A1A1A] ring-offset-2 transition-all"
                  style={{ background: c }} />
              </label>
            ))}
          </div>
          <p className="text-xs text-[#6B6B6B] mt-2">Or enter custom: <input name="color" placeholder="#E8705A" className="border border-[#E8E4DF] rounded-lg px-2 py-1 text-xs w-24 font-mono" /></p>
        </div>

        <div>
          <label className="block text-sm font-semibold text-[#1A1A1A] mb-1.5">Display Order</label>
          <input name="order" type="number" defaultValue="99" min="1" max="99" className={inputCls} />
          <p className="text-xs text-[#6B6B6B] mt-1">Lower number = shown first in menu</p>
        </div>

        <div>
          <label className="block text-sm font-semibold text-[#1A1A1A] mb-1.5">Status</label>
          <select name="active" defaultValue="true" className={inputCls}>
            <option value="true">Active — visible in menu and pages</option>
            <option value="false">Inactive — hidden from menu</option>
          </select>
        </div>

        <button type="submit" className="w-full bg-[#E8705A] hover:bg-[#C95540] text-white font-semibold py-3 rounded-xl transition-colors">
          Create Category
        </button>
      </form>
    </div>
  );
}
