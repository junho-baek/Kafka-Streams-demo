# 프로젝트 실행 및 환경 설정

## 백엔드 설정

1. 의존성 설치

```zsh
uv add -r requirements.txt
```

2. 백엔드 서버 실행

```zsh
uv run uvicorn app:sio_app --host 0.0.0.0 --port 8000
```

## 프론트엔드 설정

1. 의존성 설치

```zsh
npm install
```

2. 개발 서버 실행

```zsh
npm run dev
```

## 주의사항

- 백엔드 서버는 8000번 포트에서 실행됩니다
- 프론트엔드 개발 서버는 기본적으로 5173번 포트에서 실행됩니다
- Kafka 서버가 실행 중이어야 정상적으로 작동합니다
