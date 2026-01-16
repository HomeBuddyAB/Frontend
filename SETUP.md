# Repository Setup

This repository is set up with the following authors:

- **AlexanderG-CA** (alexander.gorie@chasacademy.se) - Primary author
- **Jakob12291** (jakob.daoud@chasacademy.se) - Co-author

## To push to GitHub

Run the following commands:

```bash
# If you need to rewrite history (removes all previous commits)
rm -rf .git
git init
git remote add origin https://github.com/HomeBuddyAB/Frontend.git
git add .
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
git branch -M main
git push -f -u origin main
```

Or use the provided scripts:
- **Windows**: Run `setup-repo.ps1` (PowerShell)
- **Linux/Mac**: Run `setup-repo.sh` (Bash)
