import axiosService from '@/api/apiClient'
import { rutasBack } from '@/config/env'
import { DashboardResponse } from '@/features/dashboard/types'

class ApiDashboardService {
  async getOverview(): Promise<DashboardResponse> {
    const response = await axiosService.get(rutasBack.dashboard.overview)
    return response.data
  }
}

export default new ApiDashboardService()
