export class ApiRequestError extends Error {
    status;
    code;
    details;
    constructor(status, error) {
        super(error.message);
        this.name = "ApiRequestError";
        this.status = status;
        this.code = error.code;
        this.details = error.details;
    }
}
function getToken() {
    if (typeof window === "undefined")
        return "";
    return localStorage.getItem("token") ?? "";
}
async function handleResponse(response) {
    if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new ApiRequestError(response.status, {
            code: body.error?.code ?? "unknown",
            message: body.error?.message ?? body.message ?? `Erreur ${response.status}`,
            details: body.error?.details,
        });
    }
    if (response.status === 204)
        return undefined;
    return response.json();
}
function buildHeaders() {
    const token = getToken();
    return {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
}
export const api = {
    get(url, params) {
        const searchParams = new URLSearchParams();
        if (params) {
            for (const [key, value] of Object.entries(params)) {
                if (value !== undefined && value !== "") {
                    searchParams.set(key, String(value));
                }
            }
        }
        const query = searchParams.toString();
        return fetch(`${url}${query ? `?${query}` : ""}`, {
            credentials: "include",
            headers: buildHeaders(),
        }).then((handleResponse));
    },
    post(url, body) {
        return fetch(url, {
            method: "POST",
            credentials: "include",
            headers: buildHeaders(),
            body: body ? JSON.stringify(body) : undefined,
        }).then((handleResponse));
    },
    put(url, body) {
        return fetch(url, {
            method: "PUT",
            credentials: "include",
            headers: buildHeaders(),
            body: JSON.stringify(body),
        }).then((handleResponse));
    },
    patch(url, body) {
        return fetch(url, {
            method: "PATCH",
            credentials: "include",
            headers: buildHeaders(),
            body: JSON.stringify(body),
        }).then((handleResponse));
    },
    delete(url) {
        return fetch(url, {
            method: "DELETE",
            credentials: "include",
            headers: buildHeaders(),
        }).then((handleResponse));
    },
};
