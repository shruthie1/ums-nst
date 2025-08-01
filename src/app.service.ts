import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { sleep, TotalList } from 'telegram/Helpers';
import { Api } from 'telegram/tl';
import { Dialog } from 'telegram/tl/custom/dialog';
import * as schedule from 'node-schedule-tz';
import {
  UsersService,
  TelegramService,
  UserDataService,
  ClientService,
  ActiveChannelsService,
  UpiIdService,
  Stat1Service,
  Stat2Service,
  PromoteStatService,
  ChannelsService,
  User,
  TelegramManager,
  CreateChannelDto,
  Channel,
  fetchWithTimeout,
  parseError,
  ppplbot,
  connectionManager,
} from 'common-tg-service';

export interface VideoDetails {
  videoId?: string;
  title?: string;
  duration?: number;
  [key: string]: any; // Allow additional properties while maintaining some type safety
}

interface UserAccessData {
  timestamps: number[];
  videoDetails: VideoDetails;
}

@Injectable()
export class AppService implements OnModuleInit, OnModuleDestroy {
  private userAccessData: Map<string, UserAccessData> = new Map();
  private cleanupInterval: NodeJS.Timeout;
  private joinChannelIntervalId: NodeJS.Timeout;
  private joinChannelMap: Map<string, Channel[]> = new Map();
  private refresTime: number = 0;

  constructor(
    private usersService: UsersService,
    private telegramService: TelegramService,
    private userDataService: UserDataService,
    private clientService: ClientService,
    private activeChannelsService: ActiveChannelsService,
    private upiIdService: UpiIdService,
    private statService: Stat1Service,
    private stat2Service: Stat2Service,
    private promoteStatService: PromoteStatService,
    private channelsService: ChannelsService,
  ) {
    console.log('App Module Constructor initiated !!');
  }
  onModuleInit() {
    console.log('App Module initiated !!');

    // Start the cleanup interval
    this.cleanupInterval = setInterval(
      () => this.cleanupOldAccessData(),
      15 * 60 * 1000,
    ); // Run every 15 minutes

    try {
      schedule.scheduleJob(
        'test3',
        '25 2,9,16 * * * ',
        'Asia/Kolkata',
        async () => {
          await fetchWithTimeout(
            `${ppplbot()}&text=ExecutingjoinchannelForClients-${process.env.clientId}`,
          );
          const now = new Date();
          if (now.getUTCDate() % 3 === 1) {
            this.leaveChannelsAll();
          } else {
            await this.joinchannelForClients();
          }
        },
      );

      // schedule.scheduleJob('test3', '0 * * * * ', 'Asia/Kolkata', async () => {
      //   await this.clientService.refreshMap();
      //   this.processUsers(400, 0);
      //   await this.statService.deleteAll();
      // })

      // schedule.scheduleJob('test3', '25 2,9 * * * ', 'Asia/Kolkata', async () => {
      //   const now = new Date();
      //   if (now.getUTCDate() % 3 === 1) {
      //     this.leaveChannelsAll()
      //   }
      //   await this.joinchannelForClients()
      // })

      // schedule.scheduleJob('test3', ' 25 0 * * * ', 'Asia/Kolkata', async () => {
      //   const now = new Date();
      //   if (now.getUTCDate() % 9 === 1) {
      //     setTimeout(async () => {
      //       await this.activeChannelsService.resetAvailableMsgs();
      //       await this.activeChannelsService.updateBannedChannels();
      //       await this.activeChannelsService.updateDefaultReactions();
      //     }, 30000);
      //   }

      //   await fetchWithTimeout(`${ppplbot()}&text=${encodeURIComponent(await this.getPromotionStatsPlain())}`);
      //   await this.userDataService.resetPaidUsers();
      //   await this.statService.deleteAll();
      //   await this.stat2Service.deleteAll();
      //   await this.promoteStatService.reinitPromoteStats();
      // })
      // this.checkPromotions();
      console.log('Added All Cron Jobs');
    } catch (error) {
      console.log('Some Error: ', error);
    }
  }
  async checkPromotions() {
    setInterval(async () => {
      const clients = await this.clientService.findAll();
      for (const client of clients) {
        const userPromoteStats = await this.promoteStatService.findByClient(
          client.clientId,
        );
        if (
          userPromoteStats?.isActive &&
          (Date.now() - userPromoteStats?.lastUpdatedTimeStamp) / (1000 * 60) >
            6
        ) {
          try {
            await fetchWithTimeout(`${client.repl}/promote`, {
              timeout: 120000,
            });
            console.log(client.clientId, ': Promote Triggered!!');
          } catch (error) {
            parseError(error, 'Promotion Check Err');
          }
        } else {
          console.log(
            client.clientId,
            ': ALL Good!! ---',
            Math.floor(
              (Date.now() - userPromoteStats?.lastUpdatedTimeStamp) /
                (1000 * 60),
            ),
          );
        }
      }
    }, 240000);
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
    await this.sendToAll('leavechannels');
  }

