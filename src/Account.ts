async function checkForLoginValidity(): Promise<void> {
  let userAuthRequest = await fetch("/api/getUserData");
  let userAuthResponse = await userAuthRequest.json();

  if (userAuthResponse.error) {
    if (userAuthResponse.errorMessage == "INVALID_TOKEN") {
      window.location.href = "/";
    }
  }
}

export { checkForLoginValidity };
