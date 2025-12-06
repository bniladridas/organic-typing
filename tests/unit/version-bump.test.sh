#!/bin/bash

# Test script for version bumping logic

increment_version() {
    local last_tag=$1
    IFS='.' read -r major minor patch <<< "$last_tag"
    # Validate version components are numbers
    if ! [[ "$major" =~ ^[0-9]+$ ]] || ! [[ "$minor" =~ ^[0-9]+$ ]] || ! [[ "$patch" =~ ^[0-9]+$ ]]; then
        echo "0.1.4"
    else
        local new_patch=$((patch + 1))
        echo "${major}.${minor}.${new_patch}"
    fi
}

# Tests
echo "Testing version increment..."

# Test normal case
result=$(increment_version "1.2.3")
expected="1.2.4"
if [ "$result" = "$expected" ]; then
    echo "✓ Normal case: $result"
else
    echo "✗ Normal case failed: expected $expected, got $result"
fi

# Test invalid version
result=$(increment_version "1.2.abc")
expected="0.1.4"
if [ "$result" = "$expected" ]; then
    echo "✓ Invalid version: $result"
else
    echo "✗ Invalid version failed: expected $expected, got $result"
fi

# Test no patch
result=$(increment_version "1.2")
expected="0.1.4"
if [ "$result" = "$expected" ]; then
    echo "✓ Missing patch: $result"
else
    echo "✗ Missing patch failed: expected $expected, got $result"
fi

# Test zero version
result=$(increment_version "0.0.0")
expected="0.0.1"
if [ "$result" = "$expected" ]; then
    echo "✓ Zero version: $result"
else
    echo "✗ Zero version failed: expected $expected, got $result"
fi

echo "Tests completed."