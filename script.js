// API 설정
const API_KEY = '282c50704028fd0f2ccaf06f516e389d';
const API_BASE_URL = 'https://api.openweathermap.org/data/2.5';

// 기상청 API 설정
const KMA_API_KEY = 'UfNtu%2F1gn10hWYfQXFmZE0dgl5%2FtYdO7cX7UcSYS1R4cvkzpn1pog2%2FaTXQO394gENEP0ndfZxgttP%2FyKTy3Rg%3D%3D';
const KMA_BASE_URL = 'https://apis.data.go.kr/1360000/VilageFcstInfoService_2.0/getVilageFcst';

// 한국 주요 도시의 격자 좌표
const KOREAN_CITIES = {
    '서울': { nx: 60, ny: 127, region: '서울특별시' },
    'seoul': { nx: 60, ny: 127, region: '서울특별시' },
    '인천': { nx: 55, ny: 124, region: '인천광역시' },
    'incheon': { nx: 55, ny: 124, region: '인천광역시' },
    '부산': { nx: 98, ny: 76, region: '부산광역시' },
    'busan': { nx: 98, ny: 76, region: '부산광역시' },
    '대구': { nx: 89, ny: 90, region: '대구광역시' },
    'daegu': { nx: 89, ny: 90, region: '대구광역시' },
    '대전': { nx: 67, ny: 100, region: '대전광역시' },
    'daejeon': { nx: 67, ny: 100, region: '대전광역시' },
    '광주': { nx: 58, ny: 74, region: '광주광역시' },
    'gwangju': { nx: 58, ny: 74, region: '광주광역시' },
    '울산': { nx: 102, ny: 84, region: '울산광역시' },
    'ulsan': { nx: 102, ny: 84, region: '울산광역시' },
    '수원': { nx: 60, ny: 121, region: '경기도 수원시' },
    'suwon': { nx: 60, ny: 121, region: '경기도 수원시' },
    '제주': { nx: 52, ny: 38, region: '제주특별자치도' },
    'jeju': { nx: 52, ny: 38, region: '제주특별자치도' },
    '춘천': { nx: 73, ny: 134, region: '강원도 춘천시' },
    'chuncheon': { nx: 73, ny: 134, region: '강원도 춘천시' }
};

// 기상청 날씨 코드 변환
const KMA_WEATHER_CODES = {
    '0': '맑음',
    '1': '비',
    '2': '비/눈',
    '3': '눈',
    '4': '소나기'
};

const KMA_SKY_CODES = {
    '1': '맑음',
    '3': '구름많음',
    '4': '흐림'
};

// DOM 요소
const cityInput = document.getElementById('cityInput');
const searchBtn = document.getElementById('searchBtn');
const locationBtn = document.getElementById('locationBtn');
const loading = document.getElementById('loading');
const weatherCard = document.getElementById('weatherCard');
const errorMessage = document.getElementById('errorMessage');
const errorText = document.getElementById('errorText');

// 날씨 정보 요소
const cityName = document.getElementById('cityName');
const temp = document.getElementById('temp');
const description = document.getElementById('description');
const feelsLike = document.getElementById('feelsLike');
const humidity = document.getElementById('humidity');

// 온도 단위 전환 버튼 제거됨

// 현재 날씨 데이터
let currentWeatherData = null;
let isCelsius = true;

// 날짜/시간 요소
const currentDate = document.getElementById('currentDate');
const currentTime = document.getElementById('currentTime');

// 이벤트 리스너
searchBtn.addEventListener('click', handleSearch);
locationBtn.addEventListener('click', getCurrentLocationWeather);
cityInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        handleSearch();
    }
});
// 온도 단위 전환 이벤트 리스너 제거됨

// 한국 도시 확인 함수
function isKoreanCity(cityName) {
    const city = cityName.toLowerCase().trim();
    return KOREAN_CITIES.hasOwnProperty(city) || KOREAN_CITIES.hasOwnProperty(cityName);
}

// 검색 처리
function handleSearch() {
    const city = cityInput.value.trim();
    if (city) {
        if (isKoreanCity(city)) {
            // 한국 도시는 한글명 그대로 검색
            getKoreanWeatherByKoreanName(city);
        } else {
            getWeatherByCity(city);
        }
    }
}

