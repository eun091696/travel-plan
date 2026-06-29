# Travel Plan

## OpenWeatherMap API Key

Create a `.env` file in the project root and set your OpenWeatherMap API key:

```env
EXPO_PUBLIC_OPENWEATHER_API_KEY=your_openweather_api_key
```

## OpenAI API Key

To enable real AI itinerary generation, add your OpenAI API key to `.env`:

```env
EXPO_PUBLIC_OPENAI_API_KEY=your_openai_api_key
```

If this key is missing, the app automatically uses the mock itinerary provider.

After changing `.env`, restart the Expo dev server so the environment variable is loaded again.

## Backend API

Spring Boot backend source lives in `backend/`.

## Frontend Backend Connection

The Expo app reads the Spring Boot API address from `EXPO_PUBLIC_API_BASE_URL`.

Create or update `.env` in the project root:

```env
EXPO_PUBLIC_API_BASE_URL=http://localhost:8080
```

Then restart the Expo dev server so the new value is loaded:

```bash
npm run web
```

Start the backend before using API-backed trip detail features. If the backend is unavailable, the frontend API layer falls back to the existing AsyncStorage local data so the MVP screens continue to work.

The app checks backend connectivity on startup with:

```text
GET /api/health
```

If the health check succeeds, the app internally uses server mode and stores trips through the Spring Boot API. If the health check or a later API call fails, the app switches to local mode and keeps using AsyncStorage. The user-facing message is "서버 연결이 불안정하여 로컬 저장소를 사용합니다"; detailed error causes are logged with `console.log` for development.

You can see the current storage mode in My Page:

```text
서버 모드
로컬 모드
```

### Mock Auth And Login

The app currently uses a mock authentication structure instead of real Google/Apple login. On first launch, the app shows a login screen. Tapping "게스트로 시작하기" creates a temporary guest user id and stores the mock user in AsyncStorage.

The frontend stores auth data under:

```text
travel-plan:mock-user
travel-plan:mock-user-id
```

Every API request sends the current user id with the `X-Mock-User-Id` header. The backend automatically creates a mock `User` record for that id and connects every `Trip` to the user. `GET /api/trips` returns only trips owned by the current mock user.

This boundary is intentionally isolated in `authService` on the frontend and `MockUserService` on the backend so it can later be replaced with Google Login, Apple Login, or Supabase Auth.

Frontend auth state is provided through `AuthProvider` and `useAuth` in `contexts/AuthContext.js`. Protected app screens are only rendered after `authService.getCurrentUser()` restores a user from AsyncStorage or after guest login succeeds.

Run the API server with the local H2 profile. If no profile is provided, `local` is used by default:

```bash
cd backend
SPRING_PROFILES_ACTIVE=local mvn spring-boot:run
```

On Windows PowerShell:

```powershell
cd backend
$env:SPRING_PROFILES_ACTIVE="local"
mvn spring-boot:run
```

H2 console:

```text
http://localhost:8080/h2-console
JDBC URL: jdbc:h2:mem:travelplan;MODE=PostgreSQL;DATABASE_TO_UPPER=false
User: sa
Password: empty
```

Run the API server with the production PostgreSQL profile:

```bash
cd backend
export SPRING_PROFILES_ACTIVE=prod
export DB_URL=jdbc:postgresql://localhost:5432/travel_plan
export DB_USERNAME=travel_plan_user
export DB_PASSWORD=your_password
mvn spring-boot:run
```

On Windows PowerShell:

```powershell
cd backend
$env:SPRING_PROFILES_ACTIVE="prod"
$env:DB_URL="jdbc:postgresql://localhost:5432/travel_plan"
$env:DB_USERNAME="travel_plan_user"
$env:DB_PASSWORD="your_password"
mvn spring-boot:run
```

The `local` profile uses H2 with `ddl-auto=update`. The `prod` profile uses PostgreSQL with `ddl-auto=validate`, so create or migrate the schema before running production.

### Trip API Samples

`totalBudget` is the current trip budget field. The API still accepts and returns `budget` as a compatibility alias for older clients.

Create trip:

```bash
curl -X POST http://localhost:8080/api/trips \
  -H "Content-Type: application/json" \
  -d '{
    "title": "도쿄 3박 4일",
    "destination": "도쿄",
    "startDate": "2026-07-10",
    "endDate": "2026-07-13",
    "arrivalDateTime": "2026-07-10T12:30:00",
    "departureDateTime": "2026-07-13T18:00:00",
    "totalBudget": 1500000,
    "companion": "친구",
    "travelStyle": "맛집 중심"
  }'
```

