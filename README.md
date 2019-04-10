# Image Manager

Benchmarking serverless/VM deployments of a simple image transformation app.

Check `package.json` for available commands.

## Deployment

First set up `gcloud` and `gsutil`.

```bash
# Build and package function source:
yarn clean && yarn resizer:build && yarn resizer:zip

# Push to Cloud Storage:
gsutil cp src/resizer/resizer.zip gs://imgmgr-functions

# Deploy function:
gcloud beta functions deploy resizer --runtime nodejs10 --trigger-resource imgmgr-images --trigger-event google.storage.object.finalize --region us-east1 --source gs://imgmgr-functions/resizer.zip --service-account serverless@imgmgr.iam.gserviceaccount.com --entry-point resizer
```
