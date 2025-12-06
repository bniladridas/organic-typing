#!/usr/bin/env python3
# SPDX-License-Identifier: BSD-3-Clause
import numpy as np
from sklearn.preprocessing import StandardScaler


class OrganicEncoder:
    def __init__(self):
        self.scaler = StandardScaler()

    def fit(self, stats_list):
        # Fit scaler on training data
        vectors = [self._to_vector(stats) for stats in stats_list]
        self.scaler.fit(vectors)

    def encode(self, stats):
        # stats: dict with keys: averageInterval, stdInterval, pauseCount, rhythmVector
        vector = self._to_vector(stats)
        if hasattr(self.scaler, "mean_"):
            return self.scaler.transform([vector])[0]
        else:
            return vector

    def _to_vector(self, stats):
        return np.array(
            [stats["averageInterval"], stats["stdInterval"], stats["pauseCount"]]
            + stats["rhythmVector"]
        )


if __name__ == "__main__":
    import json
    import sys

    stats = json.loads(sys.stdin.read())
    encoder = OrganicEncoder()
    vector = encoder.encode(stats)
    print(json.dumps(vector.tolist()))
