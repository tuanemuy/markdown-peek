import { MainContent } from "../components/layout/main-content.js";
import { MarkdownContent } from "../components/layout/markdown-content.js";
import { PageHeader } from "../components/layout/page-header.js";
import type { ResolvedStyles } from "../config/styles.js";
import { Document } from "../renderer/document.js";

type FilePreviewPageProps = {
  readonly title: string;
  readonly htmlContent: string;
  readonly styles: ResolvedStyles;
};

export function FilePreviewPage({
  title,
  htmlContent,
  styles,
}: FilePreviewPageProps) {
  return (
    <Document title={title} styles={styles} mode="file">
      <PageHeader breadcrumbs={[{ label: title }]} />

      <MainContent class="px-2 sm:px-5 py-5 sm:py-15">
        <div class="max-w-4xl mx-auto">
          <MarkdownContent htmlContent={htmlContent} />
        </div>
      </MainContent>
    </Document>
  );
}
