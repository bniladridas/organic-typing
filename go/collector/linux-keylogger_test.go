package main

import (
	"testing"
	"time"
)

func TestNewLinuxKeylogger(t *testing.T) {
	logger := NewLinuxKeylogger()
	if logger == nil {
		t.Fatal("NewLinuxKeylogger returned nil")
	}
	if len(logger.keystrokes) != 0 {
		t.Errorf("Expected empty keystrokes, got %d", len(logger.keystrokes))
	}
}

func TestStartAndGetKeystrokes(t *testing.T) {
	logger := NewLinuxKeylogger()
	err := logger.Start()
	if err != nil {
		t.Fatalf("Start failed: %v", err)
	}

	// Wait for simulation
	time.Sleep(1500 * time.Millisecond)

	logger.Stop()
	keystrokes := logger.GetKeystrokes()

	if len(keystrokes) != 2 {
		t.Errorf("Expected 2 keystrokes, got %d", len(keystrokes))
	}

	if len(keystrokes) >= 1 {
		if keystrokes[0].Key != "a" || keystrokes[0].Type != "press" {
			t.Errorf("Expected first keystroke to be 'a' press, got %v", keystrokes[0])
		}
	}

	if len(keystrokes) >= 2 {
		if keystrokes[1].Key != "a" || keystrokes[1].Type != "release" {
			t.Errorf("Expected second keystroke to be 'a' release, got %v", keystrokes[1])
		}
	}
}

func TestStop(t *testing.T) {
	logger := NewLinuxKeylogger()
	err := logger.Start()
	if err != nil {
		t.Fatalf("Start failed: %v", err)
	}

	logger.Stop()
	// Stop should not panic or error
}
