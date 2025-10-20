import os
import server
from aiohttp import web

# Web resource root directory
WEBROOT = os.path.join(os.path.dirname(os.path.realpath(__file__)), "web")

# ==========================================
# 1. Main Page Route (/bg_remove)
# ==========================================
@server.PromptServer.instance.routes.get("/bg_remove")
async def bg_remove_page(request):
    """
    Returns index.html when accessing /bg_remove path
    """
    return web.FileResponse(os.path.join(WEBROOT, "index.html"))

# ==========================================
# 2. Assets Static Files Route
# ==========================================
server.PromptServer.instance.routes.static(
    "/bg_remove/assets/",  # URL path
    path=os.path.join(WEBROOT, "assets")  # Actual file path
)

# ==========================================
# 3. vite.svg Favicon Route
# ==========================================
vite_svg_path = os.path.join(WEBROOT, "vite.svg")
if os.path.exists(vite_svg_path):
    @server.PromptServer.instance.routes.get("/bg_remove/vite.svg")
    async def vite_svg(request):
        return web.FileResponse(vite_svg_path)

# ==========================================
# 4. Loading Confirmation Message
# ==========================================
print(f"[rmbg_web] ✅ Background Removal WebUI loaded from: {WEBROOT}")
