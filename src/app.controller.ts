/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Res,
  UseInterceptors,
} from '@nestjs/common';
import { AppService } from './app.service';
import {
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Response } from 'express';
import { CloudflareCacheInterceptor, NoCache, parseError } from 'common-tg-service';

@ApiTags('App Controller')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) { }

  @Get(['', '/health'])
  @ApiOperation({ summary: 'Get health check or welcome message' })
  @ApiResponse({ description: 'Returns a welcome or health check message' })
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('processUsers/:limit/:skip')
  @ApiOperation({ summary: 'Process users with pagination' })
  @ApiParam({ name: 'limit', description: 'Number of users to process', type: Number })
  @ApiParam({ name: 'skip', description: 'Number of users to skip', type: Number })
  @ApiResponse({ description: 'Returns processed users data' })
  async processUsers(
    @Param('limit') limit: number = 30,
    @Param('skip') skip: number = 20,
  ) {
    return await this.appService.processUsers(limit, skip);
  }

  @Get('blockUserAll/:tgId')
  @ApiOperation({ summary: 'Block user across all services' })
  @ApiParam({ name: 'tgId', description: 'Telegram ID of the user', type: String })
  @ApiResponse({ description: 'Returns result of blocking user' })
  async blockUserAll(@Param('tgId') tgId: string) {
    return await this.appService.blockUserAll(tgId);
  }

  @Get('isRecentUser')
  @UseInterceptors(CloudflareCacheInterceptor)
  @NoCache()
  @ApiOperation({ summary: 'Check if user is recent and return access data' })
  @ApiQuery({ name: 'chatId', description: 'Chat ID of the user', type: String, required: true })
  @ApiResponse({ description: 'Returns count of recent accesses and video details' })
  async isRecentUser(@Query('chatId') chatId: string) {
    return this.appService.isRecentUser(chatId);
  }

  @Post('isRecentUser')
  @ApiOperation({ summary: 'Update recent user data' })
  @ApiQuery({ name: 'chatId', description: 'Chat ID of the user', type: String, required: true })
  @ApiBody({ description: 'Video details to update', type: Object })
  @ApiResponse({ description: 'Successfully updated recent user data' })
  async updateRecentUser(
    @Query('chatId') chatId: string,
    @Body() videoDetails: any,
  ) {
    return await this.appService.updateRecentUser(chatId, videoDetails);
  }

  @Get('resetRecentUser')
  @UseInterceptors(CloudflareCacheInterceptor)
  @NoCache()
  @ApiOperation({ summary: 'Reset recent user data' })
  @ApiQuery({ name: 'chatId', description: 'Chat ID of the user', type: String, required: true })
  @ApiResponse({ description: 'Returns count of recent accesses after reset' })
  async resetRecentUser(@Query('chatId') chatId: string) {
    return this.appService.resetRecentUser(chatId);
  }

  @Get('paymentStats')
  @UseInterceptors(CloudflareCacheInterceptor)
  @NoCache()
  @ApiOperation({ summary: 'Get payment statistics' })
  @ApiQuery({ name: 'chatId', description: 'Chat ID of the user', type: String })
  @ApiQuery({ name: 'profile', description: 'Profile identifier', type: String })
  @ApiResponse({ description: 'Returns payment statistics' })
  async getPaymentStats(
    @Query('chatId') chatId: string,
    @Query('profile') profile: string,
  ) {
    return this.appService.getPaymentStats(chatId, profile);
  }

  @Get('sendToAll')
  @ApiOperation({ summary: 'Send endpoint to all clients' })
  @ApiQuery({ name: 'query', description: 'Endpoint to send', type: String, required: true })
  @ApiResponse({ description: 'Returns confirmation of endpoint sent' })
  async sendToAll(@Query('query') query: string) {
    try {
      const decodedEndpoint = decodeURIComponent(query);
      this.appService.sendToAll(decodedEndpoint);
      return `Send ${query}`;
    } catch (e) {
      parseError(e);
      throw e;
    }
  }

  @Get('joinChannelsForClients')
  @ApiOperation({ summary: 'Join channels for clients' })
  @ApiResponse({ description: 'Returns result of joining channels for clients' })
  async joinChannelsforBufferClients(): Promise<string> {
    return this.appService.joinchannelForClients();
  }

  @Get('refreshmap')
  @ApiOperation({ summary: 'Refresh map for clients' })
  @ApiResponse({ description: 'Returns result of refreshing map' })
  async refreshmap(): Promise<void> {
    return await this.appService.refreshmap();
  }

  @Get('maskedCls')
  @UseInterceptors(CloudflareCacheInterceptor)
  @NoCache()
  @ApiOperation({ summary: 'Retrieve masked CLS data' })
  @ApiQuery({ name: 'query', description: 'Query parameters', type: Object })
  @ApiResponse({ description: 'Returns masked CLS data' })
  async maskedCls(@Query() query: object): Promise<any> {
    return await this.appService.findAllMasked(query);
  }

  @Get('portalData')
  @ApiOperation({ summary: 'Retrieve portal data' })
  @ApiQuery({ name: 'query', description: 'Query parameters', type: Object })
  @ApiResponse({ description: 'Returns portal data including client and UPIs' })
  async portalData(
    @Query() query: object,
  ): Promise<{ client: any; upis: object }> {
    return await this.appService.portalData(query);
  }

  @Get('/requestcall')
  @ApiOperation({ summary: 'Request a call' })
  @ApiQuery({ name: 'username', description: 'Username', type: String, required: true })
  @ApiQuery({ name: 'chatId', description: 'Chat ID', type: String, required: true })
  @ApiResponse({ description: 'Call request processed successfully' })
  async requestCall(
    @Query('username') username: string,
    @Query('chatId') chatId: string,
  ) {
    return await this.appService.getRequestCall(username, chatId);
  }

  @Get('refreshPrimary')
  @ApiOperation({ summary: 'Refresh primary clients' })
  @ApiResponse({ description: 'Returns confirmation of primary clients refresh' })
  async refreshPrimary() {
    this.appService.refreshPrimary();
    return '1';
  }

  @Get('refreshSecondary')
  @ApiOperation({ summary: 'Refresh secondary clients' })
  @ApiResponse({ description: 'Returns confirmation of secondary clients refresh' })
  async refreshSecondary() {
    this.appService.refreshSecondary();
    return '2';
  }

  @Get('exitPrimary')
  @ApiOperation({ summary: 'Exit primary clients' })
  @ApiResponse({ description: 'Returns confirmation of exiting primary clients' })
  async exitPrimary() {
    this.appService.exitPrimary();
    return '1';
  }

  @Get('exitSecondary')
  @ApiOperation({ summary: 'Exit secondary clients' })
  @ApiResponse({ description: 'Returns confirmation of exiting secondary clients' })
  async exitSecondary() {
    this.appService.exitSecondary();
    return '2';
  }

  @Get('exit')
  @ApiOperation({ summary: 'Exit the application' })
  @ApiResponse({ description: 'Returns confirmation of application exit' })
  exit(): string {
    console.log('Exit request received');
    setTimeout(() => {
      console.log('Exiting application...');
      process.exit(0);
    }, 2000);
    return 'Exiting application... in 2 seconds';
  }

  @Get('/getviddata')
  @ApiOperation({ summary: 'Get video data' })
  @ApiQuery({ name: 'profile', description: 'Profile', type: String, required: false })
  @ApiQuery({ name: 'clientId', description: 'Client ID', type: String, required: false })
  @ApiQuery({ name: 'chatId', description: 'Chat ID', type: String, required: true })
  @ApiResponse({ description: 'Video data retrieved successfully' })
  async getVidData(
    @Query('profile') profile: string,
    @Query('clientId') clientId: string,
    @Query('chatId') chatId: any,
  ) {
    return await this.appService.getUserData(profile, clientId, chatId);
  }

  @Post('/getviddata')
  @ApiOperation({ summary: 'Update video data' })
  @ApiQuery({ name: 'profile', description: 'Profile', type: String, required: false })
  @ApiQuery({ name: 'clientId', description: 'Client ID', type: String, required: false })
  @ApiBody({ description: 'Body data', type: Object })
  @ApiResponse({ description: 'Video data updated successfully' })
  async updateVidData(
    @Query('profile') profile: string,
    @Query('clientId') clientId: string,
    @Body() body: any,
  ) {
    return await this.appService.updateUserData(profile, clientId, body);
  }

  @Post('/getUserConfig')
  @ApiOperation({ summary: 'Update user configuration' })
  @ApiQuery({ name: 'filter', description: 'Filter parameters', type: Object })
  @ApiBody({ description: 'Configuration data', type: Object })
  @ApiResponse({ description: 'User configuration updated successfully' })
  async updtaeUserConfig(@Query() filter: any, @Body() data: any) {
    throw new Error('Method not implemented');
    // return await this.appService.updateUserConfig(filter, data);
  }

  @Get('/getUserConfig')
  @ApiOperation({ summary: 'Get user configuration' })
  @ApiResponse({ status: 200, description: 'User configuration retrieved successfully.' })
  async getUserConfig(@Query() filter: any) {
    return await this.appService.getUserConfig(filter);
  }

  @Get('/getallupiIds')
  @ApiOperation({ summary: 'Get all UPI IDs' })
  @ApiResponse({ description: 'All UPI IDs retrieved successfully' })
  async getallupiIds() {
    return await this.appService.getallupiIds();
  }

  @Post('/updateUserData/:chatId')
  @ApiOperation({ summary: 'Update user configuration' })
  @ApiParam({ name: 'chatId', description: 'Chat ID', type: String })
  @ApiQuery({ name: 'profile', description: 'Profile', type: String, required: false })
  @ApiBody({ description: 'User data', type: Object })
  @ApiResponse({ description: 'User configuration updated successfully' })
  async updateUserConfig(
    @Param('chatId') chatId: string,
    @Query('profile') profile: string,
    @Body() data: any,
  ) {
    return await this.appService.updateUserConfig(chatId, profile, data);
  }

  @Get('/getUserInfo')
  @UseInterceptors(CloudflareCacheInterceptor)
  @NoCache()
  @ApiOperation({ summary: 'Get user information' })
  @ApiQuery({ name: 'filter', description: 'Filter parameters', type: Object })
  @ApiResponse({ description: 'User information retrieved successfully' })
  async getUserInfo(@Query() filter: any) {
    return await this.appService.getUserInfo(filter);
  }

  @Get('getdata')
  @UseInterceptors(CloudflareCacheInterceptor)
  @NoCache()
  @ApiOperation({ summary: 'Get data and refresh periodically' })
  @ApiResponse({ description: 'Returns HTML data with periodic refresh' })
  async getData(@Res() res: Response): Promise<void> {
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
}