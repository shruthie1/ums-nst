import { Injectable, OnModuleInit } from '@nestjs/common';
import {
  TelegramService, UsersService, parseError, UserDataService,
  ppplbot, fetchWithTimeout, ClientService,
  sleep, ActiveChannelsService, UpiIdService,
  StatService,
  PromoteStatService,
  Stat2Service,
  ChannelsService
} from 'commonService';
import { CreateChannelDto } from 'commonService/dist/components/channels/dto/create-channel.dto';
import { Channel } from 'commonService/dist/components/channels/schemas/channel.schema';
import { User } from 'commonService/dist/components/users/schemas/user.schema';
import * as schedule from 'node-schedule-tz';
import { TotalList } from 'telegram/Helpers';
import { Api } from 'telegram/tl';
import { Dialog } from 'telegram/tl/custom/dialog';

@Injectable()
export class AppService implements OnModuleInit {
  private userAccessData: Map<string, { timestamps: number[], videoDetails: any }> = new Map();
  private joinChannelIntervalId: NodeJS.Timeout;
  private joinChannelMap: Map<string, Channel[]> = new Map();

  constructor(private usersService: UsersService,
    private telegramService: TelegramService,
    private userDataService: UserDataService,
    private clientService: ClientService,
    private activeChannelsService: ActiveChannelsService,
    private upiIdService: UpiIdService,
    private statService: StatService,
    private stat2Service: Stat2Service,
    private promoteStatService: PromoteStatService,
    private channelsService: ChannelsService,
  ) {
    console.log("App Module Constructor initiated !!");
  }
  private refresTime: number = 0;

  onModuleInit() {
    console.log("App Module initiated !!");
    try {
      schedule.scheduleJob('test3', '0 * * * * ', 'Asia/Kolkata', async () => {
        this.processUsers(400, 0);
        await this.statService.deleteAll();
      })

      schedule.scheduleJob('test3', '25 2,9 * * * ', 'Asia/Kolkata', async () => {
        const now = new Date();
        if (now.getUTCDate() % 3 === 1) {
          this.leaveChannelsAll()
        }
        await this.joinchannelForClients()
      })

      schedule.scheduleJob('test3', ' 25 0 * * * ', 'Asia/Kolkata', async () => {
        const now = new Date();
        if (now.getUTCDate() % 9 === 1) {
          setTimeout(async () => {
            await this.activeChannelsService.resetAvailableMsgs();
            await this.activeChannelsService.updateBannedChannels();
            await this.activeChannelsService.updateDefaultReactions();
          }, 30000);
        }

        await fetchWithTimeout(`${ppplbot()}&text=${encodeURIComponent(await this.getPromotionStatsPlain())}`);
        await this.userDataService.resetPaidUsers();
        await this.statService.deleteAll();
        await this.stat2Service.deleteAll();
        await this.promoteStatService.reinitPromoteStats();
      })

    } catch (error) {
      console.log("Some Error: ", error);
    }
  }

  async getPromotionStatsPlain() {
    let resp = '';
    const result = await this.promoteStatService.findAll();
    for (const data of result) {
      resp += `\n${data.client.toUpperCase()} : ${data.totalCount} ${data.totalCount > 0 ? ` | ${Number((Date.now() - data.lastUpdatedTimeStamp) / (1000 * 60)).toFixed(2)}` : ''}`;
    }
    return resp;
  }

  async leaveChannelsAll() {
    await this.sendToAll('leavechannels')
  }

  async sendToAll(endpoint: string) {
    const clients = await this.clientService.findAll();
    for (const client of clients) {
      const url = `${client.repl}/${endpoint}`
      console.log("Trying : ", url)
      fetchWithTimeout(url);
      await sleep(1000);
    }
  }

  async processUsers(limit?: number, skip?: number) {
    const users = await this.getUser(limit, skip);
    this.updateUsers(users);
    return "Initiated Users Update"
  }

  async updateUsers(users: User[]) {
    for (const user of users) {
      try {
        const telegramClient = await this.telegramService.createClient(user.mobile, false, false);
        const lastActive = await telegramClient.getLastActiveTime();
        const me = await telegramClient.getMe()
        const selfMSgInfo = await telegramClient.getSelfMSgsInfo();
        const dialogs = await telegramClient.getDialogs({ limit: 500 });
        const contacts = <Api.contacts.Contacts>await telegramClient.getContacts()
        const callsInfo = await telegramClient.getCallLog();
        await this.usersService.update(user.tgId, {
          contacts: contacts.savedCount,
          calls: callsInfo?.totalCalls > 0 ? callsInfo : { chatCallCounts: [], incoming: 0, outgoing: 0, totalCalls: 0, video: 0 },
          firstName: me.firstName,
          lastName: me.lastName, username: me.username, msgs: selfMSgInfo.total, totalChats: dialogs.total,
          lastActive, tgId: me.id.toString()
        })
        this.processChannels(dialogs)
        await this.telegramService.deleteClient(user.mobile);
      } catch (error) {
        parseError(error, "UMS :: ")
      }
    }
  }

