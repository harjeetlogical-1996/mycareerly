import { notFound } from "next/navigation";
import { prisma } from "../../../lib/prisma";
import { updateAuthor } from "../../../actions/authors";

export const dynamic = "force-dynamic";

export default async function EditAuthorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const author = await prisma.author.findUnique({ where: { id } });
  if (!author) notFound();

  const action = async (fd: FormData) => {
    "use server";
    await updateAuthor(id, fd);
  };

  return (
    <div className="p-8 max-w-2xl">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-[#1A1A1A]">Edit Author</h1>
        <p className="text-sm text-[#6B6B6B] mt-0.5">{author.name}</p>
      </div>

      <form action={action} className="bg-white border border-[#E8E4DF] rounded-2xl p-6 space-y-5">
        <div className="grid grid-cols-2 gap-5">
          <div className="col-span-2">
            <label className="block text-sm font-semibold text-[#1A1A1A] mb-1.5">Full Name *</label>
            <input name="name" required defaultValue={author.name}
              className="w-full border border-[#E8E4DF] rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-[#E8705A]" />
          </div>

          <div className="col-span-2">
            <label className="block text-sm font-semibold text-[#1A1A1A] mb-1.5">Bio</label>
            <textarea name="bio" rows={3} defaultValue={author.bio}
              className="w-full border border-[#E8E4DF] rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-[#E8705A] resize-none" />
          </div>

          <div>
            <label className="block text-sm font-semibold text-[#1A1A1A] mb-1.5">Email</label>
            <input name="email" type="email" defaultValue={author.email}
              className="w-full border border-[#E8E4DF] rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-[#E8705A]" />
          </div>

          <div>
            <label className="block text-sm font-semibold text-[#1A1A1A] mb-1.5">Specialty</label>
            <input name="specialty" defaultValue={author.specialty}
              className="w-full border border-[#E8E4DF] rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-[#E8705A]" />
          </div>

          <div>
            <label className="block text-sm font-semibold text-[#1A1A1A] mb-1.5">Avatar URL</label>
            <input name="avatar" defaultValue={author.avatar}
              className="w-full border border-[#E8E4DF] rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-[#E8705A]" />
          </div>

          <div>
            <label className="block text-sm font-semibold text-[#1A1A1A] mb-1.5">Website</label>
            <input name="website" defaultValue={author.website}
              className="w-full border border-[#E8E4DF] rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-[#E8705A]" />
          </div>

          <div>
            <label className="block text-sm font-semibold text-[#1A1A1A] mb-1.5">Twitter / X</label>
            <input name="twitter" defaultValue={author.twitter}
              className="w-full border border-[#E8E4DF] rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-[#E8705A]" />
          </div>

          <div>
            <label className="block text-sm font-semibold text-[#1A1A1A] mb-1.5">Instagram</label>
            <input name="instagram" defaultValue={author.instagram}
              className="w-full border border-[#E8E4DF] rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-[#E8705A]" />
          </div>

          <div className="col-span-2">
            <label className="block text-sm font-semibold text-[#1A1A1A] mb-1.5">Status</label>
            <select name="active"
              className="w-full border border-[#E8E4DF] rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-[#E8705A] bg-white">
              <option value="true" selected={author.active}>Active</option>
              <option value="false" selected={!author.active}>Inactive</option>
            </select>
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <button type="submit"
            className="flex-1 bg-[#E8705A] hover:bg-[#C95540] text-white font-semibold py-2.5 rounded-xl text-sm transition-colors">
            Save Changes
          </button>
          <a href="/admin/authors"
            className="flex-1 border border-[#E8E4DF] text-[#1A1A1A] font-semibold py-2.5 rounded-xl text-sm text-center hover:bg-[#F4F3F0] transition-colors">
            Cancel
          </a>
        </div>
      </form>
    </div>
  );
}