// 도시명으로 날씨 조회
async function getWeatherByCity(city) {
    showLoading();
    try {
        const url = `${API_BASE_URL}/weather?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=metric&lang=kr`;
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error(response.status === 404 ? '도시를 찾을 수 없습니다.' : '날씨 정보를 가져올 수 없습니다.');
        }
        
        const data = await response.json();
        currentWeatherData = data;
        displayWeather(data);
    } catch (error) {
        showError(error.message);
    }
}

// 현재 위치의 날씨 조회
function getCurrentLocationWeather() {
    if (!navigator.geolocation) {
        showError('위치 서비스가 지원되지 않습니다.');
        return;
    }
    
    showLoading();
    navigator.geolocation.getCurrentPosition(
        async (position) => {
            try {
                const { latitude, longitude } = position.coords;
                const url = `${API_BASE_URL}/weather?lat=${latitude}&lon=${longitude}&appid=${API_KEY}&units=metric&lang=kr`;
                const response = await fetch(url);
                
                if (!response.ok) {
                    throw new Error('현재 위치의 날씨 정보를 가져올 수 없습니다.');
                }
                
                const data = await response.json();
                currentWeatherData = data;
                displayWeather(data);
            } catch (error) {
                showError(error.message);
            }
        },
        () => {
            showError('위치 권한이 거부되었습니다.');
        }
    );
}

// 날씨 정보 표시
function displayWeather(data) {
    hideLoading();
    hideError();
    
    // 기본 정보
    cityName.textContent = data.name;
    
    // 온도 (항상 섭씨로 표시)
    temp.textContent = `${Math.round(data.main.temp)}°C`;
    
    // 날씨 설명
    description.textContent = data.weather[0].description;
    feelsLike.textContent = `체감온도 ${Math.round(data.main.feels_like)}°C`;
    
    // 세부 정보
    humidity.textContent = `습도 ${data.main.humidity}%`;
    
    // 날씨 카드 표시
    weatherCard.style.display = 'block';
    
    // 입력창 초기화
    cityInput.value = '';
}

// 한국 도시명을 영문으로 변환하는 매핑
const KOREAN_TO_ENGLISH = {
    '서울': 'Seoul',
    '인천': 'Incheon', 
    '부산': 'Busan',
    '대구': 'Daegu',
    '대전': 'Daejeon',
    '광주': 'Gwangju',
    '울산': 'Ulsan',
    '수원': 'Suwon',
    '제주': 'Jeju',
    '춘천': 'Chuncheon'
};

// 한국 도시 한글명으로 날씨 조회
async function getKoreanWeatherByKoreanName(koreanCityName) {
    showLoading();
    console.log('한국 도시 한글 검색:', koreanCityName);
    
    try {
        const cityKey = koreanCityName.trim();
        const cityData = KOREAN_CITIES[cityKey];
        const englishName = KOREAN_TO_ENGLISH[cityKey];
        
        if (!cityData || !englishName) {
            throw new Error('지원하지 않는 한국 도시입니다.');
        }
        
        // 영문명으로 OpenWeatherMap API 호출
        const url = `${API_BASE_URL}/weather?q=${encodeURIComponent(englishName)}&appid=${API_KEY}&units=metric&lang=kr`;
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error(response.status === 404 ? '도시를 찾을 수 없습니다.' : '날씨 정보를 가져올 수 없습니다.');
        }
        
        const data = await response.json();
        currentWeatherData = data;
        
        // 한국 도시임을 표시하며 데이터 출력 (한글명으로 표시)
        displayKoreanWeatherWithKoreanName(data, cityData, koreanCityName);
        
    } catch (error) {
        console.error('한국 날씨 조회 오류:', error);
        showError(error.message);
    }
}

// 기존 영문 한국 도시 검색 (하위 호환성)
async function getKoreanWeather(cityName) {
    showLoading();
    console.log('한국 도시 감지:', cityName);
    
    try {
        const city = cityName.toLowerCase().trim();
        const cityData = KOREAN_CITIES[city] || KOREAN_CITIES[cityName];
        
        if (!cityData) {
            throw new Error('지원하지 않는 한국 도시입니다.');
        }
        
        const url = `${API_BASE_URL}/weather?q=${encodeURIComponent(cityName)}&appid=${API_KEY}&units=metric&lang=kr`;
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error(response.status === 404 ? '도시를 찾을 수 없습니다.' : '날씨 정보를 가져올 수 없습니다.');
        }
        
        const data = await response.json();
        currentWeatherData = data;
        
        displayKoreanWeather(data, cityData);
        
    } catch (error) {
        console.error('한국 날씨 조회 오류:', error);
        showError(error.message);
    }
}

