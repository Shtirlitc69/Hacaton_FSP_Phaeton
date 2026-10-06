import os
import sys

# Добавляем директорию backend в sys.path для корректных импортов app.*
backend_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)
