fetch("http://localhost:8080/hello_world?search=ai", {
  headers: {
    "authorization": "Bearer",
    "cookie": "mode=light"
  },
  body: JSON.stringify({
    "id": "id"
  })
});