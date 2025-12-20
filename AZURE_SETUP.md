# Azure App Service Deployment Setup Guide

This guide will help you configure your Azure App Service with all required environment variables.

## Required Environment Variables

Set the following environment variables in your Azure App Service:

### 1. Database Configuration
- **MONGO_DB_USERNAME** - Your MongoDB Atlas username
- **MONGO_DB_PASSWORD** - Your MongoDB Atlas password
- **MONGO_DB_DATABASE** - Your MongoDB database name (e.g., "Airbnb")

### 2. Payment Gateway (Razorpay)
- **RAZORPAY_KEY_ID** - Your Razorpay Key ID (starts with `rzp_test_` or `rzp_live_`)
- **RAZORPAY_KEY_SECRET** - Your Razorpay Key Secret

### 3. Email Service (SendGrid)
- **SEND_GRID_KEY** - Your SendGrid API key
- **FROM_EMAIL** - Your verified SendGrid sender email address

### 4. Application Settings
- **NODE_ENV** - Set to `production`
- **PORT** - Automatically set by Azure (don't override)

## How to Set Environment Variables in Azure Portal

### Method 1: Azure Portal (Web Interface)

1. Go to [Azure Portal](https://portal.azure.com)
2. Navigate to your App Service: **hamara-airbnb**
3. In the left sidebar, click on **Configuration** (under Settings)
4. Click on **Application settings** tab
5. Click **+ New application setting** for each variable
6. Enter the **Name** and **Value** for each variable
7. Click **Save** at the top
8. Restart your app service

### Method 2: Azure CLI

Run these commands in Azure Cloud Shell or your local terminal with Azure CLI installed:

```bash
# Set MongoDB credentials
az webapp config appsettings set --name hamara-airbnb --resource-group <your-resource-group> --settings MONGO_DB_USERNAME="your_username"
az webapp config appsettings set --name hamara-airbnb --resource-group <your-resource-group> --settings MONGO_DB_PASSWORD="your_password"
az webapp config appsettings set --name hamara-airbnb --resource-group <your-resource-group> --settings MONGO_DB_DATABASE="Airbnb"

# Set Razorpay credentials
az webapp config appsettings set --name hamara-airbnb --resource-group <your-resource-group> --settings RAZORPAY_KEY_ID="rzp_test_xxxxxxxxxxxxx"
az webapp config appsettings set --name hamara-airbnb --resource-group <your-resource-group> --settings RAZORPAY_KEY_SECRET="your_secret_key"

# Set SendGrid credentials
az webapp config appsettings set --name hamara-airbnb --resource-group <your-resource-group> --settings SEND_GRID_KEY="SG.xxxxxxxxxxxxx"
az webapp config appsettings set --name hamara-airbnb --resource-group <your-resource-group> --settings FROM_EMAIL="noreply@yourdomain.com"

# Set Node environment
az webapp config appsettings set --name hamara-airbnb --resource-group <your-resource-group> --settings NODE_ENV="production"
```

### Method 3: Azure PowerShell

```powershell
# Set all variables at once
$appSettings = @{
    "MONGO_DB_USERNAME" = "your_username"
    "MONGO_DB_PASSWORD" = "your_password"
    "MONGO_DB_DATABASE" = "Airbnb"
    "RAZORPAY_KEY_ID" = "rzp_test_xxxxxxxxxxxxx"
    "RAZORPAY_KEY_SECRET" = "your_secret_key"
    "SEND_GRID_KEY" = "SG.xxxxxxxxxxxxx"
    "FROM_EMAIL" = "noreply@yourdomain.com"
    "NODE_ENV" = "production"
}

az webapp config appsettings set --name hamara-airbnb --resource-group <your-resource-group> --settings $appSettings
```

## Verification

After setting the environment variables:

1. Restart your App Service
2. Check the logs to verify all variables are loaded:
   - Go to **Log stream** in Azure Portal
   - Look for: `✓ Razorpay credentials loaded successfully`
   - Check for MongoDB connection success message

## Health Check

Your app includes a health check endpoint at `/health` that Azure can use to verify the app is running.

## Troubleshooting

### App fails to start
- Check that all required environment variables are set
- Verify MongoDB connection string format
- Check Razorpay credentials are correct
- Review logs in **Log stream** or **Logs** section

### Database connection fails
- Verify MongoDB Atlas allows connections from Azure IPs (0.0.0.0/0)
- Check username and password are correct
- Ensure database name matches

### Payment gateway errors
- Verify Razorpay keys are from the same account
- Check if using test keys in test mode
- Ensure keys are not expired or revoked

## Notes

- **Never commit** `.env` files to git
- Environment variables set in Azure Portal override `.env` files
- Changes to environment variables require an app restart
- The `PORT` variable is automatically set by Azure - don't override it

