import { createApp } from "vue";
import { createPinia } from "pinia";
import { createAuth0 } from "@auth0/auth0-vue";
import App from "./App.vue";
import router from "./router";
import "./style.css";

const app = createApp(App);

app.use(createPinia());
app.use(router);

app.use(
  createAuth0({
    domain: "dev-bko6t72qud7vo3ue.us.auth0.com",
    clientId: "b34ts9z92e03A9vEGnvJJrm50AdQemip",
    authorizationParams: {
      redirect_uri: window.location.origin,
      audience: "https://api.cybertwin.pme",
    },
  }),
);

app.mount("#app");
