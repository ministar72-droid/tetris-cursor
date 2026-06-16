# 테트리스 (교육용)

**▶ [지금 플레이하기](https://ministar72-droid.github.io/tetris-cursor/)**

HTML, CSS, JavaScript만으로 만든 브라우저 테트리스 게임입니다.  
빌드 도구나 외부 라이브러리 없이 동작하며, 입문자가 게임 로직을 단계별로 학습할 수 있도록 구성했습니다.

## 실행 방법

### 로컬에서 실행

1. 이 저장소를 클론하거나 폴더를 연다.
2. `index.html`을 더블 클릭하거나 브라우저로 드래그한다.

또는 VS Code / Cursor의 **Live Server** 확장으로 로컬 서버를 띄워 열 수 있다.

```
index.html → 브라우저에서 열기
```

별도의 `npm install`이나 빌드 과정이 필요하지 않다.

### GitHub Pages에서 실행

배포된 게임은 아래 주소에서 플레이할 수 있다.

**https://ministar72-droid.github.io/tetris-cursor/**

저장소: https://github.com/ministar72-droid/tetris-cursor

## 조작법

| 키 | 동작 |
|----|------|
| `ArrowLeft` (←) | 왼쪽으로 한 칸 이동 |
| `ArrowRight` (→) | 오른쪽으로 한 칸 이동 |
| `ArrowDown` (↓) | 한 칸 빠르게 내리기 (soft drop) |
| `ArrowUp` (↑) | 블록 시계 방향 90° 회전 |
| `Space` | 바닥까지 즉시 내리기 (hard drop) |

- 벽·고정 블록과 충돌하면 이동·회전은 적용되지 않는다.
- 회전 후 충돌이 발생하면 블록은 원래 방향으로 되돌아간다.
- 게임이 진행 중일 때만 키 입력이 반응한다.
- **시작** / **재시작** 버튼으로 게임을 초기화할 수 있다.

## 구현 기능

| 기능 | 설명 |
|------|------|
| 게임 보드 | 10열 × 20행 CSS Grid |
| 테트로미노 | I, O, T, S, Z, J, L 블록 |
| 자동 낙하 | 0.8초 간격으로 한 칸 하강 |
| 충돌 판정 | `canMove()` — 벽·고정 블록·보드 경계 |
| 키보드 조작 | 좌우 이동, 회전, soft/hard drop |
| 줄 삭제 | 가로 한 줄이 가득 차면 제거 후 위 줄 하강 |
| 점수 | 한 번에 삭제한 줄 수에 따라 가산 (아래 표 참고) |
| 게임 오버 | 새 블록 스폰 불가 시 종료, UI 메시지 표시 |
| 재시작 | 보드·점수·타이머·상태 초기화 |

### 점수 규칙

| 한 번에 삭제한 줄 | 점수 |
|-------------------|------|
| 1줄 | 100 |
| 2줄 | 300 |
| 3줄 | 500 |
| 4줄 | 800 |

### 게임 오버 조건

새 블록이 스폰 위치 `(x: 3, y: 0)`에서 고정 블록과 겹치면 게임이 종료된다.  
자동 낙하가 멈추고 **재시작** 버튼으로 다시 플레이할 수 있다.

## 파일 구조

```
TETRIS-CURSOR/
├── index.html    # 게임 화면 구조
├── style.css     # 스타일
├── script.js     # 게임 로직
└── README.md     # 프로젝트 안내
```

## 품질 점검 방법

배포 전 아래 항목을 순서대로 확인한다.

### 1. 로컬 스모크 테스트

1. `index.html`을 브라우저에서 연다.
2. 블록이 자동으로 내려오는지 확인한다.
3. 화살표 키와 Space로 조작이 되는지 확인한다.
4. 한 줄을 가득 채워 줄 삭제와 점수 증가를 확인한다.
5. 보드 상단까지 쌓아 게임 오버 메시지를 확인한다.
6. **재시작** 후 보드·점수가 초기화되는지 확인한다.

### 2. 브라우저 개발자 도구

1. `F12` → **Console** 탭을 연다.
2. 페이지 로드·플레이·재시작 중 빨간색 오류가 없는지 확인한다.
3. **Network** 탭에서 `style.css`, `script.js`가 `200`으로 로드되는지 확인한다.

### 3. Cursor 커맨드 (선택)

프로젝트에 포함된 커맨드로 추가 점검할 수 있다.

| 커맨드 | 용도 |
|--------|------|
| `/qa-playtest` | 기능별 QA 시나리오 점검 |
| `/bug-hunt` | 잠재 버그 탐색 |
| `/review-game-logic` | 게임 로직 집중 리뷰 |

## GitHub Pages 배포 방법

### 사전 준비

- GitHub 계정과 원격 저장소가 필요하다.
- 배포에 포함할 파일은 `index.html`, `style.css`, `script.js`, `README.md`이다.

### 1. Git 저장소 초기화 및 푸시

```bash
git init
git add index.html style.css script.js README.md
git commit -m "feat: 테트리스 게임 초기 배포"
git branch -M main
git remote add origin https://github.com/ministar72-droid/tetris-cursor.git
git push -u origin main
```

### 2. GitHub Pages 활성화

1. https://github.com/ministar72-droid/tetris-cursor/settings/pages
2. **Build and deployment** → **Source**: `Deploy from a branch`
3. **Branch**: `main` / **Folder**: `/ (root)`
4. **Save** 클릭

### 3. 배포 확인

- 1~2분 후 https://ministar72-droid.github.io/tetris-cursor/ 에 접속한다.
- 게임 보드·조작·점수가 로컬과 동일하게 동작하는지 확인한다.

### 배포 시 주의사항

- `index.html`의 `style.css`, `script.js`는 **상대 경로**이므로 저장소 루트 배포에 적합하다.
- `/docs` 폴더 배포를 선택하면 파일을 `docs/` 아래로 옮기거나 Pages 설정을 맞춰야 한다.
- `.cursor/` 폴더는 개발용이므로 배포에 포함하지 않는다.

## 라이선스

교육용 프로젝트입니다. 자유롭게 학습·수정·배포할 수 있습니다.
