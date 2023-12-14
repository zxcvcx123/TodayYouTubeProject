import React from 'react';
import {Image} from "@chakra-ui/react";

function KakaoLogin() {
  const REST_API_KEY = process.env.REACT_APP_REST_API_KEY;
  const REDIRECT_URI = 'http://localhost:3000/member/login';

  const KAKAO_AUTH_URI = `https://kauth.kakao.com/oauth/authorize?client_id=${REST_API_KEY}&redirect_uri=${REDIRECT_URI}&response_type=code`;

  function handleLoginClick() {
    window.location.href = KAKAO_AUTH_URI;
  }

  return (
    <button onClick={handleLoginClick}>
      <Image src="/img/kakao_login_medium_wide.png" />
    </button>
  );
}

export default KakaoLogin;