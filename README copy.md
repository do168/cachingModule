# collection-api

### 상품기획전 Use Cases

- 모든 상품기획전을 조회한다. (id, 타이틀, 노출, 생성일, 해당 기획전 url 경로 정보)
- 상품기획전 등록
  1. 타이틀 등록 (기획상 최대 25자)
  2. 상품 찾기 (아래 참고)
  3. 타이틀 + 상품 여러개 이용해 기획전 등록
- 상품기획전 수정
  <br>수정 가능한 속성들:
  - 타이틀
  - 상품 목록
- 상품기획전 삭제
  <br>현재 노출 중인 기획전도 삭제 가능노출상태 변경하기
- 노출상태 `OFF` 인 상품기획전에 Slot을 할당한다.
- Slot이 할당된 상품기획전을 `OFF`로 변경한다

### 테마기획전 Use Cases

- 모든 테마기획전을 조회한다 (id, 순서, 타이틀, 생성일, 홈 노출 여부, 기획전 노출 여부, 해당 기획전 url 경로 정보). 정렬해서 돌려준다.
- 테마기획전 등록
  1. 타이틀 등록 (기획상 최대 30자)
  2. 설명 등록 (기획상 최대 100자)
  3. 노출 기간 등록
  - 수동설정(기본값)
  - 자동설정
    <br>시작 시간과 종료 시간 설정. 시간은 `YYYY-MM-DD HH:MM`
  4. 배너 이미지 등록 (PC와 모바일)
  5. 상품 찾기
  6. 타이틀, 설명, 노출 기간, 배너 이미지, 상품 ID 목록 전달받아 테마기획전 등록
     새로운 기획전 등록하면 우선순위가 1번이 된다 (이 부분은 보류사항).
- 테마기획전 수정
  <br>수정 가능한 속성들:
  - 타이틀
  - 설명
  - 노출기간 (유형 및 기간)
  - 배너 이미지
  - 상품 목록
- 테마기획전 삭제
- 순서 변경하기
  - 일괄적으로 기획전 순서 변경하기

### 상품 검색하기

검색한 상품들의 id, 타이틀, 상품 상태 가져오기

- 타이틀 또는 id로 검색
- 날짜, 조건에 따른 상위 프립 300개 조회
- 날짜: 오늘로부터 1, 3, 7, 14, 30일 이전
- 조건: 후기 (개수), 저장 (횟수), 판매 (횟수), 조회 (횟수)

### 집계

일일 조건별 상품 데이터를 주기적으로 누적

- 후기 수, 저장 수, 판매 수, 조회 수 결과 누적

# ERD

<img width="820" alt="스크린샷 2021-03-12 오후 7 04 04" src="https://user-images.githubusercontent.com/54763136/110924880-e4e3c500-8365-11eb-8568-ee253280ea2f.png">

# Installation

```
npm i
```

# Running the app

```bash
 # development
 $ npm run dev
```

# Test

테스트를 위해 MySQL이 로컬환경에 설치되어 있어야 한다.

```bash
 $ npm test
```

## Event

### 기획전 슬롯 생성 (CollectionSlotCreated), 슬롯 수정(CollectionSlotUpdated)

#### 발송조건

- 기획전 슬롯 생성 직후, 수정 직후

#### Payload

| Fields                   | Type                              |
| ------------------------ | --------------------------------- |
| id                       | string                            |
| description              | string                            |
| maximumCountOfCollection | string                            |
| collectionType           | [CollectionType](#collectiontype) |
| conditions               | [Condition](#condition)           |
| createdAt                | Date                              |
| updatedAt                | Date                              |

---

### 기획전 슬롯 삭제 (CollectionSlotDeleted)

#### 발송조건

- 기획전 슬롯 삭제 직후

#### Payload

| Fields | Type   |
| ------ | ------ |
| id     | string |

---

### 기획전 생성 (CollectionCreated), 수정(CollectionUpdated)

#### 발송조건

- 기획전 생성 직후, 수정 직후

#### Payload

| Fields          | Type                                              |
| --------------- | ------------------------------------------------- |
| id              | number                                            |
| slotId          | string                                            |
| title           | string                                            |
| description     | string                                            |
| homeShowStartAt | Date                                              |
| homeShowEndAt   | Date                                              |
| listShowStartAt | Date                                              |
| listShowEndAt   | Date                                              |
| imageContents   | [CollectionImageContent](#collectionImageContent) |
| createdAt       | Date                                              |
| updatedAt       | Date                                              |

---

### 기획전 삭제 (CollectionDeleted)

#### 발송조건

- 기획전 삭제 직후

#### Payload

| Fields | Type   |
| ------ | ------ |
| id     | number |

---

### 기획전 정렬 변경 (CollectionSortUpdated)

#### 발송조건

- 기획전 순서 변경 직후

#### Payload

| Fields        | Type                            |
| ------------- | ------------------------------- |
| sortOrderInfo | [SortOrderInfo](#sortorderinfo) |

---

### 기획전 상태 변경 (CollectionVisibleUpdated)

#### 발송조건

- 기획전 상태 변경 직후

#### Payload

| Fields        | Type                                                        |
| ------------- | ----------------------------------------------------------- |
| slotId        | string                                                      |
| visibleStates | [CollectionVisibleStateParam](#collectionvisiblestateparam) |

---

### CollectionType

| Enum    |
| ------- |
| THEME   |
| PRODUCT |

---

### Condition

| Fields       | Type                              |
| ------------ | --------------------------------- |
| maxImageSize | number                            |
| imageWidth   | number                            |
| imageHeight  | number                            |
| platform     | [ClientPlatform](#clientplatform) |

---

### CollectionImageContent

| Fields      | Type                              |
| ----------- | --------------------------------- |
| id          | string                            |
| url         | string                            |
| width       | number                            |
| height      | number                            |
| platform    | [ClientPlatform](#clientplatform) |
| conditionId | number                            |

---

### SortOrderInfo

| Fields   | Type   |
| -------- | ------ |
| id       | string |
| newSeqNo | number |

---

### CollectionVisibleStateParam

| Fields  | Type    |
| ------- | ------- |
| id      | string  |
| home    | boolean |
| listing | boolean |

---

### ClientPlatform

| Enum       |
| ---------- |
| Web        |
| Mobile     |
| iOSApp     |
| AndroidApp |

---