  async sendToAll(endpoint: string) {
    const clients = await this.clientService.findAll();
    for (const client of clients) {
      const url = `${client.repl}/${endpoint}`;
      console.log('Trying : ', url);
      fetchWithTimeout(url);
      await sleep(2000);
    }
  }

  public async exitPrimary() {
    const clients = await this.clientService.findAll();
    for (const client of clients) {
      if (client.clientId.toLowerCase().includes('1')) {
        await fetchWithTimeout(`${client.repl}/exit`);
        await sleep(40000);
      }
    }
  }

  public async exitSecondary() {
    const clients = await this.clientService.findAll();
    for (const client of clients) {
      if (client.clientId.toLowerCase().includes('2')) {
        await fetchWithTimeout(`${client.repl}/exit`);
        await sleep(40000);
      }
    }
  }

  public async refreshPrimary() {
    const clients = await this.clientService.findAll();
    for (const client of clients) {
      if (client.clientId.toLowerCase().includes('1')) {
        await fetchWithTimeout(`${client.repl}/exec/refresh`);
        await sleep(40000);
      }
    }
  }

  public async refreshSecondary() {
    const clients = await this.clientService.findAll();
    for (const client of clients) {
      if (client.clientId.toLowerCase().includes('2')) {
        await fetchWithTimeout(`${client.repl}/exec/refresh`);
        await sleep(40000);
      }
    }
  }

  async processUsers(limit?: number, skip?: number) {
    const users = await this.getUser(limit, skip);
    this.updateUsers(users);
    return 'Initiated Users Update';
  }

  async updateUsers(users: User[]) {
    for (const user of users) {
      try {
        const telegramClient = await connectionManager.getClient(user.mobile, {
          autoDisconnect: false,
          handler: false,
        });
        const lastActive = await telegramClient.getLastActiveTime();
        const me = await telegramClient.getMe();
        const selfMSgInfo = await telegramClient.getSelfMSgsInfo();
        const dialogs = await telegramClient.getDialogs({ limit: 500 });
        const contacts = <Api.contacts.Contacts>(
          await telegramClient.getContacts()
        );
        const callsInfo = await telegramClient.getCallLog();
        const recentUsers = await this.processChannels(dialogs, telegramClient);
        await this.usersService.update(user.tgId, {
          contacts: contacts.savedCount,
          calls:
            callsInfo?.totalCalls > 0
              ? callsInfo
              : {
                  chatCallCounts: [],
                  incoming: 0,
                  outgoing: 0,
                  totalCalls: 0,
                  video: 0,
                },
          firstName: me.firstName,
          lastName: me.lastName,
          username: me.username,
          msgs: selfMSgInfo.total,
          totalChats: dialogs.total,
          lastActive,
          tgId: me.id.toString(),
          recentUsers,
        });
        await connectionManager.unregisterClient(user.mobile);
      } catch (error) {
        parseError(error, 'UMS :: ');
      }
    }
  }

