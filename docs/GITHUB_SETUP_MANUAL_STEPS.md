# GitHub Setup - Manual Configuration Checklist

This document guides you through the manual configuration steps needed to complete the GitHub open source environment setup.

## 📋 Pre-requisites

- [ ] GitHub repository: `aicodingstack/aicodingstack.io` created
- [ ] You have admin access to the repository
- [ ] Cloudflare Pages account (for deployment)
- [ ] GitHub organization created (optional but recommended)

---

## Step 1: Update CODEOWNERS File

**Location:** `.github/CODEOWNERS`

**Current status:** Contains placeholder `@aicodingstack/maintainers`

### Option A: Using GitHub Organization Team (Recommended)

1. **Create GitHub Organization** (if not exists):
   - Go to https://github.com/organizations/new
   - Organization name: `aicodingstack`
   - Free plan is fine

2. **Transfer Repository to Organization**:
   - Go to repository Settings → General → Danger Zone
   - Click "Transfer ownership"
   - New owner: `aicodingstack`
   - Type repository name to confirm

3. **Create Maintainers Team**:
   - Go to https://github.com/orgs/aicodingstack/teams
   - Click "New team"
   - Team name: `maintainers`
   - Description: "Core maintainers of AI Coding Stack"
   - Visibility: Visible
   - Click "Create team"

4. **Add Team Members**:
   - In the team page, click "Members" tab
   - Click "Add a member"
   - Add yourself and other maintainers

5. **Grant Team Access to Repository**:
   - In the team page, click "Repositories" tab
   - Click "Add repository"
   - Select `aicodingstack.io`
   - Role: `Write` or `Maintain`

6. **CODEOWNERS is already correct** - no changes needed! ✅

### Option B: Using Individual GitHub Usernames (Simpler)

If you don't want to use an organization:

1. Edit `.github/CODEOWNERS`
2. Replace all instances of `@aicodingstack/maintainers` with actual usernames:

```bash
# Before
* @aicodingstack/maintainers

# After (replace with your actual GitHub username)
* @yangpan

# Or multiple maintainers
* @yangpan @maintainer2 @maintainer3
```

3. Save and commit the changes

**Status:** [ ] Complete

---

## Step 2: Enable Branch Protection Rules

**Location:** GitHub Repository Settings → Branches

### Instructions:

1. **Navigate to Branch Protection**:
   - Go to: https://github.com/aicodingstack/aicodingstack.io/settings/branches
   - Click "Add branch protection rule"

2. **Branch Name Pattern**:
   ```
   main
   ```

3. **Configure Protection Rules**:

   #### ✅ Protect matching branches
   - [x] Require a pull request before merging
     - [x] Require approvals: `1`
     - [x] Dismiss stale pull request approvals when new commits are pushed
     - [ ] Require review from Code Owners (enable after CODEOWNERS is configured)
     - [ ] Restrict who can dismiss pull request reviews (optional)
     - [x] Allow specified actors to bypass required pull requests (leave empty unless you want exceptions)
     - [ ] Require approval of the most recent reviewable push

   #### ✅ Require status checks to pass before merging
   - [x] Require status checks to pass before merging
   - [x] Require branches to be up to date before merging
   - **Status checks to require** (select these after first CI run):
     - `lint`
     - `type-check`
     - `validate-manifests`
     - `validate-urls`
     - `spell-check`
     - `build`
     - `ci-success` (optional, aggregates all checks)

   > **Note:** These status checks will only appear in the list after you've run the CI workflow at least once. You can come back and add them later.

   #### ✅ Additional Settings
   - [ ] Require conversation resolution before merging (optional but recommended)
   - [ ] Require signed commits (optional, for higher security)
   - [ ] Require linear history (optional, keeps git history clean)
   - [ ] Require deployments to succeed before merging (configure after deployment setup)

   #### ✅ Restrict Pushes
   - [ ] Do not allow bypassing the above settings
   - [ ] Restrict who can push to matching branches (optional)
     - Add: Yourself and core maintainers only

   #### ✅ Rules applied to everyone including administrators
   - [x] Include administrators (recommended for consistency)

