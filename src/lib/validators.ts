import { z } from 'zod';

export const tokenSchema = z.object({
  token: z.string().min(10).max(200),
  proxyId: z.string().optional(),
  proxyAddress: z.string().optional().regex(/^\d{1,3}(\.\d{1,3}){3}:\d+$/, "Invalid IP:Port format"),
  proxyUser: z.string().optional(),
  proxyPass: z.string().optional()
});

export const campaignSchema = z.object({
  name: z.string().min(1).max(100),
  message: z.string().min(1).max(2000),
  cooldownMin: z.number().int().min(1).max(600),
  cooldownMax: z.number().int().min(1).max(1200),
  useTyping: z.boolean(),
  tokenIds: z.array(z.string()).min(1, "Select at least one token"),
  leadIds: z.array(z.string()).min(1, "Select at least one lead"),
  autoReply: z.string().max(500).optional()
});

export const leadSchema = z.object({
  userId: z.string().regex(/^\d{17,20}$/, "Invalid Discord ID"),
  username: z.string().optional(),
  guildId: z.string().optional()
});

export const templateSchema = z.object({
  name: z.string().min(1).max(100),
  content: z.string().min(1).max(2000)
});