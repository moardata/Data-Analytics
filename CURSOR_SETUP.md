# Cursor AI Git Sync Setup

## What Was Created

Two files have been added to the repository to help maintain sync when working with Cursor AI:

1. `.cursorrules` - Rules that guide the AI to remind about git sync
2. `.cursor/rules/git-sync.sh` - Optional bash script for manual syncing

## How It Works

The .cursorrules file tells Cursor's AI assistant to:
- Before making changes: Remind you to pull latest code
- After making changes: Remind you to commit and push

This prevents conflicts when multiple developers (or AI assistants) are working on the same codebase.

## Setup Instructions (For Both Developers)

### Step 1: Clone/Pull the Repository
```bash
git clone https://github.com/moardata/Data-Analytics.git
# OR if you already have it
git pull
```

### Step 2: That's It!
The .cursorrules file is automatically recognized by Cursor. No additional configuration needed.

## Daily Workflow

### When Starting Work
```bash
git fetch origin
git pull --rebase
```

### When Using Cursor AI
- The AI will remind you to pull before making changes
- The AI will remind you to commit/push after making changes

### Manual Git Sync Commands
```bash
# Pull latest
git pull --rebase

# Commit your changes
git add .
git commit -m "Describe what you changed"

# Push to remote
git push
```

## Optional: Manual Sync Script

If you prefer a quick sync command, use:
```bash
# On Git Bash (Windows) or Mac/Linux terminal
bash .cursor/rules/git-sync.sh
```

## Best Practices

1. Always pull before starting work
2. Commit frequently with clear messages
3. Push your changes when done
4. Communicate with your team about major changes
5. If you see conflicts, resolve them before continuing

## Troubleshooting

### "Your branch is behind..."
```bash
git pull --rebase
```

### "You have uncommitted changes..."
```bash
# Either commit them
git add .
git commit -m "Your message"

# Or stash them temporarily
git stash
git pull
git stash pop
```

### Conflicts After Pull
1. Open the conflicted files
2. Look for `<<<<<<<`, `=======`, `>>>>>>>` markers
3. Edit to keep the correct code
4. Save the files
5. Run: `git add .` then `git rebase --continue`

## Questions?
Ask your co-developer or check: https://git-scm.com/docs

