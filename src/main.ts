import dotenv from 'dotenv';
dotenv.config();

import { log, ScanStatus, WechatyBuilder } from 'wechaty';
import { PuppetPadlocal } from 'wechaty-puppet-padlocal';

import { processMessage } from './utils/MessageUtils';
import EnglishCorrection from './usecases/EnglishCorrection';
import EnglishTeacher from './usecases/EnglishTeacher';
import OpenAI from 'openai';

export const LOGPRE = '[PadLocalDemo]';

export const Openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: process.env.OPENAI_API_BASE
})
export const Puppet = new PuppetPadlocal({ token: process.env.PADLOCAL_API_KEY });

export const Bot = WechatyBuilder.build({
  name: 'PadLocalDemo',
  puppet: Puppet
})
  .on('scan', (qrcode, status) => {
    if (status === ScanStatus.Waiting && qrcode) {
      const qrcodeImageUrl = ['https://wechaty.js.org/qrcode/', encodeURIComponent(qrcode)].join('');

      log.info(LOGPRE, `onScan: ${ScanStatus[status]}(${status})`);

      console.log('\n==================================================================');
      console.log('\n* Two ways to sign on with qr code');
      console.log('\n1. Scan following QR code:\n');

      require('qrcode-terminal').generate(qrcode, { small: true }); // show qrcode on console

      console.log(`\n2. Or open the link in your browser: ${qrcodeImageUrl}`);
      console.log('\n==================================================================\n');
    } else {
      log.info(LOGPRE, `onScan: ${ScanStatus[status]}(${status})`);
    }
  })

  .on('login', (user) => {
    log.info(LOGPRE, `${user} login`);
    log.info(LOGPRE, `Name: ${Bot.currentUser.name()}`)
    // Bot.logout()
  })

  .on('logout', (user, reason) => {
    log.info(LOGPRE, `${user} logout, reason: ${reason}`);
  })

  .on('message', async (message) => {
    log.info(LOGPRE, `on message: ${message.toString()}`);

    const messageJSON = await processMessage(message);

    if (message.self() && messageJSON?.text == "logout")
      await Bot.logout()
    else if (messageJSON) {
      await EnglishCorrection(message, messageJSON) ||
      await EnglishTeacher(message, messageJSON)
    }
  })

  .on('room-invite', async (roomInvitation) => {
    log.info(LOGPRE, `on room-invite: ${roomInvitation}`);
    roomInvitation.accept();
  })

  .on('room-join', (room, inviteeList, inviter, date) => {
    log.info(LOGPRE, `on room-join, room:${room}, inviteeList:${inviteeList}, inviter:${inviter}, date:${date}`);
  })

  .on('room-leave', (room, leaverList, remover, date) => {
    log.info(LOGPRE, `on room-leave, room:${room}, leaverList:${leaverList}, remover:${remover}, date:${date}`);
  })

  .on('room-topic', (room, newTopic, oldTopic, changer, date) => {
    log.info(
      LOGPRE,
      `on room-topic, room:${room}, newTopic:${newTopic}, oldTopic:${oldTopic}, changer:${changer}, date:${date}`,
    );
  })

  .on('friendship', (friendship) => {
    log.info(LOGPRE, `on friendship: ${friendship}`);
    friendship.accept();
  })

  .on('error', (error) => {
    log.error(LOGPRE, `on error: ${error}`);
  });

Bot.reset().then(() => Bot.start()).then(() => {
  log.info(LOGPRE, 'started.');
});


