// src/transaction/dto/create-transaction.dto.ts
import { IsNotEmpty, IsOptional, IsString, IsNumber } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class CreateTransactionDto {
  @ApiPropertyOptional({
    description: 'Unique identifier for the transaction',
    example: 'txn_123456',
  })
  @IsNotEmpty()
  @IsString()
  transactionId?: string;

  @ApiPropertyOptional({
    description: 'Amount of the transaction',
    example: 1500.00,
  })
  @IsNotEmpty()
  @IsNumber()
  amount?: number;

  @ApiPropertyOptional({
    description: 'Issue related to the transaction',
    example: 'Product was defective',
  })
  @IsNotEmpty()
  @IsString()
  issue?: string;

  @ApiPropertyOptional({
    description: 'Reason for the refund',
    example: 'Received wrong item',
  })
  @IsNotEmpty()
  @IsString()
  refundReason?: string;

  @ApiPropertyOptional({
    description: 'Method of refund',
    example: 'Bank Transfer',
  })
  @IsNotEmpty()
  @IsString()
  refundMethod?: string;

  @ApiPropertyOptional({
    description: 'Bank account number for the refund (optional)',
    example: '123456789012',
    required: false,
  })
  @IsOptional()
  @IsString()
  bankAccount?: string;

  @ApiPropertyOptional({
    description: 'IFSC code of the bank (optional)',
    example: 'ABCDEF1234',
    required: false,
  })
  @IsOptional()
  @IsString()
  ifsc?: string;

  @ApiPropertyOptional({
    description: 'Card number for refund (optional)',
    example: '4111111111111111',
    required: false,
  })
  @IsOptional()
  @IsString()
  cardNumber?: string;

  @ApiPropertyOptional({
    description: 'Expiry date of the card (optional)',
    example: '12/25',
    required: false,
  })
  @IsOptional()
  @IsString()
  expiryDate?: string;

  @ApiPropertyOptional({
    description: 'UPI ID for the refund (optional)',
    example: 'example@upi',
    required: false,
  })
  @IsOptional()
  @IsString()
  upiId?: string;
}
