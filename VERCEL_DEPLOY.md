# Vercel 배포 가이드

## 📋 배포 전 체크리스트

### 1. 환경 변수 설정

Vercel 대시보드에서 다음 환경 변수를 설정하세요:

**프로덕션 환경:**
- `VITE_API_URL`: `https://www.jinwook.shop`

**프리뷰 환경 (선택사항):**
- `VITE_API_URL`: `https://www.jinwook.shop` (또는 테스트 서버 URL)

### 2. 환경 변수 설정 방법

1. Vercel 대시보드에 로그인
2. 프로젝트 선택
3. Settings → Environment Variables 메뉴로 이동
4. 다음 변수 추가:
   - **Key**: `VITE_API_URL`
   - **Value**: `https://www.jinwook.shop`
   - **Environment**: Production, Preview, Development 모두 선택

### 3. 배포 방법

#### 방법 1: Vercel CLI 사용

```bash
# Vercel CLI 설치 (전역)
npm i -g vercel

# 프로젝트 루트에서 배포
vercel

# 프로덕션 배포
vercel --prod
```

#### 방법 2: GitHub 연동 (권장)

1. GitHub에 프로젝트 푸시
2. Vercel 대시보드에서 "New Project" 클릭
3. GitHub 저장소 선택
4. 빌드 설정 자동 감지됨 (Vite 프로젝트)
5. 환경 변수 설정 후 "Deploy" 클릭

### 4. 빌드 설정 확인

현재 `vercel.json` 설정:
- **빌드 명령어**: `pnpm build`
- **출력 디렉토리**: `dist`
- **프레임워크**: Vite
- **SPA 라우팅**: 모든 경로를 `/index.html`로 리다이렉트

### 5. 배포 후 확인 사항

1. ✅ 홈페이지가 정상적으로 로드되는지 확인
2. ✅ API 호출이 정상적으로 작동하는지 확인 (브라우저 개발자 도구 Network 탭)
3. ✅ 로그인/회원가입 기능 테스트
4. ✅ 모든 페이지 라우팅이 정상 작동하는지 확인

### 6. 문제 해결

#### 문제 1: API 호출이 실패하는 경우

**원인**: 환경 변수가 설정되지 않았거나 잘못 설정됨

**해결**:
- Vercel 대시보드에서 환경 변수 확인
- `VITE_API_URL`이 `https://www.jinwook.shop`으로 설정되어 있는지 확인
- 배포 후 재배포 필요 (환경 변수 변경 시)

#### 문제 2: 페이지 새로고침 시 404 에러

**원인**: SPA 라우팅 설정 문제

**해결**:
- `vercel.json`의 `rewrites` 설정 확인
- 모든 경로가 `/index.html`로 리다이렉트되도록 설정되어 있는지 확인

#### 문제 3: 빌드 실패

**원인**: 의존성 문제 또는 빌드 스크립트 오류

**해결**:
- 로컬에서 `pnpm build` 실행하여 빌드 오류 확인
- `package.json`의 빌드 스크립트 확인
- Vercel 빌드 로그 확인

### 7. 커스텀 도메인 설정 (선택사항)

1. Vercel 대시보드 → 프로젝트 → Settings → Domains
2. 원하는 도메인 추가
3. DNS 설정 안내에 따라 도메인 DNS 설정

### 8. 환경별 배포

- **Production**: 메인 브랜치 (보통 `main` 또는 `master`)
- **Preview**: 다른 브랜치나 Pull Request
- **Development**: 개발 브랜치

각 환경별로 다른 환경 변수를 설정할 수 있습니다.

## 📝 참고 사항

- Vercel은 자동으로 HTTPS를 제공합니다
- 빌드 캐시를 활용하여 빠른 배포가 가능합니다
- 환경 변수는 빌드 시점에 주입되므로, 변경 후 재배포가 필요합니다
- Vite의 `import.meta.env.PROD`는 프로덕션 빌드에서 `true`가 됩니다

