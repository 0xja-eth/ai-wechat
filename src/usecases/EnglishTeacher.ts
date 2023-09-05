import { log, Message } from 'wechaty';
import { MessageJSON } from '../utils/MessageUtils';
import { LOGPRE } from '../main';
import { post } from '../utils/APIUtils';

const CorrectEnglish = post<{
  api_key: string, prompt: string, content?: string
}, {
  reply: string
}>("http://127.0.0.1:8090", "/generate2")

const APIKey = process.env.OPENAI_API_KEY
const MonitorRooms = process.env.MONITOR_ROOMS?.split(',') || [];
const MonitorUsers = process.env.MONITOR_USERS?.split(',') || [];

export default async function(message: Message, json: MessageJSON) {
  let { text } = json;

  const room = message.room();

  if (room) return false
  if (!text.startsWith("神秘口令")) return false

  text = text.replace("神秘口令", "").trim()

  try {
    const { reply } = await CorrectEnglish({
      prompt: `你是一个英语老师，有一名初中生想提一些英语问题，请您耐心解答。问题是：${text}`,
      api_key: APIKey
    });
    const replyText = `${reply} `;
    await (message.self() ? message.listener() : message.talker())?.say(replyText)
    // await message.talker().say(replyText)
    return true;
  } catch (e) {
    log.error(LOGPRE, "generate reply fail:", e)
  }
}
