import Slugger from 'github-slugger';
import type { Root } from 'mdast';
import { remark } from 'remark';
import remarkGfm from 'remark-gfm';
import type { PluggableList, Transformer } from 'unified';
import { visit } from 'unist-util-visit';
import { flattenNode } from './remark-utils';

interface Heading {
  id: string;
  content: string;
}

interface Content {
  heading: string | undefined;
  content: string;
}

export interface StructuredData {
  headings: Heading[];
  /**
   * Refer to paragraphs, a heading may contain multiple contents as well
   */
  contents: Content[];
}

export interface StructureOptions {
  /**
   * Types to be scanned as content.
   *
   * @defaultValue ['paragraph', 'blockquote', 'tableCell']
   */
  types?: string[];
}

declare module 'mdast' {
  interface Data {
    /**
     * Get content of unserializable element
     *
     * Needed for `remarkStructure` to generate search index
     */
    _string?: string[];
  }
}

const slugger = new Slugger();

/**
 * Attach structured data to VFile, you can access via `vfile.data.structuredData`.
 */
export function remarkStructure({
  types = ['paragraph', 'blockquote', 'heading', 'tableCell'],
}: StructureOptions = {}): Transformer<Root, Root> {
  return (node, file) => {
    slugger.reset();
    const data: StructuredData = { contents: [], headings: [] };
    let lastHeading: string | undefined = '';

    // Fumadocs OpenAPI Generated Structured Data
    if (file.data.frontmatter) {
      const frontmatter = file.data.frontmatter as {
        _openapi?: {
          structuredData?: StructuredData;
        };
      };

      if (frontmatter._openapi?.structuredData) {
        data.headings.push(...frontmatter._openapi.structuredData.headings);
        data.contents.push(...frontmatter._openapi.structuredData.contents);
      }
    }

    visit(node, (element) => {
      if (element.type === 'root') return;

      if (element.type === 'heading') {
        element.data ||= {};
        element.data.hProperties ||= {};
        const properties = element.data.hProperties;
        const content = flattenNode(element).trim();
        const id = properties.id ?? slugger.slug(content);

        data.headings.push({
          id,
          content,
        });

        lastHeading = id;
        return 'skip';
      }

      if (element.data?._string) {
        for (const content of element.data._string) {
          data.contents.push({
            heading: lastHeading,
            content,
          });
        }

        return 'skip';
      }

      if (element.type === 'mdxJsxFlowElement' && element.name) {
        data.contents.push(
          {
            heading: lastHeading,
            content: element.name,
          },
          ...element.attributes.flatMap((attribute) => {
            const valueStr =
              typeof attribute.value === 'string'
                ? attribute.value
                : attribute.value?.value;
            if (!valueStr) return [];

            return {
              heading: lastHeading,
              content:
                attribute.type === 'mdxJsxAttribute'
                  ? `${attribute.name}: ${valueStr}`
                  : valueStr,
            };
          }),
        );

        return;
      }

      if (types.includes(element.type)) {
        const content = flattenNode(element).trim();
        if (content.length === 0) return;

        data.contents.push({
          heading: lastHeading,
          content,
        });

        return 'skip';
      }
    });

    file.data.structuredData = data;
  };
}

/**
 * Extract data from markdown/mdx content
 */
export function structure(
  content: string,
  remarkPlugins: PluggableList = [],
  options: StructureOptions = {},
): StructuredData {
  const result = remark()
    .use(remarkGfm)
    .use(remarkPlugins)
    .use(remarkStructure, options)
    .processSync(content);

  return result.data.structuredData as StructuredData;
}
