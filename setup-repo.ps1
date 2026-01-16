# Setup repository with both authors as co-authors
# AlexanderG-CA and Jakob12291

Write-Host "Setting up repository with AlexanderG-CA and Jakob12291 as authors..." -ForegroundColor Cyan
Write-Host ""

# Remove existing git history if it exists
if (Test-Path .git) {
    Write-Host "Removing existing Git history..." -ForegroundColor Yellow
    Remove-Item -Recurse -Force .git
}

# Initialize fresh repository
Write-Host "Initializing fresh Git repository..." -ForegroundColor Yellow
git init
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Failed to initialize git" -ForegroundColor Red
    exit 1
}

# Configure remote
Write-Host "Configuring remote repository..." -ForegroundColor Yellow
$remoteExists = git remote get-url origin 2>$null
if ($LASTEXITCODE -eq 0) {
    git remote set-url origin https://github.com/HomeBuddyAB/Frontend.git
} else {
    git remote add origin https://github.com/HomeBuddyAB/Frontend.git
}

# Add all files
Write-Host "Adding all files..." -ForegroundColor Yellow
git add .

# Create commit with both authors
Write-Host "Creating initial commit with co-authors..." -ForegroundColor Yellow
git config user.name "AlexanderG-CA"
git config user.email "alexander.gorie@chasacademy.se"

$commitMessage = @"
Initial commit: HomeBuddy frontend application

- Next.js 15.5.9 with React 19.2.3
- E-commerce storefront with product catalog, shopping cart, and checkout
- Admin panel for managing products, orders, users, and reviews
- User authentication and authorization system
- Responsive design with modern UI/UX
- Image gallery and product variant selection
- Product reviews and analytics
- GitHub Actions workflow for CI/CD
- Environment configuration setup

Co-authored-by: Jakob12291 <jakob.daoud@chasacademy.se>
"@

git commit -m $commitMessage

# Set main branch
git branch -M main

Write-Host ""
Write-Host "Repository setup complete!" -ForegroundColor Green
Write-Host "To push to GitHub, run: git push -f -u origin main" -ForegroundColor Yellow
