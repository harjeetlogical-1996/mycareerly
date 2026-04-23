# MyCareerly — Step-by-Step GCP Deployment (PowerShell)

Project ID: `mycareerly`
Project number: `680065368067`
Region: `asia-south1` (Mumbai — closest to India)

Run these commands **one section at a time** in PowerShell. After each section, wait for it to finish before running the next.

---

## 0. Prerequisites

### Install gcloud CLI (if not already)

Download installer: https://cloud.google.com/sdk/docs/install

After install, restart PowerShell and run:
```powershell
gcloud --version
gcloud auth login
```

A browser will open → login with your Google account → authorize.

---

## 1. Set project + region

```powershell
gcloud config set project mycareerly
$env:PROJECT_ID = "mycareerly"
$env:PROJECT_NUMBER = "680065368067"
$env:REGION = "asia-south1"
$env:BUCKET = "mycareerly-media"
$env:SERVICE = "mycareerly"
```

## 2. Enable required APIs (takes ~1 min)

```powershell
gcloud services enable run.googleapis.com cloudbuild.googleapis.com artifactregistry.googleapis.com secretmanager.googleapis.com storage.googleapis.com
```

## 3. Create Artifact Registry repo (for Docker images)

```powershell
gcloud artifacts repositories create mycareerly --repository-format=docker --location=$env:REGION --description="MyCareerly app images"
```

## 4. Create public GCS bucket for media

```powershell
gcloud storage buckets create gs://$env:BUCKET --location=$env:REGION --uniform-bucket-level-access

gcloud storage buckets add-iam-policy-binding gs://$env:BUCKET --member=allUsers --role=roles/storage.objectViewer
```

> If bucket name `mycareerly-media` is already taken globally, try `mycareerly-media-in` or `mycareerly-cdn`. Update `$env:BUCKET` to match.

## 5. Create Secret Manager secrets

**For each secret below, run BOTH lines as a pair** (first creates the secret, second adds the value).

### 5a. DATABASE_URL (your Neon connection string)
```powershell
gcloud secrets create DATABASE_URL --replication-policy=automatic
"postgresql://neondb_owner:npg_ko6RqnZXPzH9@ep-dawn-brook-aoaljmbh.c-2.ap-southeast-1.aws.neon.tech/neondb?sslmode=require" | gcloud secrets versions add DATABASE_URL --data-file=-
```

### 5b. JWT_SECRET
```powershell
gcloud secrets create JWT_SECRET --replication-policy=automatic
"florencia-super-secret-jwt-key-change-in-production-2026" | gcloud secrets versions add JWT_SECRET --data-file=-
```

### 5c. CRON_SECRET
```powershell
gcloud secrets create CRON_SECRET --replication-policy=automatic
"mycareerly-cron-c4399b6d133b915c65a66f35d7d555ed" | gcloud secrets versions add CRON_SECRET --data-file=-
```

### 5d. ADMIN_PASSWORD
```powershell
gcloud secrets create ADMIN_PASSWORD --replication-policy=automatic
"florencia@admin123" | gcloud secrets versions add ADMIN_PASSWORD --data-file=-
```

### 5e. GOOGLE_PLACES_API_KEY
```powershell
gcloud secrets create GOOGLE_PLACES_API_KEY --replication-policy=automatic
"AIzaSyAjWT75SvINLLTW4zUDUEc3htoXyYNTUyY" | gcloud secrets versions add GOOGLE_PLACES_API_KEY --data-file=-
```

### 5f. GEMINI_API_KEY
Agar aapne Gemini key set kar rakhi hai abhi (admin UI me), wahi use karo. Nahi to abhi ek empty version daal do, baad me admin UI se save ho jaegi:
```powershell
gcloud secrets create GEMINI_API_KEY --replication-policy=automatic
"" | gcloud secrets versions add GEMINI_API_KEY --data-file=-
```

## 6. Grant Cloud Run service account access

```powershell
$sa = "$env:PROJECT_NUMBER-compute@developer.gserviceaccount.com"

# Secrets access
foreach ($secret in @("DATABASE_URL","JWT_SECRET","CRON_SECRET","ADMIN_PASSWORD","GOOGLE_PLACES_API_KEY","GEMINI_API_KEY")) {
    gcloud secrets add-iam-policy-binding $secret --member="serviceAccount:$sa" --role=roles/secretmanager.secretAccessor
}

# GCS bucket write access
gcloud storage buckets add-iam-policy-binding gs://$env:BUCKET --member="serviceAccount:$sa" --role=roles/storage.objectAdmin
```

## 7. Grant Cloud Build deploy permissions