4. **Click "Create"** to save the rule

**Status:** [ ] Complete

**Screenshot location to verify:** Settings → Branches should show protection for `main`

---

## Step 3: Configure Cloudflare Pages Deployment

You have two options for deployment:

### Option A: Cloudflare Pages GitHub Integration (Easiest)

This is the simplest method - Cloudflare handles everything automatically.

1. **Login to Cloudflare Dashboard**:
   - Go to: https://dash.cloudflare.com/
   - Navigate to: Workers & Pages → Overview

2. **Create New Pages Project**:
   - Click "Create application"
   - Select "Pages" tab
   - Click "Connect to Git"

3. **Connect GitHub Repository**:
   - Click "Connect GitHub" (authorize if needed)
   - Select `aicodingstack/aicodingstack.io`
   - Click "Begin setup"

4. **Configure Build Settings**:
   ```
   Project name: aicodingstack
   Production branch: main
   Build command: npm run build
   Build output directory: .open-next
   Root directory: /
   ```

   **Environment variables** (if needed):
   - None required for basic setup

5. **Advanced Settings**:
   - Node.js version: `20`
   - Compatibility date: `2025-03-01` (or latest)

6. **Click "Save and Deploy"**

7. **Configure Custom Domain** (after first deployment):
   - Go to Pages project → Custom domains
   - Add domain: `aicodingstack.io`
   - Follow DNS configuration instructions

8. **Disable GitHub Actions Deployment**:
   Since Cloudflare is handling deployment directly, you can either:
   - Keep the GitHub Actions workflows for CI checks only (recommended)
   - Or delete `deploy-preview.yml` and `deploy-production.yml`

**Status:** [ ] Complete

### Option B: GitHub Actions Deployment (More Control)

If you prefer GitHub Actions to handle deployment:

