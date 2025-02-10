from telegram import InlineKeyboardButton, InlineKeyboardMarkup, Update
from telegram.ext import Updater, CommandHandler, CallbackContext

TOKEN = '7622448767:AAHEtTODPdTyV8Y8joy6YuxgcCVFXy9LqlU'
def start(update: Update, context: CallbackContext):
    keyboard = [[
        InlineKeyboardButton("Открыть приложение", web_app={'url': 'https://unagaml.github.io/telegram-attendance-webapp/'})
    ]]
    reply_markup = InlineKeyboardMarkup(keyboard)
    update.message.reply_text("Запустите мини-приложение:", reply_markup=reply_markup)

def main():
    updater = Updater(TOKEN, use_context=True)
    dp = updater.dispatcher
    dp.add_handler(CommandHandler("start", start))
    updater.start_polling()
    updater.idle()

if __name__ == '__main__':
    main()