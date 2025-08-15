import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ContractEvent, ContractEventDocumentType } from './events.domain';
import { ContractEventData, EventType } from './events.types';

@Injectable()
export class EventsRepository {
  constructor(
    @InjectModel(ContractEvent.name)
    private readonly contractEventModel: Model<ContractEventDocumentType>,
  ) {}

  async saveUserRegistrationEvent(
    user: string,
    timestamp: number,
    transactionHash: string,
    blockNumber: number,
    logIndex: number = 0,
    rawData?: Record<string, any>,
  ): Promise<ContractEventDocumentType> {
    try {
      const event = new this.contractEventModel({
        eventType: 'UserRegistered',
        user,
        timestamp,
        transactionHash,
        blockNumber,
        logIndex,
        rawData,
      });

      return await event.save();
    } catch (error: any) {
      // Handle duplicate key error gracefully
      if (error.code === 11000) {
        // Event already exists, return the existing one
        const existing = await this.contractEventModel.findOne({
          transactionHash,
          logIndex,
        }).exec();
        if (existing) {
          return existing;
        }
      }
      throw error;
    }
  }

  async saveNFTMintEvent(
    to: string,
    tokenId: string,
    metadataURI: string,
    timestamp: number,
    transactionHash: string,
    blockNumber: number,
    logIndex: number = 0,
    rawData?: Record<string, any>,
  ): Promise<ContractEventDocumentType> {
    try {
      const event = new this.contractEventModel({
        eventType: 'NFTMinted',
        to,
        tokenId,
        metadataURI,
        timestamp,
        transactionHash,
        blockNumber,
        logIndex,
        rawData,
      });

      return await event.save();
    } catch (error: any) {
      if (error.code === 11000) {
        const existing = await this.contractEventModel.findOne({
          transactionHash,
          logIndex,
        }).exec();
        if (existing) {
          return existing;
        }
      }
      throw error;
    }
  }

  async saveUserBlacklistEvent(
    user: string,
    action: 'blacklisted' | 'removed',
    timestamp: number,
    transactionHash: string,
    blockNumber: number,
    logIndex: number = 0,
    rawData?: Record<string, any>,
  ): Promise<ContractEventDocumentType> {
    const eventType: EventType = action === 'blacklisted' ? 'UserBlacklisted' : 'UserRemovedFromBlacklist';

    try {
      const event = new this.contractEventModel({
        eventType,
        user,
        action,
        timestamp,
        transactionHash,
        blockNumber,
        logIndex,
        rawData,
      });

      return await event.save();
    } catch (error: any) {
      if (error.code === 11000) {
        const existing = await this.contractEventModel.findOne({
          transactionHash,
          logIndex,
        }).exec();
        if (existing) {
          return existing;
        }
      }
      throw error;
    }
  }

  async saveFeesUpdatedEvent(
    registrationFee: string,
    mintingFee: string,
    timestamp: number,
    transactionHash: string,
    blockNumber: number,
    logIndex: number = 0,
    rawData?: Record<string, any>,
  ): Promise<ContractEventDocumentType> {
    try {
      const event = new this.contractEventModel({
        eventType: 'FeesUpdated',
        registrationFee,
        mintingFee,
        timestamp,
        transactionHash,
        blockNumber,
        logIndex,
        rawData,
      });

      return await event.save();
    } catch (error: any) {
      if (error.code === 11000) {
        const existing = await this.contractEventModel.findOne({
          transactionHash,
          logIndex,
        }).exec();
        if (existing) {
          return existing;
        }
      }
      throw error;
    }
  }

  async getEventsByAddress(address: string): Promise<ContractEventDocumentType[]> {
    return this.contractEventModel
      .find({
        $or: [
          { user: address },
          { to: address },
        ],
      })
      .sort({ blockNumber: -1 })
      .exec();
  }

  async getAllEvents(): Promise<ContractEventDocumentType[]> {
    return this.contractEventModel.find().sort({ blockNumber: -1 }).exec();
  }

  async getEventsByType(eventType: EventType): Promise<ContractEventDocumentType[]> {
    return this.contractEventModel.find({ eventType }).sort({ blockNumber: -1 }).exec();
  }

  async getEventsByBlockRange(fromBlock: number, toBlock: number): Promise<ContractEventDocumentType[]> {
    return this.contractEventModel
      .find({
        blockNumber: { $gte: fromBlock, $lte: toBlock },
      })
      .sort({ blockNumber: -1 })
      .exec();
  }

  async isUserRegistered(address: string): Promise<boolean> {
    const registration = await this.contractEventModel
      .findOne({ eventType: 'UserRegistered', user: address })
      .exec();
    return !!registration;
  }

  async getUserNFTs(address: string): Promise<ContractEventDocumentType[]> {
    return this.contractEventModel
      .find({ eventType: 'NFTMinted', to: address })
      .sort({ blockNumber: -1 })
      .exec();
  }

  async isUserBlacklisted(address: string): Promise<boolean> {
    const lastEvent = await this.contractEventModel
      .findOne({
        user: address,
        eventType: { $in: ['UserBlacklisted', 'UserRemovedFromBlacklist'] },
      })
      .sort({ blockNumber: -1 })
      .exec();

    return lastEvent?.eventType === 'UserBlacklisted';
  }

  async getLatestFees(): Promise<ContractEventDocumentType | null> {
    return this.contractEventModel
      .findOne({ eventType: 'FeesUpdated' })
      .sort({ blockNumber: -1 })
      .exec();
  }
}