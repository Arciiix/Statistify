async function checkForLoginValidity(): Promise<any> {
  let userAuthRequest = await fetch("/api/getUserData");
  let userAuthResponse = await userAuthRequest.json();

  if (userAuthResponse.error) {
    window.location.href = "/";
  } else {
    return userAuthResponse;
  }
}

export { checkForLoginValidity };
