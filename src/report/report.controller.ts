import { Controller, Get, Param, ParseIntPipe, Req, UseGuards } from '@nestjs/common';
import { ReportService } from './report.service';
import {
  AuthenticatedRequest,
  JwtAuthGuard,
  Roles,
  RolesGuard,
  UserType,
} from '@Common';
import { ApiBearerAuth } from '@nestjs/swagger';

@Controller('report')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class ReportController {
  constructor(private readonly reportService: ReportService) {}

  @Roles(UserType.Admin)
  @Get('admin_dashbord')
  async getAdminReport() {
    return this.reportService.adminReportData();
  }

  @Roles(UserType.Manager)
  @Get('manager_dashbord')
  async getManagerReport(@Req() req: AuthenticatedRequest) {
    return this.reportService.managerData(req.user.id);
  }

  @Roles(UserType.Admin)
  @Get('platform-revenue/:eventId')
  async platFromRevenue(@Param('eventId',ParseIntPipe) eventId: number) {
  
    return this.reportService.getPlatformRevenue(Number(eventId));
  }

  @Roles(UserType.Manager)
  @Get('event-detail/:eventId')
  getEventWiseReport(
    @Req() req:AuthenticatedRequest,
    @Param('eventId', ParseIntPipe) eventId: number,
  ) {
    const userId=req.user.id
    return this.reportService.getEventWiseReport(eventId,userId);
  }

}
