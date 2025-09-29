# 세계 빵 도감 프로젝트 (Next.js)

## 기술 스택
- Next.js 14 (App Router + Pages API)
- Tailwind CSS + (shadcn/ui 스타일의 경량 컴포넌트)
- Prisma + SQLite (→ PostgreSQL 확장 예정)
- 배포: Vercel

## 폴더 구조
- `app/` UI 라우팅 (Home, Catalog, Bread Detail, Dashboard, Blog, Admin)
- `pages/api/` API 라우트 (CRUD, Auth, CSV 업로드)
- `prisma/` Prisma 스키마
- `db/` Prisma Client 및 Zod 스키마
- `scripts/` CSV Seed 스크립트
- `data/` CSV 샘플 파일

## 환경 변수
`.env` 예시는 `.env.example` 참고
```
DATABASE_URL="file:./dev.db"  # Option A: PostgreSQL URL 권장 / Option B: 임시 SQLite
DISABLE_DB="true"              # DB 완전 비활성화 모드 (홈페이지 보장 렌더용)
JWT_SECRET="change_me_super_secret"
ADMIN_PASSWORD="set_a_strong_admin_password"
```

## 설치 & 실행
```
npm install
npm run prisma:generate
npm run db:push
npm run seed   # data/*.csv → SQLite import
npm run dev
```

접속: http://localhost:3000

## 주요 페이지
- `/` Home: 비전, 진행 현황, 카테고리
- `/catalog` Catalog: 전체 목록 + 검색/필터(클라이언트)
- `/bread/[id]` Detail: 사진/원산지/발효/레시피 요약/연구 기록
- `/dashboard` Progress: 완료/진행/예정, 국가별 달성률
- `/blog` Blog/Notes: 간단한 포스트 목록
- `/admin` Admin: CRUD + CSV 업로드 (JWT 필요)
- `/admin/login` Admin 로그인

## API 라우트
- `GET /api/breads`: 목록 + 쿼리(`q, origin, fermentation, texture, category, status`)
- `POST /api/breads`: 생성 (관리자 토큰 필요)
- `GET /api/breads/[id]`: 상세
- `PUT /api/breads/[id]`: 수정 (관리자 토큰)
- `DELETE /api/breads/[id]`: 삭제 (관리자 토큰)
- `POST /api/auth/login`: `{ password, name? }` → 토큰 발급(쿠키)
- `POST /api/admin/upload`: CSV 업로드(멀티파트), 컬럼 매핑: `name,origin,fermentation,texture,category,ingredients,description,image_url`
- `POST /api/admin/upload-image`: 이미지 업로드 → Supabase Storage에 저장 후 공개 URL 반환 (관리자 전용)
- `GET/POST /api/posts`, `GET/PUT/DELETE /api/posts/[id]`: Blog CRUD (관리자 전용 for mutations)
- `GET /api/health`: 헬스체크 - 환경변수 상태, DB 연결 상태 확인

## 메모
- 현재 이미지는 `image_url` 문자열로만 저장 (추후 Supabase Storage/S3 연동 예정)
- Admin 인증: API 레벨에서 JWT 검증. UI는 로그인 페이지 제공
- PostgreSQL 전환 시 `datasource db`만 교체 후 마이그레이션 진행

## 배포 (Vercel) 권장 구성

### Option A: 프로덕션 (PostgreSQL 권장)
- 서버리스에서 SQLite 파일은 영속성이 부족합니다. `DATABASE_URL`을 PostgreSQL로 전환(예: Vercel Postgres/Neon/Supabase Postgres) 후 `prisma migrate deploy` 사용을 권장합니다.
- 환경변수: `JWT_SECRET`, `ADMIN_PASSWORD`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_BUCKET` 설정.
- Supabase Storage: `bread-images` 버킷 생성 후 공개 설정(또는 서명 URL 사용).

### Option B: 임시 배포 (DB 없이 홈페이지 우선 렌더)
홈페이지가 반드시 렌더되도록 안정화하려면:
1. Vercel 환경변수에 `DISABLE_DB=true` 설정
2. 선택적으로 `DATABASE_URL=file:./dev.db` 설정 (SQLite 임시 사용)
3. Deploy (빌드 캐시 Clear 옵션 사용)
4. `/api/health` 엔드포인트로 환경 상태 확인
5. 홈페이지가 정상 렌더되면 `DISABLE_DB`를 제거하고 PostgreSQL 연결 진행

**주의**: `DISABLE_DB=true` 시 모든 DB 기능이 비활성화되며 빈 데이터/placeholder를 표시합니다.

## 라우트 보호
- `middleware.ts`가 `/admin/*` 접근 시 JWT 토큰을 검증, 미인증 사용자는 `/admin/login`으로 리다이렉트.
- API는 별도로 관리자 권한을 검사하여 이중 방어.

## Vercel 배포 가이드 (Step-by-step)
1) GitHub 연결
- Vercel Dashboard → New Project → `winefools/bread-atlas` 선택
- Framework: Next.js 자동 감지, 기본 빌드/출력 설정 그대로 사용

2) 환경변수 등록 (Project → Settings → Environment Variables)
- NEXT_PUBLIC_SUPABASE_URL: 브라우저 공개 가능 URL (예: `https://YOUR_PROJECT.supabase.co`)
- NEXT_PUBLIC_SUPABASE_ANON_KEY: Supabase anon key (public)
- SUPABASE_SERVICE_ROLE_KEY: Supabase service role key (server only)
- SUPABASE_BUCKET: `bread-images` (권장)
- JWT_SECRET: 충분히 긴 랜덤 문자열
- ADMIN_PASSWORD: 강력한 관리자 비밀번호
- DATABASE_URL: 프로덕션은 PostgreSQL URL 권장 (예: `postgres://...`)

주의사항
- `SUPABASE_SERVICE_ROLE_KEY`는 절대 `NEXT_PUBLIC_` 접두사를 사용하지 않습니다(클라이언트 노출 금지).
- 미리보기/프로덕션 환경에 각각 필요한 변수를 설정하세요.

3) 재배포
- 환경변수 저장 후 Redeploy → 배포 URL에서 동작 확인

4) CI/CD
- `main`에 커밋을 푸시하면 Vercel이 자동으로 빌드/배포합니다.

추가 설정이 필요한 경우(리다이렉트/헤더/지역/이미지 도메인), `vercel.json`을 추가할 수 있습니다. 필요 시 템플릿을 제공해드립니다.
