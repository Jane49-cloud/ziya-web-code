import React from "react";
import { Button } from "antd";
import { FilePlus2 } from "lucide-react";

interface BlogEmptyStateProps {
  onCreate?: () => void;
}

export const BlogEmptyState: React.FC<BlogEmptyStateProps> = ({ onCreate }) => {
  return (
    <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-slate-300/60 bg-white/80 px-10 py-20 text-center shadow-[inset_0_20px_120px_-80px_rgba(15,23,42,0.4)]">
      <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-slate-900 text-white shadow-lg shadow-slate-900/40">
        <FilePlus2 size={28} />
      </div>
      <h3 className="text-2xl font-semibold text-slate-900">No stories yet</h3>
      <p className="mt-2 max-w-xl text-sm leading-relaxed text-slate-500">
        Capture a milestone, summarize a client win, or share a viewpoint that
        keeps our community inspired. Your first article starts here.
      </p>
      {onCreate ? (
        <Button
          type="primary"
          size="large"
          icon={<FilePlus2 size={18} />}
          className="mt-6 rounded-full bg-slate-900 px-6 text-white shadow-md hover:bg-slate-800"
          onClick={onCreate}
        >
          Create your first blog
        </Button>
      ) : null}
    </div>
  );
};

export default BlogEmptyState;

