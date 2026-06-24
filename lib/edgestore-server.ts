import { initEdgeStore } from "@edgestore/server"
import { createEdgeStoreNextHandler } from "@edgestore/server/adapters/next/app"
import { initEdgeStoreClient } from "@edgestore/server/core"
import { z } from "zod"

const es = initEdgeStore.create()

const templateUploadInput = z.object({
  fileName: z.string().min(1),
})

const edgeStoreRouter = es.router({
  templates: es
    .fileBucket({
      maxSize: 10 * 1024 * 1024,
      accept: [
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ],
    })
    .input(templateUploadInput)
    .metadata(({ input }) => ({
      fileName: input.fileName,
    }))
    .beforeDelete(() => true),
})

const handler = createEdgeStoreNextHandler({
  router: edgeStoreRouter,
})

const backendClient = initEdgeStoreClient({
  router: edgeStoreRouter,
})

export { backendClient, edgeStoreRouter, handler }
export type EdgeStoreRouter = typeof edgeStoreRouter