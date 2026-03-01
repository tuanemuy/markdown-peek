import { ContentCard } from "../components/layout/content-card.js";
import { Document } from "../components/layout/document.js";
import { PageHeader } from "../components/layout/page-header.js";
import { FileTree } from "../components/navigation/file-tree.js";
import type { ResolvedStyles } from "../config/styles.js";
import type { FileTreeNode } from "../utils/file-tree.js";

type DirectoryListPageProps = {
  readonly title: string;
  readonly tree: readonly FileTreeNode[];
  readonly styles: ResolvedStyles;
};

export function DirectoryListPage({
  title,
  tree,
  styles,
}: DirectoryListPageProps) {
  return (
    <Document title={title} styles={styles} mode="directory">
      <PageHeader breadcrumbs={[{ label: title }]} externalLinkHref="/" />
      <main class="p-2 sm:p-5 sm:py-0 md:pt-5 space-y-5">
        <ContentCard>
          <nav>
            <FileTree nodes={tree} />
          </nav>
        </ContentCard>
      </main>
    </Document>
  );
}
