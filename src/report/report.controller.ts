import { Controller, Get, Req, UseGuards, } from '@nestjs/common';
import { ReportService } from './report.service';
import { AuthenticatedRequest, JwtAuthGuard, Roles, RolesGuard, UserType } from '@Common';
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
  async getManagerReport(
    @Req() req: AuthenticatedRequest,
  ) {
    return this.reportService.managerData(
      req.user.id,
    );
  }


}
