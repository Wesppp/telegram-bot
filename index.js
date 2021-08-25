const token = '1855344814:AAFO56IOW_1s5e46sVpefSY1Ba8cRtZnUdw'
const helper = require('./helper')
const mongoose = require('mongoose')
const config = require('./config')
const {gameOptions, againOptions, keyboardOptions,} = require('./options')
const TelehramApi = require('node-telegram-bot-api')
const bot = new TelehramApi(token, {polling: true})
const database = require('./database.json')

helper.logStart()

mongoose.connect(config.DB_URL, {
    useMongoClient: true
}).then(() => console.log('MongoDB connected'))
  .catch((err) => console.log(err))

  require('./anim-model')
  const Anim = mongoose.model('anima')

//   database.anims.forEach(f => new Anim(f).save())

// массив с рандомынм значением по id чата
const chats = {}
const cats = {}
const animes = {}

// список доступных команд бота
bot.setMyCommands([
    {command: '/start', description: 'Начальное приветствие'},
    {command: '/help', description: 'Список команд'},
    {command: '/game', description: 'Игра на удачу'},
    {command: '/iwantcat', description: 'Получи кота'},
])

// старт игры "угадай число"
const startGame = async (chatId) => {
    await bot.sendMessage(chatId, 'Сейчас я загадаю цифру от 1 до 10, а ты постарайся угадать :)')
    const num = Math.floor(Math.random() * 10)
    chats[chatId] = num
    await bot.sendMessage(chatId, 'Отгадывай', gameOptions)
}


// основа бота
const start = () => {

    bot.on('message', async (msg) => {
        const chatId = msg.chat.id
        const text = msg.text
    
        // сообщение при старте
        if (text === '/start') {
           await bot.sendSticker(chatId, 'https://tlgrm.ru/_/stickers/759/e99/759e9948-9f95-4703-ad74-c1b6584d6559/1.webp')
           return [bot.sendMessage(chatId, `Привет, ${msg.from.first_name}
это абсолютно бесполезный бот 
созданный для ужасных экспериментов
введи /help, чтобы узнать его возможности`),
bot.sendMessage(chatId, "I'm a test robot", keyboardOptions)
]
        }
    
        // список команд
        if (text === '/help') {
            return bot.sendMessage(chatId, `Скромный список команд:(
1 - /game
2 - /iwantcat
3 - /sendHTML
4 - остальное в клавиатуре :)`)
        }

        // получи рандомного кота
        if (text === '/iwantcat' || text === '2' || text === 'Рандомный кот') {
            const randomCatId = Math.floor(Math.random() * 10)
            cats[chatId] = randomCatId

            return bot.sendPhoto(chatId, `./CatImgs/cat${cats[chatId]}.jpg`);
        }

        // игра
        if (text === '/game' || text === '1') {
            return startGame(chatId)
        }

        // отправка HTML кода, просто так
        if (text === '/sendHTML' || text === '3') {
            const html = `
            <strong>Привет, ${msg.from.first_name}</strong>
            <i>Это html код </i>`

            return bot.sendMessage(chatId, html, {
                parse_mode: 'HTML'
            })
        }

        // не стоит доверять вкусам этого бота 
        if (text === 'Что посмотреть?') {
            const randomAnime = Math.floor(Math.random() * (10 - 1 + 1)) + 1;
            animes[chatId] = randomAnime

           return sendAnima(chatId, {uuid: `f${animes[chatId]}`})
        }
    
    })

    // событие для работы с сообщениями пользователя
    bot.on('callback_query', msg => {
        const data = msg.data
        const chatId = msg.message.chat.id

        // сообщения игры 
        if (data === '/again') {
            return startGame(chatId)
        }

        // игра "угадай число"
        if (+data === +chats[chatId]) {
            return [bot.sendMessage(chatId, `Ты победил!`),
                    bot.sendSticker(chatId, 'https://tlgrm.ru/_/stickers/759/e99/759e9948-9f95-4703-ad74-c1b6584d6559/5.webp', againOptions)]         
        } else {
            return [bot.sendMessage(chatId, `Поражение(
это была цифра ${chats[chatId]}`, againOptions)]
        }
    })

}

function sendAnima(chatId, query) {
    Anim.find(query).then(anima => {
        const html = anima.map((f, i) => {
           return ` ${f.picture, parse_mode=''}
Название: ${f.name}
Рейтинг: <strong>${f.rate}</strong>
Длительность: ${f.length}
Год: ${f.year}
Переходи по ссылке ниже и смотри:)
${f.link}`
        }).join('\n')

        bot.sendMessage(chatId, html, {
            parse_mode: 'HTML'
        })
    })
}

start()

