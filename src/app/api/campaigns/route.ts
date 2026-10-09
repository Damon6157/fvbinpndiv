import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { messageEngine } from '@/server/engine/MessageEngine';
import { z } from 'zod';

const campaignSchema = z.object({
  name: z.string(),
  message: z.string(),
  cooldownMin: z.number().int().min(1),
  cooldownMax: z.number().int().min(1),
  useTyping: z.boolean(),
  tokenIds: z.array(z.string()),
  leadIds: z.array(z.string()),
  autoReply: z.string().optional()
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const data = campaignSchema.parse(body);

    const campaign = await prisma.campaign.create({
      data: {
        ...data,
        status: 'RUNNING',
        // Relação M:N simplificada para demonstração, em produção use tables de join
        // Aqui assumimos que a lógica de seleção de tokens/leads é feita no front 
        // e passamos os IDs.
      }
    });

    // Dispara o engine em background
    // Note: Em produção, você usaria uma fila (BullMQ) para isso.
    // Como o prompt pede simplicidade no worker, vamos chamar direto.
    // Para não bloquear a resposta HTTP, usamos uma promise sem await ou um queue.
    
    const payload = {
      campaignId: campaign.id,
      tokenIds: data.tokenIds,
      leadIds: data.leadIds,
      message: data.message,
      cooldownMin: data.cooldownMin,
      cooldownMax: data.cooldownMax,
      useTyping: data.useTyping
    };

    // Execução assíncrona
    messageEngine.executeCampaign(payload).catch(console.error);

    return NextResponse.json(campaign, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation failed', details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}