  async processChannels(dialogs: TotalList<Dialog>) {
    for (const chat of dialogs) {
      if (chat.isChannel || chat.isGroup) {
        const chatEntity = <Api.Channel>chat.entity;
        const cannotSendMsgs = chatEntity.defaultBannedRights?.sendMessages;
        if (!chatEntity.broadcast && !cannotSendMsgs) {
          const channel: CreateChannelDto = {
            channelId: chatEntity.id.toString(),
            canSendMsgs: true,
            participantsCount: chatEntity.participantsCount,
            private: false,
            title: chatEntity.title,
            broadcast: chatEntity.broadcast,
            megagroup: chatEntity.megagroup,
            restricted: chatEntity.restricted,
            sendMessages: true,
            username: chatEntity.username
          }
          this.channelsService.create(channel)
        }
      }
    }
  }

  async getUser(limit?: number, skip?: number) {
    const weekAgo = new Date(Date.now() - (7 * 24 * 60 * 60 * 1000)).toISOString().split('T')[0];
    console.log(weekAgo.toString())
    const users = await this.usersService.executeQuery({
      $or: [
        { "lastUpdated": { $lt: weekAgo.toString() } },
        { "lastUpdated": { $exists: false } }
      ]
    }, {}, limit || 300, skip || 0)
    return users;
  }

  getHello(): string {
    return 'Hello World!';
  }

  async isRecentUser(chatId: string): Promise<{ count: number, videoDetails: any }> {
    const accessData = this.userAccessData.get(chatId) || { timestamps: [], videoDetails: {} };
    const currentTime = Date.now();
    const recentAccessData = accessData.timestamps.filter(timestamp => currentTime - timestamp <= 15 * 60 * 1000);
    recentAccessData.push(currentTime);
    this.userAccessData.set(chatId, { videoDetails: accessData.videoDetails, timestamps: recentAccessData });
    const result = { count: recentAccessData.length, videoDetails: accessData.videoDetails }
    console.log(result)
    return result;
  }

  async updateRecentUser(chatId: string, videoDetails: any): Promise<void> {
    const accessData = this.userAccessData.get(chatId) || { timestamps: [], videoDetails: {} };
    const updatedVideoDetails = { ...accessData.videoDetails, ...videoDetails };
    console.log({ videoDetails: updatedVideoDetails, timestamps: accessData.timestamps })
    this.userAccessData.set(chatId, { videoDetails: updatedVideoDetails, timestamps: accessData.timestamps });
  }

  async resetRecentUser(chatId: string): Promise<{ count: number }> {
    this.userAccessData.delete(chatId);
    return { count: 0 };
  }

  async getPaymentStats(chatId: string, profile: string) {
    const resp = { paid: 0, demoGiven: 0, secondShow: 0, fullShow: 0 };

    try {
      const query1 = { chatId, profile: { $exists: true, $ne: profile }, payAmount: { $gte: 10 } };
      const query2 = { chatId, profile: { $exists: true, $ne: profile } };

      const document = await this.userDataService.executeQuery(query1);
      const document2 = await this.userDataService.executeQuery(query2);

      if (document.length > 0) {
        resp.paid = document.length;
      }

      if (document2.length > 0) {
        document2.forEach(doc => {
          if (doc.demoGiven) {
            resp.demoGiven++;
          }
          if (doc.secondShow) {
            resp.secondShow++;
          }
          if (doc.fullShow) {
            resp.fullShow++;
          }
        });
      }
    } catch (error) {
      parseError(error);
    }
    console.log(resp)
    return resp;
  }

  async sendtoChannel(chatId: string, token: string, message: string) {
    function isEncoded(str) {
      try {
        return str !== decodeURIComponent(str);
      } catch (e) {
        return false;
      }
    }
    const encodedMessage = isEncoded(message) ? message : encodeURIComponent(message);
    console.log(decodeURIComponent(encodedMessage));
    const url = `${ppplbot(chatId, token)}&text=${encodedMessage}`;

    try {
      await fetchWithTimeout(url, {}, 0);
      return "sent";
    } catch (e) {
      parseError(e);
    }
  }

