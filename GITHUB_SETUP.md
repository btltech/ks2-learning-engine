# GitHub Setup Instructions

Your KS2 Learning Engine is ready to push to GitHub! Follow these steps:

## 1. Create a Repository on GitHub

1. Go to [github.com/new](https://github.com/new)
2. Repository name: `ks2-learning-engine`
3. Description: "AI-powered learning platform for UK Key Stage 2 students with MiRa tutor companion"
4. Choose: Public (to allow community contributions)
5. Do NOT initialize with README, .gitignore, or license (we already have them)
6. Click "Create repository"

## 2. Add Remote and Push

Replace `YOUR_USERNAME` with your GitHub username:

```bash
cd /Users/mobolaji/Downloads/ks2-learning-engine

# Add the remote repository
git remote add origin https://github.com/YOUR_USERNAME/ks2-learning-engine.git

# Verify the remote
git remote -v

# Push to GitHub
git branch -M main
git push -u origin main
```

## 3. Verify Success

Visit `https://github.com/YOUR_USERNAME/ks2-learning-engine` to see your repository!

## 4. Optional: Add License

To add an open-source license (recommended for community projects):

```bash
# Add a LICENSE file (MIT license example)
curl https://opensource.org/licenses/MIT > LICENSE
git add LICENSE
git commit -m "docs: Add MIT license"
git push origin main
```

## 5. GitHub Pages Deployment (Optional)

To deploy the app automatically:

1. Go to repository Settings → Pages
2. Select "GitHub Actions" as source
3. Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npm run build
      - uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./dist
```

## 6. Enable CI/CD

The repo already has GitHub Actions configured in `.github/workflows/ci.yml`. 

To see runs:
1. Go to Actions tab in your repository
2. CI will run automatically on push and pull requests
3. Check status before merging PRs

## 7. Branching Strategy

Recommended workflow:

```bash
# Create feature branch
git checkout -b feature/new-feature

# Make changes and commit
git add .
git commit -m "feat: Add new feature"

# Push branch
git push origin feature/new-feature

# Create Pull Request on GitHub
# (GitHub will suggest this when you push)
```

## 8. Protect Main Branch (Recommended)

1. Settings → Branches
2. Add rule for `main`
3. Enable "Require pull request reviews"
4. Enable "Dismiss stale pull request approvals"
5. Enable "Require branches to be up to date before merging"

## 9. GitHub Secrets (For CI/CD)

If you want CI to access Firebase or Gemini API:

1. Settings → Secrets and variables → Actions
2. Add secrets:
   - `VITE_GEMINI_API_KEY`: Your Gemini API key
   - `FIREBASE_CONFIG`: Your Firebase configuration JSON

Then update `.github/workflows/ci.yml` to use them.

## Repository Files

Your repository now includes:

✅ `.gitignore` - Excludes node_modules, build artifacts
✅ `.github/workflows/ci.yml` - Automated testing and building
✅ `.github/ISSUE_TEMPLATE/` - Bug and feature templates
✅ `CONTRIBUTING.md` - Contribution guidelines
✅ `CHANGELOG.md` - Version history
✅ `README.md` - Project documentation
✅ `DEPLOYMENT_GUIDE.md` - Deployment instructions

## Helpful Commands

```bash
# Check git status
git status

# View commit history
git log --oneline

# See what changed
git diff

# Create a new branch and switch
git checkout -b feature/my-feature

# Push changes
git push origin feature/my-feature

# Pull latest changes
git pull origin main
```

## Need Help?

- [GitHub Docs](https://docs.github.com)
- [Git Documentation](https://git-scm.com/doc)
- [Creating Issues](https://docs.github.com/en/issues/tracking-your-work-with-issues/creating-an-issue)
- [Pull Requests](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests)

Good luck! 🚀
