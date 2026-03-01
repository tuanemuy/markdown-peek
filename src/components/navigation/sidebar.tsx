import type { FileTreeNode } from "../../utils/file-tree.js";
import { FileTree } from "./file-tree.js";

type SidebarProps = {
  readonly title: string;
  readonly tree: readonly FileTreeNode[];
  readonly currentPath: string;
};

export function Sidebar({ title, tree, currentPath }: SidebarProps) {
  return (
    <>
      {/* Overlay for mobile sidebar */}
      <div id="sidebar-overlay" class="fixed inset-0 z-50 bg-black/50 hidden" />

      {/* Sidebar */}
      <aside
        id="sidebar"
        class="fixed inset-y-0 start-0 z-60 w-72 lg:w-auto overflow-hidden bg-sidebar border-e border-sidebar-border -translate-x-full transition-transform duration-300"
      >
        <div class="relative flex flex-col h-full max-h-full pt-3">
          <header class="h-11.5 ps-5 pe-2 lg:ps-8 flex items-center">
            <a
              href="/"
              class="flex-none text-sm font-semibold text-sidebar-foreground hover:text-sidebar-primary"
            >
              {title}
            </a>
          </header>

          <div class="mt-1.5 h-full overflow-x-hidden overflow-y-auto [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:rounded-none [&::-webkit-scrollbar-track]:bg-scrollbar-track [&::-webkit-scrollbar-thumb]:bg-scrollbar-thumb">
            <nav class="pb-3 w-full flex flex-col">
              <FileTree nodes={tree} currentPath={currentPath} />
            </nav>
          </div>
        </div>

        {/* Resize handle */}
        <div
          id="sidebar-resize"
          class="absolute inset-y-0 end-0 w-1 cursor-col-resize hover:bg-sidebar-border hidden lg:block pointer-events-auto"
        />
      </aside>
    </>
  );
}
