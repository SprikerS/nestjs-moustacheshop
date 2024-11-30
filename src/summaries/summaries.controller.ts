import { Controller, Get } from '@nestjs/common'
import { SummariesService } from './summaries.service'

@Controller('summaries')
export class SummariesController {
  constructor(private readonly summariesService: SummariesService) {}

  @Get()
  fetchSummaries() {
    return this.summariesService.fetchSummaries()
  }
}
