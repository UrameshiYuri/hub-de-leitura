import http from "k6/http";
import { check, sleep } from "k6";

const BASE_URL = __ENV.BASE_URL || "http://localhost:3000";

export const options = {
    scenarios: {
        consulta_catalogo: {
            executor: "ramping-vus",
            startVUs: 0,
            stages: [
                { duration: "20s", target: 20 },
                { duration: "100s", target: 20 }
            ],
            gracefulStop: "5s"
        }
    },

    thresholds: {
        http_req_failed: ["rate<0.01"],
        http_req_duration: ["p(95)<500"],
        checks: ["rate==1"]
    }
};

export default function () {
    const resposta = http.get(
        `${BASE_URL}/api/books?page=1&limit=12`,
        {
            tags: { name: "GET /api/books" },
            timeout: "5s"
        }
    );

    let dados = null;

    try {
        dados = resposta.json();
    } catch {
        // A verificação abaixo registrará a resposta inválida.
    }

    check(resposta, {
        "retorna status 200": (r) => r.status === 200,
        "retorna lista de livros": () =>
            Array.isArray(dados?.books),
        "retorna pelo menos um livro": () =>
            Array.isArray(dados?.books) && dados.books.length > 0
    });

    sleep(1);
}