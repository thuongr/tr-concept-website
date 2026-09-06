# TR Concept website MCP server

This MCP server exposes the website registration workflow to GoClaw through
Streamable HTTP. It uses the same SQLite database as the website API:

```text
/var/www/my-website/brain.db
```

## Tools

- `list_new_registrations`: list recent registrations with a validated limit and date window.
- `get_registration_summary`: summarize volume, programs, new records, and follow-up coverage.
- `send_registration_follow_up`: send a Resend email and mark the registration as contacted. Use `dry_run: true` for a preview.

Every invocation is logged as JSON with an ISO timestamp. The server returns
structured JSON inside the MCP text result and marks failures with `isError`.

## Local run

The project requires Node 22 or newer because of `better-sqlite3`.

```bash
npm install
RESEND_API_KEY=your_key npm run mcp:start
```

The server listens only on:

```text
http://127.0.0.1:3001/mcp
```

It does not expose port 3001 publicly. Keep `brain.db` and the Resend key out
of Git. For a live follow-up, set `EMAIL_FROM` to a verified Resend sender.

## GoClaw connection

For a GoClaw process running directly on the VPS, create an MCP server with:

```json
{
  "name": "tr-concept-website",
  "transport": "streamable-http",
  "url": "http://127.0.0.1:3001/mcp",
  "enabled": true
}
```

Grant the server to the intended agent and restrict tools with `tool_allow`.

If GoClaw runs inside Docker, its `127.0.0.1` points to the GoClaw container,
not the VPS host. In that deployment, use a Docker host gateway or a private
Docker network and adjust the MCP URL/network policy. Do not publish port 3001
to the public internet.

## systemd

Copy `tr-concept-website-mcp.service.example` to
`/etc/systemd/system/tr-concept-website-mcp.service`, update paths and the
environment file, then run:

```bash
sudo systemctl daemon-reload
sudo systemctl enable --now tr-concept-website-mcp
sudo systemctl status tr-concept-website-mcp
sudo journalctl -u tr-concept-website-mcp -f
```

The service is intentionally bound to `127.0.0.1` and should not be put behind
the public domain or reverse proxy.