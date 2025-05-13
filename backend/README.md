uv init .

uv add -r requirements.txt # 주요 의존성 설치

uv run uvicorn app:sio_app --host 0.0.0.0 --port 8000