```powershell
$cbSa = "$env:PROJECT_NUMBER@cloudbuild.gserviceaccount.com"

gcloud projects add-iam-policy-binding $env:PROJECT_ID --member="serviceAccount:$cbSa" --role=roles/run.admin

gcloud projects add-iam-policy-binding $env:PROJECT_ID --member="serviceAccount:$cbSa" --role=roles/iam.serviceAccountUser
```

## 8. First manual deploy (~5-8 min)

This builds your Docker image + deploys + wires all env vars / secrets on the Cloud Run service.

```powershell
cd C:\Users\Admin\Desktop\florencia

gcloud run deploy mycareerly `
  --source=. `
  --region=$env:REGION `
  --platform=managed `
  --allow-unauthenticated `
  --port=8080 `
  --memory=1Gi `
  --cpu=1 `
  --min-instances=0 `
  --max-instances=4 `
  --set-env-vars="NODE_ENV=production,SITE_URL=https://mycareerly.com,ADMIN_EMAIL=admin@florencia.in,GCS_BUCKET=$env:BUCKET,GCS_PROJECT_ID=$env:PROJECT_ID,NEXT_PUBLIC_GOOGLE_MAPS_KEY=AIzaSyAjWT75SvINLLTW4zUDUEc3htoXyYNTUyY" `
  --set-secrets="DATABASE_URL=DATABASE_URL:latest,JWT_SECRET=JWT_SECRET:latest,CRON_SECRET=CRON_SECRET:latest,ADMIN_PASSWORD=ADMIN_PASSWORD:latest,GOOGLE_PLACES_API_KEY=GOOGLE_PLACES_API_KEY:latest,GEMINI_API_KEY=GEMINI_API_KEY:latest"
```

It will prompt once to confirm creation of a source repo — type **Y**.

When it finishes, it prints:
```
Service URL: https://mycareerly-xxxxxxxxx-as.a.run.app
```

**Copy that URL** — we need it next.

## 9. Test the deployed site

Open the Service URL in browser. Check:
- Homepage loads
- Articles list renders (data from Neon)
- RSS feed works: `YOUR_URL/feed.xml`

## 10. Add the Cloud Run URL to Pinterest Redirect URIs

Go to Pinterest Developer Portal → your app (1533365) → Settings → Redirect URIs. Add:
```
https://mycareerly-xxxxxxxxx-as.a.run.app/api/pinterest/oauth/callback
```
(replace with your actual Cloud Run URL)

Save.

## 11. Setup Cloud Build GitHub trigger for auto-deploy

**Go to GCP Console UI for this step** — easier than CLI.

1. GCP Console → **Cloud Build → Triggers** → https://console.cloud.google.com/cloud-build/triggers?project=mycareerly
2. Click **"Connect Repository"** (top) → Source: **GitHub (Cloud Build GitHub App)** → authenticate as `harjeetlogical-1996`
3. Select repo: **`harjeetlogical-1996/mycareerly`** → Connect
4. Click **"Create Trigger"**:
   - Name: `mycareerly-main`
   - Event: **Push to a branch**
   - Source: `^main$`
   - Configuration: **Cloud Build configuration file (yaml or json)**
   - Location: **Repository** → path: `/cloudbuild.yaml`
5. Save

Now every `git push origin main` → builds → deploys automatically.

## 12. Test auto-deploy

From your local machine:

```powershell
cd C:\Users\Admin\Desktop\florencia
# Make any small change, e.g., edit README.md
git add -A
git commit -m "test auto-deploy"
git push origin main
```

Open https://console.cloud.google.com/cloud-build/builds?project=mycareerly — you'll see the build running. Takes ~3-5 min. After success, Cloud Run automatically updates.

## 13. Setup Pinterest cron

```powershell
gcloud services enable cloudscheduler.googleapis.com

# Replace XXXXXX with your Cloud Run URL host
gcloud scheduler jobs create http pin-queue-cron `
  --schedule="*/10 * * * *" `
  --uri="https://mycareerly-XXXXXX-as.a.run.app/api/cron/pin-queue?secret=mycareerly-cron-c4399b6d133b915c65a66f35d7d555ed" `
  --http-method=GET `
  --location=$env:REGION
```

## 14. Custom domain (baad me karenge)

Domain Hostinger pe hai. Jab ready ho:
```powershell
gcloud run domain-mappings create --service=mycareerly --domain=mycareerly.com --region=$env:REGION
```
Ye DNS records print karega jo aap Hostinger DNS me add karoge.

---

## Troubleshooting

**Build fails on `next build` with Prisma error:**
Check `DATABASE_URL` secret is correct. Build doesn't need DB access but runtime does.

**403 on any page:**
Cloud Run service must have `--allow-unauthenticated` (step 8 includes this).

**Images not loading:**
Check bucket permissions — step 4's `allUsers: objectViewer` must be set.

**Pinterest OAuth fails:**
Redirect URI in Pinterest portal must be EXACT match including https:// and no trailing slash.