// 기상청 데이터 파싱 함수 제거됨 (OpenWeatherMap 사용)

// 한국 도시 날씨 정보 표시 (한글명으로)
function displayKoreanWeatherWithKoreanName(data, cityData, koreanName) {
    hideLoading();
    hideError();
    
    // 기본 정보 (한글 도시명 표시)
    cityName.textContent = `${koreanName} (🇰🇷)`;
    
    // 온도 (OpenWeatherMap 데이터 형식)
    temp.textContent = `${Math.round(data.main.temp)}°C`;
    
    // 날씨 설명
    description.textContent = data.weather[0].description;
    feelsLike.textContent = `체감온도 ${Math.round(data.main.feels_like)}°C`;
    
    // 습도
    humidity.textContent = `습도 ${data.main.humidity}%`;
    
    // 날씨 카드 표시
    weatherCard.style.display = 'block';
    
    // 입력창 초기화
    cityInput.value = '';
}

// 한국 도시 날씨 정보 표시 (영문명용)
function displayKoreanWeather(data, cityData) {
    hideLoading();
    hideError();
    
    // 기본 정보 (한국 도시 표시)
    cityName.textContent = `${cityData.region} (🇰🇷 한국 기준)`;
    
    // 온도 (OpenWeatherMap 데이터 형식)
    temp.textContent = `${Math.round(data.main.temp)}°C`;
    
    // 날씨 설명
    description.textContent = data.weather[0].description;
    feelsLike.textContent = `체감온도 ${Math.round(data.main.feels_like)}°C`;
    
    // 습도
    humidity.textContent = `습도 ${data.main.humidity}%`;
    
    // 날씨 카드 표시
    weatherCard.style.display = 'block';
    
    // 입력창 초기화
    cityInput.value = '';
}

// 온도 단위 전환 기능 제거됨 - 항상 섭씨로 표시

// 시간 포맷팅 (Unix timestamp를 시:분 형식으로)
function formatTime(timestamp) {
    const date = new Date(timestamp * 1000);
    return date.toLocaleTimeString('ko-KR', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
    });
}

// 로딩 표시
function showLoading() {
    loading.style.display = 'block';
    weatherCard.style.display = 'none';
    errorMessage.style.display = 'none';
}

// 로딩 숨기기
function hideLoading() {
    loading.style.display = 'none';
}

// 에러 표시
function showError(message) {
    hideLoading();
    weatherCard.style.display = 'none';
    errorText.textContent = message;
    errorMessage.style.display = 'block';
}

// 에러 숨기기
function hideError() {
    errorMessage.style.display = 'none';
}

// 현재 날짜와 시간 업데이트
function updateDateTime() {
    const now = new Date();
    
    // 날짜 포맷팅
    const dateOptions = {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        weekday: 'long'
    };
    const dateString = now.toLocaleDateString('ko-KR', dateOptions);
    currentDate.textContent = dateString;
    
    // 시간 포맷팅
    const timeOptions = {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
    };
    const timeString = now.toLocaleTimeString('ko-KR', timeOptions);
    currentTime.textContent = timeString;
}

// 페이지 로드 시 인천 날씨 기본 표시 및 시간 업데이트 시작
window.addEventListener('load', () => {
    getWeatherByCity('Incheon'); // Incheon으로 기본 표시
    updateDateTime(); // 즉시 시간 표시
    setInterval(updateDateTime, 1000); // 매초마다 시간 업데이트
});

// 키보드 접근성 개선
cityInput.addEventListener('focus', () => {
    cityInput.style.transform = 'scale(1.02)';
});

cityInput.addEventListener('blur', () => {
    cityInput.style.transform = 'scale(1)';
});

// 날씨 카드 애니메이션
function animateWeatherCard() {
    weatherCard.style.animation = 'none';
    weatherCard.offsetHeight; // 리플로우 강제
    weatherCard.style.animation = 'slideIn 0.8s ease-out';
}

// 더 나은 에러 처리
window.addEventListener('error', (e) => {
    console.error('앱 에러:', e.error);
});

// 네트워크 상태 확인
window.addEventListener('online', () => {
    console.log('인터넷 연결이 복구되었습니다.');
});

window.addEventListener('offline', () => {
    showError('인터넷 연결을 확인해주세요.');
}); 