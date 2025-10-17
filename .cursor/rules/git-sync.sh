#!/bin/bash

# Cursor AI Git Sync Script
# Usage: bash .cursor/rules/git-sync.sh

echo "🔄 Starting Git Sync..."
echo ""

# Check if we're in a git repository
if ! git rev-parse --git-dir > /dev/null 2>&1; then
    echo "❌ Error: Not in a git repository"
    exit 1
fi

# Check for uncommitted changes
if ! git diff-index --quiet HEAD --; then
    echo "⚠️  You have uncommitted changes."
    read -p "Do you want to commit them? (y/n) " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo "📝 Staging all changes..."
        git add .
        
        read -p "Enter commit message: " commit_msg
        git commit -m "$commit_msg"
        echo "✅ Changes committed"
    else
        echo "⚠️  Stashing uncommitted changes..."
        git stash
        STASHED=true
    fi
fi

# Fetch latest from remote
echo "📥 Fetching latest from remote..."
git fetch origin

# Pull with rebase
echo "🔽 Pulling latest changes..."
if git pull --rebase; then
    echo "✅ Successfully pulled latest changes"
else
    echo "❌ Pull failed. Please resolve conflicts manually."
    exit 1
fi

# Pop stashed changes if we stashed
if [ "$STASHED" = true ]; then
    echo "📤 Restoring stashed changes..."
    if git stash pop; then
        echo "✅ Stashed changes restored"
    else
        echo "⚠️  Conflicts detected. Please resolve and commit."
        exit 1
    fi
fi

# Push if there are commits to push
if git log origin/$(git branch --show-current)..HEAD | grep -q .; then
    echo "📤 Pushing changes to remote..."
    if git push; then
        echo "✅ Changes pushed successfully"
    else
        echo "❌ Push failed. Please check permissions."
        exit 1
    fi
else
    echo "✅ No local commits to push"
fi

echo ""
echo "🎉 Git sync complete!"

