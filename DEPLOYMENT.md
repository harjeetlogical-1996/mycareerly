# MyCareerly — Deployment Guide (Google Cloud Run)

Push to GitHub → Cloud Build auto-deploys to Cloud Run.

## Architecture

| Piece | Service |
|---|---|
| App runtime | Cloud Run (containerized Next.js) |
| Database | Neon Postgres |
| File uploads + AI images | Google Cloud Storage |
| Secrets | Google Secret Manager |
| CI/CD | Cloud Build (GitHub trigger) |
| Registry | Artifact Registry |

---

## One-time setup

### 1. GitHub repo

```bash
cd C:/Users/Admin/Desktop/florencia
git init
git add .
git commit -m "Initial commit"
gh repo create mycareerly --private --source=. --push
# or via github.com UI
```

### 2. Neon Postgres

Already done — connection string in `.env`. Schema pushed + data migrated.

### 3. Google Cloud project

Assumes you've created a project in the GCP Console. Set your project ID:

```bash
# Replace with YOUR project id (shown top-left in GCP Console)
gcloud config set project YOUR_PROJECT_ID
export PROJECT_ID=YOUR_PROJECT_ID
export REGION=asia-south1
```

### 4. Enable required APIs

```bash
gcloud services enable \
  run.googleapis.com \
  cloudbuild.googleapis.com \
  artifactregistry.googleapis.com \
  secretmanager.googleapis.com \
  storage.googleapis.com
```

### 5. Create Artifact Registry repo

```bash
gcloud artifacts repositories create mycareerly \
  --repository-format=docker \
  --location=$REGION
```

### 6. Create GCS bucket for media

```bash
# Pick a globally-unique bucket name
export BUCKET=mycareerly-media

gcloud storage buckets create gs://$BUCKET \
  --location=$REGION \
  --uniform-bucket-level-access

# Make uploads publicly readable (so <img src> works)
gcloud storage buckets add-iam-policy-binding gs://$BUCKET \
  --member=allUsers \
  --role=roles/storage.objectViewer
```

### 7. Create Secret Manager secrets

Run each line, pasting the value when prompted:

```bash
gcloud secrets create DATABASE_URL --replication-policy=automatic
printf "postgresql://neondb_owner:npg_xxx@ep-dawn-brook-aoaljmbh.c-2.ap-southeast-1.aws.neon.tech/neondb?sslmode=require" | gcloud secrets versions add DATABASE_URL --data-file=-

gcloud secrets create JWT_SECRET --replication-policy=automatic
printf "YOUR-LONG-RANDOM-STRING" | gcloud secrets versions add JWT_SECRET --data-file=-

gcloud secrets create CRON_SECRET --replication-policy=automatic
printf "YOUR-CRON-SECRET" | gcloud secrets versions add CRON_SECRET --data-file=-

gcloud secrets create ADMIN_PASSWORD --replication-policy=automatic
printf "your-admin-password" | gcloud secrets versions add ADMIN_PASSWORD --data-file=-

gcloud secrets create GOOGLE_PLACES_API_KEY --replication-policy=automatic
printf "AIza..." | gcloud secrets versions add GOOGLE_PLACES_API_KEY --data-file=-

gcloud secrets create GEMINI_API_KEY --replication-policy=automatic
printf "AIza..." | gcloud secrets versions add GEMINI_API_KEY --data-file=-
```

### 8. Grant the Cloud Run service account access

The Cloud Run service needs to read secrets and write to GCS. It uses the *Compute* service account by default (`PROJECT_NUMBER-compute@developer.gserviceaccount.com`).

```bash
export PROJECT_NUMBER=$(gcloud projects describe $PROJECT_ID --format='value(projectNumber)')
export SA=${PROJECT_NUMBER}-compute@developer.gserviceaccount.com

# Read all secrets
for s in DATABASE_URL JWT_SECRET CRON_SECRET ADMIN_PASSWORD GOOGLE_PLACES_API_KEY GEMINI_API_KEY; do
  gcloud secrets add-iam-policy-binding $s \
    --member=serviceAccount:$SA \
    --role=roles/secretmanager.secretAccessor
done

# Write to GCS bucket
gcloud storage buckets add-iam-policy-binding gs://$BUCKET \
  --member=serviceAccount:$SA \
  --role=roles/storage.objectAdmin
```

### 9. Grant Cloud Build permission to deploy