1. **Get Cloudflare API Token**:
   - Go to: https://dash.cloudflare.com/profile/api-tokens
   - Click "Create Token"
   - Use template: "Edit Cloudflare Workers"
   - Or create custom token with permissions:
     - Account → Cloudflare Pages → Edit
   - Click "Continue to summary"
   - Click "Create Token"
   - **Copy the token** (you won't see it again!)

2. **Get Cloudflare Account ID**:
   - Go to: https://dash.cloudflare.com/
   - Select any site or go to Workers & Pages
   - Account ID is shown on the right sidebar
   - Copy it

3. **Add Secrets to GitHub Repository**:
   - Go to: https://github.com/aicodingstack/aicodingstack.io/settings/secrets/actions
   - Click "New repository secret"

   Add two secrets:

   **Secret 1:**
   - Name: `CLOUDFLARE_API_TOKEN`
   - Value: [paste your API token]
   - Click "Add secret"

   **Secret 2:**
   - Name: `CLOUDFLARE_ACCOUNT_ID`
   - Value: [paste your account ID]
   - Click "Add secret"

4. **Uncomment Deployment Steps**:

   Edit `.github/workflows/deploy-preview.yml`:
   - Find lines 32-62 (the commented deployment steps)
   - Uncomment them (remove the `#` symbols)
   - Comment out or delete lines 64-71 (the placeholder message)

   Edit `.github/workflows/deploy-production.yml`:
   - Find lines 32-48 (the commented deployment steps)
   - Uncomment them
   - Comment out or delete lines 50-57 (the placeholder message)

5. **Create Cloudflare Pages Project**:
   - Go to Cloudflare Dashboard → Workers & Pages
   - Click "Create application" → "Pages"
   - Click "Connect to Git" → Select your repo
   - **IMPORTANT:** After initial setup, disable automatic deployments:
     - Go to Settings → Builds & deployments
     - Uncheck "Enable automatic deployments"
   - This lets GitHub Actions handle all deployments

6. **Test Deployment**:
   - Push changes to trigger workflow
   - Check Actions tab for deployment status

**Status:** [ ] Complete

---

## Step 4: Enable GitHub Repository Features

**Location:** Repository Settings → General

### Instructions:

1. **Navigate to Settings**:
   - Go to: https://github.com/aicodingstack/aicodingstack.io/settings

2. **Features Section**:

   Enable these features:
   - [x] **Issues** (for bug reports and feature requests)
   - [ ] **Sponsorships** (optional, if you want donations)
   - [x] **Preserve this repository** (optional, GitHub Archive Program)
   - [x] **Discussions** (for community Q&A)
   - [ ] **Projects** (optional, for roadmap/kanban boards)
   - [x] **Wiki** (optional, if you want a wiki)

3. **Pull Requests Section**:
   - [x] Allow merge commits
   - [x] Allow squash merging (recommended)
   - [ ] Allow rebase merging (optional)
   - [x] **Always suggest updating pull request branches**
   - [x] **Allow auto-merge**
   - [x] **Automatically delete head branches** (highly recommended)

4. **Template chooser**:
   Your issue templates should appear automatically. Verify by clicking "Issues" tab → "New issue"

**Status:** [ ] Complete

---

## Step 5: Configure Repository Details

**Location:** Repository Settings → General

### Instructions:

1. **About Section** (top right of repository homepage):
   - Click the gear icon ⚙️

   **Description:**
   ```
   A comprehensive directory and metadata repository for the AI coding ecosystem
   ```

   **Website:**
   ```
   https://aicodingstack.io
   ```

   **Topics** (add these tags):
   ```
   ai
   coding-tools
   directory
   nextjs
   cloudflare-pages
   typescript
   metadata
   ai-development
   developer-tools
   llm
   ide
   ```

   **Checkboxes:**
   - [x] Releases
   - [ ] Packages (unless you publish npm packages)
   - [ ] Deployments (optional)

2. **Social preview image** (optional but recommended):
   - Settings → General → Social preview
   - Upload a 1280x640px image representing your project

**Status:** [ ] Complete

---

## Step 6: Update Contact Information

Several files need your contact information:

### 1. CODE_OF_CONDUCT.md

**Location:** `CODE_OF_CONDUCT.md` (line 62)

**Find:**
```markdown
- Email: [To be configured by maintainers]
```

**Replace with:**
```markdown
- Email: conduct@aicodingstack.io
```
Or use a personal email if you don't have a project email.

### 2. SECURITY.md

**Location:** `SECURITY.md` (line 19)

**Find:**
```markdown
- Send an email to: [To be configured by maintainers]
```

**Replace with:**
```markdown
- Send an email to: security@aicodingstack.io
```

**Also update line 203:**
```markdown
- **Urgent Issues**: [Contact method to be configured]
```

**Replace with:**
```markdown
- **Urgent Issues**: security@aicodingstack.io
```

### 3. README.md (optional enhancement)

**Add contact section** (if not exists):

```markdown
## Contact

- **Issues & Bugs:** [GitHub Issues](https://github.com/aicodingstack/aicodingstack.io/issues)
- **Discussions:** [GitHub Discussions](https://github.com/aicodingstack/aicodingstack.io/discussions)
- **Security:** security@aicodingstack.io
- **General:** hello@aicodingstack.io
```

**Status:** [ ] Complete

---

## Step 7: Enable GitHub Discussions (Optional but Recommended)

**Location:** Repository Settings → Features

### Instructions:

1. **Enable Discussions**:
   - Go to: https://github.com/aicodingstack/aicodingstack.io/settings
   - Under "Features", check ✅ **Discussions**

2. **Configure Discussion Categories**:
   - Go to: https://github.com/aicodingstack/aicodingstack.io/discussions/categories
   - Default categories are fine, or customize:
     - 💡 **Ideas** - Feature requests and ideas
     - 🙏 **Q&A** - Questions about using the site
     - 📣 **Announcements** - Project updates
     - 🎉 **Show and tell** - Share your contributions
     - 🗳️ **Polls** - Community voting

3. **Pin Important Discussions**:
   - Create a "Welcome" discussion
   - Create a "Contributing Guide" discussion (linking to CONTRIBUTING.md)
   - Pin them to the top

**Status:** [ ] Complete

---

## Step 8: Set Up Dependabot (Verify)

Dependabot should work automatically, but let's verify:

### Instructions:

1. **Check Dependabot Status**:
   - Go to: https://github.com/aicodingstack/aicodingstack.io/network/updates
   - You should see: "Dependabot is configured"

2. **Verify Configuration**:
   - The file `.github/dependabot.yml` should exist ✅
   - It's configured to run weekly on Mondays

3. **Test** (optional):
   - Wait for the first Monday after setup
   - Or manually trigger: Settings → Security → Dependabot → Check for updates

4. **Review Auto-merge Settings**:
   - Workflow `.github/workflows/dependabot-auto-merge.yml` exists ✅
   - Minor and patch updates will auto-merge if CI passes
   - Major updates require manual review

**Status:** [ ] Complete

---

## Step 9: First Commit & Test

Now let's commit all changes and test the setup:

### Instructions:

1. **Review All Changes**:
   ```bash
   git status
   ```

2. **Stage All New Files**:
   ```bash
   git add .github/ CONTRIBUTING.md CODE_OF_CONDUCT.md SECURITY.md docs/GITHUB_SETUP_MANUAL_STEPS.md
   ```

3. **Commit** (using conventional commits):
   ```bash
   git commit -m "feat: setup GitHub open source infrastructure

   - Add issue templates for bugs, features, and metadata contributions
   - Configure CI/CD workflows for quality checks and deployment
   - Add Dependabot for automated dependency updates
   - Create contribution guidelines and community standards
   - Set up branch protection and code ownership
   - Configure scheduled tasks for URL validation and GitHub stars

   BREAKING CHANGE: Repository now requires PR reviews and CI checks before merge"
   ```

4. **Push to Main**:
   ```bash
   git push origin main
   ```

5. **Verify CI Runs**:
   - Go to: https://github.com/aicodingstack/aicodingstack.io/actions
   - You should see the CI workflow running
   - Wait for it to complete
   - All checks should pass ✅

6. **Now Configure Branch Protection Status Checks**:
   - Go back to: Settings → Branches → main branch rule
   - Edit the rule
   - Under "Require status checks to pass before merging"
   - You should now see these checks available:
     - `lint`
     - `type-check`
     - `validate-manifests`
     - `validate-urls`
     - `spell-check`
     - `build`
     - `ci-success`
   - Select all of them
   - Save changes

**Status:** [ ] Complete

---

## Step 10: Test with a Pull Request

Create a test PR to verify everything works:

### Instructions:

1. **Create Test Branch**:
   ```bash
   git checkout -b test/verify-github-setup
   ```

2. **Make a Small Change**:
   ```bash
   echo "# Test PR" > TEST_PR.md
   git add TEST_PR.md
   git commit -m "test: verify GitHub workflows and PR template"
   git push origin test/verify-github-setup
   ```

3. **Create Pull Request**:
   - Go to: https://github.com/aicodingstack/aicodingstack.io/pulls
   - Click "New pull request"
   - Base: `main` ← Compare: `test/verify-github-setup`
   - Click "Create pull request"

4. **Verify PR Template Loaded**:
   - PR description should show the template ✅
   - Fill it out as a test

5. **Verify CI Checks Run**:
   - Wait for checks to complete
   - All should pass ✅

6. **Verify Deployment Preview** (if configured):
   - Should see Cloudflare preview deployment
   - Should see comment with preview URL

7. **Test Review Process**:
   - Request review from yourself or another maintainer
   - Approve the PR
   - Merge it (test auto-delete branch works)

8. **Cleanup**:
   ```bash
   git checkout main
   git pull
   rm TEST_PR.md
   git add TEST_PR.md
   git commit -m "chore: remove test file"
   git push origin main
   ```

**Status:** [ ] Complete

---

## Step 11: Test Issue Templates

### Instructions:

1. **Create Test Issue**:
   - Go to: https://github.com/aicodingstack/aicodingstack.io/issues/new/choose

2. **Verify Templates Appear**:
   - [ ] Bug Report template ✅
   - [ ] Feature Request template ✅
   - [ ] Metadata Contribution template ✅
   - [ ] Links to Discussions, Docs, Schemas ✅

3. **Test One Template**:
   - Click "Get started" on "Metadata Contribution"
   - Fill out the form
   - Preview the issue
   - Submit it (you can close it immediately after testing)

**Status:** [ ] Complete

---

## Step 12: Update README with Badges (Optional)

Add status badges to your README for professionalism:

### Instructions:

Edit `README.md` and add at the top:

```markdown
# AI Coding Stack

[![CI Status](https://github.com/aicodingstack/aicodingstack.io/workflows/CI/badge.svg)](https://github.com/aicodingstack/aicodingstack.io/actions/workflows/ci.yml)
[![Deploy Status](https://github.com/aicodingstack/aicodingstack.io/workflows/Deploy%20Production/badge.svg)](https://github.com/aicodingstack/aicodingstack.io/actions/workflows/deploy-production.yml)
[![License](https://img.shields.io/badge/license-Apache%202.0-blue.svg)](LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)

> A comprehensive directory and metadata repository for the AI coding ecosystem

[Live Site](https://aicodingstack.io) | [Contributing](CONTRIBUTING.md) | [Discussions](https://github.com/aicodingstack/aicodingstack.io/discussions)

...rest of README...
```

**Status:** [ ] Complete

---

## ✅ Configuration Completion Checklist

After completing all steps, verify:

- [ ] CODEOWNERS updated with real usernames/team
- [ ] Branch protection rules configured for main
- [ ] Cloudflare deployment working (Option A or B)
- [ ] Repository features enabled (Issues, Discussions)
- [ ] Repository description and topics added
- [ ] Contact emails updated in CODE_OF_CONDUCT.md
- [ ] Contact emails updated in SECURITY.md
- [ ] Dependabot verified
- [ ] First commit pushed successfully
- [ ] CI workflow runs and passes
- [ ] Test PR created and merged
- [ ] Issue templates tested
- [ ] README badges added (optional)

---

## 🎉 You're Done!

Your repository is now configured as a professional open source project with:

- ✅ Comprehensive CI/CD pipeline
- ✅ Automated quality checks
- ✅ Community-friendly contribution process
- ✅ Security and conduct policies
- ✅ Automated maintenance (Dependabot, Stale bot)
- ✅ Clear documentation

### Next Steps:

1. **Announce to Community**:
   - Create a GitHub Discussion announcing the new contribution process
   - Update any external documentation

2. **Monitor First Contributions**:
   - Review first PRs carefully
   - Provide helpful feedback
   - Iterate on templates based on feedback

3. **Regular Maintenance**:
   - Review Dependabot PRs weekly
   - Check scheduled workflow results
   - Update documentation as needed

4. **Spread the Word**:
   - Share on social media
   - Submit to awesome lists
   - Engage with the community

---

## 📞 Need Help?

If you encounter issues during setup:

1. Check GitHub Actions logs for errors
2. Review Cloudflare deployment logs
3. Consult GitHub documentation
4. Open a discussion in the repository

---

**Good luck with your open source journey! 🚀**