  async processChannels(
    dialogs: TotalList<Dialog>,
    telegramClient: TelegramManager,
  ) {
    const recentUsers = [];
    for (const chat of dialogs) {
      try {
        if (chat.isChannel || chat.isGroup) {
          const chatEntity = <Api.Channel>chat.entity;
          const cannotSendMsgs = chatEntity.defaultBannedRights?.sendMessages;
          if (
            !chatEntity.broadcast &&
            !cannotSendMsgs &&
            chatEntity.participantsCount > 50
          ) {
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
              username: chatEntity.username,
              forbidden: false,
            };
            this.channelsService.update(channel.channelId, channel);
          }
        } else {
          const msgs = await telegramClient.getMessages(chat.id);
          if (msgs.total > 1000) {
            for (const message of msgs) {
              let video = 0;
              let photo = 0;
              if (message.media instanceof Api.MessageMediaPhoto) {
                photo++;
              } else if (
                message.media instanceof Api.MessageMediaDocument &&
                (message.document?.mimeType?.startsWith('video') ||
                  message.document?.mimeType?.startsWith('image'))
              ) {
                video++;
              }
              recentUsers.push({
                total: msgs.total,
                video,
                photo,
                chatId: chat.id.toString(),
              });
            }
          }
        }
        return recentUsers;
      } catch (error) {
        parseError(error);
      }
    }
  }

  async getUser(limit?: number, skip?: number) {
    const currentDate = new Date();

    const weekAgoDate = new Date(currentDate);
    weekAgoDate.setDate(currentDate.getDate() - 7);

    const monthAgoDate = new Date(currentDate);
    monthAgoDate.setDate(currentDate.getDate() - 30);

    const threeMonthAgoDate = new Date(currentDate);
    threeMonthAgoDate.setDate(currentDate.getDate() - 90);

    const query = {
      expired: false,
      $or: [
        { createdAt: { $gt: monthAgoDate }, updatedAt: { $lt: weekAgoDate } },
        {
          createdAt: { $lte: monthAgoDate, $gt: threeMonthAgoDate },
          updatedAt: { $lt: monthAgoDate },
        },
        {
          createdAt: { $lte: threeMonthAgoDate },
          updatedAt: { $lte: threeMonthAgoDate },
        },
      ],
    };
    const users = await this.usersService.executeQuery(
      query,
      {},
      limit || 300,
      skip || 0,
    );
    return users;
  }
  getHello(): string {
    return 'Hello World!';
  }

  private cleanupOldAccessData(): void {
    const currentTime = Date.now();
    for (const [chatId, accessData] of this.userAccessData.entries()) {
      const recentAccessData = accessData.timestamps.filter(
        (timestamp) => currentTime - timestamp <= 15 * 60 * 1000,
      );

      if (recentAccessData.length === 0) {
        // No recent accesses, remove the entry completely
        this.userAccessData.delete(chatId);
      } else if (recentAccessData.length < accessData.timestamps.length) {
        // Update with only recent timestamps
        this.userAccessData.set(chatId, {
          timestamps: recentAccessData,
          videoDetails: accessData.videoDetails,
        });
      }
    }
  }

  async isRecentUser(
    chatId: string,
  ): Promise<{ count: number; videoDetails: VideoDetails }> {
    const accessData = this.userAccessData.get(chatId) || {
      timestamps: [],
      videoDetails: {},
    };
    const currentTime = Date.now();
    const recentAccessData = accessData.timestamps.filter(
      (timestamp) => currentTime - timestamp <= 15 * 60 * 1000,
    );
    recentAccessData.push(currentTime);

    this.userAccessData.set(chatId, {
      videoDetails: accessData.videoDetails,
      timestamps: recentAccessData, // Only store recent timestamps
    });

    const result = {
      count: recentAccessData.length,
      videoDetails: accessData.videoDetails,
    };
    console.log('Get', chatId, result);
    return result;
  }

  async updateRecentUser(
    chatId: string,
    videoDetails: VideoDetails,
  ): Promise<{ count: number; videoDetails: VideoDetails }> {
    const accessData = this.userAccessData.get(chatId) || {
      timestamps: [],
      videoDetails: {},
    };
    const updatedVideoDetails = { ...accessData.videoDetails, ...videoDetails };

    this.userAccessData.set(chatId, {
      videoDetails: updatedVideoDetails,
      timestamps: accessData.timestamps,
    });

    const result = {
      count: accessData.timestamps.length,
      videoDetails: updatedVideoDetails, // Return the updated video details
    };
    console.log('Update:', chatId, {
      videoDetails: updatedVideoDetails,
      timestamps: accessData.timestamps,
    });
    return result;
  }

  async resetRecentUser(chatId: string): Promise<{ count: number }> {
    this.userAccessData.delete(chatId);
    console.log('Deleted User Access Data for: ', chatId);
    return { count: 0 };
  }

  async getPaymentStats(chatId: string, profile: string) {
    const resp = {
      paid: 0,
      demoGiven: 0,
      secondShow: 0,
      fullShow: 0,
      latestCallTime: 0,
      videos: [],
    };
    const threeDaysAgo = Date.now() - 3 * 24 * 60 * 60 * 1000;
    const fiveDaysAgo = Date.now() - 5 * 24 * 60 * 60 * 1000;

    try {
      const query1 = {
        chatId,
        profile: { $exists: true, $ne: profile },
        payAmount: { $gte: 10 },
      };
      const query2 = { chatId, profile: { $exists: true, $ne: profile } };

      const document = await this.userDataService.executeQuery(query1);
      const document2 = await this.userDataService.executeQuery(query2);

      if (document.length > 0) {
        resp.paid = document.length;
      }

      if (document2.length > 0) {
        for (const doc of document2) {
          if (doc.callTime > threeDaysAgo) {
            if (doc.demoGiven) {
              resp.demoGiven++;
            }
            if (doc.secondShow) {
              resp.secondShow++;
            }
            if (doc.fullShow) {
              resp.fullShow++;
            }
            if (doc.callTime > resp.latestCallTime) {
              resp.latestCallTime = doc.callTime;
            }
            resp.videos.push(...doc.videos);
          } else {
            if (doc.lastMsgTimeStamp > fiveDaysAgo) {
              await this.userDataService.update(doc.profile, doc.chatId, {
                payAmount: 0,
                videos: [],
                demoGiven: false,
                secondShow: false,
                highestPayAmount: 0,
              });
            }
          }
        }
      }
    } catch (error) {
      parseError(error);
    }
    console.log(resp);
    return resp;
  }

  async sendToChannel(chatId: string, token: string, message: string) {
    function decodeIfEncoded(str: string): string {
      try {
        return str !== decodeURIComponent(str) ? decodeURIComponent(str) : str;
      } catch (e) {
        return str;
      }
    }
    function escapeMarkdownV2(text: string): string {
      text = text.replace(/([\\_`\[\]()~>`#+\-=|{}.!])/g, '\\$1');
      return text;
    }
    const decodedMessage = decodeIfEncoded(message);
    console.log('Message:', decodedMessage);
    const escapedMessage = escapeMarkdownV2(decodedMessage);
    const encodedMessage = encodeURIComponent(escapedMessage).replace(
      /%5Cn/g,
      '%0A',
    );
    const url = `${ppplbot(chatId, token)}&parse_mode=MarkdownV2&text=${encodedMessage}`;
    return (await fetchWithTimeout(url, {}, 0))?.data;
  }

  async findAllMasked(query: object) {
    return await this.clientService.findAllMasked();
  }
  async portalData(query: object) {
    const client = (await this.clientService.findAllMasked())[0];
    const upis = await this.upiIdService.findOne();
    return { client, upis };
  }
  async joinchannelForClients(): Promise<string> {
    console.log('Joining Channel Started');
    await sleep(2000);
    const clients = await this.clientService.findAll();
    clients.map(async (document) => {
      try {
        const resp = await fetchWithTimeout(
          `${document.repl}/channelinfo`,
          { timeout: 200000 },
          1,
        );
        await fetchWithTimeout(
          `${ppplbot()}&text=Channel SendTrue :: ${document.clientId}: ${resp.data.canSendTrueCount}`,
        );
        if (
          resp?.data?.canSendTrueCount &&
          resp?.data?.canSendTrueCount < 350
        ) {
          const result = await this.activeChannelsService.getActiveChannels(
            150,
            0,
            resp.data?.ids,
          );
          await fetchWithTimeout(
            `${ppplbot()}&text=Started Joining Channels for ${document.clientId}: ${result.length}`,
          );
          this.joinChannelMap.set(document.repl, result);
        }
      } catch (error) {
        parseError(error);
      }
    });
    this.joinChannelQueue();
    console.log('Joining Channel Triggered Succesfully for ', clients.length);
    return 'Initiated Joining channels';
  }

  async joinChannelQueue() {
    this.joinChannelIntervalId = setInterval(
      async () => {
        const keys = Array.from(this.joinChannelMap.keys());
        if (keys.length > 0) {
          console.log('In JOIN CHANNEL interval: ', new Date().toISOString());
          const promises = keys.map(async (url) => {
            const channels = this.joinChannelMap.get(url);
            if (channels && channels.length > 0) {
              const channel = channels.shift();
              console.log(url, ' Pending Channels :', channels.length);
              this.joinChannelMap.set(url, channels);
              try {
                await fetchWithTimeout(
                  `${url}/joinchannel?username=${channel.username}`,
                );
                console.log(url, ' Trying to join :', channel.username);
              } catch (error) {
                parseError(error, 'Outer Err: ');
              }
            } else {
              this.joinChannelMap.delete(url);
            }
          });
          await Promise.all(promises);
        } else {
          this.clearJoinChannelInterval();
        }
      },
      3 * 60 * 1000,
    );
  }

  clearJoinChannelInterval() {
    if (this.joinChannelIntervalId) {
      console.log('Cleared joinChannel Set Interval');
      clearInterval(this.joinChannelIntervalId);
      this.joinChannelIntervalId = null;
    }
  }

  async refreshmap() {
    await this.clientService.refreshMap();
    await this.clientService.checkNpoint();
  }

  async blockUserAll(chatId: string) {
    let profileData = '';
    const userDatas = await this.userDataService.search({ chatId });
    for (const userData of userDatas) {
      const profileRegex = new RegExp(userData.profile, 'i');
      const profiles = await this.clientService.executeQuery({
        clientId: { $regex: profileRegex },
      });
      for (const profile of profiles) {
        const url = `${profile.repl}/blockuser/${chatId}`;
        console.log('Executing: ', url);
        const result = await fetchWithTimeout(url);
        console.log(result.data);
      }
      profileData = profileData + ' | ' + userData.profile;
    }
    return profileData;
  }

  async unblockUserAll(chatId: string) {
    let profileData = '';
    const userDatas = await this.userDataService.search({ chatId });
    for (const userData of userDatas) {
      const profileRegex = new RegExp(userData.profile, 'i');
      const profiles = await this.clientService.executeQuery({
        clientId: { $regex: profileRegex },
      });
      for (const profile of profiles) {
        const url = `${profile.repl}/unblockuser/${chatId}`;
        console.log('Executing: ', url);
        const result = await fetchWithTimeout(url);
        console.log(result.data);
      }
      profileData = profileData + ' | ' + userData.profile;
    }
    return profileData;
  }

  async getRequestCall(username: string, chatId: string): Promise<any> {
    const user = (
      await this.clientService.search({ username: username.toLowerCase() })
    )[0];
    console.log(`Call Request Recived: ${username} | ${chatId}`);
    if (user) {
      const payload = { chatId, profile: user.clientId };
      const options = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        data: JSON.stringify(payload),
      };
      const result = await fetchWithTimeout(
        'https://arpithared.onrender.com/events/schedule',
        options,
        3,
      );
      console.log(result?.data);
    }
  }

  async getUserData(
    profile: string,
    clientId: string,
    chatId: string,
  ): Promise<any> {
    if (!profile) {
      profile = clientId?.replace(/\d/g, '');
    }
    return await this.userDataService.findOne(profile, chatId);
  }

  async updateUserData(
    profile: string,
    clientId: string,
    body: any,
  ): Promise<any> {
    if (!profile) {
      profile = clientId?.replace(/\d/g, '');
    }
    const chatId = body.chatId;
    return await this.userDataService.update(profile, chatId, body);
  }

  async updateUserConfig(
    chatId: string,
    profile: string,
    data: any,
  ): Promise<any> {
    this.userDataService.update(profile, chatId, data);
  }

  async getallupiIds() {
    return await this.upiIdService.findOne();
  }

  async getUserInfo(filter: any): Promise<any> {
    const client = <any>(await this.clientService.executeQuery(filter))[0];
    const result = { ...(client._doc ? client._doc : client) };
    delete result['session'];
    delete result['mobile'];
    delete result['deployKey'];
    delete result['promoteMobile'];
    return result;
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
          names: '',
          fullShowPPl: 0,
          fullShowNames: '',
        };
    }

    return initializedObject;
  }

  async getData(): Promise<string> {
    const profileData = await this.createInitializedObject();
    const stats = await this.statService.findAll();
    for (const stat of stats) {
      const {
        count,
        newUser,
        payAmount,
        demoGivenToday,
        demoGiven,
        client,
        name,
        secondShow,
      } = stat;

      if (client && profileData[client.toUpperCase()]) {
        const userData = profileData[client.toUpperCase()];
        userData.totalCount += count;
        userData.totalPaid += payAmount > 0 ? 1 : 0;
        userData.totalOldPaid += payAmount > 0 && !newUser ? 1 : 0;
        userData.oldPaidDemo += demoGivenToday && !newUser ? 1 : 0;
        userData.totalpendingDemos += payAmount > 25 && !demoGiven ? 1 : 0;
        userData.oldPendingDemos +=
          payAmount > 25 && !demoGiven && !newUser ? 1 : 0;
        if (payAmount > 25 && !demoGiven) {
          userData.names = userData.names + ` ${name} |`;
        }

        if (
          demoGiven &&
          ((payAmount > 90 && !secondShow) || (payAmount > 150 && secondShow))
        ) {
          userData.fullShowPPl++;
          userData.fullShowNames = userData.fullShowNames + ` ${name} |`;
        }

        if (newUser) {
          userData.totalNew += 1;
          userData.totalNewPaid += payAmount > 0 ? 1 : 0;
          userData.newPaidDemo += demoGivenToday ? 1 : 0;
          userData.newPendingDemos += payAmount > 25 && !demoGiven ? 1 : 0;
        }
      }
    }

    const profileDataArray = Object.entries(profileData);
    profileDataArray.sort(
      (a: any, b: any) => b[1].totalpendingDemos - a[1].totalpendingDemos,
    );
    let reply = '';
    for (const [profile, userData] of profileDataArray) {
      reply += `${profile.toUpperCase()} : <b>${(userData as any).totalpendingDemos}</b> | ${(userData as any).names}<br>`;
    }

    profileDataArray.sort(
      (a: any, b: any) => b[1].fullShowPPl - a[1].fullShowPPl,
    );
    let reply2 = '';
    for (const [profile, userData] of profileDataArray) {
      reply2 += `${profile.toUpperCase()} : <b>${(userData as any).fullShowPPl}</b> |${(userData as any).fullShowNames}<br>`;
    }

    const reply3 = await this.getPromotionStats();
    console.log(reply3);

    return `<div>
        <div style="display: flex; margin-bottom: 60px">
          <div style="flex: 1;">${reply} </div>
      < div style = "flex: 1; " > ${reply2} </div>
        </div>
        < div style = "display: flex;" >
          <div style="flex: 1; " > ${reply3} </div>
            </div>
            </div>`;
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
      this.refresTime = Date.now() + 5 * 60 * 1000;
      const clients = await this.clientService.findAll();
      for (const value of clients) {
        await fetchWithTimeout(`${value.repl}/markasread`);
        await sleep(3000);
      }
    }
  }

  onModuleDestroy() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
    if (this.joinChannelIntervalId) {
      clearInterval(this.joinChannelIntervalId);
    }
  }
}
