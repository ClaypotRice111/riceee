export async function onRequest(context) {
    const { request, next } = context;
    const cookie = request.headers.get("Cookie");

    // 检查 Cookie 中是否有我们要的暗号
    if (cookie && cookie.includes("auth_token=valid_user")) {
        // 验证通过，放行，去加载 home.html
        return next();
    }

    // 验证失败，强制重定向回首页
    return Response.redirect(new URL("/", request.url), 302);
}