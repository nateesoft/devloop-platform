import { Controller, Post, Body, UseGuards, Get, Req, Delete, Param, Ip, Headers, UseFilters } from '@nestjs/common';
import { ApiTags, ApiResponse, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { AuthExceptionFilter } from '../../common/filters/auth-exception.filter';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './jwt-auth.guard';

@ApiTags('Authentication')
@Controller('auth')
@UseFilters(AuthExceptionFilter)
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiOperation({ summary: 'Register new user' })
  @ApiResponse({ status: 201, description: 'User registered successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @ApiOperation({ summary: 'User login' })
  @ApiResponse({ status: 200, description: 'Login successful' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @Post('login')
  async login(
    @Body() loginDto: LoginDto,
    @Ip() ip: string,
    @Headers('user-agent') userAgent: string
  ) {
    const deviceInfo = {
      ip,
      userAgent,
      deviceInfo: this.extractDeviceInfo(userAgent)
    };
    return this.authService.login(loginDto, deviceInfo);
  }

  @ApiOperation({ summary: 'Refresh token' })
  @ApiResponse({ status: 200, description: 'Token refreshed successfully' })
  @ApiResponse({ status: 401, description: 'Invalid refresh token' })
  @Post('refresh')
  async refresh(@Body('refresh_token') refreshToken: string) {
    return this.authService.refreshToken(refreshToken);
  }

  @ApiOperation({ summary: 'Get user profile' })
  @ApiResponse({ status: 200, description: 'User profile retrieved' })
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Req() req: any) {
    return req.user;
  }

  @ApiOperation({ summary: 'Verify token' })
  @ApiResponse({ status: 200, description: 'Token is valid' })
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @Post('verify')
  verify(@Req() req: any) {
    return { valid: true, user: req.user };
  }

  @ApiOperation({ summary: 'Sync user with Keycloak' })
  @ApiResponse({ status: 200, description: 'User synced successfully' })
  @Post('keycloak-sync')
  async keycloakSync(
    @Body() keycloakData: any,
    @Ip() ip: string,
    @Headers('user-agent') userAgent: string
  ) {
    const deviceInfo = {
      ip,
      userAgent,
      deviceInfo: 'Keycloak SSO'
    };
    return this.authService.syncKeycloakUser(keycloakData, deviceInfo);
  }

  @ApiOperation({ summary: 'Logout user' })
  @ApiResponse({ status: 200, description: 'Logout successful' })
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @Post('logout')
  async logout(@Req() req: any) {
    const userId = req.user.id;
    const sessionId = req.user.sessionId;
    const tokenId = req.user.tokenId;
    
    return this.authService.logout(userId, sessionId, tokenId);
  }

  @ApiOperation({ summary: 'Logout from all sessions' })
  @ApiResponse({ status: 200, description: 'All sessions terminated' })
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @Post('logout-all')
  async logoutAllSessions(@Req() req: any) {
    const userId = req.user.id;
    return this.authService.logoutAllSessions(userId);
  }

  @ApiOperation({ summary: 'Get user active sessions' })
  @ApiResponse({ status: 200, description: 'Sessions retrieved' })
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @Get('sessions')
  async getUserSessions(@Req() req: any) {
    const userId = req.user.id;
    const sessions = await this.authService.getUserActiveSessions(userId);
    return { sessions };
  }

  @ApiOperation({ summary: 'Terminate specific session' })
  @ApiResponse({ status: 200, description: 'Session terminated' })
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @Delete('sessions/:sessionId')
  async terminateSession(
    @Req() req: any,
    @Param('sessionId') sessionId: string
  ) {
    const userId = req.user.id;
    return this.authService.terminateSessionById(userId, sessionId);
  }

  private extractDeviceInfo(userAgent: string): string {
    if (!userAgent) return 'Unknown Device';
    
    if (userAgent.includes('Mobile')) return 'Mobile Device';
    if (userAgent.includes('Tablet')) return 'Tablet';
    if (userAgent.includes('Chrome')) return 'Chrome Browser';
    if (userAgent.includes('Firefox')) return 'Firefox Browser';
    if (userAgent.includes('Safari')) return 'Safari Browser';
    if (userAgent.includes('Edge')) return 'Edge Browser';
    
    return 'Desktop Browser';
  }
}