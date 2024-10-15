// src/transaction/transaction.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class Transaction extends Document {
  @Prop({ required: false })
  transactionId: string;

  @Prop({ required: false, default:0 })
  amount: number;

  @Prop({ required: false })
  issue?: string;

  @Prop({ required: false })
  refundReason?: string;

  @Prop({ required: false })
  refundMethod?: string;

  @Prop({ required: false })
  bankAccount?: string;

  @Prop({ required: false })
  ifsc?: string;

  @Prop({ required: false })
  cardNumber?: string;

  @Prop({ required: false })
  expiryDate?: string;

  @Prop({ required: false })
  upiId?: string;
}

export const TransactionSchema = SchemaFactory.createForClass(Transaction);
