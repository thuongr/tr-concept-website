# Deployment TODO

## DNS and API subdomain

The `api.trconcept.co` service is not ready to configure yet because the domain
provider currently has an issue. Complete this after the MCP and VPS work:

1. Create or confirm the DNS record for `api.trconcept.co` pointing to the VPS IP.
2. Reverse-proxy `api.trconcept.co` to the website backend at `127.0.0.1:3000`.
3. Keep the MCP server private on `127.0.0.1:3001`; do not expose it through this domain.
4. Add HTTPS and verify `GET /health` and the website registration flow.
