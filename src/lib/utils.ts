import { z } from 'zod';

// 1. Validação Real de Token via API do Discord
export async function validateDiscordToken(token: string): Promise<{ valid: boolean; user?: any; error?: string }> {
  try {
    // Endpoint público do Discord para validar token
    const response = await fetch(`https://discord.com/api/v10/users/@me`, {
      headers: {
        Authorization: `Bot ${token}`
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      return { valid: false, error: errorData.message || 'Invalid token' };
    }

    const userData = await response.json();
    return { valid: true, user: userData };
  } catch (error) {
    return { valid: false, error: (error as Error).message };
  }
}

// 2. Substituição de Variáveis Humanizadas
export function interpolateTemplate(template: string, variables: Record<string, string>): string {
  return template.replace(/\{(\w+)\}/g, (match, key) => {
    return variables[key] !== undefined ? variables[key] : match;
  });
}

// 3. Sanitização de Input (Prevenção de Injeção de Código/HTML)
export function sanitizeInput(input: string): string {
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .trim();
}

// 4. Geração de Delay Aleatório Humanizado
export function getHumanizedDelay(minMs: number, maxMs: number): number {
  return Math.floor(Math.random() * (maxMs - minMs + 1)) + minMs;
}

// 5. Formatação de Token (Mascara)
export function maskToken(token: string): string {
  if (token.length < 10) return token;
  return `${token.substring(0, 10)}...${token.substring(token.length - 5)}`;
}