# SPDX-License-Identifier: BSD-3-Clause
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split

class Verifier:
    def __init__(self):
        self.model = RandomForestClassifier(n_estimators=10, random_state=42)
        self.is_trained = False

    def train(self, human_vectors, ai_vectors):
        # Train on labeled data
        X = np.vstack([human_vectors, ai_vectors])
        y = np.hstack([np.ones(len(human_vectors)), np.zeros(len(ai_vectors))])
        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
        self.model.fit(X_train, y_train)
        self.is_trained = True
        accuracy = self.model.score(X_test, y_test)
        print(f"Model trained with accuracy: {accuracy:.2f}")

    def verify(self, input_vector):
        # Predict if human-like
        if not self.is_trained:
            # Fallback to simple heuristic if not trained
            avg_interval = input_vector[0] if len(input_vector) > 0 else 100
            pause_count = input_vector[2] if len(input_vector) > 2 else 5
            # Simple check: human if interval > 80ms and pauses < 10
            return avg_interval > 80 and pause_count < 10
        prediction = self.model.predict([input_vector])
        return prediction[0] == 1  # 1 for human

if __name__ == "__main__":
    import json
    import sys
    if len(sys.argv) > 1:
        # Legacy: from arg
        vector = json.loads(sys.argv[1])
    else:
        # From stdin
        vector = json.loads(sys.stdin.read())
    v = Verifier()
    result = v.verify(vector)
    print("Human" if result else "AI")
