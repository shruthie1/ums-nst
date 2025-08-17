import * as schedule from 'node-schedule-tz';
import { sleep, TotalList } from 'telegram/Helpers';
import { Api } from 'telegram/tl';
import { Dialog } from 'telegram/tl/custom/dialog';
import { shouldMatch } from './utils';
import {
  UsersService, TelegramService, UserDataService,
  ClientService, ActiveChannelsService, UpiIdService,
  Stat1Service, Stat2Service, PromoteStatService,
  ChannelsService, PromoteClientService, fetchWithTimeout,
  ppplbot, parseError, TelegramManager, Channel,
  connectionManager,
  contains,
  UserDocument,
  ActiveChannel
} from 'common-tg-service';
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';


@Injectable()
export class AppService implements OnModuleInit {
  private logger = new Logger(AppService.name);
  private userAccessData: Map<string, { timestamps: number[], videoDetails: any }> = new Map();
  private joinChannelIntervalId: NodeJS.Timeout;
  private joinChannelMap: Map<string, Channel[] | ActiveChannel[]> = new Map();

  constructor(
    private usersService: UsersService,
    private telegramService: TelegramService,
    private userDataService: UserDataService,
    private clientService: ClientService,
    private activeChannelsService: ActiveChannelsService,
    private upiIdService: UpiIdService,
    private stat1Service: Stat1Service,
    private stat2Service: Stat2Service,
    private promoteStatService: PromoteStatService,
    private channelsService: ChannelsService,
    private promoteClientService: PromoteClientService,
  ) {
    console.log("App Module Constructor initiated !!");
  }
  private refresTime: number = 0;


  onModuleInit() {
    this.logger = new Logger(AppService.name);
    this.logger.log('App Module initiated !!');

    try {
      this.scheduleTask('refresh-map-and-stats', '0 * * * *', async () => {
        await this.clientService.refreshMap();
        await this.stat1Service.deleteAll();
      });

      this.scheduleTask('process-users-every-3h', '0 */3 * * *', async () => {
        this.processUsers(400, 0);
      });

      this.scheduleTask('check-promote-clients', '35 16 * * *', async () => {
        this.promoteClientService.checkPromoteClients();
      });

      this.scheduleTask('weekly-monthly-maintenance', '25 0 * * *', async () => {
        this.handleMaintenanceTasks();
      });

      this.logger.log('Added All Cron Jobs');

      // Start processing users after 2 mins (on boot)
      setTimeout(() => {
        this.logger.log('Starting initial processUsers() after 2 minutes...');
        this.processUsers(400, 0);
      }, 120000); // 2 minutes in milliseconds

    } catch (error) {
      this.logger.error('Error scheduling jobs', error);
    }
  }

  private scheduleTask(name: string, cron: string, job: () => Promise<void>) {
    schedule.scheduleJob(name, cron, 'Asia/Kolkata', async () => {
      try {
        this.logger.log(`Running scheduled job: ${name}`);
        await job();
      } catch (err) {
        this.logger.error(`Error in scheduled job: ${name}`, err.stack || err.message);
      }
    });
  }

  private async handleMaintenanceTasks() {
    const now = new Date();

    if (now.getUTCDate() % 7 === 0) {
      await fetchWithTimeout(`${ppplbot()}&text=Resetting Banned Channels`);
      setTimeout(async () => {
        // await this.activeChannelsService.resetAvailableMsgs();
        // await this.activeChannelsService.updateBannedChannels();
        // await this.activeChannelsService.updateDefaultReactions();
      }, 30000);
    }

    if (now.getUTCDate() % 9 === 0) {
      setTimeout(async () => {
        await this.activeChannelsService.resetWordRestrictions();
      }, 30000);
    }

    await fetchWithTimeout(`${ppplbot()}&text=${encodeURIComponent(await this.getPromotionStatsPlain())}`);
    await this.userDataService.resetPaidUsers();
    await this.stat1Service.deleteAll();
    await this.stat2Service.deleteAll();
    await this.promoteStatService.reinitPromoteStats();
  }


  async checkPromotions() {
    setInterval(async () => {
      const clients = await this.clientService.findAll();
      for (const client of clients) {
        const userPromoteStats = await this.promoteStatService.findByClient(client.clientId);
        if (userPromoteStats?.isActive && (Date.now() - userPromoteStats?.lastUpdatedTimeStamp) / (1000 * 60) > 6) {
          try {
            await fetchWithTimeout(`${client.repl}/promote`, { timeout: 120000 });
            console.log(client.clientId, ": Promote Triggered!!");
          } catch (error) {
            parseError(error, "Promotion Check Err")
          }
        } else {
          console.log(client.clientId, ": ALL Good!! ---", Math.floor((Date.now() - userPromoteStats?.lastUpdatedTimeStamp) / (1000 * 60)));
        }
        await sleep(1000)
      }
    }, 240000)
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
    await fetchWithTimeout(`${(ppplbot())}&text=Leaveing Channels`)
    await this.sendToAll('leavechannels')
  }

