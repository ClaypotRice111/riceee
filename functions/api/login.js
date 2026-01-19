// functions/api/login.js

export async function onRequestPost(context) {
    const { request, env } = context;

    try {
        // 🆕 接收 rememberMe 参数
        const { username, password, rememberMe } = await request.json();

        // ... (这里是哈希加密代码，保持不变) ...
        const myText = new TextEncoder().encode(password);
        const myDigest = await crypto.subtle.digest({ name: 'SHA-256' }, myText);
        const hashArray = Array.from(new Uint8Array(myDigest));
        const inputHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

        // ... (这里是查数据库代码，保持不变) ...
        const user = await env.DB.prepare(
            "SELECT * FROM users WHERE username = ? AND password = ?"
        ).bind(username, inputHash).first();

        if (!user) {
            return new Response("账号或密码错误", { status: 401 });
        }

        // 🆕 核心修改：根据是否勾选“记住我”，设置不同的过期时间
        // 如果记住我：2592000秒 (30天)
        // 如果不记住：3600秒 (1小时)
        const maxAge = rememberMe ? 2592000 : 3600;

        const headers = new Headers();
        // 注意看这里用到了 maxAge 变量
        headers.append("Set-Cookie", `auth_token=valid_user; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=${maxAge}`);
        headers.append("Set-Cookie", `user=${username}; Path=/; Secure; SameSite=Strict; Max-Age=${maxAge}`);

        return new Response("Login OK", { status: 200, headers });

    } catch (e) {
        return new Response("Server Error: " + e.message, { status: 500 });
    }
}