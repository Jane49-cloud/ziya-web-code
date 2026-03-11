import { useEffect, useState } from "react";
import type { Editor } from "@tiptap/core";
import {
  INITIAL_STATS,
  calculateStatsFromText,
  type EditorStats,
} from "../utils/editorStats";

export const useEditorStats = (editor: Editor | null): EditorStats => {
  const [stats, setStats] = useState<EditorStats>(INITIAL_STATS);

  useEffect(() => {
    if (!editor) return undefined;

    const updateStats = () => setStats(calculateStatsFromText(editor.getText()));
    updateStats();
    editor.on("update", updateStats);

    return () => {
      editor.off("update", updateStats);
    };
  }, [editor]);

  return stats;
};
