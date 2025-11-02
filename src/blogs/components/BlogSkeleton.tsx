import React from "react";
import { Skeleton, Card } from "antd";

export const BlogSkeleton: React.FC = () => {
  return (
    <Card className="rounded-3xl border border-slate-200/40 bg-white/85">
      <Skeleton.Image
        active
        style={{ width: "100%", height: 180, borderRadius: 18 }}
      />
      <Skeleton active paragraph={{ rows: 3 }} className="mt-6" />
    </Card>
  );
};

export default BlogSkeleton;
