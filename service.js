import axios from 'axios';

export async function sendToTelegram(text) {
    let url = `https://api.telegram.org/bot${process.env.TELEGRAM_TOKEN}/sendMessage`

    await axios.post(url, {
        chat_id: process.env.TELEGRAM_CHAT_ID,
        text: text
    })
}

export function formatBytes(bytes, decimals = 2) {
    if (!+bytes) return '0 Bytes'

    const k = 1024
    const dm = decimals < 0 ? 0 : decimals
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']

    const i = Math.floor(Math.log(bytes) / Math.log(k))

    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`
}
