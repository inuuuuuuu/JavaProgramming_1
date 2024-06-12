const check_xss = (input) => {
    // DOMPurify 라이브러리 로드 (CDN 사용)
    const DOMPurify = window.DOMPurify;
    // 입력 값을 DOMPurify로 sanitize
    const sanitizedInput = DOMPurify.sanitize(input);
    // Sanitized된 값과 원본 입력 값 비교
    if (sanitizedInput !== input) {
        // XSS 공격 가능성 발견 시 에러 처리
        alert('XSS 공격 가능성이 있는 입력값을 발견했습니다.');
        return false;
    }
    // Sanitized된 값 반환
    return sanitizedInput;
};
function addJavascript(jsname) { // 자바스크립트 외부 연동
    var th = document.getElementsByTagName('head')[0];
    var s = document.createElement('script');
    s.setAttribute('type','text/javascript');
    s.setAttribute('src',jsname);
    th.appendChild(s);
}
addJavascript('/js/security.js'); // 암복호화 함수
addJavascript('/js/session.js'); // 세션 함수
addJavascript('/js/cookie.js'); // 쿠키 함수
addJavascript('/js/logout_timer.js'); // 로그아웃 타이머 함수

const setCookie = (name, value, expiredays) => {
    var date = new Date();
    date.setDate(date.getDate() + expiredays);
    document.cookie = escape(name) + "=" + escape(value) + "; expires=" + date.toUTCString() + "; path=/" + ";SameSite=None; Secure";
}

const getCookie = (name) => {
    var cookie = document.cookie;
    console.log("쿠키를 요청합니다.");
    if (cookie != "") {
        var cookie_array = cookie.split("; ");
        for (var index in cookie_array) {
            var cookie_name = cookie_array[index].split("=");
            if (cookie_name[0] == name) {
                return cookie_name[1];
            }
        }
    }
    return null;
}



const login_failed = () => {
    let failCount = parseInt(getCookie("login_fail_count")) || 0;
    failCount += 1;
    setCookie("login_fail_count", failCount, 1);

    if (failCount >= 3) {
        alert(`로그인 실패 횟수: ${failCount}회. 로그인이 제한됩니다.`);
        setCookie("login_blocked", "true", 1);
    } else {
        alert(`로그인 실패 횟수: ${failCount}회.`);
    }
}

