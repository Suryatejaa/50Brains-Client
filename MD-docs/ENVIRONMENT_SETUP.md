# Environment Configuration

## Command Environment Matrix

### 🔧 Local Development Commands (Uses `.env.local`)

```bash
npm run dev          # Uses .env.local (development)
npm run dev:local    # Explicitly uses .env.local
```

### 🚀 Production Commands (Uses `.env.production` or `.env`)

```bash
npm run build        # Uses .env.production (if NODE_ENV=production)
npm run build:prod   # Explicitly uses .env.production
npm run start        # Uses built app with production env
npm run start:prod   # Explicitly uses production environment
npm run preview      # Build + start (uses default env)
npm run preview:prod # Build + start with production env
```

### 🧪 Other Commands (Environment Independent)

```bash
npm run lint         # No environment variables needed
npm run type-check   # No environment variables needed
npm run test         # Uses test environment
npm run clean        # No environment variables needed
```

## Environment Files Priority

Next.js loads environment variables in this order (highest to lowest priority):

1. **`.env.local`** → Loaded for `npm run dev` and `npm run dev:local`
2. **`.env.production`** → Loaded for `npm run build:prod`, `npm run start:prod`
3. **`.env.development`** → Loaded when NODE_ENV=development
4. **`.env`** → Always loaded as fallback (currently set to production)

## Quick Reference

| Command                | Environment | URL Used                                             |
| ---------------------- | ----------- | ---------------------------------------------------- |
| `npm run dev`          | Local       | `http://localhost:3000`                              |
| `npm run dev:local`    | Local       | `http://localhost:3000`                              |
| `npm run build:prod`   | Production  | `https://api-gateway-production-c8bc.up.railway.app` |
| `npm run start:prod`   | Production  | `https://api-gateway-production-c8bc.up.railway.app` |
| `npm run preview:prod` | Production  | `https://api-gateway-production-c8bc.up.railway.app` |

## Environment Files

### 1. `.env.local` - Local Development

Used when running `npm run dev` locally.

```bash
NEXT_PUBLIC_API_BASE_URL=http://localhost:3000
NEXT_PUBLIC_WEBSOCKET_URL=ws://localhost:4000
```

### 2. `.env.production` - Production Deployment

Used when deploying to production.

```bash
NEXT_PUBLIC_API_BASE_URL=https://api-gateway-production-c8bc.up.railway.app
NEXT_PUBLIC_WEBSOCKET_URL=wss://websocket-gateway-production-dbb2.up.railway.app
```

### 3. `.env` - Main Environment File

Currently configured for production. This file is used when no specific environment file is found.

### 4. `.env.example` - Template

Template file showing all available environment variables with examples for both local and production setups.

## URLs Reference

### Production URLs

- **API Gateway**: `https://api-gateway-production-c8bc.up.railway.app`
- **WebSocket Gateway**: `wss://websocket-gateway-production-dbb2.up.railway.app`

### Local Development URLs

- **API Gateway**: `http://localhost:3000`
- **WebSocket Gateway**: `ws://localhost:4000`
- **Web App**: `http://localhost:5173`

## Setup Instructions

### For Local Development

1. Copy `.env.example` to `.env.local`:

   ```bash
   cp .env.example .env.local
   ```

2. Update `.env.local` with your local configuration:

   ```bash
   NODE_ENV=development
   NEXT_PUBLIC_API_BASE_URL=http://localhost:3000
   NEXT_PUBLIC_WEBSOCKET_URL=ws://localhost:4000
   NEXT_PUBLIC_APP_URL=http://localhost:5173
   ```

3. Start your local backend services:
   - API Gateway on port 3000
   - WebSocket Gateway on port 4000

4. Run the development server:
   ```bash
   npm run dev
   ```

### For Production Deployment

1. Ensure `.env.production` or `.env` contains production URLs:

   ```bash
   NODE_ENV=production
   NEXT_PUBLIC_API_BASE_URL=https://api-gateway-production-c8bc.up.railway.app
   NEXT_PUBLIC_WEBSOCKET_URL=wss://websocket-gateway-production-dbb2.up.railway.app
   ```

2. Build and deploy:
   ```bash
   npm run build
   npm start
   ```

## Environment Variable Priority

Next.js loads environment variables in this order (highest to lowest priority):

1. `.env.local` (always loaded, should not be committed)
2. `.env.production` (loaded when NODE_ENV=production)
3. `.env.development` (loaded when NODE_ENV=development)
4. `.env` (always loaded)

## Security Notes

- Never commit `.env.local` to version control
- Keep production secrets secure and separate from development
- Use different API keys for development and production
- Generate strong, unique secrets for production `NEXTAUTH_SECRET`

## Troubleshooting

### Common Issues

1. **WebSocket connection fails**
   - Check if `NEXT_PUBLIC_WEBSOCKET_URL` is correctly set
   - Verify the WebSocket server is running on the specified URL

2. **API calls fail**
   - Verify `NEXT_PUBLIC_API_BASE_URL` points to the correct API gateway
   - Check if the API server is running and accessible

3. **Environment variables not loading**
   - Restart the development server after changing `.env` files
   - Check file naming (must start with `NEXT_PUBLIC_` for client-side access)
   - Ensure files are in the correct location (`apps/web/` directory)

### Debugging

To verify environment variables are loaded correctly, check the browser console or add this to any component:

```javascript
console.log('API URL:', process.env.NEXT_PUBLIC_API_BASE_URL);
console.log('WebSocket URL:', process.env.NEXT_PUBLIC_WEBSOCKET_URL);
```
