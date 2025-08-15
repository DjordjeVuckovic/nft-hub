import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import type { EventType } from './events.types';

@Schema({ timestamps: true, strict: false })
export class ContractEvent extends Document {
	@Prop({
		required: true,
		type: String,
		enum: ['UserRegistered', 'NFTMinted', 'UserBlacklisted', 'UserRemovedFromBlacklist', 'FeesUpdated'],
	})
	eventType: EventType;

	@Prop({ required: true })
	transactionHash: string;

	@Prop({ required: true })
	blockNumber: number;

	@Prop({ required: true, default: 0 })
	logIndex: number;

	@Prop({ required: true })
	timestamp: number;

	@Prop() // UserRegistered, UserBlacklisted, UserRemovedFromBlacklist
	user?: string;

	@Prop()
	to?: string;

	@Prop()
	tokenId?: string;

	@Prop()
	metadataURI?: string;

	@Prop() // UserBlacklisted, UserRemovedFromBlacklist
	action?: 'blacklisted' | 'removed';

	@Prop() // FeesUpdated
	registrationFee?: string;

	@Prop() // FeesUpdated
	mintingFee?: string;

	@Prop({ type: Object })
	rawData?: Record<string, any>;
}

export const ContractEventSchema = SchemaFactory.createForClass(ContractEvent);

ContractEventSchema.index({ transactionHash: 1, logIndex: 1 }, { unique: true }); // Prevent duplicates
ContractEventSchema.index({ eventType: 1, blockNumber: -1 });
ContractEventSchema.index({ user: 1 }, { sparse: true });
ContractEventSchema.index({ to: 1 }, { sparse: true });
ContractEventSchema.index({ tokenId: 1 }, { sparse: true });
ContractEventSchema.index({ blockNumber: -1 });
ContractEventSchema.index({ timestamp: -1 });

export type ContractEventDocumentType = ContractEvent & Document;
