import { z } from "zod/v4";

const multipleChoiceContent = z.object({
  type: z.literal("multiple_choice"),
  options: z.array(z.string()).min(2).max(6),
  correctIndex: z.number().int().min(0),
});

const fillBlankContent = z.object({
  type: z.literal("fill_blank"),
  blanks: z.array(z.object({ id: z.string(), answer: z.string() })),
});

const traceStepContent = z.object({
  type: z.literal("trace_step"),
  steps: z.array(z.unknown()),
  correctStepIndex: z.number().int(),
});

const debugStepContent = z.object({
  type: z.literal("debug_step"),
  steps: z.array(z.unknown()),
  errorStepIndex: z.number().int(),
});

const shortAnswerContent = z.object({
  type: z.literal("short_answer"),
  rubric: z.array(z.string()),
  sampleAnswer: z.string(),
});

export const questionContentSchema = z.discriminatedUnion("type", [
  multipleChoiceContent,
  fillBlankContent,
  traceStepContent,
  debugStepContent,
  shortAnswerContent,
]);

export type QuestionContent = z.infer<typeof questionContentSchema>;
