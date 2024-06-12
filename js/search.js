//document.getElementById("search_btn").addEventListener('click', search_message);

//function search_button_msg(){
    //alert("검색을 수행합니다!");
   // }

   const search_message = () => {
    const c = '검색을 수행합니다';
    alert(c);
    };

    document.getElementById("search_btn").addEventListener('click', search_message);

    function googleSearch() {
        const searchTerm = document.getElementById("search_input").value.trim(); // 검색어로 설정하고 양 끝 공백 제거
        if (searchTerm === "") { // 검색어가 공백인 경우
            alert("텍스트를 입력해 주세요.");
            return false;
        } else if (/(바보|멍청이|머저리|개XX|18)/.test(searchTerm)) { // 비속어가 입력된 경우
            alert("검색할 수 없는 단어입니다.");
            return false;
        } else {
            const googleSearchUrl = `https://www.google.com/search?q=${encodeURIComponent(searchTerm)}`;
            // 새 창에서 구글 검색을 수행
            window.open(googleSearchUrl, "_blank"); // 새로운 창에서 열기.
            return false;
        }
    }