#!/usr/bin/env node

/**
 * MCP Server - Bu projeyi MCP aracı olarak sunar
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { orchestrate } from './orchestrator.js';
import type { AnalyzerConfig } from './types.js';
import logger from './logger.js';

const server = new Server(
  {
    name: 'linkedin-career-analyzer',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Araç listesi
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'analyze_linkedin_profiles',
        description:
          'Belirtilen şirkette belirli pozisyonda çalışan LinkedIn profillerini analiz eder',
        inputSchema: {
          type: 'object',
          properties: {
            company: {
              type: 'string',
              description: "Hedef şirket adı (örn: 'Google', 'Trendyol')",
            },
            role: {
              type: 'string',
              description: "Hedef pozisyon (örn: 'Software Engineer', 'Data Scientist')",
            },
            department: {
              type: 'string',
              description: "Departman filtresi (örn: 'Machine Learning', 'Platform')",
            },
            profile_count: {
              type: 'number',
              description: 'Analiz edilecek profil sayısı (5-50 arası, default: 15)',
              default: 15,
            },
            include_certifications: {
              type: 'boolean',
              description: 'Sertifika analizini dahil et (default: false)',
              default: false,
            },
            include_extras: {
              type: 'boolean',
              description:
                'Yan projeler, yayınlar, açık kaynak katkılarını dahil et (default: false)',
              default: false,
            },
          },
          required: ['company', 'role'],
        },
      },
    ],
  };
});

// Araç çağrısı
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  if (name === 'analyze_linkedin_profiles') {
    try {
      if (!args) {
        throw new Error('Arguments are required');
      }

      const config: AnalyzerConfig = {
        company: args.company as string,
        role: args.role as string,
        department: args.department as string | undefined,
        profileCount: (args.profile_count as number) || 15,
        includeCertifications: (args.include_certifications as boolean) || false,
        includeExtras: (args.include_extras as boolean) || false,
        outputFormat: 'json',
      };

      const result = await orchestrate(config);

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(result, null, 2),
          },
        ],
      };
    } catch (error: any) {
      logger.error('Analiz hatası:', error);
      return {
        content: [
          {
            type: 'text',
            text: `Hata: ${error.message}`,
          },
        ],
        isError: true,
      };
    }
  }

  throw new Error(`Bilinmeyen araç: ${name}`);
});

// Sunucuyu başlat
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  logger.info('LinkedIn Career Analyzer MCP sunucusu başlatıldı');
}

main().catch((error) => {
  logger.error('MCP sunucu hatası:', error);
  process.exit(1);
});
