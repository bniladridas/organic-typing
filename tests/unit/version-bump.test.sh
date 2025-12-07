#!/bin/bash

# Test script for version bumping logic

increment_version() {
    local last_tag=$1
    IFS='.' read -r major minor patch <<< "$last_tag"
    # Validate version components are numbers
    if ! [[ "$major" =~ ^[0-9]+$ ]] || ! [[ "$minor" =~ ^[0-9]+$ ]] || ! [[ "$patch" =~ ^[0-9]+$ ]]; then
        echo "Error: Invalid version format: '$last_tag'" >&2
        return 1
    else
        local new_patch=$((patch + 1))
        echo "${major}.${minor}.${new_patch}"
    fi
}

assert_equal() {
    local actual="$1"
    local expected="$2"
    local test_name="$3"
    if [ "$actual" = "$expected" ]; then
        echo "✓ ${test_name}: $actual"
    else
        echo "✗ ${test_name} failed: expected '$expected', got '$actual'"
    fi
}

# Tests
echo "Testing version increment..."

# Test normal case
result=$(increment_version "1.2.3")
assert_equal "$result" "1.2.4" "Normal case"

# Test invalid version
result=$(increment_version "1.2.abc")
assert_equal "$result" "0.1.4" "Invalid version"

# Test no patch
result=$(increment_version "1.2")
assert_equal "$result" "0.1.4" "Missing patch"

# Test zero version
result=$(increment_version "0.0.0")
assert_equal "$result" "0.0.1" "Zero version"

echo "Tests completed."
