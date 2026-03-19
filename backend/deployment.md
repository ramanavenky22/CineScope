# Backend Deployment to Google Cloud Platform

This guide contains the step-by-step commands to deploy the CineScope backend to Google Cloud Run using Google Cloud Build and Artifact Registry.

## Prerequisites
- Google Cloud CLI (`gcloud`) installed and authenticated.
- Ensure you are inside the `backend` directory when running these commands.

## 1. Initial Setup

Set the correct Google Cloud Project and enable the required services:

```bash
# Set your active project
gcloud config set project <your-project-id>

# Enable the required APIs
gcloud services enable artifactregistry.googleapis.com cloudbuild.googleapis.com run.googleapis.com
```

## 2. Create Artifact Registry Repository

Create a repository to store the Docker images. (You only need to run this once).

```bash
gcloud artifacts repositories create cinescope-repo \
  --repository-format=docker \
  --location=us-central1 \
  --description="Docker repository for CineScope backend"
```

## 3. Build and Push Using Cloud Build

Google Cloud Build will remotely build the image defined in the `Dockerfile` and push it to the Artifact Registry repository.

```bash
gcloud builds submit --tag us-central1-docker.pkg.dev/<your-project-id>/cinescope-repo/cinescope-backend:latest
```

## 4. Deploy to Cloud Run

Deploy the newly pushed image to Cloud Run. Make sure to provide any required environment variables.

```bash
gcloud run deploy cinescope-backend \
  --image=us-central1-docker.pkg.dev/<your-project-id>/cinescope-repo/cinescope-backend:latest \
  --region=us-central1 \
  --allow-unauthenticated \
  --set-env-vars=GEMINI_API_KEY="your api key"
```

## Deployment URL

The live deployment can be accessed at:
**[https://cinescope-backend-423394910382.us-central1.run.app](https://cinescope-backend-423394910382.us-central1.run.app)**

*To test the health of the live backend, visit: [https://cinescope-backend-423394910382.us-central1.run.app/api/health](https://cinescope-backend-423394910382.us-central1.run.app/api/health)*

## Updating the Deployment

If you make changes to the backend code, simply re-run **Step 3** to build the new image, and **Step 4** to deploy the latest image.

## Setting up Continuous Deployment (CD) with GitHub Actions

To automate the build and deployment process whenever you push code, a GitHub Actions workflow is present in `.github/workflows/deploy-backend.yml`.

### Step 1: Create a Service Account
Create a dedicated Service Account in Google Cloud for GitHub Actions:
```bash
gcloud iam service-accounts create github-actions-deploy \
  --description="Service account for GitHub Actions deployment" \
  --display-name="GitHub Actions Deploy"
```

### Step 2: Grant Permissions
Grant the necessary roles to the new Service Account so it can build, push, and deploy:
```bash
# Permission to build images with Cloud Build
gcloud projects add-iam-policy-binding <your-project-id> \
  --member="serviceAccount:github-actions-deploy@<your-project-id>.iam.gserviceaccount.com" \
  --role="roles/cloudbuild.builds.builder"

# Permission to push images to Artifact Registry
gcloud projects add-iam-policy-binding <your-project-id> \
  --member="serviceAccount:github-actions-deploy@<your-project-id>.iam.gserviceaccount.com" \
  --role="roles/artifactregistry.writer"

# Permission to deploy the image to Cloud Run
gcloud projects add-iam-policy-binding <your-project-id> \
  --member="serviceAccount:github-actions-deploy@<your-project-id>.iam.gserviceaccount.com" \
  --role="roles/run.admin"

# Permission to act as the Service Account
gcloud projects add-iam-policy-binding <your-project-id> \
  --member="serviceAccount:github-actions-deploy@<your-project-id>.iam.gserviceaccount.com" \
  --role="roles/iam.serviceAccountUser"
```

### Step 3: Generate and Store Keys
Generate a JSON key for the Service Account:
```bash
gcloud iam service-accounts keys create gcp-key.json \
  --iam-account=github-actions-deploy@<your-project-id>.iam.gserviceaccount.com
```

**⚠️ Important**: Do not commit the `gcp-key.json` file. Instead, go to your GitHub Repository > **Settings** > **Secrets and variables** > **Actions** > **New repository secret**.
Add two secrets:
- `GCP_CREDENTIALS` (paste the entire content of `gcp-key.json`)
- `GEMINI_API_KEY` (paste your AI API key)

Once setup, pushing code affecting the `backend/` directory to the `main` branch will automatically build and deploy your service!
