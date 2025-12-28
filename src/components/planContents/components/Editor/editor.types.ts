import z from 'zod';

const _editorMetaSchema = z.object({
  direction: z.enum(['ltr', 'rtl']).nullable(),
  format: z.string(),
  indent: z.number(),
  type: z.string(),
  version: z.number(),
});

const _nodeMetaSchema = _editorMetaSchema.extend({ textFormat: z.number(), textStyle: z.string() });

const _textNodeSchema = z.object({
  type: z.literal('text'),
  text: z.string(),
  detail: z.number(),
  format: z.number(),
  mode: z.enum(['normal', 'token', 'segmented']),
  style: z.string(),
  version: z.number(),
});

const _fileNodeSchema = z.object({
  type: z.literal('file'),
  src: z.string(),
  width: z.number(),
  height: z.number(),
  version: z.number(),
});

const nodeSchema = z.union([_textNodeSchema, _fileNodeSchema]);
export type NODE = z.infer<typeof nodeSchema>;

export const editorContentSchema = z.object({
  root: _editorMetaSchema.extend({
    children: z.array(
      _nodeMetaSchema.extend({
        children: z.array(nodeSchema),
      })
    ),
  }),
});
