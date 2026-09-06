import path from 'node:path';
import { fileURLToPath } from 'node:url';
import Database from 'better-sqlite3';
import express from 'express';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { createMcpExpressApp } from '@modelcontextprotocol/sdk/server/express.js';
import * as z from 'zod/v4';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '..');
const databasePath = path.join(projectRoot, 'brain.db');
const port = Number(process.env.MCP_PORT || 3001);
const host = '127.0.0.1';

const db = new Database(databasePath);
db.pragma('journal_mode = WAL');

const logCall = (toolName, input, outcome) => {
  console.log(JSON.stringify({
    timestamp: new Date().toISOString(),
    tool: toolName,
    input,
    outcome
  }));
};

const result = (payload, isError = false) => ({
  content: [{ type: 'text', text: JSON.stringify(payload, null, 2) }],
  ...(isError ? { isError: true } : {})
});

const failed = (toolName, input, message) => {
  logCall(toolName, input, 'error');
  return result({ success: false, error: message, message }, true);
};

const successful = (toolName, input, payload) => {
  logCall(toolName, input, 'success');
  return result({ success: true, ...payload });
};

function getServer() {
  const server = new McpServer({ name: 'tr-concept-website', version: '1.0.0' });

  server.registerTool('list_new_registrations', {
    description: 'List recent website registrations, newest first.',
    inputSchema: {
      limit: z.number().int().min(1).max(100).default(20).describe('Maximum records to return.'),
      since_days: z.number().int().min(1).max(365).default(30).describe('Only include registrations from this many days ago.')
    }
  }, async ({ limit, since_days }) => {
    const input = { limit, since_days };
    try {
      const rows = db.prepare(`
        SELECT id, customer_name, customer_email, customer_phone, customer_business,
               selected_program, customer_challenge, status, follow_up_sent_at, created_at
        FROM registrations
        WHERE datetime(created_at) >= datetime('now', ?)
        ORDER BY datetime(created_at) DESC, id DESC
        LIMIT ?
      `).all(`-${since_days} days`, limit);

      return successful('list_new_registrations', input, {
        message: `Found ${rows.length} registration(s) from the last ${since_days} day(s)`,
        registrations: rows
      });
    } catch (error) {
      return failed('list_new_registrations', input, `Could not list registrations: ${error.message}`);
    }
  });

  server.registerTool('get_registration_summary', {
    description: 'Summarize registration volume, programs, statuses, and follow-up coverage.',
    inputSchema: {
      period_days: z.number().int().min(1).max(3650).default(30).describe('Number of days to summarize.')
    }
  }, async ({ period_days }) => {
    const input = { period_days };
    try {
      const totals = db.prepare(`
        SELECT COUNT(*) AS total,
               SUM(CASE WHEN status = 'new' THEN 1 ELSE 0 END) AS new_count,
               SUM(CASE WHEN follow_up_sent_at IS NOT NULL THEN 1 ELSE 0 END) AS follow_up_count
        FROM registrations
        WHERE datetime(created_at) >= datetime('now', ?)
      `).get(`-${period_days} days`);
      const programs = db.prepare(`
        SELECT selected_program AS program, COUNT(*) AS count
        FROM registrations
        WHERE datetime(created_at) >= datetime('now', ?)
        GROUP BY selected_program
        ORDER BY count DESC, program ASC
      `).all(`-${period_days} days`);

      return successful('get_registration_summary', input, {
        message: `Registration summary for the last ${period_days} day(s)`,
        summary: {
          period_days,
          total: Number(totals.total),
          new_count: Number(totals.new_count || 0),
          follow_up_count: Number(totals.follow_up_count || 0),
          programs
        }
      });
    } catch (error) {
      return failed('get_registration_summary', input, `Could not summarize registrations: ${error.message}`);
    }
  });

  server.registerTool('send_registration_follow_up', {
    description: 'Send a follow-up email to one registration and mark it contacted.',
    inputSchema: {
      registration_id: z.number().int().positive().describe('Registration ID to contact.'),
      message: z.string().trim().min(1).max(2000).describe('Plain-text follow-up message.'),
      dry_run: z.boolean().default(false).describe('Preview only; do not send or update the database.')
    }
  }, async ({ registration_id, message, dry_run }) => {
    const input = { registration_id, message, dry_run };
    try {
      const registration = db.prepare(`
        SELECT id, customer_name, customer_email, selected_program, status
        FROM registrations WHERE id = ?
      `).get(registration_id);
      if (!registration) {
        return failed('send_registration_follow_up', input, `Registration ${registration_id} was not found`);
      }

      if (dry_run) {
        return successful('send_registration_follow_up', input, {
          message: `Dry run: follow-up prepared for ${registration.customer_name}`,
          follow_up: { registration_id, recipient: registration.customer_email, message, sent: false }
        });
      }

      const apiKey = process.env.RESEND_API_KEY;
      if (!apiKey || apiKey === 'test-only') {
        return failed('send_registration_follow_up', input, 'RESEND_API_KEY is not configured for live email sending');
      }

      const from = process.env.EMAIL_FROM || 'Thương từ TR Concept <hi@trconcept.co>';
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from,
          to: [registration.customer_email],
          subject: `[TR Concept] Follow-up: ${registration.selected_program}`,
          text: message
        })
      });
      const responseBody = await response.json();
      if (!response.ok) {
        return failed('send_registration_follow_up', input, `Resend rejected the email: ${responseBody.message || response.statusText}`);
      }

      db.prepare(`
        UPDATE registrations
        SET status = 'contacted', follow_up_sent_at = datetime('now'), updated_at = datetime('now')
        WHERE id = ?
      `).run(registration_id);

      return successful('send_registration_follow_up', input, {
        message: `Follow-up sent to ${registration.customer_name}`,
        follow_up: { registration_id, recipient: registration.customer_email, sent: true, resend_id: responseBody.id || null }
      });
    } catch (error) {
      return failed('send_registration_follow_up', input, `Could not send follow-up: ${error.message}`);
    }
  });

  return server;
}

const app = createMcpExpressApp({ host });
app.use(express.json());

app.post('/mcp', async (req, res) => {
  const server = getServer();
  const transport = new StreamableHTTPServerTransport({ sessionIdGenerator: undefined });
  try {
    await server.connect(transport);
    await transport.handleRequest(req, res, req.body);
  } catch (error) {
    console.error(new Date().toISOString(), 'mcp.request.error', error);
    if (!res.headersSent) {
      res.status(500).json({ jsonrpc: '2.0', error: { code: -32603, message: 'Internal server error' }, id: null });
    }
  } finally {
    res.on('close', () => {
      transport.close();
      server.close();
    });
  }
});

app.get('/mcp', (_req, res) => {
  res.status(405).json({ jsonrpc: '2.0', error: { code: -32000, message: 'Method not allowed.' }, id: null });
});

app.delete('/mcp', (_req, res) => {
  res.status(405).json({ jsonrpc: '2.0', error: { code: -32000, message: 'Method not allowed.' }, id: null });
});

app.listen(port, host, () => {
  console.log(`${new Date().toISOString()} MCP server listening on http://${host}:${port}/mcp`);
});

process.on('SIGINT', () => {
  db.close();
  process.exit(0);
});