  async findAllMasked(query: object) {
    return await this.clientService.findAllMasked(query)
  }
  async portalData(query: object) {
    const client = (await this.clientService.findAllMasked(query))[0];
    const upis = await this.upiIdService.findOne();
    return { client, upis }
  }
  async joinchannelForClients(): Promise<string> {
    console.log("Joining Channel Started")
    await this.telegramService.disconnectAll();
    await sleep(2000);
    const clients = await this.clientService.findAll();
    clients.map(async (document) => {
      try {
        let resp = await fetchWithTimeout(`${document.repl}/channelinfo`, { timeout: 200000 });
        await fetchWithTimeout(`${(ppplbot())}&text=ChannelCount SendTrue - ${document.clientId}: ${resp.data.canSendTrueCount}`)
        if (resp?.data?.canSendTrueCount && resp?.data?.canSendTrueCount < 300) {
          const keys = ['wife', 'adult', 'lanj', 'lesb', 'paid', 'coupl', 'cpl', 'randi', 'bhab', 'boy', 'girl', 'friend', 'frnd', 'boob', 'pussy', 'dating', 'swap', 'gay', 'sex', 'bitch', 'love', 'video', 'service', 'real', 'call', 'desi'];
          const result = await this.activeChannelsService.getActiveChannels(150, 0, keys, resp.data?.ids);
          this.joinChannelMap.set(document.repl, result);
        }
      } catch (error) {
        parseError(error)
      }
    })
    this.joinChannelQueue();
    console.log("Joining Channel Triggered Succesfully for ", clients.length);
    return "Initiated Joining channels"
  }

  async joinChannelQueue() {
    this.joinChannelIntervalId = setInterval(async () => {
      const keys = Array.from(this.joinChannelMap.keys());
      if (keys.length > 0) {
        console.log("In JOIN CHANNEL interval: ", new Date().toISOString());

        const promises = keys.map(async url => {
          const channels = this.joinChannelMap.get(url);
          if (channels && channels.length > 0) {
            const channel = channels.shift();
            console.log(url, " Pending Channels :", channels.length)
            this.joinChannelMap.set(url, channels);
            try {
              await fetchWithTimeout(`${url}/joinchannel?username=${channel.username}`);
              console.log(url, " Trying to join :", channel.username);
            } catch (error) {
              parseError(error, "Outer Err: ");
            }
          } else {
            this.joinChannelMap.delete(url);
          }
        });
        await Promise.all(promises);
      } else {
        this.clearJoinChannelInterval()
      }
    }, 3 * 60 * 1000);
  }

  clearJoinChannelInterval() {
    if (this.joinChannelIntervalId) {
      console.log("Cleared joinChannel Set Interval")
      clearInterval(this.joinChannelIntervalId);
      this.joinChannelIntervalId = null;
    }
  }

  refreshmap() {
    this.clientService.refreshMap()
  }

  async blockUserAll(tgId: string) {
    return await this.userDataService.updateAll(tgId, { canReply: 0, payAmount: 0 })
  }

