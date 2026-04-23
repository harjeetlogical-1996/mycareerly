import Link from "next/link";
import { prisma } from "../../lib/prisma";
import { Plus, Pencil, ToggleLeft, ToggleRight, Tag } from "lucide-react";
import { deleteCategory, toggleCategory } from "../../actions/categories";
import DeleteButton from "../components/DeleteButton";

export const dynamic = "force-dynamic";

export default async function AdminCategoriesPage() {
  const categories = await prisma.category.findMany({ orderBy: { order: "asc" } });

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-[#1A1A1A]">Categories</h1>
          <p className="text-sm text-[#6B6B6B] mt-0.5">Manage article categories shown in menu and pages</p>
        </div>
        <Link
          href="/admin/categories/new"
          className="inline-flex items-center gap-2 bg-[#E8705A] hover:bg-[#C95540] text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors"
        >
          <Plus size={15} /> Add Category
        </Link>
      </div>

      <div className="bg-white border border-[#E8E4DF] rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-[#FAFAF8] border-b border-[#E8E4DF]">
              <th className="text-left px-5 py-3 font-semibold text-[#6B6B6B]">Name</th>
              <th className="text-left px-5 py-3 font-semibold text-[#6B6B6B]">Slug</th>
              <th className="text-left px-5 py-3 font-semibold text-[#6B6B6B]">Color</th>
              <th className="text-left px-5 py-3 font-semibold text-[#6B6B6B]">Order</th>
              <th className="text-left px-5 py-3 font-semibold text-[#6B6B6B]">Status</th>
              <th className="text-right px-5 py-3 font-semibold text-[#6B6B6B]">Actions</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((cat) => (
              <tr key={cat.id} className="border-b border-[#E8E4DF] last:border-0 hover:bg-[#FAFAF8] transition-colors">
                <td className="px-5 py-3">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: cat.color }} />
                    <span className="font-medium text-[#1A1A1A]">{cat.name}</span>
                  </div>
                </td>
                <td className="px-5 py-3 text-[#6B6B6B] font-mono text-xs">{cat.slug}</td>
                <td className="px-5 py-3">
                  <span className="text-xs font-mono px-2 py-0.5 rounded-lg border border-[#E8E4DF]" style={{ color: cat.color }}>
                    {cat.color}
                  </span>
                </td>
                <td className="px-5 py-3 text-[#6B6B6B]">{cat.order}</td>
                <td className="px-5 py-3">
                  <form action={async () => { "use server"; await toggleCategory(cat.id, !cat.active); }}>
                    <button type="submit" title={cat.active ? "Deactivate" : "Activate"}
                      className={`flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-lg transition-colors ${cat.active ? "bg-[#EDF5EE] text-[#7A9E7E] hover:bg-[#d5e9d7]" : "bg-[#F3F0ED] text-[#9A9A9A] hover:bg-[#E8E4DF]"}`}>
                      {cat.active ? <ToggleRight size={13} /> : <ToggleLeft size={13} />}
                      {cat.active ? "Active" : "Inactive"}
                    </button>
                  </form>
                </td>
                <td className="px-5 py-3">
                  <div className="flex items-center justify-end gap-2">
                    <Link href={`/articles/category/${cat.slug}`} target="_blank"
                      className="w-7 h-7 rounded-lg border border-[#E8E4DF] flex items-center justify-center text-[#6B6B6B] hover:text-[#E8705A] hover:border-[#E8705A] transition-colors" title="View">
                      <Tag size={13} />
                    </Link>
                    <Link href={`/admin/categories/${cat.id}`}
                      className="w-7 h-7 rounded-lg border border-[#E8E4DF] flex items-center justify-center text-[#6B6B6B] hover:text-[#E8705A] hover:border-[#E8705A] transition-colors" title="Edit">
                      <Pencil size={13} />
                    </Link>
                    <form action={async () => { "use server"; await deleteCategory(cat.id); }}>
                      <DeleteButton message={`Delete "${cat.name}"?`} />
                    </form>
                  </div>
                </td>
              </tr>
            ))}
            {categories.length === 0 && (
              <tr><td colSpan={6} className="px-5 py-10 text-center text-[#6B6B6B] text-sm">No categories yet. Add one above.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
