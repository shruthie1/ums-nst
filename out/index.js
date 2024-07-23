/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./src/app.controller.ts":
/*!*******************************!*\
  !*** ./src/app.controller.ts ***!
  \*******************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AppController = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const app_service_1 = __webpack_require__(/*! ./app.service */ "./src/app.service.ts");
const swagger_1 = __webpack_require__(/*! @nestjs/swagger */ "@nestjs/swagger");
const commonService_1 = __webpack_require__(/*! commonService */ "commonService");
let AppController = class AppController {
    constructor(appService) {
        this.appService = appService;
    }
    getHello() {
        return this.appService.getHello();
    }
    async processUsers(limit = 30, skip = 20) {
        return await this.appService.processUsers(limit, skip);
    }
    async blockUserAll(tgId) {
        return await this.appService.blockUserAll(tgId);
    }
    async isRecentUser(chatId) {
        return this.appService.isRecentUser(chatId);
    }
    async updateRecentUser(chatId, videoDetails) {
        await this.appService.updateRecentUser(chatId, videoDetails);
        return 'Ok';
    }
    async resetRecentUser(chatId) {
        return this.appService.resetRecentUser(chatId);
    }
    async getPaymentStats(chatId, profile) {
        return this.appService.getPaymentStats(chatId, profile);
    }
    async sendToChannel(message, chatId, token) {
        try {
            if (message.length < 1500) {
                return await this.appService.sendtoChannel(chatId, token, message);
            }
            else {
                console.log("Skipped Message:", decodeURIComponent(message));
                return 'sent';
            }
        }
        catch (e) {
            (0, commonService_1.parseError)(e);
        }
    }
    async sendToAll(query) {
        try {
            const decodedEndpoint = decodeURIComponent(query);
            this.appService.sendToAll(decodedEndpoint);
            return `Send ${query}`;
        }
        catch (e) {
            (0, commonService_1.parseError)(e);
            throw e;
        }
    }
    async joinChannelsforBufferClients() {
        return this.appService.joinchannelForClients();
    }
    async refreshmap() {
        return this.appService.refreshmap();
    }
    async maskedCls(query) {
        return await this.appService.findAllMasked(query);
    }
    async portalData(query) {
        return await this.appService.portalData(query);
    }
    async requestCall(username, chatId) {
        return await this.appService.getRequestCall(username, chatId);
    }
    async refreshPrimary() {
        this.appService.refreshPrimary();
        return '1';
    }
    async refreshSecondary() {
        this.appService.refreshSecondary();
        return '2';
    }
    async exitPrimary() {
        this.appService.exitPrimary();
        return '1';
    }
    async exitSecondary() {
        this.appService.exitSecondary();
        return '2';
    }
    exit() {
        process.exit(1);
    }
    async getVidData(profile, clientId, chatId) {
        return await this.appService.getUserData(profile, clientId, chatId);
    }
    async updateVidData(profile, clientId, body) {
        return await this.appService.updateUserData(profile, clientId, body);
    }
    async updtaeUserConfig(filter, data) {
        throw new Error("Method not implemented");
    }
    async getUserConfig(filter) {
        return await this.appService.getUserConfig(filter);
    }
    async getallupiIds() {
        return await this.appService.getallupiIds();
    }
    async updateUserConfig(chatId, profile, data) {
        return await this.appService.updateUserConfig(chatId, profile, data);
    }
    async getUserInfo(filter) {
        return await this.appService.getUserInfo(filter);
    }
    async getData(res) {
        this.appService.checkAndRefresh();
        res.setHeader('Content-Type', 'text/html');
        let resp = '<html><head></head><body>';
        resp += await this.appService.getData();
        resp += '</body></html>';
        resp += `<script>
                console.log("hi");
                setInterval(() => {
                  window.location.reload();
                }, 20000);
            </script>`;
        res.send(resp);
    }
};
exports.AppController = AppController;
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", String)
], AppController.prototype, "getHello", null);
__decorate([
    (0, common_1.Get)('processUsers/:limit/:skip'),
    __param(0, (0, common_1.Param)('limit')),
    __param(1, (0, common_1.Param)('skip')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number]),
    __metadata("design:returntype", Promise)
], AppController.prototype, "processUsers", null);
__decorate([
    (0, common_1.Get)('blockUserAll/:tgId'),
    __param(0, (0, common_1.Param)('tgId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AppController.prototype, "blockUserAll", null);
__decorate([
    (0, common_1.Get)('isRecentUser'),
    (0, swagger_1.ApiOperation)({ summary: 'Check if user is recent and return access data' }),
    (0, swagger_1.ApiParam)({ name: 'chatId', type: 'string', required: true }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Returns count of recent accesses and video details' }),
    __param(0, (0, common_1.Query)('chatId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AppController.prototype, "isRecentUser", null);
__decorate([
    (0, common_1.Post)('isRecentUser'),
    (0, swagger_1.ApiOperation)({ summary: 'Update recent user data' }),
    (0, swagger_1.ApiParam)({ name: 'chatId', type: 'string', required: true }),
    (0, swagger_1.ApiBody)({ type: Object, description: 'Video details to update', required: true }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Successfully updated recent user data' }),
    __param(0, (0, common_1.Query)('chatId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AppController.prototype, "updateRecentUser", null);
__decorate([
    (0, common_1.Get)('resetRecentUser'),
    (0, swagger_1.ApiOperation)({ summary: 'Reset recent user data' }),
    (0, swagger_1.ApiParam)({ name: 'chatId', type: 'string', required: true }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Returns count of recent accesses after reset' }),
    __param(0, (0, common_1.Query)('chatId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AppController.prototype, "resetRecentUser", null);
__decorate([
    (0, common_1.Get)('paymentStats'),
    __param(0, (0, common_1.Query)('chatId')),
    __param(1, (0, common_1.Query)('profile')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], AppController.prototype, "getPaymentStats", null);
__decorate([
    (0, common_1.Get)('sendToChannel'),
    (0, swagger_1.ApiOperation)({ summary: 'Send message to channel' }),
    (0, swagger_1.ApiQuery)({ name: 'msg', required: true, description: 'Message to send' }),
    (0, swagger_1.ApiQuery)({ name: 'chatId', required: false, description: 'Chat ID of the channel' }),
    (0, swagger_1.ApiQuery)({ name: 'token', required: false, description: 'Token for authentication' }),
    __param(0, (0, common_1.Query)('msg')),
    __param(1, (0, common_1.Query)('chatId')),
    __param(2, (0, common_1.Query)('token')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], AppController.prototype, "sendToChannel", null);
__decorate([
    (0, common_1.Get)('sendToAll'),
    (0, swagger_1.ApiOperation)({ summary: 'Send Enpoint to all clients' }),
    (0, swagger_1.ApiQuery)({ name: 'query', required: true, description: 'Endpoint to send' }),
    __param(0, (0, common_1.Query)('query')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AppController.prototype, "sendToAll", null);
__decorate([
    (0, common_1.Get)('joinChannelsForClients'),
    (0, swagger_1.ApiOperation)({ summary: 'Join Channels for Clients' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AppController.prototype, "joinChannelsforBufferClients", null);
__decorate([
    (0, common_1.Get)('refreshmap'),
    (0, swagger_1.ApiOperation)({ summary: 'refreshmap for Clients' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AppController.prototype, "refreshmap", null);
__decorate([
    (0, common_1.Get)('maskedCls'),
    (0, swagger_1.ApiOperation)({ summary: 'Cls Data' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AppController.prototype, "maskedCls", null);
__decorate([
    (0, common_1.Get)('portalData'),
    (0, swagger_1.ApiOperation)({ summary: 'Cls Data' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AppController.prototype, "portalData", null);
__decorate([
    (0, common_1.Get)('/requestcall'),
    (0, swagger_1.ApiOperation)({ summary: 'Request a call' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Call request processed successfully.' }),
    (0, swagger_1.ApiQuery)({ name: 'username', required: true, description: 'Username' }),
    (0, swagger_1.ApiQuery)({ name: 'chatId', required: true, description: 'Chat ID' }),
    __param(0, (0, common_1.Query)('username')),
    __param(1, (0, common_1.Query)('chatId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], AppController.prototype, "requestCall", null);
__decorate([
    (0, common_1.Get)('refreshPrimary'),
    (0, swagger_1.ApiOperation)({ summary: 'Exit primary clients' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'exit Call request processed successfully.' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AppController.prototype, "refreshPrimary", null);
__decorate([
    (0, common_1.Get)('refreshSecondary'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AppController.prototype, "refreshSecondary", null);
__decorate([
    (0, common_1.Get)('exitPrimary'),
    (0, swagger_1.ApiOperation)({ summary: 'Exit primary clients' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'exit Call request processed successfully.' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AppController.prototype, "exitPrimary", null);
__decorate([
    (0, common_1.Get)('exitSecondary'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AppController.prototype, "exitSecondary", null);
__decorate([
    (0, common_1.Get)("exit"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", String)
], AppController.prototype, "exit", null);
__decorate([
    (0, common_1.Get)('/getviddata'),
    (0, swagger_1.ApiOperation)({ summary: 'Get video data' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Video data retrieved successfully.' }),
    (0, swagger_1.ApiQuery)({ name: 'profile', required: false, description: 'Profile' }),
    (0, swagger_1.ApiQuery)({ name: 'clientId', required: false, description: 'clientId' }),
    (0, swagger_1.ApiQuery)({ name: 'chatId', required: true, description: 'chatId' }),
    __param(0, (0, common_1.Query)('profile')),
    __param(1, (0, common_1.Query)('clientId')),
    __param(2, (0, common_1.Query)('chatId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], AppController.prototype, "getVidData", null);
__decorate([
    (0, common_1.Post)('/getviddata'),
    (0, swagger_1.ApiOperation)({ summary: 'Get video data' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Video data retrieved successfully.' }),
    (0, swagger_1.ApiQuery)({ name: 'profile', required: false, description: 'Profile' }),
    (0, swagger_1.ApiQuery)({ name: 'clientId', required: false, description: 'clientId' }),
    (0, swagger_1.ApiBody)({ description: 'Body data', required: true, type: Object }),
    __param(0, (0, common_1.Query)('profile')),
    __param(1, (0, common_1.Query)('clientId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], AppController.prototype, "updateVidData", null);
__decorate([
    (0, common_1.Post)('/getUserConfig'),
    (0, swagger_1.ApiOperation)({ summary: 'Get user configuration' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'User configuration updated successfully.' }),
    (0, swagger_1.ApiBody)({ description: 'Configuration data', required: true, type: Object }),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AppController.prototype, "updtaeUserConfig", null);
__decorate([
    (0, common_1.Get)('/getUserConfig'),
    (0, swagger_1.ApiOperation)({ summary: 'Get user configuration' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'User configuration retrieved successfully.' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AppController.prototype, "getUserConfig", null);
__decorate([
    (0, common_1.Get)('/getallupiIds'),
    (0, swagger_1.ApiOperation)({ summary: 'Get all UpiIDs' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'All upi Ids retrieved successfully.' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AppController.prototype, "getallupiIds", null);
__decorate([
    (0, common_1.Post)('/updateUserData/:chatId'),
    (0, swagger_1.ApiOperation)({ summary: 'Get user configuration' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'User configuration updated successfully.' }),
    (0, swagger_1.ApiQuery)({ name: 'profile', required: false, description: 'Profile' }),
    (0, swagger_1.ApiBody)({ description: 'user data', required: true, type: Object }),
    __param(0, (0, common_1.Param)('chatId')),
    __param(1, (0, common_1.Query)('profile')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], AppController.prototype, "updateUserConfig", null);
__decorate([
    (0, common_1.Get)('/getUserInfo'),
    (0, swagger_1.ApiOperation)({ summary: 'Get user information' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'User information retrieved successfully.' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AppController.prototype, "getUserInfo", null);
__decorate([
    (0, common_1.Get)('getdata'),
    (0, swagger_1.ApiOperation)({ summary: 'Get data and refresh periodically' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Successful operation' }),
    __param(0, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AppController.prototype, "getData", null);
exports.AppController = AppController = __decorate([
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [app_service_1.AppService])
], AppController);


/***/ }),

/***/ "./src/app.module.ts":
/*!***************************!*\
  !*** ./src/app.module.ts ***!
  \***************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AppModule = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const app_controller_1 = __webpack_require__(/*! ./app.controller */ "./src/app.controller.ts");
const app_service_1 = __webpack_require__(/*! ./app.service */ "./src/app.service.ts");
const commonService_1 = __webpack_require__(/*! commonService */ "commonService");
let AppModule = class AppModule {
    configure(consumer) {
        consumer.apply(commonService_1.LoggerMiddleware).forRoutes('*');
    }
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            commonService_1.BuildModule, commonService_1.UsersModule, commonService_1.TelegramModule,
            commonService_1.UserDataModule, commonService_1.ClientModule,
            commonService_1.ActiveChannelsModule, commonService_1.UpiIdModule,
            commonService_1.StatModule, commonService_1.Stat2Module, commonService_1.PromoteStatModule,
            commonService_1.ChannelsModule
        ],
        controllers: [app_controller_1.AppController],
        providers: [app_service_1.AppService],
    })
], AppModule);


/***/ }),

/***/ "./src/app.service.ts":
/*!****************************!*\
  !*** ./src/app.service.ts ***!
  \****************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AppService = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const commonService_1 = __webpack_require__(/*! commonService */ "commonService");
let AppService = class AppService {
    constructor(usersService, telegramService, userDataService, clientService, activeChannelsService, upiIdService, statService, stat2Service, promoteStatService, channelsService) {
        this.usersService = usersService;
        this.telegramService = telegramService;
        this.userDataService = userDataService;
        this.clientService = clientService;
        this.activeChannelsService = activeChannelsService;
        this.upiIdService = upiIdService;
        this.statService = statService;
        this.stat2Service = stat2Service;
        this.promoteStatService = promoteStatService;
        this.channelsService = channelsService;
        this.userAccessData = new Map();
        this.joinChannelMap = new Map();
        this.refresTime = 0;
        console.log("App Module Constructor initiated !!");
    }
    onModuleInit() {
        console.log("App Module initiated !!");
        try {
            this.checkPromotions();
            console.log("Added All Cron Jobs");
        }
        catch (error) {
            console.log("Some Error: ", error);
        }
    }
    async checkPromotions() {
        setInterval(async () => {
            const clients = await this.clientService.findAll();
            for (const client of clients) {
                const userPromoteStats = await this.promoteStatService.findByClient(client.clientId);
                if (userPromoteStats?.isActive && (Date.now() - userPromoteStats?.lastUpdatedTimeStamp) / (1000 * 60) > 6) {
                    try {
                        await (0, commonService_1.fetchWithTimeout)(`${client.repl}/promote`, { timeout: 120000 });
                        console.log(client.clientId, ": Promote Triggered!!");
                    }
                    catch (error) {
                        (0, commonService_1.parseError)(error, "Promotion Check Err");
                    }
                }
                else {
                    console.log(client.clientId, ": ALL Good!! ---", Math.floor((Date.now() - userPromoteStats?.lastUpdatedTimeStamp) / (1000 * 60)));
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
    async sendToAll(endpoint) {
        const clients = await this.clientService.findAll();
        for (const client of clients) {
            const url = `${client.repl}/${endpoint}`;
            console.log("Trying : ", url);
            (0, commonService_1.fetchWithTimeout)(url);
            await (0, commonService_1.sleep)(2000);
        }
    }
    async exitPrimary() {
        const clients = await this.clientService.findAll();
        for (const client of clients) {
            if (client.clientId.toLowerCase().includes('1')) {
                await (0, commonService_1.fetchWithTimeout)(`${client.repl}/exit`);
                await (0, commonService_1.sleep)(40000);
            }
        }
    }
    async exitSecondary() {
        const clients = await this.clientService.findAll();
        for (const client of clients) {
            if (client.clientId.toLowerCase().includes('2')) {
                await (0, commonService_1.fetchWithTimeout)(`${client.repl}/exit`);
                await (0, commonService_1.sleep)(40000);
            }
        }
    }
    async refreshPrimary() {
        const clients = await this.clientService.findAll();
        for (const client of clients) {
            if (client.clientId.toLowerCase().includes('1')) {
                await (0, commonService_1.fetchWithTimeout)(`${client.repl}/exec/refresh`);
                await (0, commonService_1.sleep)(40000);
            }
        }
    }
    async refreshSecondary() {
        const clients = await this.clientService.findAll();
        for (const client of clients) {
            if (client.clientId.toLowerCase().includes('2')) {
                await (0, commonService_1.fetchWithTimeout)(`${client.repl}/exec/refresh`);
                await (0, commonService_1.sleep)(40000);
            }
        }
    }
    async processUsers(limit, skip) {
        const users = await this.getUser(limit, skip);
        this.updateUsers(users);
        return "Initiated Users Update";
    }
    async updateUsers(users) {
        for (const user of users) {
            try {
                const telegramClient = await this.telegramService.createClient(user.mobile, false, false);
                const lastActive = await telegramClient.getLastActiveTime();
                const me = await telegramClient.getMe();
                const selfMSgInfo = await telegramClient.getSelfMSgsInfo();
                const dialogs = await telegramClient.getDialogs({ limit: 500 });
                const contacts = await telegramClient.getContacts();
                const callsInfo = await telegramClient.getCallLog();
                await this.usersService.update(user.tgId, {
                    contacts: contacts.savedCount,
                    calls: callsInfo?.totalCalls > 0 ? callsInfo : { chatCallCounts: [], incoming: 0, outgoing: 0, totalCalls: 0, video: 0 },
                    firstName: me.firstName,
                    lastName: me.lastName, username: me.username, msgs: selfMSgInfo.total, totalChats: dialogs.total,
                    lastActive, tgId: me.id.toString()
                });
                this.processChannels(dialogs);
                await this.telegramService.deleteClient(user.mobile);
            }
            catch (error) {
                (0, commonService_1.parseError)(error, "UMS :: ");
            }
        }
    }
    async processChannels(dialogs) {
        for (const chat of dialogs) {
            try {
                if (chat.isChannel || chat.isGroup) {
                    const chatEntity = chat.entity;
                    const cannotSendMsgs = chatEntity.defaultBannedRights?.sendMessages;
                    if (!chatEntity.broadcast && !cannotSendMsgs && chatEntity.participantsCount > 50) {
                        const channel = {
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
                        };
                        this.channelsService.update(channel.channelId, channel);
                    }
                }
            }
            catch (error) {
                (0, commonService_1.parseError)(error);
            }
        }
    }
    async getUser(limit, skip) {
        var currentDate = new Date();
        var weekAgoDate = new Date(currentDate);
        weekAgoDate.setDate(currentDate.getDate() - 7);
        var monthAgoDate = new Date(currentDate);
        monthAgoDate.setDate(currentDate.getDate() - 30);
        var query = {
            $or: [
                { createdAt: { $gt: monthAgoDate }, updatedAt: { $lt: weekAgoDate } },
                { createdAt: { $lte: monthAgoDate }, updatedAt: { $lt: monthAgoDate } }
            ]
        };
        const users = await this.usersService.executeQuery(query, {}, limit || 300, skip || 0);
        return users;
    }
    getHello() {
        return 'Hello World!';
    }
    async isRecentUser(chatId) {
        const accessData = this.userAccessData.get(chatId) || { timestamps: [], videoDetails: {} };
        const currentTime = Date.now();
        const recentAccessData = accessData.timestamps.filter(timestamp => currentTime - timestamp <= 15 * 60 * 1000);
        recentAccessData.push(currentTime);
        this.userAccessData.set(chatId, { videoDetails: accessData.videoDetails, timestamps: recentAccessData });
        const result = { count: recentAccessData.length, videoDetails: accessData.videoDetails };
        console.log(result);
        return result;
    }
    async updateRecentUser(chatId, videoDetails) {
        const accessData = this.userAccessData.get(chatId) || { timestamps: [], videoDetails: {} };
        const updatedVideoDetails = { ...accessData.videoDetails, ...videoDetails };
        console.log({ videoDetails: updatedVideoDetails, timestamps: accessData.timestamps });
        this.userAccessData.set(chatId, { videoDetails: updatedVideoDetails, timestamps: accessData.timestamps });
    }
    async resetRecentUser(chatId) {
        this.userAccessData.delete(chatId);
        return { count: 0 };
    }
    async getPaymentStats(chatId, profile) {
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
        }
        catch (error) {
            (0, commonService_1.parseError)(error);
        }
        console.log(resp);
        return resp;
    }
    async sendtoChannel(chatId, token, message) {
        function isEncoded(str) {
            try {
                return str !== decodeURIComponent(str);
            }
            catch (e) {
                return false;
            }
        }
        const encodedMessage = isEncoded(message) ? message : encodeURIComponent(message);
        console.log(decodeURIComponent(encodedMessage));
        const url = `${(0, commonService_1.ppplbot)(chatId, token)}&text=${encodedMessage}`;
        try {
            await (0, commonService_1.fetchWithTimeout)(url, {}, 0);
            return "sent";
        }
        catch (e) {
            (0, commonService_1.parseError)(e);
        }
    }
    async findAllMasked(query) {
        return await this.clientService.findAllMasked(query);
    }
    async portalData(query) {
        const client = (await this.clientService.findAllMasked(query))[0];
        const upis = await this.upiIdService.findOne();
        return { client, upis };
    }
    async joinchannelForClients() {
        console.log("Joining Channel Started");
        await this.telegramService.disconnectAll();
        await (0, commonService_1.sleep)(2000);
        const clients = await this.clientService.findAll();
        clients.map(async (document) => {
            try {
                let resp = await (0, commonService_1.fetchWithTimeout)(`${document.repl}/channelinfo`, { timeout: 200000 });
                await (0, commonService_1.fetchWithTimeout)(`${((0, commonService_1.ppplbot)())}&text=Channel SendTrue :: ${document.clientId}: ${resp.data.canSendTrueCount}`);
                if (resp?.data?.canSendTrueCount && resp?.data?.canSendTrueCount < 300) {
                    const keys = ['wife', 'adult', 'lanj', 'lesb', 'paid', 'coupl', 'cpl', 'randi', 'bhab', 'boy', 'girl', 'friend', 'frnd', 'boob', 'pussy', 'dating', 'swap', 'gay', 'sex', 'bitch', 'love', 'video', 'service', 'real', 'call', 'desi'];
                    const result = await this.activeChannelsService.getActiveChannels(150, 0, keys, resp.data?.ids);
                    await (0, commonService_1.fetchWithTimeout)(`${((0, commonService_1.ppplbot)())}&text=Started Joining Channels for ${document.clientId}: ${result.length}`);
                    this.joinChannelMap.set(document.repl, result);
                }
            }
            catch (error) {
                (0, commonService_1.parseError)(error);
            }
        });
        this.joinChannelQueue();
        console.log("Joining Channel Triggered Succesfully for ", clients.length);
        return "Initiated Joining channels";
    }
    async joinChannelQueue() {
        this.joinChannelIntervalId = setInterval(async () => {
            const keys = Array.from(this.joinChannelMap.keys());
            if (keys.length > 0) {
                console.log("In JOIN CHANNEL interval: ", new Date().toISOString());
                const promises = keys.map(async (url) => {
                    const channels = this.joinChannelMap.get(url);
                    if (channels && channels.length > 0) {
                        const channel = channels.shift();
                        console.log(url, " Pending Channels :", channels.length);
                        this.joinChannelMap.set(url, channels);
                        try {
                            await (0, commonService_1.fetchWithTimeout)(`${url}/joinchannel?username=${channel.username}`);
                            console.log(url, " Trying to join :", channel.username);
                        }
                        catch (error) {
                            (0, commonService_1.parseError)(error, "Outer Err: ");
                        }
                    }
                    else {
                        this.joinChannelMap.delete(url);
                    }
                });
                await Promise.all(promises);
            }
            else {
                this.clearJoinChannelInterval();
            }
        }, 3 * 60 * 1000);
    }
    clearJoinChannelInterval() {
        if (this.joinChannelIntervalId) {
            console.log("Cleared joinChannel Set Interval");
            clearInterval(this.joinChannelIntervalId);
            this.joinChannelIntervalId = null;
        }
    }
    refreshmap() {
        this.clientService.refreshMap();
    }
    async blockUserAll(tgId) {
        return await this.userDataService.updateAll(tgId, { canReply: 0, payAmount: 0 });
    }
    async getRequestCall(username, chatId) {
        const user = (await this.clientService.search({ username: username.toLowerCase() }))[0];
        console.log(`Call Request Recived: ${username} | ${chatId}`);
        if (user) {
            const payload = { chatId, profile: user.clientId };
            const options = {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                data: JSON.stringify(payload),
            };
            const result = await (0, commonService_1.fetchWithTimeout)("https://arpithared.onrender.com/events/schedule", options, 3);
            console.log(result?.data);
        }
    }
    async getUserData(profile, clientId, chatId) {
        if (!profile) {
            profile = clientId?.replace(/\d/g, '');
        }
        return await this.userDataService.findOne(profile, chatId);
    }
    async updateUserData(profile, clientId, body) {
        if (!profile) {
            profile = clientId?.replace(/\d/g, '');
        }
        const chatId = body.chatId;
        return await this.userDataService.update(profile, chatId, body);
    }
    async updateUserConfig(chatId, profile, data) {
        this.userDataService.update(profile, chatId, data);
    }
    async getUserConfig(filter) {
    }
    async getallupiIds() {
        return await this.upiIdService.findOne();
    }
    async getUserInfo(filter) {
        const client = (await this.clientService.executeQuery(filter))[0];
        const result = { ...(client._doc ? client._doc : client) };
        delete result['session'];
        delete result['mobile'];
        delete result['deployKey'];
        return result;
    }
    extractNumberFromString(inputString) {
        const regexPattern = /\d+/;
        const matchResult = inputString?.match(regexPattern);
        if (matchResult && matchResult.length > 0) {
            return parseInt(matchResult[0], 10);
        }
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
                };
        }
        return initializedObject;
    }
    async getData() {
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
        profileDataArray.sort((a, b) => b[1].totalpendingDemos - a[1].totalpendingDemos);
        let reply = '';
        for (const [profile, userData] of profileDataArray) {
            reply += `${profile.toUpperCase()} : <b>${userData.totalpendingDemos}</b> | ${userData.names}<br>`;
        }
        profileDataArray.sort((a, b) => b[1].fullShowPPl - a[1].fullShowPPl);
        let reply2 = '';
        for (const [profile, userData] of profileDataArray) {
            reply2 += `${profile.toUpperCase()} : <b>${userData.fullShowPPl}</b> |${userData.fullShowNames}<br>`;
        }
        const reply3 = await this.getPromotionStats();
        console.log(reply3);
        return (`<div>
        <div style="display: flex; margin-bottom: 60px">
          <div style="flex: 1;">${reply}</div>
          <div style="flex: 1; ">${reply2}</div>
        </div>
        <div style="display: flex;">
          <div style="flex: 1; " >${reply3}</div>
        </div>
      </div>`);
    }
    async getPromotionStats() {
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
            const clients = await this.clientService.findAll();
            for (const value of clients) {
                await (0, commonService_1.fetchWithTimeout)(`${value.repl}/markasread`);
                await (0, commonService_1.sleep)(3000);
            }
        }
    }
};
exports.AppService = AppService;
exports.AppService = AppService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [commonService_1.UsersService,
        commonService_1.TelegramService,
        commonService_1.UserDataService,
        commonService_1.ClientService,
        commonService_1.ActiveChannelsService,
        commonService_1.UpiIdService,
        commonService_1.StatService,
        commonService_1.Stat2Service,
        commonService_1.PromoteStatService,
        commonService_1.ChannelsService])
], AppService);


/***/ }),

/***/ "@nestjs/common":
/*!*********************************!*\
  !*** external "@nestjs/common" ***!
  \*********************************/
/***/ ((module) => {

module.exports = require("@nestjs/common");

/***/ }),

/***/ "@nestjs/core":
/*!*******************************!*\
  !*** external "@nestjs/core" ***!
  \*******************************/
/***/ ((module) => {

module.exports = require("@nestjs/core");

/***/ }),

/***/ "@nestjs/swagger":
/*!**********************************!*\
  !*** external "@nestjs/swagger" ***!
  \**********************************/
/***/ ((module) => {

module.exports = require("@nestjs/swagger");

/***/ }),

/***/ "commonService":
/*!********************************!*\
  !*** external "commonService" ***!
  \********************************/
/***/ ((module) => {

module.exports = require("commonService");

/***/ }),

/***/ "mongoose":
/*!***************************!*\
  !*** external "mongoose" ***!
  \***************************/
/***/ ((module) => {

module.exports = require("mongoose");

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it uses a non-standard name for the exports (exports).
(() => {
var exports = __webpack_exports__;
/*!*********************!*\
  !*** ./src/main.ts ***!
  \*********************/

Object.defineProperty(exports, "__esModule", ({ value: true }));
const core_1 = __webpack_require__(/*! @nestjs/core */ "@nestjs/core");
const mongoose_1 = __webpack_require__(/*! mongoose */ "mongoose");
const app_module_1 = __webpack_require__(/*! ./app.module */ "./src/app.module.ts");
const swagger_1 = __webpack_require__(/*! @nestjs/swagger */ "@nestjs/swagger");
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.use((req, res, next) => {
        res.header('Access-Control-Allow-Origin', '*');
        res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
        res.header('Access-Control-Allow-Headers', 'Content-Type, Accept');
        next();
    });
    app.enableCors({
        allowedHeaders: "*",
        origin: "*"
    });
    app.useGlobalPipes(new common_1.ValidationPipe({
        transform: true,
    }));
    const config = new swagger_1.DocumentBuilder()
        .setTitle('NestJS and Express API')
        .setDescription('API documentation')
        .setVersion('1.0')
        .build();
    const document = swagger_1.SwaggerModule.createDocument(app, config);
    swagger_1.SwaggerModule.setup('api', app, document);
    mongoose_1.default.set('debug', true);
    process.on('unhandledRejection', (reason, promise) => {
        console.error('Unhandled Rejection at:', promise, 'reason:', reason);
    });
    process.on('uncaughtException', (reason, promise) => {
        console.error(promise, reason);
    });
    let isShuttingDown = false;
    const shutdown = async (signal) => {
        if (isShuttingDown)
            return;
        isShuttingDown = true;
        console.log(`${signal} received`);
        await app.close();
        process.exit(0);
    };
    process.on('exit', async () => {
        console.log('Application closed');
    });
    process.on('SIGINT', async () => {
        await shutdown('SIGINT');
    });
    process.on('SIGTERM', async () => {
        await shutdown('SIGTERM');
    });
    process.on('SIGQUIT', async () => {
        await shutdown('SIGQUIT');
    });
    await app.init();
    await app.listen(process.env.PORT || 9000);
}
bootstrap();

})();

var __webpack_export_target__ = exports;
for(var i in __webpack_exports__) __webpack_export_target__[i] = __webpack_exports__[i];
if(__webpack_exports__.__esModule) Object.defineProperty(__webpack_export_target__, "__esModule", { value: true });
/******/ })()
;
//# sourceMappingURL=index.js.map