Sample response:

```json
{
  "id": 1,
  "userId": "mock-user-1",
  "title": "도쿄 3박 4일",
  "destination": "도쿄",
  "startDate": "2026-07-10",
  "endDate": "2026-07-13",
  "arrivalDateTime": "2026-07-10T12:30:00",
  "departureDateTime": "2026-07-13T18:00:00",
  "totalBudget": 1500000,
  "budget": 1500000,
  "companion": "친구",
  "travelStyle": "맛집 중심",
  "createdAt": "2026-06-29T10:00:00",
  "updatedAt": "2026-06-29T10:00:00"
}
```

List trips:

```bash
curl http://localhost:8080/api/trips
```

Get trip by id:

```bash
curl http://localhost:8080/api/trips/1
```

Update trip:

```bash
curl -X PUT http://localhost:8080/api/trips/1 \
  -H "Content-Type: application/json" \
  -d '{
    "title": "도쿄 맛집 여행",
    "destination": "도쿄",
    "startDate": "2026-07-10",
    "endDate": "2026-07-13",
    "arrivalDateTime": "2026-07-10T12:30:00",
    "departureDateTime": "2026-07-13T18:00:00",
    "totalBudget": 1800000,
    "companion": "친구",
    "travelStyle": "맛집 중심"
  }'
```

Delete trip:

```bash
curl -X DELETE http://localhost:8080/api/trips/1
```

### Itinerary API Samples

Get itinerary days and items:

```bash
curl http://localhost:8080/api/trips/1/itinerary
```

Create itinerary item:

```bash
curl -X POST http://localhost:8080/api/trips/1/itinerary/items \
  -H "Content-Type: application/json" \
  -d '{
    "dayNumber": 1,
    "date": "2026-07-10",
    "time": "10:00",
    "title": "시부야 산책",
    "description": "스크램블 교차로와 주변 카페를 둘러봅니다.",
    "category": "관광지",
    "placeName": "시부야 스크램블 교차로",
    "address": "Shibuya City, Tokyo",
    "latitude": 35.6595000,
    "longitude": 139.7005000,
    "sortOrder": 1,
    "isCompleted": false
  }'
```

Update itinerary item:

```bash
curl -X PUT http://localhost:8080/api/itinerary/items/1 \
  -H "Content-Type: application/json" \
  -d '{
    "dayNumber": 1,
    "time": "11:00",
    "title": "시부야 산책",
    "description": "일정 시간을 조정합니다.",
    "category": "관광지",
    "placeName": "시부야 스크램블 교차로",
    "sortOrder": 1,
    "isCompleted": true
  }'
```

Delete itinerary item:

```bash
curl -X DELETE http://localhost:8080/api/itinerary/items/1
```

### Budget API Samples

Get budgets:

```bash
curl http://localhost:8080/api/trips/1/budgets
```

Create budget:

```bash
curl -X POST http://localhost:8080/api/trips/1/budgets \
  -H "Content-Type: application/json" \
  -d '{
    "category": "식비",
    "title": "점심",
    "plannedAmount": 30000,
    "actualAmount": 28000,
    "memo": "라멘"
  }'
```

Update budget:

```bash
curl -X PUT http://localhost:8080/api/budgets/1 \
  -H "Content-Type: application/json" \
  -d '{
    "category": "식비",
    "title": "점심",
    "plannedAmount": 30000,
    "actualAmount": 32000,
    "memo": "디저트 포함"
  }'
```

Delete budget:

```bash
curl -X DELETE http://localhost:8080/api/budgets/1
```

### Checklist API Samples

Get checklist:

```bash
curl http://localhost:8080/api/trips/1/checklists
```

Create checklist item:

```bash
curl -X POST http://localhost:8080/api/trips/1/checklists \
  -H "Content-Type: application/json" \
  -d '{
    "title": "여권",
    "category": "필수",
    "isChecked": false
  }'
```

Update checklist item:

```bash
curl -X PUT http://localhost:8080/api/checklists/1 \
  -H "Content-Type: application/json" \
  -d '{
    "title": "여권",
    "category": "필수",
    "isChecked": true
  }'
```

Delete checklist item:

```bash
curl -X DELETE http://localhost:8080/api/checklists/1
```
