import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Inject,
  Post,
  Query,
} from '@nestjs/common';
import { AppService } from './app.service';
import { RedisService } from './redis/redis.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Inject(RedisService)
  private redisService: RedisService;

  @Post('addPos')
  addPos(
    @Body('name') posName: string,
    @Body('lng') lng: number,
    @Body('lat') lat: number,
  ) {
    if (!posName || !lat || !lng) {
      throw new BadRequestException('位置信息不安全！');
    }

    try {
      this.redisService.geoAdd('positions', posName, [lng, lat]);
    } catch (error) {
      throw new BadRequestException(error.message);
    }

    return {
      message: '位置信息添加成功！',
      statusCode: 200,
    };
  }

  @Get('pos')
  async getPos(@Query('name') posName: string) {
    return await this.redisService.geoPos('positions', posName);
  }

  @Get('allPos')
  async getAllPos() {
    return await this.redisService.geoList('positions');
  }

  @Get('nearbyPos')
  async getNearbyPos(
    @Query('lng') lng: number,
    @Query('lat') lat: number,
    @Query('radius') radius: number,
  ) {
    if (!lng || !lat) {
      throw new BadRequestException('缺少位置信息！');
    }

    if (!radius) {
      throw new BadRequestException('缺少搜索半径！');
    }

    return await this.redisService.geoSearch('positions', [lng, lat], radius);
  }
}
