import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { AppService } from './app.service';
import { ApiBody, ApiOperation, ApiParam, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { parseError } from 'commonService';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) { }

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('processUsers/:limit/:skip')
  async processUsers(
    @Param('limit') limit: number = 30,
    @Param('skip') skip: number = 20) {
    return await this.appService.processUsers(limit, skip)
  }

  @Get('blockUserAll/:tgId')
  async blockUserAll(@Param('tgId') tgId: string) {
    return await this.appService.blockUserAll(tgId)
  }

  @Get('isRecentUser')
  @ApiOperation({ summary: 'Check if user is recent and return access data' })
  @ApiParam({ name: 'chatId', type: 'string', required: true })
  @ApiResponse({ status: 200, description: 'Returns count of recent accesses and video details' })
  async isRecentUser(@Query('chatId') chatId: string) {
    return this.appService.isRecentUser(chatId);
  }

  @Post('isRecentUser')
  @ApiOperation({ summary: 'Update recent user data' })
  @ApiParam({ name: 'chatId', type: 'string', required: true })
  @ApiBody({ type: Object, description: 'Video details to update', required: true })
  @ApiResponse({ status: 200, description: 'Successfully updated recent user data' })
  async updateRecentUser(@Query('chatId') chatId: string, @Body() videoDetails: any) {
    await this.appService.updateRecentUser(chatId, videoDetails);
    return 'Ok';
  }

  @Get('resetRecentUser')
  @ApiOperation({ summary: 'Reset recent user data' })
  @ApiParam({ name: 'chatId', type: 'string', required: true })
  @ApiResponse({ status: 200, description: 'Returns count of recent accesses after reset' })
  async resetRecentUser(@Query('chatId') chatId: string) {
    return this.appService.resetRecentUser(chatId);
  }

  @Get('paymentStats')
  async getPaymentStats(@Query('chatId') chatId: string, @Query('profile') profile: string) {
    return this.appService.getPaymentStats(chatId, profile);
  }

  @Get('sendToChannel')
  @ApiOperation({ summary: 'Send message to channel' })
  @ApiQuery({ name: 'msg', required: true, description: 'Message to send' })
  @ApiQuery({ name: 'chatId', required: false, description: 'Chat ID of the channel' })
  @ApiQuery({ name: 'token', required: false, description: 'Token for authentication' })
  async sendToChannel(
    @Query('msg') message: string,
    @Query('chatId') chatId: string,
    @Query('token') token: string,
  ) {
    try {
      if (false&&message.length < 1500) {
        return await this.appService.sendtoChannel(chatId, token, message);
      } else {
        console.log("Skipped Message:", decodeURIComponent(message))
        return 'sent'
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
      return await this.appService.sendToAll(decodedEndpoint);
    } catch (e) {
      parseError(e);
      throw e; // optional, depending on how you want to handle errors
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
    return this.appService.refreshmap();
  }

  @Get('/requestcall')
  @ApiOperation({ summary: 'Request a call' })
  @ApiResponse({ status: 200, description: 'Call request processed successfully.' })
  @ApiQuery({ name: 'username', required: true, description: 'Username' })
  @ApiQuery({ name: 'chatId', required: true, description: 'Chat ID' })
  async requestCall(@Query('username') username: string, @Query('chatId') chatId: string) {
    return await this.appService.getRequestCall(username, chatId);
  }

  @Get('/getviddata')
  @ApiOperation({ summary: 'Get video data' })
  @ApiResponse({ status: 200, description: 'Video data retrieved successfully.' })
  @ApiQuery({ name: 'profile', required: false, description: 'Profile' })
  @ApiQuery({ name: 'clientId', required: false, description: 'clientId' })
  @ApiQuery({ name: 'chatId', required: true, description: 'chatId' })
  async getVidData(@Query('profile') profile: string, @Query('clientId') clientId: string, @Query('chatId') chatId: any) {
    return await this.appService.getUserData(profile, clientId, chatId);
  }

  @Post('/getviddata')
  @ApiOperation({ summary: 'Get video data' })
  @ApiResponse({ status: 200, description: 'Video data retrieved successfully.' })
  @ApiQuery({ name: 'profile', required: false, description: 'Profile' })
  @ApiQuery({ name: 'clientId', required: false, description: 'clientId' })
  @ApiBody({ description: 'Body data', required: true, type: Object })
  async updateVidData(@Query('profile') profile: string, @Query('clientId') clientId: string, @Body() body: any) {
    return await this.appService.updateUserData(profile, clientId, body);
  }

  @Post('/getUserConfig')
  @ApiOperation({ summary: 'Get user configuration' })
  @ApiResponse({ status: 200, description: 'User configuration updated successfully.' })
  @ApiBody({ description: 'Configuration data', required: true, type: Object })
  async updtaeUserConfig(@Query() filter: any, @Body() data: any) {
    throw new Error("Method not implemented")
    // return await this.appService.updateUserConfig(filter, data);
  }

  @Get('/getUserConfig')
  @ApiOperation({ summary: 'Get user configuration' })
  @ApiResponse({ status: 200, description: 'User configuration retrieved successfully.' })
  async getUserConfig(@Query() filter: any) {
    return await this.appService.getUserConfig(filter);
  }

  @Get('/getallupiIds')
  @ApiOperation({ summary: 'Get all UpiIDs' })
  @ApiResponse({ status: 200, description: 'All upi Ids retrieved successfully.' })
  async getallupiIds() {
    return await this.appService.getallupiIds();
  }

  @Post('/updateUserData/:chatId')
  @ApiOperation({ summary: 'Get user configuration' })
  @ApiResponse({ status: 200, description: 'User configuration updated successfully.' })
  @ApiQuery({ name: 'profile', required: false, description: 'Profile' })
  @ApiBody({ description: 'user data', required: true, type: Object })
  async updateUserConfig(@Param('chatId') chatId: string, @Query('profile') profile: string, @Body() data: any) {
    return await this.appService.updateUserConfig(chatId, profile, data);
  }
  @Get('/getUserInfo')
  @ApiOperation({ summary: 'Get user information' })
  @ApiResponse({ status: 200, description: 'User information retrieved successfully.' })
  async getUserInfo(@Query() filter: any) {
    return await this.appService.getUserInfo(filter);
  }

}
