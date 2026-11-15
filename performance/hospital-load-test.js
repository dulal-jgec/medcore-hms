import http from "k6/http";
import { check, sleep } from "k6";

export const options = {
  vus: 10,
  duration: "30s",
};

export default function () {
  const token = __ENV.SUPER_ADMIN_TOKEN;

  const url = "http://localhost/api/v1/super-admin/admins?page=0&size=10";

  const params = {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    },
  };

  const response = http.get(url, params);

   
  check(response, {
    "Status is 200": (r) => r.status === 200,
    "Response time below 1000ms": (r) => r.timings.duration < 1000,
  });

  sleep(1);
}
