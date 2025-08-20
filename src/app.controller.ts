/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Res,
} from '@nestjs/common';
import { AppService, VideoDetails } from './app.service';
import {
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
} from '@nestjs/swagger';
import { Response } from 'express';
import { parseError } from 'common-tg-service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get(['', '/health'])
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('processUsers/:limit/:skip')
  async processUsers(
    @Param('limit') limit: number = 30,
    @Param('skip') skip: number = 20,
  ) {
    return await this.appService.processUsers(limit, skip);
  }

  @Get('blockUserAll/:tgId')
  async blockUserAll(@Param('tgId') tgId: string) {
    return await this.appService.blockUserAll(tgId);
  }

  @Get('unblockUserAll/:tgId')
  async unblockUserAll(@Param('tgId') tgId: string) {
    return await this.appService.unblockUserAll(tgId);
  }

  @Get('isRecentUser')
  @ApiOperation({ summary: 'Check if user is recent and return access data' })
  @ApiParam({ name: 'chatId', type: 'string', required: true })
  @ApiResponse({
    status: 200,
    description: 'Returns count of recent accesses and video details',
  })
  async isRecentUser(@Query('chatId') chatId: string) {
    return this.appService.isRecentUser(chatId);
  }

  @Post('isRecentUser')
  @ApiOperation({ summary: 'Update recent user data' })
  @ApiParam({ name: 'chatId', type: 'string', required: true })
  @ApiBody({
    type: Object,
    description: 'Video details to update',
    required: true,
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully updated recent user data',
  })
  async updateRecentUser(
    @Query('chatId') chatId: string,
    @Body() videoDetails: any,
  ): Promise<VideoDetails> {
    return await this.appService.updateRecentUser(chatId, videoDetails);
  }

  @Get('resetRecentUser')
  @ApiOperation({ summary: 'Reset recent user data' })
  @ApiParam({ name: 'chatId', type: 'string', required: true })
  @ApiResponse({
    status: 200,
    description: 'Returns count of recent accesses after reset',
  })
  async resetRecentUser(@Query('chatId') chatId: string) {
    return this.appService.resetRecentUser(chatId);
  }

  @Get('paymentStats')
  async getPaymentStats(
    @Query('chatId') chatId: string,
    @Query('profile') profile: string,
  ) {
    return this.appService.getPaymentStats(chatId, profile);
  }

  @Get('sendToChannel')
  @ApiOperation({ summary: 'Send message to channel' })
  @ApiQuery({ name: 'msg', required: true, description: 'Message to send' })
  @ApiQuery({
    name: 'chatId',
    required: false,
    description: 'Chat ID of the channel',
  })
  @ApiQuery({
    name: 'token',
    required: false,
    description: 'Token for authentication',
  })
  async sendToChannel(
    @Query('msg') message: string,
    @Query('chatId') chatId: string,
    @Query('token') token: string,
  ) {
    try {
      if (message.length < 1500) {
        return await this.appService.sendToChannel(chatId, token, message);
      } else {
        console.log('Skipped Message:', decodeURIComponent(message));
        return 'sent';
      }
    } catch (e) {
      parseError(e);
    }
  }

  @Get('sendToAll')
  @ApiOperation({ summary: 'Send Enpoint to all clients' })
  @ApiQuery({ name: 'query', required: true, description: 'Endpoint to send' })
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
  @ApiOperation({ summary: 'Join Channels for Clients' })
  async joinChannelsforBufferClients(): Promise<string> {
    return this.appService.joinchannelForClients();
  }

  @Get('refreshmap')
  @ApiOperation({ summary: 'refreshmap for Clients' })
  async refreshmap(): Promise<void> {
    return await this.appService.refreshmap();
  }

  @Get('maskedCls')
  @ApiOperation({ summary: 'Cls Data' })
  async maskedCls(@Query() query: object): Promise<any> {
    return await this.appService.findAllMasked(query);
  }

  @Get('portalData')
  @ApiOperation({ summary: 'Cls Data' })
  async portalData(
    @Query() query: object,
  ): Promise<{ client: any; upis: object }> {
    return await this.appService.portalData(query);
  }

  @Get('/requestcall')
  @ApiOperation({ summary: 'Request a call' })
  @ApiResponse({
    status: 200,
    description: 'Call request processed successfully.',
  })
  @ApiQuery({ name: 'username', required: true, description: 'Username' })
  @ApiQuery({ name: 'chatId', required: true, description: 'Chat ID' })
  async requestCall(
    @Query('username') username: string,
    @Query('chatId') chatId: string,
  ) {
    return await this.appService.getRequestCall(username, chatId);
  }

  @Get('refreshPrimary')
  @ApiOperation({ summary: 'Exit primary clients' })
  @ApiResponse({
    status: 200,
    description: 'exit Call request processed successfully.',
  })
  async refreshPrimary() {
    this.appService.refreshPrimary();
    return '1';
  }

  @Get('refreshSecondary')
  async refreshSecondary() {
    this.appService.refreshSecondary();
    return '2';
  }

  @Get('exitPrimary')
  @ApiOperation({ summary: 'Exit primary clients' })
  @ApiResponse({
    status: 200,
    description: 'exit Call request processed successfully.',
  })
  async exitPrimary() {
    this.appService.exitPrimary();
    return '1';
  }

  @Get('exitSecondary')
  async exitSecondary() {
    this.appService.exitSecondary();
    return '2';
  }

  @Get('exit')
  exit(): string {
    console.log("Exit request received");
    setTimeout(() => {
      console.log("Exiting application...");
      process.exit(0);
    }, 2000);
    return 'Exiting application... in 2 seconds';
  }

  @Get('/getviddata')
  @ApiOperation({ summary: 'Get video data' })
  @ApiResponse({
    status: 200,
    description: 'Video data retrieved successfully.',
  })
  @ApiQuery({ name: 'profile', required: false, description: 'Profile' })
  @ApiQuery({ name: 'clientId', required: false, description: 'clientId' })
  @ApiQuery({ name: 'chatId', required: true, description: 'chatId' })
  async getVidData(
    @Query('profile') profile: string,
    @Query('clientId') clientId: string,
    @Query('chatId') chatId: any,
  ) {
    return await this.appService.getUserData(profile, clientId, chatId);
  }

  @Post('/getviddata')
  @ApiOperation({ summary: 'Get video data' })
  @ApiResponse({
    status: 200,
    description: 'Video data retrieved successfully.',
  })
  @ApiQuery({ name: 'profile', required: false, description: 'Profile' })
  @ApiQuery({ name: 'clientId', required: false, description: 'clientId' })
  @ApiBody({ description: 'Body data', required: true, type: Object })
  async updateVidData(
    @Query('profile') profile: string,
    @Query('clientId') clientId: string,
    @Body() body: any,
  ) {
    return await this.appService.updateUserData(profile, clientId, body);
  }

  @Post('/getUserConfig')
  @ApiOperation({ summary: 'Get user configuration' })
  @ApiResponse({
    status: 200,
    description: 'User configuration updated successfully.',
  })
  @ApiBody({ description: 'Configuration data', required: true, type: Object })
  async updtaeUserConfig(@Query() filter: any, @Body() data: any) {
    throw new Error('Method not implemented');
    // return await this.appService.updateUserConfig(filter, data);
  }
  @Get('/getallupiIds')
  @ApiOperation({ summary: 'Get all UpiIDs' })
  @ApiResponse({
    status: 200,
    description: 'All upi Ids retrieved successfully.',
  })
  async getallupiIds() {
    return await this.appService.getallupiIds();
  }

  @Post('/updateUserData/:chatId')
  @ApiOperation({ summary: 'Get user configuration' })
  @ApiResponse({
    status: 200,
    description: 'User configuration updated successfully.',
  })
  @ApiQuery({ name: 'profile', required: false, description: 'Profile' })
  @ApiBody({ description: 'user data', required: true, type: Object })
  async updateUserConfig(
    @Param('chatId') chatId: string,
    @Query('profile') profile: string,
    @Body() data: any,
  ) {
    return await this.appService.updateUserConfig(chatId, profile, data);
  }
  @Get('/getUserInfo')
  @ApiOperation({ summary: 'Get user information' })
  @ApiResponse({
    status: 200,
    description: 'User information retrieved successfully.',
  })
  async getUserInfo(@Query() filter: any) {
    return await this.appService.getUserInfo(filter);
  }

  @Get('getdata')
  @ApiOperation({ summary: 'Get data and refresh periodically' })
  @ApiResponse({ status: 200, description: 'Successful operation' })
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
