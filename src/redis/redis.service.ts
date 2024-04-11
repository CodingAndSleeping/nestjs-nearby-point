import { Inject, Injectable } from '@nestjs/common';
import { RedisClientType } from 'redis';

@Injectable()
export class RedisService {
  // 注入redis client
  @Inject('REDIS_CLIENT')
  private redisClient: RedisClientType;

  // 添加位置
  async geoAdd(key: string, posName: string, posLoc: [number, number]) {
    return await this.redisClient.geoAdd(key, {
      longitude: posLoc[0],
      latitude: posLoc[1],
      member: posName,
    });
  }

  // 读取某个点的位置
  async geoPos(key: string, posName: string) {
    const res = await this.redisClient.geoPos(key, posName);
    return {
      name: posName,
      longitude: res[0].longitude,
      latitude: res[0].latitude,
    };
  }

  // 读取所有点的位置
  async geoList(key: string) {
    const positions = await this.redisClient.zRange(key, 0, -1);

    const list = [];

    for (const pos of positions) {
      const res = await this.geoPos(key, pos);
      list.push(res);
    }

    return list;
  }

  // 搜索附近的点
  async geoSearch(key: string, pos: [number, number], radius: number) {
    const positions = await this.redisClient.geoRadius(
      key,
      {
        longitude: pos[0],
        latitude: pos[1],
      },
      radius,
      'km',
    );
    const list = [];

    for (const pos of positions) {
      const res = await this.geoPos(key, pos);
      list.push(res);
    }

    return list;
  }
}