```bash
export CB_SA=${PROJECT_NUMBER}@cloudbuild.gserviceaccount.com

gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member=serviceAccount:$CB_SA \
  --role=roles/run.admin

gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member=serviceAccount:$CB_SA \
  --role=roles/iam.serviceAccountUser
```

### 10. First manual deploy (sets env vars + secrets on the service)

```bash
# From project root
gcloud run deploy mycareerly \
  --source=. \
  --region=$REGION \
  --platform=managed \
  --allow-unauthenticated \
  --port=8080 \
  --memory=1Gi \
  --cpu=1 \
  --min-instances=0 \
  --max-instances=4 \
  --set-env-vars="NODE_ENV=production,SITE_URL=https://mycareerly.com,ADMIN_EMAIL=admin@florencia.in,GCS_BUCKET=$BUCKET,GCS_PROJECT_ID=$PROJECT_ID,NEXT_PUBLIC_GOOGLE_MAPS_KEY=AIzaSyAjWT75SvINLLTW4zUDUEc3htoXyYNTUyY" \
  --set-secrets="DATABASE_URL=DATABASE_URL:latest,JWT_SECRET=JWT_SECRET:latest,CRON_SECRET=CRON_SECRET:latest,ADMIN_PASSWORD=ADMIN_PASSWORD:latest,GOOGLE_PLACES_API_KEY=GOOGLE_PLACES_API_KEY:latest,GEMINI_API_KEY=GEMINI_API_KEY:latest"
```

After the first deploy Cloud Run remembers these settings; subsequent pushes via Cloud Build only update the image.

### 11. Connect Cloud Build to GitHub

1. GCP Console → **Cloud Build → Triggers → Create trigger**
2. Name: `mycareerly-main`
3. Event: **Push to a branch**
4. Source: Connect your GitHub repo (authorize Cloud Build GitHub app if prompted)
5. Branch: `^main$`
6. Configuration: **Cloud Build configuration file** → `/cloudbuild.yaml`
7. Save

From now on every push to `main` → build + deploy automatically.

### 12. Add Cloud Run URL to Pinterest Redirect URIs

After step 10, `gcloud` prints the service URL (e.g., `https://mycareerly-xxxxx-as.a.run.app`).

Go to Pinterest Developer Portal → app 1533365 → Redirect URIs → add:
```
https://mycareerly-xxxxx-as.a.run.app/api/pinterest/oauth/callback
https://mycareerly.com/api/pinterest/oauth/callback
```

### 13. Custom domain (mycareerly.com)

After the app is live on the `.run.app` URL:

```bash
gcloud run domain-mappings create \
  --service=mycareerly \
  --domain=mycareerly.com \
  --region=$REGION
```

This prints the DNS records you need to add in Hostinger:
- An `A` record pointing to the IPs shown
- An `AAAA` record pointing to the IPv6 shown
- (For `www.`) a `CNAME`

---

## Everyday workflow

```bash
# Make changes locally
# Test on http://localhost:3000 (or PORT=3001 npm run dev)

git add -A
git commit -m "describe the change"
git push origin main

# Cloud Build auto-builds → Cloud Run auto-deploys (~3-5 min)
# Watch progress: GCP Console → Cloud Build → History
```

## Cron for Pinterest pin queue

```bash
gcloud scheduler jobs create http pin-queue-cron \
  --schedule="*/10 * * * *" \
  --uri="https://mycareerly-xxxxx-as.a.run.app/api/cron/pin-queue?secret=YOUR_CRON_SECRET" \
  --http-method=GET \
  --location=$REGION
```

## Costs (rough, low traffic)

| Service | Monthly |
|---|---|
| Cloud Run (scales to zero) | $0–2 |
| Neon Postgres free tier | $0 |
| GCS (1 GB, 10k reads) | <$0.50 |
| Artifact Registry | <$0.50 |
| **Total** | **~$0–3/month** |

## Troubleshooting

- **Build fails on `npm ci`**: make sure `package-lock.json` is committed.
- **Runtime DB connect fails**: check `DATABASE_URL` secret, and that Neon allows Cloud Run IP ranges (it does by default — no allowlist needed).
- **Images 404 after upload**: bucket needs `allUsers` → `storage.objectViewer` (step 6).
- **Pinterest OAuth fails in prod**: redirect URI must be added in Pinterest Developer portal exactly (step 12).
