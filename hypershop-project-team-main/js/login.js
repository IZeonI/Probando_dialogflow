const signIn = document.getElementById("signIn");
const signUp = document.getElementById("signUp");
const container = document.getElementById("container");

signIn.addEventListener("click", () => {
  container.classList.toggle("right-panel-active");
});

signUp.addEventListener("click", () => {
  container.classList.toggle("right-panel-active");
});
