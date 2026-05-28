# 🌤️ SkyPulse - 실시간 날씨 & 라이프 대시보드

SkyPulse는 실시간 기상 상태와 대기질 지수(AQI)를 기반으로 사용자의 하루에 필요한 핵심 생활 지수와 맞춤형 안내 브리핑을 제공하는 프리미엄 날씨 대시보드 웹 애플리케이션입니다.

API 키 등록이 전혀 필요 없는 **Open-Meteo API**를 활용하며, 시각적으로 매력적이고 세련된 **글래스모피즘(Glassmorphism) UI**로 제작되었습니다.

---

## 🌟 주요 기능

1. **실시간 기상 데이터 분석**
   - 현재 기온 및 최고/최저 기온, 체감 온도, 습도, 풍속/풍향, 자외선(UV) 지수 등을 실시간으로 표시합니다.
2. **대기질 지수 (AQI) 및 미세먼지 측정**
   - 유럽 표준 AQI 모델을 토대로 미세먼지(PM10) 및 초미세먼지(PM2.5) 농도를 직관적인 뱃지 컬러로 시각화합니다.
3. **맞춤형 기상 비서 'SkyPulse 브리핑'**
   - 기온, 강수 예보, 미세먼지, 자외선 정보를 조합해 "우산을 챙기세요", "반팔 차림이 좋습니다", "황사 마스크를 쓰세요"와 같은 맞춤형 조언 문구를 생성합니다.
4. **날씨 연동 생활 지수**
   - 기상 정보를 수학적으로 연산하여 실외 활동, 빨래 건조, 세차 지수(100점 만점) 및 가이드를 도출합니다.
5. **시간대별(24H) 및 주간(7일) 예보**
   - 24시간 동안의 기온 흐름과 강수 확률, 향후 일주일간의 날씨 예보와 최고/최저 기온 상대 비교 그래프를 제공합니다.
6. **일출 & 일몰 궤적 추적**
   - 현재 시간 기준의 낮 길이를 표시하고, 태양의 궤적을 둥근 아크(호) 라인 위에 해 아이콘으로 실시간 위치 매핑합니다.
7. **도시 검색 및 즐겨찾기**
   - 디바운스(Debounce) 처리가 적용된 전 세계 도시 검색(자동 완성)과 LocalStorage 기반의 즐겨찾는 도시 간 퀵 전환을 제공합니다.
8. **단위 즉시 토글**
   - 화씨(°F)와 섭씨(°C) 단위를 원클릭으로 변경할 수 있으며, 환산된 온도가 즉각 렌더링됩니다.
9. **기상 상황 대응 동적 테마**
   - 날씨(맑음, 밤, 흐림, 비, 안개, 눈, 뇌우 등) 상태에 맞춰 배경 그래픽 및 그라디언트 톤이 유동적으로 변화합니다.

---

## 🛠️ 사용된 기술 (Tech Stack)

- **Markup:** HTML5 (Semantic Structure)
- **Styling:** Vanilla CSS (Glassmorphism, Custom Properties, Keyframe Animations, Responsive Design)
- **Logic:** Vanilla JavaScript (ES6+, Fetch API, HTML5 Geolocation API, LocalStorage)
- **Icons:** Lucide Icons (CDN 연동)
- **APIs:** 
  - [Open-Meteo Forecast API](https://open-meteo.com/) (기상 예보)
  - [Open-Meteo Geocoding API](https://open-meteo.com/en/docs/geocoding-api) (도시 검색)
  - [Open-Meteo Air Quality API](https://open-meteo.com/en/docs/air-quality-api) (대기질)
  - [BigDataCloud Reverse Geocoding API](https://www.bigdatacloud.com/) (좌표 주소 변환)

---

## 🚀 배포 방법 (GitHub Pages - 비개발자용)

본 웹사이트는 별도의 빌드 과정이 없는 정적 페이지이므로, 브라우저 화면에서 바로 업로드해 배포할 수 있습니다.

1. **GitHub 저장소 생성**: 
   - GitHub 가입 후 새 저장소(New Repository)를 만들 때 **`Add a README file`**에 반드시 체크하여 생성합니다.
2. **파일 드래그 업로드**:
   - 저장소 화면의 **`Add file` -> `Upload files`**를 누르고, 이 폴더의 `index.html`, `style.css`, `app.js` 파일을 드래그 앤 드롭해 집어넣은 뒤 **`Commit changes`** 버튼을 누릅니다.
3. **Pages 배포 활성화**:
   - 저장소 상단 **`Settings` -> `Pages`**로 들어가 **Branch** 설정을 `main` 브랜치로 선택하고 **`Save`**를 누릅니다.
   - 1~2분 뒤 부여되는 `https://<내-아이디>.github.io/<저장소-이름>/` 주소로 전 세계 어디서든 접속이 가능합니다!
