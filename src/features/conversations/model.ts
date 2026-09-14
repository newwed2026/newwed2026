import { z } from "zod";

export const conversationModeSchema = z.enum(["AGENT", "HUMAN"]);
export type ConversationMode = z.infer<typeof conversationModeSchema>;

export const notificationDeliveryStatusSchema = z.enum(["PENDING", "SENT", "FAILED"]);
