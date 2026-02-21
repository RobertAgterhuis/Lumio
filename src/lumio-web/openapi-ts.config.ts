import { defineConfig } from "@hey-api/openapi-ts";

export default defineConfig({
  client: "@hey-api/client-fetch",
  input: "http://127.0.0.1:5123/swagger/v1/swagger.json",
  output: {
    path: "src/lib/api",
    format: "prettier",
  },
});
