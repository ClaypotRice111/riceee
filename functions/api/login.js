export async function onRequestPost(context) {
    const { request, env } = context;

    try {
        const { username, password } = await request.json();

        // 1. 计算输入密码的哈希
        const myText = new TextEncoder().encode(password);
        const myDigest = await crypto.subtle.digest({ name: 'SHA-256' }, myText);
        const hashArray = Array.from(new Uint8Array(myDigest));
        const inputHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

        // 2. 查库比对
        const user = await env.DB.prepare(
            "SELECT * FROM users WHERE username = ? AND password = ?"
        ).bind(username, inputHash).first();

        if (!user) {
            return new Response("账号或密码错误", { status: 401 });
        }

        // 3. 登录成功，生成 Cookie
        // HttpOnly: JS 无法读取 (防止 XSS)
        // Secure: 仅 HTTPS 发送
        // Max-Age=86400: 有效期 1 天
        const headers = new Headers();
        headers.append("Set-Cookie", `auth_token=valid_user; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=86400`);

        // 也可以存一个非 HttpOnly 的 cookie 给前端显示名字用
        headers.append("Set-Cookie", `user=${username}; Path=/; Secure; SameSite=Strict; Max-Age=86400`);

        return new Response("Login OK", { status: 200, headers });

    } catch (e) {
        return new Response("Server Error", { status: 500 });
    }
}