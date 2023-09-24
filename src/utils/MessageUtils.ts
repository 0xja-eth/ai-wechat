import fs from 'fs';
import path from 'path';
import { log, Message } from 'wechaty';
import * as PUPPET from 'wechaty-puppet';
import moment from 'moment';
import { LOGPRE } from '../main';
import { StringUtils } from './StringUtils';

function createDir(dirPath: string) {
  if (!fs.existsSync(dirPath)) {
    createDir(path.dirname(dirPath));
    fs.mkdirSync(dirPath);
  }
}

export type MessageJSON = {
  chatName: string, talkerName: string, text: string, datetime: string, timestamp: number
}
export type UserAssistantMessage = {
  role: "system" | "user" | "assistant", content: string
}

export function getUserAssistantMessages(chatName: string): UserAssistantMessage[] {
  chatName = StringUtils.ensureFileNameValid(chatName)
  const filePath = path.resolve(`./data/total/${chatName}.json`);
  try { return JSON.parse(fs.readFileSync(filePath, 'utf-8')) }
  catch (e) { log.error(LOGPRE, `read file failed ${filePath}`, e) }
  return [];
}
function saveUserAssistantMessageToJSONFile(message: Message, messageJSON: MessageJSON) {
  const chatName = StringUtils.ensureFileNameValid(messageJSON.chatName)

  const filePath = path.resolve(`./data/total/${chatName}.json`);

  createDir(path.resolve(`./data/total`));

  let allMessages = [];
  try { allMessages = JSON.parse(fs.readFileSync(filePath, 'utf-8')) }
  catch (e) { log.error(LOGPRE, `read file failed ${filePath}`, e) }

  allMessages.push({
    role: message.self() ? "assistant" : "user",
    content: messageJSON.text
  });

  try { fs.writeFileSync(filePath, JSON.stringify(allMessages, null, 2), 'utf-8') }
  catch (e) { log.error(LOGPRE, `write file failed ${filePath}`, e) }
}
function saveMessageToJSONFile(messageJSON: MessageJSON) {
  const chatName = StringUtils.ensureFileNameValid(messageJSON.chatName)

  const today = moment().format('YYYY-MM-DD');
  const filePath = path.resolve(`./data/${today}/${chatName}.json`);

  createDir(path.resolve(`./data/${today}`));

  let allMessages = [];
  try { allMessages = JSON.parse(fs.readFileSync(filePath, 'utf-8')) }
  catch (e) { log.error(LOGPRE, `read file failed ${filePath}`, e) }

  allMessages.push(messageJSON);

  try { fs.writeFileSync(filePath, JSON.stringify(allMessages, null, 2), 'utf-8') }
  catch (e) { log.error(LOGPRE, `write file failed ${filePath}`, e) }
}
function saveMessageToPlainFile(messageJSON: MessageJSON) {
  const chatName = StringUtils.ensureFileNameValid(messageJSON.chatName)

  const today = moment().format('YYYY-MM-DD');
  const filePath = path.resolve(`./data/${today}/${chatName}.txt`);

  createDir(path.resolve(`./data/${today}`));

  const data = `${messageJSON.datetime}:\n${messageJSON.talkerName}:\n${messageJSON.text}\n\n`;

  try { fs.appendFileSync(filePath, data) }
  catch (e) { log.error(LOGPRE, `write file failed ${filePath}`, e) }
}

export async function processMessage(message: Message) {
  switch (message.type()) {
    case PUPPET.types.Message.Text:
      const room = message.room();
      const roomName = await room?.topic();

      const isSelf = message.self();
      const talkerName = message.talker()?.name();
      const listenerName = message.listener()?.name();
      const userName = isSelf ? listenerName : talkerName;
      const text = message.text();

      const chatName = roomName || userName;

      log.silly(LOGPRE, `get message: "${text}" by [${userName}] in {${chatName}}`);

      const time = message.date();
      const datetime = moment(time).format('YYYY-MM-DD HH:mm:ss')
      const timestamp = time.getTime();

      const messageJSON = { chatName, talkerName, text, datetime, timestamp };

      saveMessageToJSONFile(messageJSON);
      saveMessageToPlainFile(messageJSON);

      saveUserAssistantMessageToJSONFile(message, messageJSON);

      return messageJSON;
    case PUPPET.types.Message.Attachment:
    case PUPPET.types.Message.Audio:
      const attachFile = await message.toFileBox();
      const dataBuffer = await attachFile.toBuffer();
      log.info(LOGPRE, `get message audio or attach: ${dataBuffer.length}`);

      break;
    case PUPPET.types.Message.Video:
      const videoFile = await message.toFileBox();
      const videoData = await videoFile.toBuffer();
      log.info(LOGPRE, `get message video: ${videoData.length}`);

      break;
    case PUPPET.types.Message.Emoticon:
      const emotionFile = await message.toFileBox();
      const emotionJSON = emotionFile.toJSON();
      log.info(LOGPRE, `get message emotion json: ${JSON.stringify(emotionJSON)}`);

      const emotionBuffer: Buffer = await emotionFile.toBuffer();
      log.info(LOGPRE, `get message emotion: ${emotionBuffer.length}`);

      break;
    case PUPPET.types.Message.Image:
      const messageImage = await message.toImage();

      const thumbImage = await messageImage.thumbnail();
      const thumbImageData = await thumbImage.toBuffer();
      log.info(LOGPRE, `get message image, thumb: ${thumbImageData.length}`);

      const hdImage = await messageImage.hd();
      const hdImageData = await hdImage.toBuffer();
      log.info(LOGPRE, `get message image, hd: ${hdImageData.length}`);

      const artworkImage = await messageImage.artwork();
      const artworkImageData = await artworkImage.toBuffer();
      log.info(LOGPRE, `get message image, artwork: ${artworkImageData.length}`);

      break;
    case PUPPET.types.Message.Url:
      const urlLink = await message.toUrlLink();
      log.info(LOGPRE, `get message url: ${JSON.stringify(urlLink)}`);

      const urlThumbImage = await message.toFileBox();
      const urlThumbImageData = await urlThumbImage.toBuffer();
      log.info(LOGPRE, `get message url thumb: ${urlThumbImageData.length}`);

      break;
    case PUPPET.types.Message.MiniProgram:
      const miniProgram = await message.toMiniProgram();
      log.info(LOGPRE, `get message mini program: ${JSON.stringify(miniProgram)}`);

      break;
  }
}