  async getRequestCall(username: string, chatId: string): Promise<any> {
    const user = (await this.clientService.search(username.toLowerCase()))[0];
    console.log(`Call Request Recived: ${username} | ${chatId}`)
    if (user) {
      const payload = { chatId, profile: user.clientId }
      const options = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        data: JSON.stringify(payload),
      };
      const result = await fetchWithTimeout("https://arpithared.onrender.com/events/schedule", options, 3);
      console.log(result?.data)
    }
  }

  async getUserData(profile: string, clientId: string, chatId: string): Promise<any> {
    if (!profile) {
      profile = clientId?.replace(/\d/g, '')
    }
    return await this.userDataService.findOne(profile, chatId);
  }

  async updateUserData(profile: string, clientId: string, body: any): Promise<any> {
    if (!profile) {
      profile = clientId?.replace(/\d/g, '')
    }
    const chatId = body.chatId;
    return await this.userDataService.update(profile, chatId, body);
  }

  async updateUserConfig(chatId: string, profile: string, data: any): Promise<any> {
    this.userDataService.update(profile, chatId, data)
  }

  async getUserConfig(filter: any): Promise<any> {
    // Implement your logic here
  }

  async getallupiIds() {
    return await this.upiIdService.findOne();
  }

  async getUserInfo(filter: any): Promise<any> {
    const client = <any>(await this.clientService.executeQuery(filter,))[0]
    const result = { ...(client._doc ? client._doc : client) }
    delete result['session'];
    delete result['mobile'];
    delete result['deployKey'];
    return result
  }

  extractNumberFromString(inputString) {
    const regexPattern = /\d+/;
    const matchResult = inputString?.match(regexPattern);
    if (matchResult && matchResult.length > 0) {
      // Parse the matched string into a number and return it
      return parseInt(matchResult[0], 10);
    }
    // If no number is found, return null
    return null;
  }

  async createInitializedObject() {
    const clients = await this.clientService.findAll();
    const initializedObject = {};
    for (const user of clients) {
      if (this.extractNumberFromString(user.clientId))
        initializedObject[user.clientId.toUpperCase()] = {
          profile: user.clientId.toUpperCase(),
          totalCount: 0,
          totalPaid: 0,
          totalOldPaid: 0,
          oldPaidDemo: 0,
          totalpendingDemos: 0,
          oldPendingDemos: 0,
          totalNew: 0,
          totalNewPaid: 0,
          newPaidDemo: 0,
          newPendingDemos: 0,
          names: "",
          fullShowPPl: 0,
          fullShowNames: ""
        }
    }

    return initializedObject;
  }

  async getData(): Promise<string> {
    const profileData = await this.createInitializedObject();
    const stats = await this.statService.findAll();
    for (const stat of stats) {
      const { count, newUser, payAmount, demoGivenToday, demoGiven, profile, client, name, secondShow } = stat;

      if (client && profileData[client.toUpperCase()]) {
        const userData = profileData[client.toUpperCase()];
        userData.totalCount += count;
        userData.totalPaid += payAmount > 0 ? 1 : 0;
        userData.totalOldPaid += (payAmount > 0 && !newUser) ? 1 : 0;
        userData.oldPaidDemo += (demoGivenToday && !newUser) ? 1 : 0;
        userData.totalpendingDemos += (payAmount > 25 && !demoGiven) ? 1 : 0;
        userData.oldPendingDemos += (payAmount > 25 && !demoGiven && !newUser) ? 1 : 0;
        if (payAmount > 25 && !demoGiven) {
          userData.names = userData.names + ` ${name} |`;
        }

        if (demoGiven && ((payAmount > 90 && !secondShow) || (payAmount > 150 && secondShow))) {
          userData.fullShowPPl++;
          userData.fullShowNames = userData.fullShowNames + ` ${name} |`;
        }

        if (newUser) {
          userData.totalNew += 1;
          userData.totalNewPaid += payAmount > 0 ? 1 : 0;
          userData.newPaidDemo += demoGivenToday ? 1 : 0;
          userData.newPendingDemos += (payAmount > 25 && !demoGiven) ? 1 : 0;
        }
      }
    }

    const profileDataArray = Object.entries(profileData);
    profileDataArray.sort((a: any, b: any) => b[1].totalpendingDemos - a[1].totalpendingDemos);
    let reply = '';
    for (const [profile, userData] of profileDataArray) {
      reply += `${profile.toUpperCase()} : <b>${(userData as any).totalpendingDemos}</b> | ${(userData as any).names}<br>`;
    }

    profileDataArray.sort((a: any, b: any) => b[1].fullShowPPl - a[1].fullShowPPl);
    let reply2 = '';
    for (const [profile, userData] of profileDataArray) {
      reply2 += `${profile.toUpperCase()} : <b>${(userData as any).fullShowPPl}</b> |${(userData as any).fullShowNames}<br>`;
    }

    const reply3 = await this.getPromotionStats();
    console.log(reply3)

    return (
      `<div>
        <div style="display: flex; margin-bottom: 60px">
          <div style="flex: 1;">${reply}</div>
          <div style="flex: 1; ">${reply2}</div>
        </div>
        <div style="display: flex;">
          <div style="flex: 1; " >${reply3}</div>
        </div>
      </div>`
    );
  }

  async getPromotionStats(): Promise<string> {
    let resp = '';
    const result = await this.promoteStatService.findAll();
    for (const data of result) {
      resp += `${data.client.toUpperCase()} : <b>${data.totalCount}</b>${data.totalCount > 0 ? ` | ${Number((Date.now() - data.lastUpdatedTimeStamp) / (1000 * 60)).toFixed(2)}` : ''}<br>`;
    }
    return resp;
  }

  async checkAndRefresh() {
    if (Date.now() > this.refresTime) {
      this.refresTime = Date.now() + (5 * 60 * 1000);
      const clients = await this.clientService.findAll()
      for (const value of clients) {
        await fetchWithTimeout(`${value.repl}/markasread`);
        await sleep(3000);
      }
    }
  }
}
