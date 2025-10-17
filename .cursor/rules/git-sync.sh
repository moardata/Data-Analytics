#!/bin/bash

# Cursor AI Git Sync Script
<<<<<<< HEAD
# Quick script to sync your local repo with remote
=======
# Usage: bash .cursor/rules/git-sync.sh
>>>>>>> b54bf6dcbde2c46be7c72929a090d485d2cced58

echo "🔄 Starting Git Sync..."
echo ""

<<<<<<< HEAD
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
=======
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
>>>>>>> b54bf6dcbde2c46be7c72929a090d485d2cced58
        git stash
        STASHED=true
    fi
fi

<<<<<<< HEAD
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
=======
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
>>>>>>> b54bf6dcbde2c46be7c72929a090d485d2cced58
        exit 1
    fi
fi

<<<<<<< HEAD
echo ""
echo "🎉 Git sync complete!"
echo ""
git status
=======
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
>>>>>>> b54bf6dcbde2c46be7c72929a090d485d2cced58