  async sendToAll(endpoint: string) {
    const clients = await this.clientService.findAll();
    for (const client of clients) {
      const url = `${client.repl}/${endpoint}`
      console.log("Trying : ", url)
      fetchWithTimeout(url);
      await sleep(2000);
    }
  }

  public async exitPrimary() {
    const clients = await this.clientService.findAll();
    for (const client of clients) {
      if (client.clientId.toLowerCase().includes('1')) {
        await fetchWithTimeout(`${client.repl}/exit`);
        await sleep(10000);
      }
    }
  }

  public async exitSecondary() {
    const clients = await this.clientService.findAll();
    for (const client of clients) {
      if (client.clientId.toLowerCase().includes('2')) {
        await fetchWithTimeout(`${client.repl}/exit`);
        await sleep(10000);
      }
    }
  }

  public async refreshPrimary() {
    const clients = await this.clientService.findAll();
    for (const client of clients) {
      if (client.clientId.toLowerCase().includes('1')) {
        await fetchWithTimeout(`${client.repl}/exec/refresh`);
        await sleep(10000);
      }
    }
  }

  public async refreshSecondary() {
    const clients = await this.clientService.findAll();
    for (const client of clients) {
      if (client.clientId.toLowerCase().includes('2')) {
        await fetchWithTimeout(`${client.repl}/exec/refresh`);
        await sleep(10000);
      }
    }
  }

  async processUsers(limit?: number, skip?: number) {
    const users = await this.getUser(limit, skip);
    console.log(`Initiated Users Update: ${users.length}`);
    this.updateUsers(users);
    return `Initiated Users Update: ${users.length}`
  }
  async updateUsers(users: UserDocument[]) {
    for (const user of users) {
      let telegramClient: TelegramManager;
      try {
        console.log("----------------------------------------------------------");
        console.log("last Updated :: ", (user as any).updatedAt)
        telegramClient = await connectionManager.getClient(user.mobile, { autoDisconnect: true, handler: false });
        const lastActive = await telegramClient.getLastActiveTime();
        const me = await telegramClient.getMe();
        const selfMsgInfo = await telegramClient.getSelfMSgsInfo();
        const dialogs = await telegramClient.getDialogs({ limit: 5 });
        const contacts = <Api.contacts.Contacts>await telegramClient.getContacts();
        const hasPassword = await telegramClient.hasPassword();
        const callsInfo = await telegramClient.getCallLog();
        console.log("last Active :: ", (user as any).lastActive)
        if (callsInfo.chatCallCounts.length > 0) {
          console.log("CallsInfo :: ", callsInfo.chatCallCounts)
        }

        const result = await this.usersService.updateByFilter({ $or: [{ tgId: user.tgId }, { mobile: me.phone }] }, {
          contacts: contacts.savedCount,
          calls: callsInfo?.totalCalls > 0 ? callsInfo : { chatCallCounts: [], incoming: 0, outgoing: 0, totalCalls: 0, video: 0 },
          firstName: me.firstName,
          lastName: me.lastName,
          mobile: me.phone,
          username: me.username,
          msgs: selfMsgInfo.total,
          totalChats: dialogs.total,
          ownPhotoCount: selfMsgInfo.ownPhotoCount,
          movieCount: selfMsgInfo.movieCount,
          otherPhotoCount: selfMsgInfo.otherPhotoCount,
          otherVideoCount: selfMsgInfo.otherVideoCount,
          ownVideoCount: selfMsgInfo.ownVideoCount,
          twoFA: hasPassword ? true : false,
          lastActive,
          tgId: me.id.toString(),
        });
        await telegramClient.client.sendMessage("me", { message: "." });
        await this.processChannels(dialogs);
        console.log("Updated count::", result);
      } catch (error) {
        const errorDetails = parseError(error, `Failed to update user ${user.mobile}`, false);
        const errorMessage = errorDetails.message;
        if (contains(errorMessage.toLowerCase(),
          [
            'USER_DEACTIVATED_BAN',
            'USER_DEACTIVATED',
            'SESSION_REVOKED',
            'AUTH_KEY_UNREGISTERED'
          ])) {
          console.log(`User [${user.mobile}] is deactivated or session is revoked, deleting user... id: ${user.id}, _id: ${user._id}`);
          await this.usersService.deleteById(user.id.toString());
        }
      } finally {
        if (telegramClient) {
          await connectionManager.unregisterClient(user.mobile);
        }
        telegramClient = null;
        await sleep(2000);
      }
    }
    console.log("ProcessUsers finished");
    setTimeout(() => {
      this.promoteClientService.joinchannelForPromoteClients()
    }, 2 * 60 * 1000);
  }