const check_input = () => {
    const idsave_check = document.getElementById('idSaveCheck');
    const loginForm = document.getElementById('login_form');
    const emailInput = document.getElementById('typeEmailX');
    const passwordInput = document.getElementById('typePasswordX');
    const c = '아이디, 패스워드를 체크합니다';
    alert(c);
    const emailValue = emailInput.value.trim();
    const passwordValue = passwordInput.value.trim();

    if (getCookie("login_blocked") === "true") {
        alert("로그인이 제한되었습니다. 관리자에게 문의하세요.");
        return false;
    }

    if (emailValue === '') {
        alert('이메일을 입력하세요.');
        login_failed();
        return false;
    }
    if (passwordValue === '') {
        alert('비밀번호를 입력하세요.');
        login_failed();
        return false;
    }

    // 길이 제한 검사
    if (emailValue.length > 10) {
        alert('이메일은 10글자 이하로 입력해야 합니다.');
        login_failed();
        return false;
    }
    if (passwordValue.length > 15) {
        alert('패스워드는 15글자 이하로 입력해야 합니다.');
        login_failed();
        return false;
    }

    // 반복된 문자 검사 (3글자 이상 반복 금지)
    const repeatedCharPattern = /(.)\1{2,}/;
    if (repeatedCharPattern.test(emailValue) || repeatedCharPattern.test(passwordValue)) {
        alert('반복된 문자가 3글자 이상 포함되어 있습니다.');
        login_failed();
        return false;
    }

    // 연속된 숫자 2개 이상 반복 검사
    const repeatedNumberPattern = /(\d)\1/;
    if (repeatedNumberPattern.test(emailValue) || repeatedNumberPattern.test(passwordValue)) {
        alert('연속된 숫자가 2개 이상 포함되어 있습니다.');
        login_failed();
        return false;
    }

    const sanitizedPassword = check_xss(passwordValue);
    const sanitizedEmail = check_xss(emailValue);

    if (!sanitizedEmail) {
        login_failed();
        return false;
    }

    if (!sanitizedPassword) {
        login_failed();
        return false;
    }

    if (emailValue.length < 5) {
        alert('아이디는 최소 5글자 이상 입력해야 합니다.');
        login_failed();
        return false;
    }
    if (passwordValue.length < 12) {
        alert('비밀번호는 반드시 12글자 이상 입력해야 합니다.');
        login_failed();
        return false;
    }
    const hasSpecialChar = passwordValue.match(/[!,@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/) !== null;
    if (!hasSpecialChar) {
        alert('패스워드는 특수문자를 1개 이상 포함해야 합니다.');
        login_failed();
        return false;
    }
    const hasUpperCase = passwordValue.match(/[A-Z]+/) !== null;
    const hasLowerCase = passwordValue.match(/[a-z]+/) !== null;
    if (!hasUpperCase || !hasLowerCase) {
        alert('패스워드는 대소문자를 1개 이상 포함해야 합니다.');
        login_failed();
        return false;
    }

  // 쿠키 저장
    if (idsave_check.checked == true) { // 아이디 체크 o
        alert("쿠키를 저장합니다.", emailValue);
        setCookie("id", emailValue, 1); // 1일 저장
        alert("쿠키 값 :" + emailValue);
    } else { // 아이디 체크 x
        setCookie("id", emailValue.value, 0); //날짜를 0 - 쿠키 삭제
    }

    console.log('이메일:', emailValue);
    console.log('비밀번호:', passwordValue);
    session_set(); // 세션 생성
    loginForm.submit(); // 해당 폼을 submit하다


// 로그인 후 5분 타이머 시작
    setTimeout(() => {
        alert('로그인 시간이 만료되었습니다. 자동으로 로그아웃됩니다.');
        logout();
    }, 1 * 60 * 1000); // 5분 후 로그아웃
};

const session_set = () => { //세션 저장
    let session_id = document.querySelector("#typeEmailX"); // DOM 트리에서 ID검색
    let session_pass = document.querySelector("#typePasswordX"); // DOM 트리에서 pass 검색
    if (sessionStorage) {
        let en_text = encrypt_text(session_pass.value);
        sessionStorage.setItem("Session_Storage_test", session_id.value);
        sessionStorage.setItem("Session_Storage_pass", en_text);
        
    } else {
        alert("로컬 스토리지 지원 x");
    }
}

/*function session_set(){ //세션 저장(객체)
    let id = document.querySelector("#floatingInput");
    let password = document.querySelector("#floatingPassword");
    let random = new Date(); // 랜덤 타임스탬프
     
    const obj = { // 객체 선언
    id : id.value,
    otp : random
    }
    if (sessionStorage) {
        const objString = JSON.stringify(obj); // 객체 -> JSON 문자열변환
        let en_text = encrypt_text(objString); // 암호화
        sessionStorage.setItem("Session_Storage_object", objString);
        sessionStorage.setItem("Session_Storage_encrypted", en_text);
    } else {
        alert("세션 스토리지 지원 x");
    }
}*/

const session_get = () => { //세션 읽기
    if (sessionStorage) {
        return sessionStorage.getItem("Session_Storage_encrypted");
    } else {
        alert("세션 스토리지 지원 x");
    }
}

const session_check = () => { //세션 검사
    if (sessionStorage.getItem("Session_Storage_id")) {
        alert("이미 로그인 되었습니다.");
        location.href='../login/index_login.html'; // 로그인된 페이지로 이동
    }
}


const session_del = () => { // 세션 삭제
    if (sessionStorage) {
        sessionStorage.removeItem("Session_Storage_test");
        sessionStorage.removeItem("Session_Storage_pass");
        sessionStorage.removeItem("Session_Storage_time");
        alert('로그아웃 버튼 클릭 확인 : 세션 스토리지를 삭제합니다.');
    } else {
        alert("세션 스토리지 지원 x");
    }

    // 쿠키도 삭제
    document.cookie = "id=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; SameSite=None; Secure";
    document.cookie = "login_fail_count=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; SameSite=None; Secure";
    document.cookie = "login_blocked=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; SameSite=None; Secure";

    // 메인 페이지로 이동
    location.href = '../index.html';
}


const init = () => { // 로그인 폼에 쿠키에서 가져온 아이디 입력
    const emailInput = document.getElementById('typeEmailX');
    const idsave_check = document.getElementById('idSaveCheck');
    let get_id = getCookie("id");

    if (get_id) {
        emailInput.value = get_id;
        idsave_check.checked = true;
    }
    session_check(); // 세션 유무 검사
}

function init_logined(){
    if(sessionStorage){
       decrypt_text(); // 복호화 함수
    }
    else{
      alert("세션 스토리지 지원 x");
       }
}

function logout(){
    session_del(); //세션삭제
    location.herf='../index.html'
}

//암/복호화 함수 원형을 추가
function encodeByAES256(key, data){
    const cipher = CryptoJS.AES.encrypt(data, CryptoJS.enc.Utf8.parse(key), {
        iv: CryptoJS.enc.Utf8.parse(""),
        padding: CryptoJS.pad.Pkcs7,
        mode: CryptoJS.mode.CBC
    });
    return cipher.toString();
}

function decodeByAES256(key, data){
    const cipher = CryptoJS.AES.decrypt(data, CryptoJS.enc.Utf8.parse(key), {
        iv: CryptoJS.enc.Utf8.parse(""),
        padding: CryptoJS.pad.Pkcs7,
        mode: CryptoJS.mode.CBC
    });
    return cipher.toString(CryptoJS.enc.Utf8);
}

// 패스워드 보안 처리 부분을 추가
function encrypt_text(password){
    const k = "key"; // 클라이언트 키
    const rk = k.padEnd(32, " "); // AES256은 key 길이가 32
    const b = password;
    const eb = this.encodeByAES256(rk, b);
    return eb;
    console.log(eb);
}

function decrypt_text(){
    const k = "key"; // 서버의 키
    const rk = k.padEnd(32, " "); // AES256은 key 길이가 32
    const eb = session_get();
    const b = this.decodeByAES256(rk, eb);
    console.log(b);
}



    
    
document.getElementById("login_btn").addEventListener('click', check_input);
document.getElementById("logout_btn").addEventListener('click', session_del); // 로그아웃 버튼 클릭 시 세션 삭제
document.addEventListener('DOMContentLoaded', init);
