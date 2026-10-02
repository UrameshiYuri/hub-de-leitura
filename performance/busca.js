import http from "k6/http";
import { check, sleep } from "k6";

const BASE_URL = __ENV.BASE_URL || "http://localhost:3000";
const TITULO = "O Pequeno Príncipe";

export const options = {
    scenarios: {
        busca_livro: {
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
        `${BASE_URL}/api/books?page=1&limit=12&search=${encodeURIComponent(TITULO)}`,
        {
            tags: { name: "GET /api/books?search" },
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
        "encontra o livro pesquisado": () =>
            Array.isArray(dados?.books) &&
            dados.books.some((livro) => livro.title === TITULO)
    });

    sleep(1);
}