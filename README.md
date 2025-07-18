# Cosmetics Data Hub

A centralized PostgreSQL database and web application for managing cosmetic laboratory data including formulas, ingredients, and pricing information.

## 🎉 Current Features (Working!)

✅ **PostgreSQL Database Schema** - Complete with formulas, ingredients, relationships, and pricing tables  
✅ **CSV Import with Preview** - Upload CSV files and see exactly what will be imported before committing  
✅ **Formula Validation** - Automatic percentage validation with pass/fail indicators  
✅ **RESTful API** - Complete CRUD operations for formulas and ingredients  
✅ **Admin Web Interface** - Beautiful Tailwind CSS interface for data management  
✅ **Real-time Analysis** - See formula counts, ingredient lists, and validation status  
✅ **Data Safety** - Preview prevents bad imports, validates data integrity  
✅ **Next.js 14** - Modern React framework with TypeScript  
✅ **Fly.io Ready** - Configured for cloud deployment  

## 🚀 Current Status & Wins

### ✨ Just Completed
- **CSV Preview System** - See exactly what will be imported before committing to database
- **Formula Validation** - Automatic percentage validation with visual indicators
- **Flexible CSV Format** - Handles Formula Name, Ingredient, Percentage (no INCI required)
- **Data Safety** - Preview prevents bad imports and shows validation warnings
- **Beautiful UI** - Clean admin interface with statistics and formula breakdown

### 🎯 Local Setup (Working!)
```bash
# 1. Install dependencies
npm install

# 2. Create PostgreSQL database
createdb cosmetics_data_hub

# 3. Run migrations
psql -d cosmetics_data_hub -f db/migrations/001_create_tables.sql

# 4. Start development server
npm run dev
# Visit: http://localhost:3005

# 5. Test CSV import
# Go to http://localhost:3005/admin/import
# Upload CSV and click "Preview CSV" to see analysis
```

### 📊 What's Working Right Now
- **CSV Preview** - Upload your CSV and see formula count, ingredient count, validation status
- **Formula Analysis** - See which formulas are at 100% vs need review
- **Admin Dashboard** - Browse formulas and ingredients with search functionality
- **API Endpoints** - `/api/formulas`, `/api/ingredients`, `/api/import`, `/api/preview`
- **Database Schema** - Complete with relationships and indexes

## 🎯 Next Steps & Roadmap

### 🔥 Immediate Priority
1. **Formula Status Tracking** - Add "needs_review" vs "approved" status to database
2. **Local PostgreSQL Testing** - Verify complete data import and validation
3. **Duplicate Prevention** - Handle re-importing same CSV without data duplication
4. **Fly.io Deployment** - Get app running in cloud with PostgreSQL instance

### 🚀 Short-term Goals
1. **Formula ID System** - Add stable IDs that persist even if formula names change
2. **Validation Dashboard** - Visual overview of which formulas need review
3. **Bulk Formula Actions** - Approve/reject multiple formulas at once
4. **Import History** - Track when formulas were imported and by whom

### 💡 Long-term Vision
1. **Cloud-First Architecture** - App runs on Fly.io, connects to cloud database
2. **Hybrid Data Flow** - Local CSV preview → Cloud database update
3. **Multi-user Support** - Different users can review and approve formulas
4. **Pricing Integration** - Import supplier pricing data for cost calculations
5. **API for External Apps** - Other tools can query formula/ingredient data
6. **Data Versioning** - Track formula changes over time

### 🛡️ Data Safety Strategy
- **Preview First** - Always show what will be imported before committing
- **Upsert Logic** - Update existing formulas instead of creating duplicates
- **Validation Rules** - Enforce percentage totals and ingredient requirements
- **Rollback Capability** - Ability to undo imports if needed
- **Audit Trail** - Log all data changes with timestamps and user info

## Database Schema

```sql
-- Core tables for cosmetics data
CREATE TABLE formulas (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    version VARCHAR(50) DEFAULT '1.0',
    status VARCHAR(20) DEFAULT 'needs_review',  -- planned: needs_review, approved, rejected
    created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE ingredients (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    inci_name VARCHAR(255),
    supplier_code VARCHAR(100),
    category VARCHAR(100),
    created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE formula_ingredients (
    id SERIAL PRIMARY KEY,
    formula_id INTEGER REFERENCES formulas(id) ON DELETE CASCADE,
    ingredient_id INTEGER REFERENCES ingredients(id) ON DELETE CASCADE,
    percentage DECIMAL(5,2) NOT NULL CHECK (percentage >= 0 AND percentage <= 100),
    created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(formula_id, ingredient_id)
);

CREATE TABLE ingredient_pricing (
    id SERIAL PRIMARY KEY,
    ingredient_id INTEGER REFERENCES ingredients(id) ON DELETE CASCADE,
    price_per_kg DECIMAL(10,2) NOT NULL CHECK (price_per_kg >= 0),
    supplier VARCHAR(255),
    effective_date DATE NOT NULL,
    created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Observability & Monitoring

This project includes production-ready observability out of the box:

### 🚨 Error Tracking (Sentry)
- **Automatic setup**: `flyctl ext sentry create`
- **Free for 1 year**: Team plan worth $26/month
- **Webhook failure alerts**: Get notified when webhooks fail
- **Performance monitoring**: Track response times and bottlenecks
- **Access**: `flyctl apps errors` opens Sentry dashboard

### 📊 Infrastructure Metrics (Fly.io)
- **Automatic monitoring**: No setup required
- **HTTP metrics**: Request counts, response times, error rates
- **Resource usage**: CPU, memory, network utilization
- **Health checks**: Built-in endpoint monitoring
- **Access**: Fly.io dashboard or `https://api.fly.io/prometheus/personal`