  async processChannels(dialogs: TotalList<Dialog>) {
    const channels = dialogs
      .filter(chat => chat.isChannel || chat.isGroup)
      .map(chat => {
        const chatEntity = <Api.Channel>chat.entity;
        const cannotSendMsgs = chatEntity.defaultBannedRights?.sendMessages;
        if (!chatEntity.broadcast && !cannotSendMsgs && chatEntity.participantsCount > 50 && shouldMatch(chatEntity)) {
          return {
            channelId: chatEntity.id.toString(),
            canSendMsgs: true,
            participantsCount: chatEntity.participantsCount,
            private: false,
            title: chatEntity.title,
            broadcast: chatEntity.broadcast,
            megagroup: chatEntity.megagroup,
            restricted: chatEntity.restricted,
            sendMessages: true,
            username: chatEntity.username,
            forbidden: false
          };
        }
      })
      .filter(Boolean);
    console.log("Inserting the Channels Found: ", channels.length);
    this.channelsService.createMultiple(channels);
    this.activeChannelsService.createMultiple(channels);
  }

  async getUser(limit = 300, skip = 0) {
    const now = new Date();

    const weekAgo = new Date(now);
    weekAgo.setDate(weekAgo.getDate() - 7);
    weekAgo.setHours(23, 59, 59, 999);

    const monthAgo = new Date(now);
    monthAgo.setDate(monthAgo.getDate() - 30);
    monthAgo.setHours(23, 59, 59, 999);

    const threeMonthAgo = new Date(now);
    threeMonthAgo.setDate(threeMonthAgo.getDate() - 70);
    threeMonthAgo.setHours(23, 59, 59, 999);

    const query = {
      expired: false,
      updatedAt: { $lt: weekAgo },
      $or: [
        {
          createdAt: { $gt: monthAgo },
          updatedAt: { $lt: weekAgo }
        },
        {
          createdAt: { $lte: monthAgo, $gt: threeMonthAgo },
          updatedAt: { $lt: monthAgo }
        },
        {
          createdAt: { $lte: threeMonthAgo },
          updatedAt: { $lte: threeMonthAgo }
        }
      ]
    };

    return await this.usersService.executeQuery(query, {}, limit, skip);
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
    return await this.clientService.findAllMasked()
  }
  async portalData(query: object) {
    const client = (await this.clientService.findAllMasked())[0];
    const upis = await this.upiIdService.findOne();
    return { client, upis }
  }
  async joinchannelForClients(): Promise<string> {
    console.log("Joining Channel Started")
    await sleep(2000);
    const clients = await this.clientService.findAll();
    clients.map(async (document) => {
      try {
        let resp = await fetchWithTimeout(`${document.repl}/channelinfo`, { timeout: 200000 });
        await fetchWithTimeout(`${(ppplbot())}&text=Channel SendTrue :: ${document.clientId}: ${resp.data.canSendTrueCount}`)
        if (resp?.data?.canSendTrueCount && resp?.data?.canSendTrueCount < 350) {
          const result = await this.activeChannelsService.getActiveChannels(150, 0, resp.data?.ids);
          await fetchWithTimeout(`${(ppplbot())}&text=Started Joining Channels for ${document.clientId}: ${result.length}`)
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

  async refreshmap() {
    await this.clientService.refreshMap()
    await this.clientService.checkNpoint();

  }

  async blockUserAll(chatId: string) {
    let profileData = ''
    const userDatas = await this.userDataService.search({ chatId });
    for (const userData of userDatas) {
      const profileRegex = new RegExp(userData.profile, "i")
      const profiles = await this.clientService.executeQuery({ clientId: { $regex: profileRegex } })
      for (const profile of profiles) {
        await fetchWithTimeout(`${profile.repl}/blockuser/${userData.chatId}`);
      }
      profileData = profileData + " | " + userData.profile;
      await sleep(1000);
    }
    return profileData;
  }

  async getRequestCall(username: string, chatId: string): Promise<any> {
    const user = (await this.clientService.search({ username: username.toLowerCase() }))[0];
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
    delete result['promoteMobile'];
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
    const stats = await this.stat1Service.findAll();
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
    console.log("checkAndRefresh")
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
