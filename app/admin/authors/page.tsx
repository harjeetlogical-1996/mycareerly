import Link from "next/link";
import { prisma } from "../../lib/prisma";
import { Plus, Pencil, User, ExternalLink } from "lucide-react";
import { deleteAuthor } from "../../actions/authors";
import DeleteButton from "../components/DeleteButton";

export default async function AdminAuthorsPage() {
  const authors = await prisma.author.findMany({ orderBy: { name: "asc" } });

  // Count articles per author by matching authorName
  const articles = await prisma.article.findMany({ select: { authorName: true } });
  const countMap: Record<string, number> = {};
  for (const a of articles) {
    countMap[a.authorName] = (countMap[a.authorName] || 0) + 1;
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-[#1A1A1A]">Authors</h1>
          <p className="text-sm text-[#6B6B6B] mt-0.5">Manage article authors and their profiles</p>
        </div>
        <Link
          href="/admin/authors/new"
          className="inline-flex items-center gap-2 bg-[#E8705A] hover:bg-[#C95540] text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors"
        >
          <Plus size={15} /> Add Author
        </Link>
      </div>

      <div className="bg-white border border-[#E8E4DF] rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-[#FAFAF8] border-b border-[#E8E4DF]">
              <th className="text-left px-5 py-3 font-semibold text-[#6B6B6B]">Author</th>
              <th className="text-left px-5 py-3 font-semibold text-[#6B6B6B]">Specialty</th>
              <th className="text-left px-5 py-3 font-semibold text-[#6B6B6B]">Articles</th>
              <th className="text-left px-5 py-3 font-semibold text-[#6B6B6B]">Status</th>
              <th className="text-right px-5 py-3 font-semibold text-[#6B6B6B]">Actions</th>
            </tr>
          </thead>
          <tbody>
            {authors.map((author) => (
              <tr key={author.id} className="border-b border-[#E8E4DF] last:border-0 hover:bg-[#FAFAF8] transition-colors">
                <td className="px-5 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-[#F9EBE8] flex items-center justify-center shrink-0">
                      {author.avatar ? (
                        <img src={author.avatar} alt={author.name} className="w-9 h-9 rounded-full object-cover" />
                      ) : (
                        <span className="text-sm font-bold text-[#E8705A]">{author.name.charAt(0)}</span>
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-[#1A1A1A]">{author.name}</p>
                      {author.email && <p className="text-xs text-[#6B6B6B]">{author.email}</p>}
                    </div>
                  </div>
                </td>
                <td className="px-5 py-3 text-[#6B6B6B] text-xs">{author.specialty || "—"}</td>
                <td className="px-5 py-3">
                  <span className="text-xs font-semibold text-[#1A1A1A] bg-[#F4F3F0] px-2 py-0.5 rounded-lg">
                    {countMap[author.name] || 0}
                  </span>
                </td>
                <td className="px-5 py-3">
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-lg ${author.active ? "bg-[#EDF5EE] text-[#7A9E7E]" : "bg-[#F3F0ED] text-[#9A9A9A]"}`}>
                    {author.active ? "Active" : "Inactive"}
                  </span>
                </td>
                <td className="px-5 py-3">
                  <div className="flex items-center justify-end gap-2">
                    <Link href={`/authors/${author.slug}`} target="_blank"
                      className="w-7 h-7 rounded-lg border border-[#E8E4DF] flex items-center justify-center text-[#6B6B6B] hover:text-[#E8705A] hover:border-[#E8705A] transition-colors" title="View profile">
                      <ExternalLink size={13} />
                    </Link>
                    <Link href={`/admin/authors/${author.id}`}
                      className="w-7 h-7 rounded-lg border border-[#E8E4DF] flex items-center justify-center text-[#6B6B6B] hover:text-[#E8705A] hover:border-[#E8705A] transition-colors" title="Edit">
                      <Pencil size={13} />
                    </Link>
                    <form action={async () => { "use server"; await deleteAuthor(author.id); }}>
                      <DeleteButton message={`Delete author "${author.name}"?`} />
                    </form>
                  </div>
                </td>
              </tr>
            ))}
            {authors.length === 0 && (
              <tr>
                <td colSpan={5} className="px-5 py-12 text-center">
                  <User size={32} className="text-[#E8E4DF] mx-auto mb-2" />
                  <p className="text-[#6B6B6B] text-sm">No authors yet. Add one above.</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
