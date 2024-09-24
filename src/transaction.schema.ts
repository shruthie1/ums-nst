// src/transaction/transaction.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class Transaction extends Document {
  @Prop({ required: true })
  transactionId: string;

  @Prop({ required: true })
  amount: number;

  @Prop({ required: true })
  issue?: string;

  @Prop({ required: true })
  refundReason?: string;

  @Prop({ required: true })
  refundMethod?: string;

  @Prop()
  bankAccount?: string;

  @Prop()
  ifsc?: string;

  @Prop()
  cardNumber?: string;

  @Prop()
  expiryDate?: string;

  @Prop()
  upiId?: string;
}

export const TransactionSchema = SchemaFactory.createForClass(Transaction);
