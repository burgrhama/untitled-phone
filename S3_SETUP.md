# AWS S3 Setup Guide (Optional)

## Why S3?
- **Professional audio hosting** for production apps
- **Unlimited scalability** - doesn't depend on your server storage
- **Cheaper than server storage** at scale
- **CDN distribution** - faster downloads globally

## Option 1: Free Tier (AWS)

1. **Create AWS Account**: https://aws.amazon.com/free/
2. **Create S3 Bucket**:
   - Go to S3 console
   - Click "Create bucket"
   - Name: `untitled-phone-bucket` (must be globally unique)
   - Region: `us-east-1`
   - Unblock public access (for music playback)
   - Create

3. **Create IAM User** (for API access):
   - Go to IAM console
   - Users → Create user → Name: `untitled-phone-uploader`
   - Attach policy: `AmazonS3FullAccess`
   - Create access key
   - Save: `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY`

4. **Set Environment Variables on Render**:
   - Go to Render dashboard
   - Your service → Environment
   - Add:
     ```
     AWS_ACCESS_KEY_ID=your-key-here
     AWS_SECRET_ACCESS_KEY=your-secret-here
     AWS_S3_BUCKET=untitled-phone-bucket
     AWS_REGION=us-east-1
     ```
   - Redeploy

## Option 2: DigitalOcean Spaces (Cheaper Alternative)

1. **Create account**: https://www.digitalocean.com/
2. **Create Space** (like S3 but $5/month):
   - Spaces → Create Space
   - Name: `untitled-phone`
   - Region: `nyc3`
   - Make public
3. **Generate API Keys**: Account → API → Spaces Keys
4. **Set env vars** (same format as S3)

## Testing

After setting env vars:

1. **Check storage mode**:
   ```
   curl https://your-render-url.onrender.com/api/debug/uploads
   ```
   Should show: `"storageMode": "S3"` (or `"BASE64"` if S3 not configured)

2. **Upload a track** from PC and verify it plays on phone
3. **Check S3 bucket** - audio file should appear in bucket

## Pricing

- **AWS S3 Free Tier**: 5GB storage + 20k GET requests/month
- **DigitalOcean Spaces**: $5/month (250GB bandwidth, 250GB storage)
- **Base64 (Default)**: Free, but limited to database size (~10-50MB depending on Render plan)

## Troubleshooting

### Upload fails with "S3 upload failed"
- Check AWS credentials are correct
- Verify bucket exists and is public
- Check IAM user has S3FullAccess

### Files don't appear in S3
- Verify bucket name in `.env`
- Check AWS region matches bucket region
- Look at Render logs: `Render Dashboard → Logs`

### Fallback to Base64
The app automatically falls back to BASE64 if S3 env vars aren't set, so uploads won't fail.

## Local Testing

To test S3 locally:

```bash
AWS_ACCESS_KEY_ID=your-key \
AWS_SECRET_ACCESS_KEY=your-secret \
AWS_S3_BUCKET=your-bucket \
AWS_REGION=us-east-1 \
npm start
```