### 📝 Structured Logging
- **JSON formatted**: Easy parsing and searching
- **Correlation IDs**: Track individual requests end-to-end
- **Webhook context**: Payload details, processing time, errors
- **Access**: `flyctl logs` for live tail, `flyctl logs --app your-app` for history

### 🔍 What You Can Monitor
- ✅ Webhook delivery success/failure rates
- ✅ Response times and performance trends  
- ✅ Error details with stack traces
- ✅ Request volume and traffic patterns
- ✅ Service uptime and availability
- ✅ Resource usage under load

### Accessing Your Monitoring
```bash
# Real-time error tracking
flyctl apps errors

# Live application logs  
flyctl logs

# Infrastructure metrics
# Visit: https://fly.io/dashboard/{your-org}/metrics

# Health check status
flyctl status
```

## Project Structure

```
├── fly.toml                 # Fly.io configuration with health checks
├── Dockerfile              # Production container
├── docker-compose.yml      # Local development
├── next.config.js          # Next.js configuration
├── app/
│   ├── layout.tsx          # Root layout
│   ├── page.tsx            # Homepage with status
│   └── api/
│       └── webhook/
│           └── route.ts    # Main webhook endpoint with logging
└── scripts/
    └── test-webhook.sh     # Testing script for all environments
```

## Webhook Endpoints

### `GET /api/webhook`
Returns service status and monitoring information.

**Response:**
```json
{
  "status": "ready",
  "service": "batch-webhook-fly",
  "timestamp": "2025-07-13T15:30:00.000Z",
  "environment": "production",
  "message": "Webhook endpoint is operational"
}
```

### `POST /api/webhook`
Handles webhook payloads with comprehensive logging:

- **Challenge verification**: Echoes `{"challenge": "value"}` for service setup
- **Payload processing**: Accepts and processes JSON data
- **Error handling**: Structured error responses with correlation IDs
- **Monitoring**: Automatic error tracking and performance metrics

## Customization

### 1. Modify Webhook Logic
Edit `app/api/webhook/route.ts` to add your specific webhook processing:

```typescript
// Add your business logic here
console.log(`🔔 [${correlationId}] Processing webhook:`, event.type)

if (event?.type === 'your_event_type') {
  // Process your event
  await processYourEvent(event)
  console.log(`✅ [${correlationId}] Successfully processed ${event.type}`)
}
```

### 2. Environment Variables
Set in Fly.io:
```bash
fly secrets set YOUR_API_KEY=your_value
fly secrets set YOUR_CONFIG=your_value

# Sentry DSN is set automatically by flyctl ext sentry create
```

### 3. Customize Monitoring
```bash
# Add custom Sentry tags for different webhook types
# Edit app/api/webhook/route.ts:

import * as Sentry from "@sentry/nextjs"

Sentry.setTag("webhook.type", event.type)
Sentry.setContext("webhook.payload", { size: JSON.stringify(body).length })
```

### 4. App Settings
- **App name**: Edit `app = "your-app-name"` in `fly.toml`
- **Region**: Change `primary_region` in `fly.toml`
- **Port**: Modify ports in `docker-compose.yml` and `package.json`

## Example Use Cases

This template works perfectly for:
- **Monday.com webhooks**: Task creation, status updates
- **GitHub webhooks**: Repository events, PR notifications  
- **Stripe webhooks**: Payment processing, subscription events
- **Slack webhooks**: Message processing, slash commands
- **Custom API webhooks**: Any service that sends HTTP callbacks

## Testing & Validation

The included test script validates all monitoring components:

```bash
# Test any deployment with full observability
./scripts/test-webhook.sh https://your-deployment.fly.dev

# Check logs for correlation IDs and structured data
flyctl logs

# Verify error tracking (test with invalid payload)
curl -X POST https://your-app.fly.dev/api/webhook -d "invalid-json"
```

## Production Features

- **Auto-scaling**: Scales to 0 when idle, auto-starts on requests
- **Health checks**: Built-in monitoring for Fly.io load balancer  
- **HTTPS**: Automatic SSL/TLS termination
- **Error tracking**: Production-grade error monitoring with Sentry
- **Performance monitoring**: Request timing, throughput, and bottleneck detection
- **Structured logging**: JSON logs with correlation IDs for easy debugging
- **Container optimization**: Minimal Alpine Linux image

## Troubleshooting

### Observability Issues
```bash
# Check if Sentry is working
flyctl apps errors

# Verify webhook logs are structured  
flyctl logs | grep "🔔"

# Test error tracking
curl -X POST https://your-app.fly.dev/api/webhook \
  -H "Content-Type: application/json" \
  -d "invalid-json"
```

### Common Monitoring Questions
- **"Where are my metrics?"** → Fly.io dashboard + `flyctl apps errors`
- **"How do I track specific webhook types?"** → Add custom Sentry tags
- **"Can I export logs?"** → Yes, Fly.io supports log aggregation services
- **"What's my uptime?"** → Check Fly.io dashboard health checks

## Support

- **Fly.io docs**: https://fly.io/docs/
- **Sentry docs**: https://docs.sentry.io/
- **Next.js docs**: https://nextjs.org/docs
- **Template issues**: Open an issue on this repository

## License

MIT License - feel free to use for any project!
