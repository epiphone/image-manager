# Image Manager

Benchmarking serverless/VM deployments of a simple image transformation app.

Check `package.json` for available commands.

## Deploying Cloud Functions

First set up `gcloud` and `gsutil`.

```bash
# Build and package function source:
yarn clean && yarn resizer:build && yarn resizer:zip

# Push to Cloud Storage:
gsutil cp src/resizer/resizer.zip gs://imgmgr-functions

# Deploy function:
gcloud beta functions deploy resizer --runtime nodejs10 --trigger-resource imgmgr-images --trigger-event google.storage.object.finalize --region us-east1 --source gs://imgmgr-functions/resizer.zip --service-account serverless@imgmgr.iam.gserviceaccount.com --entry-point resizer
```

## Deploying VM app

```bash
# Build image:
docker build -t image-manager .

# Run locally:
docker run --rm -p 3000:3000 -v ~/.config:/root/.config --name image-manager image-manager:latest

# Push image to GCR:
gcloud auth configure-docker
docker tag image-manager:latest gcr.io/imgmgr/image-manager
docker push gcr.io/imgmgr/image-manager
```

## Running VM app locally

```bash
# Run server in development mode:
GOOGLE_APPLICATION_CREDENTIALS=/somepath/service-account-key.json yarn server:dev

# Upload an image file with httpie:
http -f POST localhost:3000 image@~/Pictures/tiikeri.jpg
```

## Utilities

```bash
# Clean up buckets:
gsutil -m rm -r gs://imgmgr-server-images/** gs://imgmgr-server-thumbnails/** gs://imgmgr-server-sqips/** gs://imgmgr-images/** gs://imgmgr-thumbnails/**

# List files in server buckets:
gsutil -m ls gs://imgmgr-server-images/ gs://imgmgr-server-thumbnails/
```
