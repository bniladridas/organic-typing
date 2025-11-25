package main

import (
	"encoding/json"
	"fmt"
	"os"
	"time"
)

type Keystroke struct {
	Key       string `json:"key"`
	Timestamp int64  `json:"timestamp"`
	Type      string `json:"type"`
}

type LinuxKeylogger struct {
	keystrokes []Keystroke
}

func NewLinuxKeylogger() *LinuxKeylogger {
	return &LinuxKeylogger{
		keystrokes: make([]Keystroke, 0),
	}
}

func (lk *LinuxKeylogger) Start() error {
	// Placeholder: In a real implementation, open /dev/input/event* and read events
	// For now, simulate some keystrokes
	go func() {
		time.Sleep(1 * time.Second)
		lk.keystrokes = append(lk.keystrokes, Keystroke{Key: "a", Timestamp: time.Now().UnixMilli(), Type: "press"})
		time.Sleep(100 * time.Millisecond)
		lk.keystrokes = append(lk.keystrokes, Keystroke{Key: "a", Timestamp: time.Now().UnixMilli(), Type: "release"})
	}()
	return nil
}

func (lk *LinuxKeylogger) Stop() {
	// Placeholder
}

func (lk *LinuxKeylogger) GetKeystrokes() []Keystroke {
	return lk.keystrokes
}

func main() {
	if len(os.Args) < 2 {
		fmt.Println("Usage: go run linux-keylogger.go <duration_seconds>")
		os.Exit(1)
	}

	duration, err := time.ParseDuration(os.Args[1] + "s")
	if err != nil {
		fmt.Printf("Invalid duration: %v\n", err)
		os.Exit(1)
	}

	logger := NewLinuxKeylogger()
	err = logger.Start()
	if err != nil {
		fmt.Printf("Error starting logger: %v\n", err)
		os.Exit(1)
	}

	time.Sleep(duration)
	logger.Stop()

	data := logger.GetKeystrokes()
	jsonData, err := json.MarshalIndent(data, "", "  ")
	if err != nil {
		fmt.Printf("Error marshaling JSON: %v\n", err)
		os.Exit(1)
	}

	fmt.Println(string(jsonData))
}
