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
            # Fallback to simple distance if not trained
            return True  # Assume human for now
        prediction = self.model.predict([input_vector])
        return prediction[0] == 1  # 1 for human
