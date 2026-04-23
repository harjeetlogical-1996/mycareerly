import { createAuthor } from "../../../actions/authors";

export default function NewAuthorPage() {
  return (
    <div className="p-8 max-w-2xl">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-[#1A1A1A]">Add Author</h1>
        <p className="text-sm text-[#6B6B6B] mt-0.5">Create a new author profile</p>
      </div>

      <form action={createAuthor} className="bg-white border border-[#E8E4DF] rounded-2xl p-6 space-y-5">
        <div className="grid grid-cols-2 gap-5">
          <div className="col-span-2">
            <label className="block text-sm font-semibold text-[#1A1A1A] mb-1.5">Full Name *</label>
            <input name="name" required placeholder="e.g. Sarah Mitchell"
              className="w-full border border-[#E8E4DF] rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-[#E8705A]" />
          </div>

          <div className="col-span-2">
            <label className="block text-sm font-semibold text-[#1A1A1A] mb-1.5">Bio</label>
            <textarea name="bio" rows={3} placeholder="Short professional bio..."
              className="w-full border border-[#E8E4DF] rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-[#E8705A] resize-none" />
          </div>

          <div>
            <label className="block text-sm font-semibold text-[#1A1A1A] mb-1.5">Email</label>
            <input name="email" type="email" placeholder="author@example.com"
              className="w-full border border-[#E8E4DF] rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-[#E8705A]" />
          </div>

          <div>
            <label className="block text-sm font-semibold text-[#1A1A1A] mb-1.5">Specialty</label>
            <input name="specialty" placeholder="e.g. Wedding Floristry, Care Guides"
              className="w-full border border-[#E8E4DF] rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-[#E8705A]" />
          </div>

          <div>
            <label className="block text-sm font-semibold text-[#1A1A1A] mb-1.5">Avatar URL</label>
            <input name="avatar" placeholder="https://..."
              className="w-full border border-[#E8E4DF] rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-[#E8705A]" />
          </div>

          <div>
            <label className="block text-sm font-semibold text-[#1A1A1A] mb-1.5">Website</label>
            <input name="website" placeholder="https://..."
              className="w-full border border-[#E8E4DF] rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-[#E8705A]" />
          </div>

          <div>
            <label className="block text-sm font-semibold text-[#1A1A1A] mb-1.5">Twitter / X</label>
            <input name="twitter" placeholder="@handle"
              className="w-full border border-[#E8E4DF] rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-[#E8705A]" />
          </div>

          <div>
            <label className="block text-sm font-semibold text-[#1A1A1A] mb-1.5">Instagram</label>
            <input name="instagram" placeholder="@handle"
              className="w-full border border-[#E8E4DF] rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-[#E8705A]" />
          </div>

          <div className="col-span-2">
            <label className="block text-sm font-semibold text-[#1A1A1A] mb-1.5">Status</label>
            <select name="active"
              className="w-full border border-[#E8E4DF] rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-[#E8705A] bg-white">
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <button type="submit"
            className="flex-1 bg-[#E8705A] hover:bg-[#C95540] text-white font-semibold py-2.5 rounded-xl text-sm transition-colors">
            Create Author
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
