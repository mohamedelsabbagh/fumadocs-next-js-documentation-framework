// @ts-nocheck -- skip type checking
import * as docs_doc_1 from "./folder/test.mdx?collection=docs&hash=hash"
import * as docs_doc_0 from "./index.mdx?collection=docs&hash=hash"
import { _runtime } from "fumadocs-mdx"
import * as _source from "./config"
export const docs = _runtime.doc<typeof _source.docs>([{ info: {"path":"index.mdx","absolutePath":"$cwd/packages/mdx/test/fixtures/index.mdx"}, data: docs_doc_0 }, { info: {"path":"folder/test.mdx","absolutePath":"$cwd/packages/mdx/test/fixtures/folder/test.mdx"}, data: docs_doc_1 }]);