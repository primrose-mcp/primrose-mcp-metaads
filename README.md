# Meta Ads MCP Server

[![Primrose MCP](https://img.shields.io/badge/Primrose-MCP-blue)](https://primrose.dev/mcp/metaads)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A Model Context Protocol (MCP) server for integrating with Meta (Facebook) Ads. This server enables AI assistants to manage ad campaigns, creatives, audiences, and analytics through Meta's Marketing API.

## Features

- **Account Management** - Access and manage ad accounts
- **Ad Management** - Create, update, and manage ads
- **Ad Set Management** - Configure ad sets and targeting
- **Audience Management** - Create and manage custom audiences
- **Business Management** - Access Business Manager features
- **Campaign Management** - Create and manage ad campaigns
- **Catalog Management** - Manage product catalogs
- **Creative Management** - Design and manage ad creatives
- **Insights & Analytics** - Access campaign performance data
- **Pixel Management** - Configure and manage Meta Pixels
- **Targeting Tools** - Configure detailed audience targeting

## Quick Start

The easiest way to get started is using the [Primrose SDK](https://github.com/primrose-ai/primrose-mcp):

```bash
npm install primrose-mcp
```

```typescript
import { PrimroseClient } from 'primrose-mcp';

const client = new PrimroseClient({
  service: 'metaads',
  headers: {
    'X-Meta-Access-Token': 'your-access-token'
  }
});
```

## Manual Installation

```bash
# Clone and install
git clone https://github.com/primrose-ai/primrose-mcp-metaads.git
cd primrose-mcp-metaads
npm install

# Build
npm run build

# Run locally
npm run dev
```

## Configuration

### Required Headers

| Header | Description |
|--------|-------------|
| `X-Meta-Access-Token` | Meta/Facebook OAuth access token |

### Optional Headers

| Header | Description |
|--------|-------------|
| `X-Meta-Ad-Account-Id` | Default ad account ID (act_XXXX format) |
| `X-Meta-Business-Id` | Business Manager ID |
| `X-Meta-App-Id` | App ID (for app-scoped tokens) |
| `X-Meta-App-Secret` | App secret (for server-to-server) |

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `CHARACTER_LIMIT` | 50000 | Maximum response character limit |
| `DEFAULT_PAGE_SIZE` | 25 | Default pagination size |
| `MAX_PAGE_SIZE` | 100 | Maximum pagination size |
| `META_API_VERSION` | v21.0 | Meta API version |

## Available Tools

### Account Tools
- List ad accounts
- Get account details
- Access account insights

### Ad Tools
- Create ads
- Update ads
- Pause/resume ads
- Delete ads
- Get ad previews

### Ad Set Tools
- Create ad sets
- Update ad sets
- Configure budgets
- Set targeting
- Manage schedules

### Audience Tools
- Create custom audiences
- Create lookalike audiences
- Update audiences
- Delete audiences
- Add/remove users

### Business Tools
- Get business details
- List business ad accounts
- Access business settings

### Campaign Tools
- Create campaigns
- Update campaigns
- Set objectives
- Manage budgets
- Pause/resume campaigns

### Catalog Tools
- List catalogs
- Get catalog products
- Sync product feeds

### Creative Tools
- Create ad creatives
- Update creatives
- Preview creatives
- Manage creative assets

### Insights Tools
- Get campaign insights
- Access ad set metrics
- View ad performance
- Generate reports

### Pixel Tools
- List pixels
- Get pixel details
- Access pixel events

### Targeting Tools
- Get targeting options
- Search interests
- Access demographics
- Get reach estimates

## Development

```bash
# Install dependencies
npm install

# Run in development mode
npm run dev

# Build for production
npm run build

# Run linter
npm run lint

# Run type checking
npm run typecheck
```

## Related Resources

- [Primrose SDK Documentation](https://primrose.dev/docs)
- [Meta Marketing API Documentation](https://developers.facebook.com/docs/marketing-apis)
- [Meta for Developers](https://developers.facebook.com/)
- [Model Context Protocol](https://modelcontextprotocol.io/)

## License

MIT
