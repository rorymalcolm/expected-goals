#!/bin/bash
# This script deploys all of the workers in the root directory

# we can use the find command to get all of the directories in the root directory
# and then iterate through them
for dir in $(find . -maxdepth 1 -type d)
do
  # we don't want to run wrangler deploy on the root directory or the scripts directory or .git
  if [ "$dir" != "." ] && [ "$dir" != "./scripts" ]  && [ "$dir" != "./.git" ]
  then
    # we want to cd into the directory and run wrangler deploy
    cd $dir
    echo "Deploying $dir"
    wrangler deploy
    cd ..
  fi
done
echo "Deployed all workers"