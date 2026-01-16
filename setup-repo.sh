#!/bin/bash
# Setup repository with both authors as co-authors

echo "Setting up repository with AlexanderG-CA and Jakob12291 as authors..."

# Remove existing git history if it exists
if [ -d .git ]; then
    echo "Removing existing Git history..."
    rm -rf .git
fi

# Initialize fresh repository
echo "Initializing fresh Git repository..."
git init

# Configure remote
echo "Configuring remote repository..."
git remote add origin https://github.com/HomeBuddyAB/Frontend.git 2>/dev/null || git remote set-url origin https://github.com/HomeBuddyAB/Frontend.git

# Add all files
echo "Adding all files..."
git add .

# Create commit with both authors
echo "Creating initial commit with co-authors..."
git config user.name "AlexanderG-CA"
git config user.email "alexander.gorie@chasacademy.se"

git commit -m "Initial commit: HomeBuddy frontend application

- Next.js 15.5.9 with React 19.2.3
- E-commerce storefront with product catalog, shopping cart, and checkout
- Admin panel for managing products, orders, users, and reviews
- User authentication and authorization system
- Responsive design with modern UI/UX
- Image gallery and product variant selection
- Product reviews and analytics
- GitHub Actions workflow for CI/CD
- Environment configuration setup

Co-authored-by: Jakob12291 <jakob.daoud@chasacademy.se>"

# Set main branch
git branch -M main

echo ""
echo "Repository setup complete!"
echo "To push to GitHub, run: git push -f -u origin main"
