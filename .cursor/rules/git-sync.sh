#!/bin/bash

# Cursor AI Git Sync Script
# Quick script to sync your local repo with remote

echo "🔄 Starting Git Sync..."
echo ""

# Check for uncommitted changes
if [[ -n $(git status -s) ]]; then
    echo "⚠️  You have uncommitted changes:"
    git status -s
    echo ""
    read -p "Do you want to commit them? (y/n) " -n 1 -r
    echo ""
    
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        read -p "Enter commit message: " commit_msg
        git add .
        git commit -m "$commit_msg"
        echo "✅ Changes committed"
    else
        echo "Stashing changes temporarily..."
        git stash
        STASHED=true
    fi
fi

# Pull latest changes
echo ""
echo "⬇️  Pulling latest changes..."
git pull --rebase

if [ $? -eq 0 ]; then
    echo "✅ Pull successful"
else
    echo "❌ Pull failed - please resolve conflicts"
    exit 1
fi

# Pop stash if we stashed
if [ "$STASHED" = true ]; then
    echo ""
    echo "Restoring your stashed changes..."
    git stash pop
fi

# Push if we have commits to push
if [[ -n $(git log @{u}.. 2>/dev/null) ]]; then
    echo ""
    echo "⬆️  Pushing your commits..."
    git push
    
    if [ $? -eq 0 ]; then
        echo "✅ Push successful"
    else
        echo "❌ Push failed"
        exit 1
    fi
fi

echo ""
echo "🎉 Git sync complete!"
echo ""
git status

