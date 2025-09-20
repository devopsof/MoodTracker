# 🛠️ MoodTracker Helper Scripts

This folder contains various utility scripts to help with deploying and managing your MoodTracker application.

## 📋 Available Scripts

### 🚀 Setup & Deployment

#### [`../setup.ps1`](../setup.ps1) / [`../setup.sh`](../setup.sh)
**Quick environment setup and configuration**
```powershell
# Windows PowerShell
.\setup.ps1

# Mac/Linux Bash  
./setup.sh
```
- Installs dependencies
- Creates environment configuration
- Tests build process
- Interactive AWS configuration

#### [`check-deployment.ps1`](check-deployment.ps1)
**Check the status of your deployed application**
```powershell
.\scripts\check-deployment.ps1 -BucketName "your-bucket-name"
```
- Verifies S3 bucket exists and is configured
- Checks website hosting settings
- Tests public access and bucket policy
- Validates deployed files
- Tests website accessibility

### 🔧 Troubleshooting

#### [`troubleshoot.ps1`](troubleshoot.ps1)
**Comprehensive troubleshooting tool**
```powershell
# Basic diagnostics
.\scripts\troubleshoot.ps1

# Include deployment check
.\scripts\troubleshoot.ps1 -BucketName "your-bucket-name"
```
- Checks system prerequisites (Node.js, npm, AWS CLI)
- Validates project structure
- Tests environment configuration
- Verifies AWS credentials
- Tests build process
- Provides common solutions

### 🧹 Cleanup

#### [`cleanup-deployment.ps1`](cleanup-deployment.ps1)
**Clean up AWS resources when no longer needed**
```powershell
# Interactive cleanup (prompts for confirmation)
.\scripts\cleanup-deployment.ps1 -BucketName "your-bucket-name"

# Force cleanup (no prompts)
.\scripts\cleanup-deployment.ps1 -BucketName "your-bucket-name" -Force
```
- Deletes all files from S3 bucket
- Removes bucket policy
- Removes website hosting configuration  
- Deletes the S3 bucket itself

## 🏗️ Main Deployment Scripts

### PowerShell (Windows)
- [`deployment/deploy-to-s3.ps1`](../deployment/deploy-to-s3.ps1) - Main deployment script
- [`deployment/deploy-to-s3-clean.ps1`](../deployment/deploy-to-s3-clean.ps1) - Clean deployment

### Bash (Mac/Linux)
- [`aws/setup-s3.sh`](../aws/setup-s3.sh) - S3 setup script

## 🤖 Automated Deployment

### GitHub Actions
- [`.github/workflows/deploy.yml`](../.github/workflows/deploy.yml) - CI/CD workflow
- See [`docs/GITHUB_ACTIONS.md`](../docs/GITHUB_ACTIONS.md) for setup guide

## 📊 Usage Examples

### Complete Setup from Scratch
```powershell
# 1. Clone and setup
git clone https://github.com/yourusername/moodtracker.git
cd moodtracker

# 2. Quick setup
.\setup.ps1

# 3. Deploy to AWS
.\deployment\deploy-to-s3.ps1 -BucketName "moodtracker-myname"

# 4. Check deployment
.\scripts\check-deployment.ps1 -BucketName "moodtracker-myname"
```

### Troubleshooting Workflow
```powershell
# 1. Run diagnostics
.\scripts\troubleshoot.ps1 -BucketName "moodtracker-myname"

# 2. Fix any issues found
# (follow the suggestions from the troubleshoot script)

# 3. Verify fixes
.\scripts\check-deployment.ps1 -BucketName "moodtracker-myname"
```

### Cleanup Workflow
```powershell
# 1. Clean up all AWS resources
.\scripts\cleanup-deployment.ps1 -BucketName "moodtracker-myname"

# 2. Verify cleanup
.\scripts\check-deployment.ps1 -BucketName "moodtracker-myname"
# Should show "Bucket does not exist"
```

## 🔒 Security Notes

- Scripts use AWS CLI profiles for authentication
- Default profile is used unless specified with `-Profile` parameter
- Bucket names must be globally unique across all AWS accounts
- Cleanup script requires confirmation to prevent accidental deletions

## 🆘 Common Issues & Solutions

### "AWS CLI not found"
**Solution**: Install AWS CLI from https://aws.amazon.com/cli/

### "AWS credentials not configured"  
**Solution**: Run `aws configure` and enter your credentials

### "Bucket already exists"
**Solution**: Choose a different bucket name (must be globally unique)

### "Build failed"
**Solution**: Check environment variables in `.env.local`

### "Website not accessible"
**Solutions**:
- Wait 5-10 minutes for DNS propagation
- Clear browser cache or try incognito mode
- Verify bucket policy allows public read access

## 📚 Additional Resources

- [**Complete Deployment Guide**](../docs/DEPLOYMENT.md) - Comprehensive deployment instructions
- [**GitHub Actions Setup**](../docs/GITHUB_ACTIONS.md) - Automated CI/CD setup
- [**Main README**](../README.md) - Project overview and quick start

## 🤝 Contributing

If you create additional helper scripts, please:

1. Follow the existing naming conventions
2. Include proper error handling and colored output
3. Add documentation to this README
4. Test on both Windows PowerShell and Git Bash (if applicable)

---

**Need help?** Create an issue in the GitHub repository with details about your specific problem.
