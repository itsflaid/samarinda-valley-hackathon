export async function logout() {
    const response = await fetch("/api/auth/logout", {
        method: "POST",
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || "Gagal logout");
    }

    return data;
}