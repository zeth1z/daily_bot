import asyncio
import logging
from aiogram import Bot, Dispatcher, types
from aiogram.filters import Command
from aiogram.types import WebAppInfo, InlineKeyboardMarkup, InlineKeyboardButton
from aiohttp import web
import aiohttp_cors

# Configuration
BOT_TOKEN = "YOUR_BOT_TOKEN_HERE"
WEBAPP_URL = "https://your-domain.com/web_app"  # HTTPS required!
HOST = '0.0.0.0'
PORT = 8080

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

bot = Bot(token=BOT_TOKEN)
dp = Dispatcher()

# Static file server
async def handle_static(request):
    path = request.match_info.get('path', 'index.html')
    file_path = f"web_app/{path}"
    
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        content_type = 'text/html'
        if path.endswith('.css'):
            content_type = 'text/css'
        elif path.endswith('.js'):
            content_type = 'application/javascript'
        
        return web.Response(text=content, content_type=content_type)
    except FileNotFoundError:
        return web.Response(status=404, text="Not found")

# Webhook for Telegram
async def handle_webhook(request):
    update = types.Update(**await request.json())
    asyncio.create_task(dp.feed_update(bot, update))
    return web.Response()

@dp.message(Command("start"))
async def cmd_start(message: types.Message):
    keyboard = InlineKeyboardMarkup(inline_keyboard=[
        [InlineKeyboardButton(
            text="📅 Открыть расписание",
            web_app=WebAppInfo(url=WEBAPP_URL)
        )]
    ])
    
    await message.answer(
        "👋 Привет! Это ИСПОтулз\n\n"
        "Нажми на кнопку ниже, чтобы открыть расписание:",
        reply_markup=keyboard
    )

@dp.message(Command("schedule"))
async def cmd_schedule(message: types.Message):
    await message.answer(
        "📅 Расписание",
        reply_markup=InlineKeyboardMarkup(inline_keyboard=[
            [InlineKeyboardButton(
                text="📱 Открыть в приложении",
                web_app=WebAppInfo(url=WEBAPP_URL)
            )]
        ])
    )

async def setup_web_server():
    app = web.Application()
    
    # Routes
    app.router.add_get('/', lambda r: handle_static(r))
    app.router.add_get('/web_app', lambda r: handle_static(r))
    app.router.add_get('/web_app/{path:.*}', handle_static)
    app.router.add_post('/webhook', handle_webhook)
    
    # CORS
    cors = aiohttp_cors.setup(app, defaults={
        "*": aiohttp_cors.ResourceOptions(
            allow_credentials=True,
            expose_headers="*",
            allow_headers="*",
            allow_methods=["GET", "POST", "OPTIONS"]
        )
    })
    
    for route in list(app.router.routes()):
        cors.add(route)
    
    return app

async def on_startup():
    # Set webhook
    await bot.set_webhook(f"{WEBAPP_URL.replace('/web_app', '')}/webhook")
    logger.info("Webhook set successfully")

async def on_shutdown():
    await bot.delete_webhook()
    await bot.session.close()
    logger.info("Bot stopped")

async def main():
    app = await setup_web_server()
    
    app.on_startup.append(on_startup)
    app.on_shutdown.append(on_shutdown)
    
    runner = web.AppRunner(app)
    await runner.setup()
    
    site = web.TCPSite(runner, HOST, PORT)
    await site.start()
    
    logger.info(f"Server started on http://{HOST}:{PORT}")
    logger.info(f"WebApp URL: {WEBAPP_URL}")
    
    # Keep running
    while True:
        await asyncio.sleep(3600)

if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        logger.info("Bot stopped by user")