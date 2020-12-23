function keySuffix() {
  var urlParams = new URLSearchParams(window.location.search);
  var entries = urlParams.entries();
  for (pair of entries) {
    if (pair[0] == "key") {
      return pair[1];
    }
  }
  console.log("Missing key");
  return "";
}
