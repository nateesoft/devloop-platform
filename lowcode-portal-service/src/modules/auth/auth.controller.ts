import { Controller, Post, Body, UseGuards, Get, Req, Delete, Param, Ip, Headers } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

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

  @Post('refresh')
  async refresh(@Body('refresh_token') refreshToken: string) {
    return this.authService.refreshToken(refreshToken);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Req() req: any) {
    return req.user;
  }

  @UseGuards(JwtAuthGuard)
  @Post('verify')
  verify(@Req() req: any) {
    return { valid: true, user: req.user };
  }

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

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  async logout(@Req() req: any) {
    const userId = req.user.id;
    const sessionId = req.user.sessionId;
    const tokenId = req.user.tokenId;
    
    return this.authService.logout(userId, sessionId, tokenId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout-all')
  async logoutAllSessions(@Req() req: any) {
    const userId = req.user.id;
    return this.authService.logoutAllSessions(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('sessions')
  async getUserSessions(@Req() req: any) {
    const userId = req.user.id;
    const sessions = await this.authService.getUserActiveSessions(userId);
    return { sessions };
  }

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