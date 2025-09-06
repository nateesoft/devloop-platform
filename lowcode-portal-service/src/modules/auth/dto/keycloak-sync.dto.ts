import { IsEmail, IsString, IsOptional, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class KeycloakSyncDto {
  @ApiProperty({ description: 'Keycloak user ID', example: 'abc123-def456-ghi789' })
  @IsString()
  keycloakId: string;

  @ApiProperty({ description: 'User email address', example: 'user@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ description: 'User first name', example: 'John' })
  @IsString()
  firstName: string;

  @ApiProperty({ description: 'User last name', example: 'Doe' })
  @IsString()
  lastName: string;

  @ApiPropertyOptional({ description: 'User role from Keycloak', example: 'admin' })
  @IsOptional()
  @IsString()
  role?: string;

  @ApiPropertyOptional({ description: 'Email verification status', example: true })
  @IsOptional()
  @IsBoolean()
  emailVerified?: boolean;
}