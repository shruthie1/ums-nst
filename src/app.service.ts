import { Injectable, OnModuleInit } from '@nestjs/common';
import { TelegramService, UsersService, parseError, UserDataService, ppplbot, fetchWithTimeout, ClientService, sleep, ActiveChannelsService } from 'commonService';
import { Channel } from 'commonService/dist/components/channels/schemas/channel.schema';
import { User } from 'commonService/dist/components/users/schemas/user.schema';
import * as schedule from 'node-schedule-tz';
import { Api } from 'telegram/tl';

@Injectable()
export class AppService implements OnModuleInit {
  private userAccessData: Map<string, { timestamps: number[], videoDetails: any }> = new Map();
  private joinChannelIntervalId: NodeJS.Timeout;
  private joinChannelMap: Map<string, Channel[]> = new Map();

  constructor(private usersService: UsersService,
    private telegramService: TelegramService,
    private userDataService: UserDataService,
    private clientService: ClientService,
    private activeChannelsService: ActiveChannelsService
  ) {
    console.log("App Module Constructor initiated !!");
  }

  onModuleInit() {
    console.log("App Module initiated !!");
    try {
      schedule.scheduleJob('test3', '0 * * * * ', 'Asia/Kolkata', async () => {
        this.processUsers(400, 0);
      })
      schedule.scheduleJob('test3', '25 2 * * * ', 'Asia/Kolkata', async () => {
        const now = new Date();
        if (now.getUTCDate() % 3 === 1) {
          this.leaveChannels()
        }
      })

    } catch (error) {
      console.log("Some Error: ", error);
    }
  }

  async leaveChannels() {
    await this.sendToAll('leavechannels')
  }

  async sendToAll(endpoint: string) {
    const clients = await this.clientService.findAll();
    for (const client of clients) {
      const url = `${client.repl}/${endpoint}`
      console.log("Trying : ", url)
      await fetchWithTimeout(url)
    }
  }

  async processUsers(limit?: number, skip?: number) {
    const users = await this.getUser(limit, skip);
    this.updateUsers(users);
    return "Initiated Users Update"
  }

  async updateUsers(users: User[]) {
    for (const user of users) {
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
        lastActive, tgId: me.id.toString(), lastUpdated: new Date().toISOString().split('T')[0]
      })
      await this.telegramService.deleteClient(user.mobile);
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
    return { count: recentAccessData.length, videoDetails: accessData.videoDetails };
  }

  async updateRecentUser(chatId: string, videoDetails: any): Promise<void> {
    const accessData = this.userAccessData.get(chatId) || { timestamps: [], videoDetails: {} };
    const updatedVideoDetails = { ...accessData.videoDetails, ...videoDetails };
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

    return resp;
  }

  async sendtoChannel(chatId: string, token: string, message: string) {
    const url = `${ppplbot(chatId, token)}&text=${message}`;
    try {
      await fetchWithTimeout(url, {}, 0);
      return "sent";
    } catch (e) {
      parseError(e);
    }
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
    await this.userDataService.updateAll(tgId, { canReply: 0, payAmount: 0 })
    return "blocked sucessfully"
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

  async updateUserConfig(filter: any, data: any): Promise<any> {
    // Implement your logic here
  }

  async getUserConfig(filter: any): Promise<any> {
    // Implement your logic here
  }

  async getUserInfo(filter: any): Promise<any> {
   const client = (await this.clientService.executeQuery(filter,))[0]
   const result = {...client}
   delete result['session'];
   delete result['mobile'];
   delete result['deploykey'];
   delete result['repl']
   return result
  }

}
